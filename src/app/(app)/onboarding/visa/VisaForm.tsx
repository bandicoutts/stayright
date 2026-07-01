'use client'

import { useState } from 'react'
import Link from 'next/link'
import { saveVisaProfileAction } from '../actions'
import { track } from '@/lib/posthog'

const VISA_ROUTES = [
  'Skilled Worker',
  'Health and Care Worker',
  'Intra-Company Transfer',
  'Global Talent',
  'Graduate',
  'Other',
]

interface Props {
  defaultFirstName: string
  defaultRoute: string
  defaultStartDate: string
}

// Token-driven input style — mirrors the reskin form idiom (PlanTripSimulator).
const inputCls =
  'w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-warm)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-shadow'

export function VisaForm({ defaultFirstName, defaultRoute, defaultStartDate }: Props) {
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [visaRoute, setVisaRoute] = useState(defaultRoute)
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Auto-calculate ILR eligibility date (visa start + 5 years)
  const ilrDate = startDate
    ? (() => {
        const d = new Date(startDate)
        d.setFullYear(d.getFullYear() + 5)
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      })()
    : null

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim()) {
      setError('Please enter your first name.')
      return
    }
    if (!startDate) {
      setError('Please enter your visa start date.')
      return
    }
    if (startDate > today) {
      setError('Visa start date must be in the past.')
      return
    }

    setPending(true)
    try {
      const formData = new FormData(e.currentTarget)
      await saveVisaProfileAction(formData)
      track('onboarding_visa_setup_completed')
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
        <div className="h-2 w-8 rounded-full bg-[var(--color-green)]" />
        <div className="h-2 w-2 rounded-full bg-[var(--color-border-strong)]" />
      </div>

      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-text-faint)] mb-2">
          Step 1 of 2
        </p>
        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl tracking-tight text-[var(--color-text-primary)] mb-1">
          Tell us about your visa
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          This lets us calculate your qualifying period and ILR eligibility date.
        </p>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 px-4 py-3 rounded-xl text-sm text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First name */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              aria-required="true"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Priya"
              className={inputCls}
            />
          </div>

          {/* Visa route */}
          <div>
            <label
              htmlFor="visa_route"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              Visa route
            </label>
            <select
              id="visa_route"
              name="visa_route"
              value={visaRoute}
              onChange={(e) => setVisaRoute(e.target.value)}
              className={inputCls}
            >
              <optgroup label="Available Routes">
                {VISA_ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Visa start date */}
          <div>
            <label
              htmlFor="visa_start_date"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
            >
              Visa start date
            </label>
            <input
              id="visa_start_date"
              name="visa_start_date"
              type="date"
              required
              aria-required="true"
              max={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputCls} font-[family-name:var(--font-mono)]`}
            />
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              Check the vignette sticker, BRP, or eVisa if you&apos;re unsure.
            </p>
          </div>

          {/* Auto-calculated ILR info */}
          {ilrDate && (
            <div className="border-l-2 border-[var(--color-green)] bg-[var(--color-green-pale)] rounded-r-xl px-4 py-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Based on your route, your qualifying period is{' '}
                <strong className="text-[var(--color-text-primary)]">5 years</strong>.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                ILR eligibility:{' '}
                <strong className="text-[var(--color-text-primary)]">{ilrDate}</strong>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
          >
            {pending ? 'Saving…' : 'Continue →'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/onboarding"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  )
}
