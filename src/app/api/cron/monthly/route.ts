import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, EMAIL_FROM } from '@/lib/resend'
import { monthlySummaryEmail } from '@/lib/email/templates'
import type { MonthlySummaryParams } from '@/lib/email/templates'
import {
  getCurrentRollingWindow,
  getQualifyingPeriod,
  calculateTripAbsenceDays,
} from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'

// ---------------------------------------------------------------------------
// Vercel Cron: runs on the 1st of each month at 08:00 UTC
// Schedule defined in vercel.json: "0 8 1 * *"
// Protected by CRON_SECRET — Vercel sends Authorization: Bearer <secret>
// Idempotent: checks notified_monthly_summary_at before sending.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // Month label, e.g. "March 2026"
  const monthLabel = today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  // Previous month — for "trips this month" we look at last calendar month
  // (since this runs on the 1st, "this month" = the month that just ended)
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0) // last day of prev month
  const prevMonthLabel = prevMonthStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  // Fetch Pro users with monthly notifications enabled
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, first_name, visa_start_date, notifications_monthly, notified_monthly_summary_at')
    .eq('notifications_monthly', true)

  if (error || !profiles) {
    console.error('[cron/monthly] failed to fetch profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  // Only Pro users
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('plan', ['pro_monthly', 'pro_annual', 'pro_lifetime'])
    .in('status', ['active', 'past_due'])

  const proUserIds = new Set((subscriptions ?? []).map((s) => s.user_id))

  // Fetch user emails — paginate to handle >1000 users
  const allAuthUsers: { id: string; email?: string }[] = []
  let page = 1
  const perPage = 1000
  while (true) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage })
    if (!data?.users?.length) break
    allAuthUsers.push(...data.users)
    if (data.users.length < perPage) break
    page++
  }
  const emailMap = new Map(allAuthUsers.map((u) => [u.id, u.email ?? '']))

  let sent = 0
  let skipped = 0

  for (const profile of profiles) {
    const email = emailMap.get(profile.id)
    if (!email || !proUserIds.has(profile.id)) { skipped++; continue }

    // Idempotency: skip if already sent this month
    if (profile.notified_monthly_summary_at) {
      const lastSent = new Date(profile.notified_monthly_summary_at)
      if (lastSent >= thisMonthStart) { skipped++; continue }
    }

    // Fetch all trips for this user
    const { data: trips } = await supabase
      .from('trips')
      .select('id, destination, departure_date, return_date')
      .eq('user_id', profile.id)
      .order('departure_date', { ascending: true })

    const tripInputs: TripInput[] = (trips ?? []).map((t) => ({
      id: t.id,
      destination: t.destination,
      departure_date: t.departure_date,
      return_date: t.return_date,
    }))

    const rollingWindow = getCurrentRollingWindow(tripInputs, today, profile.visa_start_date ?? undefined)
    const daysUsed = rollingWindow.days

    // Trips in the previous calendar month
    const prevMonthStartStr = prevMonthStart.toISOString().split('T')[0]
    const prevMonthEndStr = prevMonthEnd.toISOString().split('T')[0]
    const recentTripsRaw = tripInputs.filter(
      (t) => t.departure_date >= prevMonthStartStr && t.departure_date <= prevMonthEndStr && t.return_date !== null
    )

    const recentTrips = recentTripsRaw.map((t) => {
      const dep = new Date(t.departure_date)
      const ret = new Date(t.return_date!)
      const depFmt = dep.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      const retFmt = ret.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      return {
        destination: t.destination,
        dates: `${depFmt} – ${retFmt}`,
        days: calculateTripAbsenceDays({ destination: t.destination, departure_date: t.departure_date, return_date: t.return_date! }),
      }
    })

    // Next upcoming trip (departure_date > today)
    const todayStr = today.toISOString().split('T')[0]
    const nextTripRaw = tripInputs.find((t) => t.departure_date > todayStr)
    let nextTrip: MonthlySummaryParams['nextTrip'] = null
    if (nextTripRaw?.return_date) {
      const impact = calculateTripAbsenceDays({
        destination: nextTripRaw.destination,
        departure_date: nextTripRaw.departure_date,
        return_date: nextTripRaw.return_date,
      })
      nextTrip = {
        destination: nextTripRaw.destination,
        departureDate: nextTripRaw.departure_date,
        daysImpact: impact,
      }
    }

    // Qualifying period
    let percentComplete = 0
    if (profile.visa_start_date) {
      try {
        const qp = getQualifyingPeriod(profile.visa_start_date, today)
        percentComplete = qp.percentage
      } catch {
        percentComplete = 0
      }
    }

    const tmpl = monthlySummaryEmail({
      name: profile.first_name || null,
      month: prevMonthLabel,   // summary is for the month just ended
      daysUsed,
      riskStatus: rollingWindow.status,
      tripsThisMonth: recentTrips.length,
      percentComplete: Math.round(percentComplete),
      recentTrips,
      nextTrip,
    })

    const { error: sendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
    })

    if (!sendError) {
      await supabase
        .from('profiles')
        .update({ notified_monthly_summary_at: new Date().toISOString() })
        .eq('id', profile.id)
      sent++
    } else {
      console.error(`[cron/monthly] failed for ${profile.id}:`, sendError)
    }
  }

  console.log(`[cron/monthly] ${monthLabel}: sent=${sent} skipped=${skipped}`)
  return NextResponse.json({ ok: true, month: monthLabel, sent, skipped })
}
