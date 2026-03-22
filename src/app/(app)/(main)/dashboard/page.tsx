import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuotaRing } from '@/components/app/QuotaRing'
import { UpgradeTracker } from '@/components/app/dashboard/UpgradeTracker'
import {
  getCurrentRollingWindow,
  getQualifyingPeriod,
  calculateTripAbsenceDays,
  getRiskStatus,
} from '@/lib/calculations/absenceEngine'
import type { Metadata } from 'next'
import type { TripInput } from '@/lib/calculations/absenceEngine'

export const metadata: Metadata = { title: 'Dashboard — StayRight' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, visa_route, visa_start_date, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Load all trips
  const { data: rawTrips } = await supabase
    .from('trips')
    .select('id, destination, departure_date, return_date')
    .eq('user_id', user.id)
    .order('departure_date', { ascending: false })

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

  // Recent trips (last 3, with absence days computed)
  const recentTrips = trips.slice(0, 3).map((trip) => ({
    ...trip,
    absenceDays:
      trip.return_date
        ? calculateTripAbsenceDays({
            destination: trip.destination,
            departure_date: trip.departure_date,
            return_date: trip.return_date,
          })
        : null,
  }))

  const isCurrentlyAbroad = trips.some((t) => !t.return_date)
  const firstName = profile.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  // Needed for upgrade_completed analytics event
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Track upgrade_completed when redirected back from Stripe Checkout */}
      <Suspense fallback={null}>
        <UpgradeTracker planType={subscription?.plan ?? 'unknown'} />
      </Suspense>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D]">
          Good {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-[#3D4A42] mt-0.5">
          {isCurrentlyAbroad
            ? 'You are currently abroad.'
            : "Here's your compliance status."}
        </p>
      </div>

      {/* Currently abroad banner */}
      {isCurrentlyAbroad && (
        <div className="mb-6 px-4 py-3 bg-[#D97706]/10 border border-[#D97706]/25 rounded-xl flex items-center gap-3">
          <span className="text-lg">✈️</span>
          <p className="text-sm text-[#191C1D]">
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
        {/* Left column — quota ring + qualifying period + recent trips */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quota ring card */}
          <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-8">
            <QuotaRing days={rollingWindow.days} status={rollingWindow.status} />
            <p className="mt-5 text-xs text-center text-[#3D4A42] max-w-sm mx-auto leading-relaxed">
              Calculations follow official Home Office guidance. Always verify
              with an immigration adviser if you are approaching the limit.
            </p>
          </div>

          {/* Qualifying period */}
          {qualifying && (
            <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#191C1D]">
                  Qualifying period
                </h2>
                <span className="text-sm font-semibold text-[#006948]">
                  {qualifying.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#191C1D]/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006948] rounded-full transition-all duration-700"
                  style={{ width: `${qualifying.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#3D4A42]">
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

          {/* Recent trips */}
          <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#191C1D]">
                Recent trips
              </h2>
              <Link
                href="/trips"
                className="text-xs text-[#006948] hover:underline"
              >
                View all →
              </Link>
            </div>

            {recentTrips.length === 0 ? (
              <p className="text-sm text-[#3D4A42] py-4 text-center">
                No trips logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <TripRow key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — actions + ILR timeline */}
        <div className="space-y-6">
          {/* CTAs */}
          <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-6 space-y-3">
            <Link
              href="/trips/plan"
              className="flex items-center justify-between w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Plan a trip</span>
              <span>→</span>
            </Link>
            <p className="text-xs text-[#3D4A42] text-center -mt-1">
              See the impact before you book
            </p>
            <Link
              href="/trips/log"
              className="flex items-center justify-between w-full border border-[#191C1D]/15 text-[#191C1D] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
            >
              <span>Log a past trip</span>
              <span className="text-[#3D4A42]">→</span>
            </Link>
            <p className="text-xs text-[#3D4A42] text-center -mt-1">
              Add trips you&apos;ve already taken
            </p>
          </div>

          {/* ILR eligibility timeline */}
          {qualifying && (
            <div className="bg-white rounded-2xl border border-[#191C1D]/8 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-[#191C1D] mb-4">
                ILR timeline
              </h2>
              <div className="space-y-3">
                <TimelineItem
                  label="Visa started"
                  date={qualifying.visaStartDate}
                  done
                />
                <div className="ml-3 w-px h-4 bg-[#006948]/30" />
                <TimelineItem
                  label={`${qualifying.percentage}% complete`}
                  date={today}
                  active
                />
                <div className="ml-3 w-px h-4 bg-[#191C1D]/10" />
                <TimelineItem
                  label="ILR eligibility"
                  date={qualifying.ilrDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
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
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-[#D97706]',
      icon: '⚠️',
      message: `You have used ${days} of your 180 days in the current rolling window. You are approaching the limit.`,
    },
    DANGER: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-[#BA1A1A]',
      icon: '🚨',
      message: `You have used ${days} of your 180 days. You are very close to the limit. Plan carefully before any further travel.`,
    },
    BREACH: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-[#8E0009]',
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

function TripRow({
  trip,
}: {
  trip: {
    id: string
    destination: string
    departure_date: string
    return_date: string | null
    absenceDays: number | null
  }
}) {
  const status =
    trip.absenceDays !== null ? getRiskStatus(trip.absenceDays) : null
  const statusColour = status
    ? { SAFE: 'text-[#006948]', WARNING: 'text-[#D97706]', DANGER: 'text-[#BA1A1A]', BREACH: 'text-[#8E0009]' }[status]
    : 'text-[#3D4A42]'

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#191C1D]/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#191C1D] truncate">
          {trip.destination}
        </p>
        <p className="text-xs text-[#3D4A42]">
          {fmt(trip.departure_date)} →{' '}
          {trip.return_date ? fmt(trip.return_date) : 'ongoing'}
        </p>
      </div>
      <div className="text-right shrink-0 ml-4">
        {trip.absenceDays !== null ? (
          <>
            <p className={`text-sm font-semibold ${statusColour}`}>
              {trip.absenceDays}d
            </p>
            <p className="text-xs text-[#3D4A42]">absence</p>
          </>
        ) : (
          <p className="text-xs text-[#D97706]">abroad</p>
        )}
      </div>
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
            ? 'bg-[#006948] text-white'
            : active
            ? 'bg-[#006948]/20 border-2 border-[#006948]'
            : 'bg-[#F8F9FA] border-2 border-[#191C1D]/15'
        }`}
      >
        {done && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-[#191C1D]">{label}</p>
        <p className="text-xs text-[#3D4A42]">
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
