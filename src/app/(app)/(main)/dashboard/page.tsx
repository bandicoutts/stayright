import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { isPlanPro } from '@/lib/subscriptionUtils'
import { QuotaRing } from '@/components/app/QuotaRing'
import { UpgradeTracker } from '@/components/app/dashboard/UpgradeTracker'
import { DashboardAnalytics } from '@/components/app/dashboard/DashboardAnalytics'
import { DashboardTripsPreview } from '@/components/app/dashboard/DashboardTripsPreview'
import { SetupNudge } from '@/components/app/dashboard/SetupNudge'
import { DashboardWelcome } from '@/components/app/dashboard/DashboardWelcome'
import {
  getCurrentRollingWindow,
  getPeakRollingWindow,
  getQualifyingPeriod,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import { RISK_CONFIG } from '@/lib/riskConfig'
import type { Metadata } from 'next'
import type { TripInput, RollingWindowResult } from '@/lib/calculations/absenceEngine'

export const metadata: Metadata = { title: 'Dashboard — StayRight' }

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PeakWindowCard({ peak }: { peak: RollingWindowResult }) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const cfg = RISK_CONFIG[peak.status]

  // Smaller ring constants
  const RADIUS = 50
  const STROKE = 8
  const SIZE = (RADIUS + STROKE) * 2
  const CENTER = SIZE / 2
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
          Historical peak
        </h2>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase ${cfg.chip}`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative mb-3" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth={STROKE} />
            <circle
              cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
              stroke="var(--color-green-light)" strokeWidth={STROKE} strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(peak.days / 180, 1))}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              className="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-manrope)] font-bold text-3xl leading-none tracking-tight text-[var(--color-text-primary)]">
              {peak.days}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)] mt-1">/ 180</span>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          <span className="font-semibold text-[var(--color-text-primary)]">{Math.max(0, 180 - peak.days)} days</span> remaining
        </p>
        <p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)] mt-1 text-center">
          {fmt(peak.windowStart)} – {fmt(peak.windowEnd)}
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
    visaStartDate && hasCompletedTrips
      ? getPeakRollingWindow(trips, visaStartDate, today)
      : null

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
    ? Math.ceil(
        (new Date(ilrEligibilityDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
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
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.75rem] leading-tight tracking-[-0.03em] text-[var(--color-text-primary)]">
              Good {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {isCurrentlyAbroad ? 'You are currently abroad.' : "Here's your compliance status."}
            </p>
          </div>
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <Link
              href="/trips?modal=plan&returnTo=%2Fdashboard"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors no-underline"
            >
              Plan trip
            </Link>
            <Link
              href="/trips?modal=log&returnTo=%2Fdashboard"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity no-underline"
              style={{ background: 'var(--gradient-green)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Log trip
            </Link>
          </div>
        </div>
        {/* Mobile buttons — below heading */}
        <div className="flex sm:hidden items-center gap-2.5 mt-4">
          <Link
            href="/trips?modal=plan&returnTo=%2Fdashboard"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors no-underline"
          >
            Plan trip
          </Link>
          <Link
            href="/trips?modal=log&returnTo=%2Fdashboard"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity no-underline"
            style={{ background: 'var(--gradient-green)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Log trip
          </Link>
        </div>
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
            <span className="font-semibold">You&apos;re currently abroad.</span>{' '}
            Return date not yet logged —{' '}
            <Link href="/trips" className="underline font-medium">log your return</Link>{' '}
            when you&apos;re back in the UK.
          </p>
        </div>
      )}

      {/* Alert card */}
      {rollingWindow.status !== 'SAFE' && (
        <AlertCard days={rollingWindow.days} status={rollingWindow.status} />
      )}

      {/* Stat cards — three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Current window — hero ring */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
              Current window
            </h2>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase ${RISK_CONFIG[rollingWindow.status].chip}`}>
              {RISK_CONFIG[rollingWindow.status].label}
            </span>
          </div>
          <QuotaRing days={rollingWindow.days} status={rollingWindow.status} />
        </div>

        {/* Historical peak */}
        {peakWindow ? (
          <PeakWindowCard peak={peakWindow} />
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col items-center justify-center text-center gap-2" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">Historical peak</h2>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--color-text-faint)]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 12L6.5 7l3 3.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Your peak will appear here after your first completed trip.</p>
          </div>
        )}

        {/* Qualifying period */}
        {qualifying ? (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-5">
              Qualifying period
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="font-[family-name:var(--font-manrope)] font-extrabold text-[3.5rem] leading-none tracking-[-0.04em] text-[var(--color-text-primary)]">
                  {qualifying.percentage}%
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">of qualifying period complete</p>
              </div>
              <div
                className="w-full h-2 bg-[var(--color-surface-sunken)] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={qualifying.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="ILR qualifying period progress"
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${qualifying.percentage}%`, background: 'var(--gradient-green)' }}
                />
              </div>
              <div className="w-full flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
                <span>{qualifying.visaStartDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>ILR {qualifying.ilrDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 flex flex-col items-center justify-center text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-3">Qualifying period</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Set your visa start date in Settings to track progress.</p>
          </div>
        )}
      </div>

      {/* Recent trips preview */}
      <DashboardTripsPreview trips={rawTrips ?? []} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AlertCard({
  days,
  status,
}: {
  days: number
  status: 'WARNING' | 'DANGER' | 'BREACH'
}) {
  const config = {
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
      message: `You have exceeded 180 days of absence (${days} days used). Seek immigration advice immediately.`,
    },
  }[status]

  return (
    <div className={`mb-6 px-4 py-4 border rounded-xl flex gap-3 ${config.bg}`} role="alert">
      <span className="text-lg shrink-0">{config.icon}</span>
      <p className={`text-sm font-medium ${config.text}`}>{config.message}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
