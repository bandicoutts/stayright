import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { isPlanPro } from '@/lib/subscriptionUtils'
import { UpgradeTracker } from '@/components/app/dashboard/UpgradeTracker'
import { DashboardAnalytics } from '@/components/app/dashboard/DashboardAnalytics'
import { DashboardTripsPreview } from '@/components/app/dashboard/DashboardTripsPreview'
import { SetupNudge } from '@/components/app/dashboard/SetupNudge'
import { DashboardWelcome } from '@/components/app/dashboard/DashboardWelcome'
import { DashboardGreeting } from '@/components/app/dashboard/DashboardGreeting'
import { RollingWindowTimeline } from '@/components/app/dashboard/RollingWindowTimeline'
import { AbsenceHeatmap } from '@/components/app/dashboard/AbsenceHeatmap'
import { PeakTrajectoryChart } from '@/components/app/dashboard/PeakTrajectoryChart'
import { PlanTripSimulator } from '@/components/app/dashboard/PlanTripSimulator'
import {
  getCurrentRollingWindow,
  getPeakRollingWindow,
  getQualifyingPeriod,
  getRollingWindowSeries,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { Metadata } from 'next'
import type { TripInput, QualifyingPeriodResult } from '@/lib/calculations/absenceEngine'

export const metadata: Metadata = { title: 'Dashboard — StayRight' }

// ---------------------------------------------------------------------------
// ILR countdown module
// ---------------------------------------------------------------------------

function IlrCountdownCard({
  qualifying,
  daysUntilIlr,
}: {
  qualifying: QualifyingPeriodResult
  daysUntilIlr: number
}) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 h-full flex flex-col" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mb-4">
        ILR countdown
      </h2>
      <p className="font-[family-name:var(--font-mono)] font-semibold text-[2.5rem] leading-none tracking-[-0.03em] text-[var(--color-text-primary)]">
        {Math.max(0, daysUntilIlr)}
      </p>
      <p className="text-sm text-[var(--color-text-muted)] mt-1.5">days to go</p>
      <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)] mt-1">
        Eligible from {fmt(qualifying.ilrDate)}
      </p>

      <div className="mt-auto pt-5">
        <div
          className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={qualifying.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="ILR qualifying period progress"
        >
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${qualifying.percentage}%`, background: 'var(--gradient-green)' }} />
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          {qualifying.percentage}% through your 5-year span
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_route, visa_start_date, first_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const [{ data: rawTrips }, { data: subscription }] = await Promise.all([
    supabase
      .from('trips')
      .select('id, destination, departure_date, return_date, notes')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single(),
  ])

  const trips: TripInput[] = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }))

  const today = new Date()
  const visaStartDate = profile.visa_start_date ?? undefined

  const rollingWindow = getCurrentRollingWindow(trips, today, visaStartDate)
  const qualifying = visaStartDate ? getQualifyingPeriod(visaStartDate, today) : null

  const hasCompletedTrips = trips.some((t) => t.return_date !== null)
  const peakWindow =
    visaStartDate && hasCompletedTrips ? getPeakRollingWindow(trips, visaStartDate, today) : null
  const series = visaStartDate ? getRollingWindowSeries(trips, visaStartDate, today) : []

  const tripCount = trips.length
  const isCurrentlyAbroad = trips.some((t) => !t.return_date)
  const firstName = profile.first_name || user.email?.split('@')[0] || 'there'

  const isPro = isPlanPro(subscription?.plan, subscription?.status)

  const ilrEligibilityDate = visaStartDate
    ? (() => {
        const d = new Date(visaStartDate)
        d.setFullYear(d.getFullYear() + 5)
        return d.toISOString().split('T')[0]
      })()
    : null
  const daysUntilIlr = ilrEligibilityDate
    ? Math.ceil((new Date(ilrEligibilityDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const complianceStatus = getRiskStatus(rollingWindow.days)

  return (
    <div className="p-6 md:p-8">
      <Suspense fallback={null}>
        <DashboardAnalytics
          visaRoute={profile.visa_route ?? null}
          ilrEligibilityDate={ilrEligibilityDate}
          daysUntilIlr={daysUntilIlr}
          isPro={isPro}
          tripCount={tripCount}
          rollingWindowDays={rollingWindow.days}
          complianceStatus={complianceStatus}
        />
      </Suspense>
      <Suspense fallback={null}>
        <UpgradeTracker planType={subscription?.plan ?? 'unknown'} />
      </Suspense>

      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-y-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[1.75rem] leading-tight tracking-[-0.04em] text-[var(--color-text-primary)]">
            <DashboardGreeting firstName={firstName} />
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)] mt-1">
            {isCurrentlyAbroad ? 'You are currently abroad.' : "Here's your compliance status."}
          </p>
        </div>
        <Link
          href="/trips?modal=log&returnTo=%2Fdashboard"
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity no-underline"
          style={{ background: 'var(--gradient-green)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Log trip
        </Link>
      </div>

      {/* Setup nudge — shown when user skipped onboarding without entering visa data */}
      {!profile.visa_start_date && (
        <Suspense fallback={null}>
          <SetupNudge />
        </Suspense>
      )}

      {/* First-visit welcome — shown once after completing onboarding (?onboarded=1) */}
      <Suspense fallback={null}>
        <DashboardWelcome />
      </Suspense>

      {/* Currently abroad banner */}
      {isCurrentlyAbroad && (
        <div className="mb-6 px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl flex items-center gap-3">
          <span className="text-lg shrink-0">✈️</span>
          <p className="text-sm text-[var(--color-text-primary)]">
            <span className="font-semibold">Your absence days are still counting.</span>{' '}
            <Link href="/trips" className="underline font-medium">Log your return date</Link>{' '}
            as soon as you&apos;re back in the UK to keep your compliance status accurate.
          </p>
        </div>
      )}

      {/* Alert card */}
      {rollingWindow.status !== 'SAFE' && (
        <AlertCard days={rollingWindow.days} status={rollingWindow.status} />
      )}

      {/* Bento */}
      <div className="flex flex-col gap-5">
        {/* Hero — signature rolling-window timeline */}
        <RollingWindowTimeline
          days={rollingWindow.days}
          status={rollingWindow.status}
          windowStart={rollingWindow.windowStart}
          windowEnd={rollingWindow.windowEnd}
          trips={trips}
        />

        {/* Inline what-if simulator */}
        <PlanTripSimulator
          existingTrips={trips}
          visaStartDate={visaStartDate}
          currentDays={rollingWindow.days}
        />

        {/* Heatmap + ILR countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-stretch">
          <div className="lg:col-span-2 h-full">
            <AbsenceHeatmap trips={trips} today={today} />
          </div>
          {qualifying && daysUntilIlr !== null ? (
            <IlrCountdownCard qualifying={qualifying} daysUntilIlr={daysUntilIlr} />
          ) : (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 h-full flex flex-col items-center justify-center text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-faint)] mb-3">ILR countdown</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Set your visa start date in Settings to track progress.</p>
            </div>
          )}
        </div>

        {/* Peak trajectory */}
        <PeakTrajectoryChart
          series={series}
          peakDays={peakWindow?.days ?? 0}
          peakDate={peakWindow?.windowEnd ?? null}
        />

        {/* Recent trips */}
        <DashboardTripsPreview trips={rawTrips ?? []} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Alert card
// ---------------------------------------------------------------------------

function AlertCard({
  days,
  status,
}: {
  days: number
  status: 'WARNING' | 'DANGER' | 'BREACH'
}) {
  const config: Record<'WARNING' | 'DANGER' | 'BREACH', { bg: string; text: string; icon: string; message: React.ReactNode }> = {
    WARNING: {
      bg: 'bg-[var(--color-warning-bg)] border-[var(--color-warning-border)]',
      text: 'text-[var(--color-warning-text)]',
      icon: '⚠️',
      message: `You have used ${days} of your 180 days in the current rolling window. You are approaching the limit.`,
    },
    DANGER: {
      bg: 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]',
      text: 'text-[var(--color-danger-text)]',
      icon: '🚨',
      message: `You have used ${days} of your 180 days. You are very close to the limit. Plan carefully before any further travel.`,
    },
    BREACH: {
      bg: 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]',
      text: 'text-[var(--color-danger-text)]',
      icon: '🚫',
      message: (
        <>
          You have exceeded 180 days of absence ({days} days used). You should seek qualified immigration advice immediately.{' '}
          <Link
            href="https://solicitors.lawsociety.org.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Find an immigration solicitor →
          </Link>
        </>
      ),
    },
  }

  const { bg, text, icon, message } = config[status]

  return (
    <div className={`mb-6 px-4 py-4 border rounded-xl flex gap-3 ${bg}`} role="alert">
      <span className="text-lg shrink-0">{icon}</span>
      <p className={`text-sm font-medium ${text}`}>{message}</p>
    </div>
  )
}
