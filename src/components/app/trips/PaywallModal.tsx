'use client'

import { useState, useEffect, useRef } from 'react'
import { track } from '@/lib/posthog'

interface Props {
  open: boolean
  onClose: () => void
  /** When true, renders as a full-width card (no overlay) for page-level paywall gates */
  inline?: boolean
  /** Reason the paywall was triggered — sent with paywall_shown event (PRD §4n) */
  triggerReason?: string
}

const PLANS = [
  { id: 'monthly',  label: 'Monthly',  price: '£2.99',  period: '/month', badge: null,          detail: '£2.99/month' },
  { id: 'annual',   label: 'Annual',   price: '£24.99', period: '/year',  badge: 'Save 30%',    detail: '£24.99/year' },
  { id: 'lifetime', label: 'Lifetime', price: '£49.99', period: '',       badge: 'Best value',  detail: '£49.99' },
] as const

type PlanId = typeof PLANS[number]['id']

const BENEFITS = [
  'Unlimited trip logging',
  'What-if planning simulator',
  'Smart risk & breach alerts',
  'Audit-ready PDF exports',
]

// Map modal plan IDs to the API's plan keys
const PLAN_API_MAP: Record<PlanId, string> = {
  monthly: 'pro_monthly',
  annual: 'pro_annual',
  lifetime: 'pro_lifetime',
}

export function PaywallModal({ open, onClose, inline = false, triggerReason = 'unknown' }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button on open (modal mode)
  useEffect(() => {
    if (open && !inline) {
      closeRef.current?.focus()
    }
  }, [open, inline])

  // Fire paywall_shown when the modal becomes visible
  useEffect(() => {
    if (open || inline) {
      track('paywall_shown', { trigger: triggerReason })
    }
  }, [open, inline, triggerReason])

  // Keyboard close
  useEffect(() => {
    if (!open || inline) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        track('paywall_dismissed')
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, inline, onClose])

  if (!open && !inline) return null

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!

  function handleDismiss() {
    track('paywall_dismissed')
    onClose()
  }

  async function handleUpgrade() {
    track('upgrade_clicked', { plan: selectedPlan })

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: PLAN_API_MAP[selectedPlan] }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Could not connect to payment provider. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-8 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-[var(--color-text-primary)]">
            Audit Your Full 5-Year History
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Audit your full 5-year history and prevent ILR rejection.
          </p>
        </div>
        {!inline && (
          <button
            ref={closeRef}
            onClick={handleDismiss}
            aria-label="Close"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer -mt-1 -mr-1 p-1 rounded-lg hover:bg-[var(--color-bg-tinted)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Benefit list */}
      <ul className="space-y-2 mb-6">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-green-pale)] flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--color-green)]" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Plan selection */}
      <div className="space-y-2 mb-6" role="radiogroup" aria-label="Select plan">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id
          return (
            <label
              key={plan.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[var(--color-green)] bg-[var(--color-green-pale)]/20'
                  : 'border-[var(--color-border)] hover:border-[var(--color-green)]/35'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={isSelected}
                onChange={() => setSelectedPlan(plan.id)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[var(--color-green)]' : 'border-[var(--color-border-strong)]'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-green)]" />
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{plan.label}</span>
                {plan.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    plan.badge === 'Save 30%'
                      ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]'
                      : 'bg-[var(--color-green-pale)] text-[var(--color-green)]'
                  }`}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {plan.price}
                <span className="text-xs font-normal text-[var(--color-text-muted)]">{plan.period}</span>
              </span>
            </label>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-white"
        style={{ background: 'var(--gradient-green)' }}
      >
        {loading ? 'Redirecting to checkout…' : `Unlock Pro — ${currentPlan.detail}`}
      </button>

      {error && (
        <p className="mt-2 text-xs text-center text-[var(--color-danger-text)]">{error}</p>
      )}

      {/* Dismiss */}
      {!inline && (
        <div className="mt-4 text-center">
          <button
            onClick={handleDismiss}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Not now
          </button>
        </div>
      )}
    </div>
  )

  if (inline) {
    return (
      <div className="p-6 md:p-8 max-w-lg">
        {content}
      </div>
    )
  }

  // Modal overlay
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss() }}
    >
      {content}
    </div>
  )
}
