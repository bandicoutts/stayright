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
        <div className="h-2 w-2 rounded-full bg-[#191C1D]/15" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8">
        <p className="text-xs font-semibold text-[#3D4A42] uppercase tracking-widest mb-1">
          Step 1 of 2
        </p>
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-1">
          Tell us about your visa
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6">
          This lets us calculate your qualifying period and ILR eligibility date.
        </p>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-[#BA1A1A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First name */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-[#191C1D] mb-1.5"
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
              className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
            />
          </div>

          {/* Visa route */}
          <div>
            <label
              htmlFor="visa_route"
              className="block text-sm font-medium text-[#191C1D] mb-1.5"
            >
              Visa route
            </label>
            <select
              id="visa_route"
              name="visa_route"
              value={visaRoute}
              onChange={(e) => setVisaRoute(e.target.value)}
              className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] bg-white focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
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
              className="block text-sm font-medium text-[#191C1D] mb-1.5"
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
              className="w-full border border-[#191C1D]/15 rounded-xl px-4 py-3 text-sm text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#006948] focus:border-transparent transition-shadow"
            />
            <p className="mt-1.5 text-xs text-[#3D4A42]">
              Check the vignette sticker, BRP, or eVisa if you&apos;re unsure.
            </p>
          </div>

          {/* Auto-calculated ILR info */}
          {ilrDate && (
            <div className="border-l-4 border-[#006948] bg-[#006948]/5 rounded-r-xl px-4 py-3">
              <p className="text-xs text-[#3D4A42]">
                Based on your route, your qualifying period is{' '}
                <strong className="text-[#191C1D]">5 years</strong>.
              </p>
              <p className="text-xs text-[#3D4A42] mt-0.5">
                ILR eligibility:{' '}
                <strong className="text-[#191C1D]">{ilrDate}</strong>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {pending ? 'Saving…' : 'Continue →'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/onboarding"
            className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  )
}
