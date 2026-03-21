import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, EMAIL_FROM } from '@/lib/resend'
import {
  threshold120Email,
  threshold150Email,
  ilrReminderEmail,
  returnReminderEmail,
} from '@/lib/email/templates'
import { getCurrentRollingWindow, getQualifyingPeriod } from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'

// ---------------------------------------------------------------------------
// Vercel Cron: runs daily at 08:00 UTC
// Schedule defined in vercel.json: "0 8 * * *"
// Protected by CRON_SECRET — Vercel sends Authorization: Bearer <secret>
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Fetch all Pro users whose profiles have notification settings
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, visa_start_date, notifications_120_day, notifications_150_day, notifications_ilr_reminder, notifications_return_reminder, notified_120_day_at, notified_150_day_at')

  if (profilesError || !profiles) {
    console.error('[cron/daily] failed to fetch profiles:', profilesError)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  // Fetch only Pro subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, plan, status')
    .in('plan', ['pro_monthly', 'pro_annual', 'pro_lifetime'])
    .in('status', ['active', 'past_due'])

  const proUserIds = new Set((subscriptions ?? []).map((s) => s.user_id))

  // Fetch all users' emails via auth.admin
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ''])
  )

  let sent = 0
  let skipped = 0

  for (const profile of profiles) {
    const email = emailMap.get(profile.id)
    if (!email) { skipped++; continue }

    const isPro = proUserIds.has(profile.id)

    // Fetch this user's trips
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

    // -----------------------------------------------------------------------
    // Threshold: 120 days (Pro only)
    // -----------------------------------------------------------------------
    if (isPro && profile.notifications_120_day) {
      if (daysUsed >= 120 && !profile.notified_120_day_at) {
        // Send notification and mark as sent
        const tmpl = threshold120Email({ name: profile.full_name, daysUsed })
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: tmpl.subject,
          html: tmpl.html,
          text: tmpl.text,
        })
        if (!error) {
          await supabase
            .from('profiles')
            .update({ notified_120_day_at: new Date().toISOString() })
            .eq('id', profile.id)
          sent++
        } else {
          console.error(`[cron/daily] 120-day email failed for ${profile.id}:`, error)
        }
      } else if (daysUsed < 100 && profile.notified_120_day_at) {
        // Reset flag — they've dropped well below 120
        await supabase
          .from('profiles')
          .update({ notified_120_day_at: null })
          .eq('id', profile.id)
      }
    }

    // -----------------------------------------------------------------------
    // Threshold: 150 days (Pro only)
    // -----------------------------------------------------------------------
    if (isPro && profile.notifications_150_day) {
      if (daysUsed >= 150 && !profile.notified_150_day_at) {
        const tmpl = threshold150Email({ name: profile.full_name, daysUsed })
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: tmpl.subject,
          html: tmpl.html,
          text: tmpl.text,
        })
        if (!error) {
          await supabase
            .from('profiles')
            .update({ notified_150_day_at: new Date().toISOString() })
            .eq('id', profile.id)
          sent++
        } else {
          console.error(`[cron/daily] 150-day email failed for ${profile.id}:`, error)
        }
      } else if (daysUsed < 130 && profile.notified_150_day_at) {
        await supabase
          .from('profiles')
          .update({ notified_150_day_at: null })
          .eq('id', profile.id)
      }
    }

    // -----------------------------------------------------------------------
    // ILR reminder: 90 days before eligibility (Pro only)
    // -----------------------------------------------------------------------
    if (isPro && profile.notifications_ilr_reminder && profile.visa_start_date) {
      try {
        const qp = getQualifyingPeriod(profile.visa_start_date, today)
        const ilrDateStr = qp.ilrDate.toISOString().split('T')[0]

        // Check if today is exactly 90 days before ILR date
        const daysUntilIlr = Math.round(
          (qp.ilrDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilIlr === 90) {
          const tmpl = ilrReminderEmail({
            name: profile.full_name,
            ilrDate: ilrDateStr,
            daysUsed,
          })
          const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: tmpl.subject,
            html: tmpl.html,
            text: tmpl.text,
          })
          if (!error) sent++
          else console.error(`[cron/daily] ILR reminder failed for ${profile.id}:`, error)
        }
      } catch {
        // Silently skip — profile may not have enough data
      }
    }

    // -----------------------------------------------------------------------
    // Return reminder (Pro only)
    // Fires for trips where return_date IS NULL and departure_date = today - 3 days.
    // Checking the exact departure_date means this fires once per trip without
    // needing a separate tracking column.
    // -----------------------------------------------------------------------
    if (isPro && profile.notifications_return_reminder) {
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

      const ongoingTrips = tripInputs.filter(
        (t) => t.return_date === null && t.departure_date === threeDaysAgoStr
      )

      for (const trip of ongoingTrips) {
        const tmpl = returnReminderEmail({
          name: profile.full_name,
          destination: trip.destination,
          departureDate: trip.departure_date,
        })
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: tmpl.subject,
          html: tmpl.html,
          text: tmpl.text,
        })
        if (!error) sent++
        else console.error(`[cron/daily] return reminder failed for ${profile.id}:`, error)
      }
    }
  }

  console.log(`[cron/daily] ${todayStr}: sent=${sent} skipped=${skipped}`)
  return NextResponse.json({ ok: true, date: todayStr, sent, skipped })
}
