import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { isPlanPro } from '@/lib/subscriptionUtils'
import { QuotaRing } from '@/components/app/QuotaRing'
import { UpgradeTracker } from '@/components/app/dashboard/UpgradeTracker'
import { DashboardAnalytics } from '@/components/app/dashboard/DashboardAnalytics'
import { TripsClient } from '@/components/app/trips/TripsClient'
import {
  getCurrentRollingWindow,
  getPeakRollingWindow,
  getQualifyingPeriod,
  calculateTripAbsenceDays,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { Metadata } from 'next'
import type { TripInput, RollingWindowResult } from '@/lib/calculations/absenceEngine'

export const metadata: Metadata = { title: 'Dashboard — StayRight' }

// ---------------------------------------------------------------------------
// Sub-components (defined before the page so RSC compiler resolves them)
// ---------------------------------------------------------------------------

function PeakWindowCard({
  peak,
  current,
}: {
  peak: RollingWindowResult
  current: RollingWindowResult
}) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const statusConfig = {
    SAFE: { label: 'Safe', color: 'var(--color-green)', bg: 'var(--color-green-pale)' },
    WARNING: { label: 'Warning', color: 'var(--color-warning-text)', bg: 'var(--color-warning-bg)' },
    DANGER: { label: 'Danger', color: 'var(--color-danger-text)', bg: 'var(--color-danger-bg)' },
    BREACH: { label: 'Breach', color: 'var(--color-danger-text)', bg: 'var(--color-danger-bg)' },
  }[peak.status]

  const isSameAsCurrent = peak.days === current.days

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Historical peak
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: statusConfig.color, background: statusConfig.bg }}
        >
          {statusConfig.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span
          className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold"
          style={{ color: statusConfig.color }}
        >
          {peak.days}
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">/ 180 days</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        {fmt(peak.windowStart)} – {fmt(peak.windowEnd)}
      </p>
      <p className="mt-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
        {isSameAsCurrent
          ? 'This is also your current rolling window — your worst period is right now.'
          : 'Worst 12-month window across your entire qualifying period.'}
      </p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_route, visa_start_date, first_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Load trips and subscription in parallel (since both depend only on user.id)
  const [
    { data: rawTrips },
    { data: subscription }
  ] = await Promise.all([
    supabase
      .from('trips')
      .select('id, destination, departure_date, return_date, notes')
      .eq('user_id', user.id)
      .order('departure_date', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()
  ])

  const trips: TripInput[] = (rawTrips ?? []).map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }))

  const today = new Date()
  const visaStartDate = profile.visa_start_date ?? undefined

  // Core calculations
  const rollingWindow = getCurrentRollingWindow(trips, today, visaStartDate)
  const qualifying = visaStartDate
    ? getQualifyingPeriod(visaStartDate, today)
    : null

  // Peak rolling window — worst 12-month period across the entire qualifying
  // history. Only meaningful once there is at least one completed trip.
  const hasCompletedTrips = trips.some((t) => t.return_date !== null)
  const peakWindow =
    visaStartDate && hasCompletedTrips
      ? getPeakRollingWindow(trips, visaStartDate, today)
      : null

  // Trip summary for right column
  const tripCount = trips.length
  const totalDaysAbroad = trips
    .filter((t) => t.return_date !== null)
    .reduce(
      (sum, t) =>
        sum +
        calculateTripAbsenceDays({
          destination: t.destination,
          departure_date: t.departure_date,
          return_date: t.return_date as string,
        }),
      0
    )

  const isCurrentlyAbroad = trips.some((t) => !t.return_date)
  const firstName = profile.first_name || user.email?.split('@')[0] || 'there'

  // Subscription is already fetched via Promise.all earlier
  const isPro = isPlanPro(subscription?.plan, subscription?.status)

  // Derived values for PostHog user properties
  const ilrEligibilityDate = visaStartDate
    ? (() => {
        const d = new Date(visaStartDate)
        d.setFullYear(d.getFullYear() + 5)
        return d.toISOString().split('T')[0]
      })()
    : null
  const daysUntilIlr = ilrEligibilityDate
    ? Math.ceil(
        (new Date(ilrEligibilityDate).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null
  const complianceStatus = getRiskStatus(rollingWindow.days)

  return (
    <div className="p-6 md:p-8">
      {/* dashboard_viewed event + user property sync */}
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

      {/* Track upgrade_completed when redirected back from Stripe Checkout */}
      <Suspense fallback={null}>
        <UpgradeTracker planType={subscription?.plan ?? 'unknown'} />
      </Suspense>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)]">
          Good {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {isCurrentlyAbroad
            ? 'You are currently abroad.'
            : "Here's your compliance status."}
        </p>
      </div>

      {/* Currently abroad banner */}
      {isCurrentlyAbroad && (
        <div className="mb-6 px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl flex items-center gap-3">
          <span className="text-lg">✈️</span>
          <p className="text-sm text-[var(--color-text-primary)]">
            <span className="font-semibold">You're currently abroad.</span> Return
            date not yet logged — log your return when you're back in the UK.
          </p>
        </div>
      )}

      {/* Alert card — shown when WARNING or above */}
      {rollingWindow.status !== 'SAFE' && (
        <AlertCard days={rollingWindow.days} status={rollingWindow.status} />
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — quota ring + qualifying period */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quota ring card */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-8">
            <QuotaRing days={rollingWindow.days} status={rollingWindow.status} />
            <p className="mt-5 text-xs text-center text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
              Calculations follow official Home Office guidance. Always verify
              with an immigration adviser if you are approaching the limit.
            </p>
          </div>

          {/* Peak rolling window */}
          {peakWindow && (
            <PeakWindowCard peak={peakWindow} current={rollingWindow} />
          )}

          {/* Qualifying period */}
          {qualifying && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 id="qualifying-period-heading" className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Qualifying period
                </h2>
                <span className="text-sm font-semibold text-[var(--color-green)]">
                  {qualifying.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--color-bg-tinted)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={qualifying.percentage} aria-valuemin={0} aria-valuemax={100} aria-labelledby="qualifying-period-heading">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${qualifying.percentage}%`, background: 'var(--color-green)' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
                <span>
                  Started{' '}
                  {qualifying.visaStartDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span>
                  ILR eligible{' '}
                  {qualifying.ilrDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right column — actions + ILR timeline + trip summary */}
        <div className="space-y-6">
          {/* CTAs */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 space-y-3">
            <Link
              href="?modal=plan"
              className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity text-white"
              style={{ background: 'var(--gradient-green)' }}
            >
              <span>Plan a trip</span>
              <span>→</span>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] text-center -mt-1">
              See the impact before you book
            </p>
            <Link
              href="?modal=log"
              className="flex items-center justify-between w-full border border-[var(--color-border-strong)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--color-bg-tinted)] transition-colors"
            >
              <span>Log a past trip</span>
              <span className="text-[var(--color-text-muted)]">→</span>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] text-center -mt-1">
              Add trips you&apos;ve already taken
            </p>
          </div>

          {/* ILR eligibility timeline */}
          {qualifying && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                ILR timeline
              </h2>
              <div className="space-y-3">
                <TimelineItem
                  label="Visa started"
                  date={qualifying.visaStartDate}
                  done
                />
                <div className="ml-3 w-px h-4 bg-[var(--color-green)]/30" />
                <TimelineItem
                  label={`${qualifying.percentage}% complete`}
                  date={today}
                  active
                />
                <div className="ml-3 w-px h-4 bg-[var(--color-text-primary)]/10" />
                <TimelineItem
                  label="ILR eligibility"
                  date={qualifying.ilrDate}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Full Trip Log */}
      <div className="mt-8">
        <TripsClient 
          trips={rawTrips ?? []}
          visaStartDate={visaStartDate}
          isPro={isPro}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components (AlertCard, TimelineItem, getGreeting)
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
    <div
      className={`mb-6 px-4 py-4 border rounded-xl flex gap-3 ${config.bg}`}
      role="alert"
    >
      <span className="text-lg shrink-0">{config.icon}</span>
      <p className={`text-sm font-medium ${config.text}`}>{config.message}</p>
    </div>
  )
}

function TimelineItem({
  label,
  date,
  done = false,
  active = false,
}: {
  label: string
  date: Date
  done?: boolean
  active?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
          done
            ? 'text-white'
            : active
            ? 'border-2 border-[var(--color-green)] bg-[var(--color-green-pale)]'
            : 'bg-[var(--color-bg)] border-2 border-[var(--color-border-strong)]'
        }`}
        style={done ? { background: 'var(--color-green)' } : undefined}
      >
        {done && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
