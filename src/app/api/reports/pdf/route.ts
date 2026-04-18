import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPlanPro } from '@/lib/subscriptionUtils'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  ILRAbsenceTableDocument,
  RollingWindowHistoryDocument,
  CustomDateRangeDocument,
} from '@/lib/pdf/reportDocuments'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

const VALID_TYPES = ['ilr', 'rolling', 'custom'] as const
type ReportType = (typeof VALID_TYPES)[number]

function todayIso() {
  return new Date().toISOString().split('T')[0]
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  if (!isPlanPro(subscription?.plan, subscription?.status)) {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const rawType = searchParams.get('type')
  if (!rawType || !VALID_TYPES.includes(rawType as ReportType)) {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }
  const type = rawType as ReportType

  const startDate = searchParams.get('start') ?? ''
  const endDate = searchParams.get('end') ?? ''

  if (type === 'custom') {
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start and end query params required for custom report' },
        { status: 400 },
      )
    }
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 },
      )
    }
  }

  const [{ data: profile }, { data: rawTrips }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name, visa_route, visa_start_date')
      .eq('id', user.id)
      .single(),
    supabase
      .from('trips')
      .select('id, destination, departure_date, return_date, notes')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: true }),
  ])

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const profileData = {
    firstName: profile.first_name,
    lastName: profile.last_name,
    visaRoute: profile.visa_route,
    visaStartDate: profile.visa_start_date,
  }

  const trips = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
    notes: t.notes,
  }))

  const generatedOn = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const today = todayIso()

  let element: ReactElement<DocumentProps>
  let filename: string

  if (type === 'ilr') {
    element = ILRAbsenceTableDocument({ trips, profile: profileData, generatedOn }) as ReactElement<DocumentProps>
    filename = `StayRight_ILR_Absence_Table_${today}.pdf`
  } else if (type === 'rolling') {
    element = RollingWindowHistoryDocument({ trips, profile: profileData, generatedOn }) as ReactElement<DocumentProps>
    filename = `StayRight_Rolling_Window_History_${today}.pdf`
  } else {
    element = CustomDateRangeDocument({
      trips,
      profile: profileData,
      generatedOn,
      startDate,
      endDate,
    }) as ReactElement<DocumentProps>
    filename = `StayRight_Custom_Date_Range_${today}.pdf`
  }

  const buffer = await renderToBuffer(element)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
