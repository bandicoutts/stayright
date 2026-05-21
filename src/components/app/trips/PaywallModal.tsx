'use client'

import { useState, useEffect, useRef } from 'react'
import { track } from '@/lib/posthog'
import { Spinner } from '@/components/ui/Spinner'

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
    <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] w-full max-w-[560px] mx-auto overflow-hidden">
      {/* Close button */}
      {!inline && (
        <div className="flex justify-end px-5 pt-4 pb-0">
          <button
            ref={closeRef}
            onClick={handleDismiss}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-bg-tinted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="text-center px-6 pt-5 pb-6">
        <div className="text-4xl mb-4" aria-hidden="true">👑</div>
        <h2
          id="paywall-title"
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.375rem] leading-tight tracking-tight text-[var(--color-text-primary)] mb-2"
        >
          Unlock StayRight Pro
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
          You&apos;ve reached the free plan limit. Upgrade to track unlimited trips and protect your ILR application.
        </p>
      </div>

      {/* Free vs Pro comparison grid */}
      <div className="grid grid-cols-2 gap-3 px-6 pb-6">
        {/* Free column */}
        <div className="bg-[var(--color-bg-tinted)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="font-[family-name:var(--font-manrope)] font-bold text-[15px] text-[var(--color-text-primary)] mb-1">Free</p>
          <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)] mb-4">£0 / forever</p>
          {[
            { label: '10 trips', included: true },
            { label: 'PDF export', included: false },
            { label: 'Email alerts', included: false },
            { label: 'What-if planner', included: true },
            { label: 'Dashboard', included: true },
          ].map(({ label, included }) => (
            <div key={label} className="flex items-center gap-2 py-1">
              <span className={`text-sm font-semibold w-4 shrink-0 ${included ? 'text-[var(--color-green-light)]' : 'text-[var(--color-text-faint)]'}`}>
                {included ? '✓' : '✕'}
              </span>
              <span className={`text-[13px] ${included ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-faint)]'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Pro column */}
        <div className="relative bg-[var(--color-surface)] border-2 border-[var(--color-green)] rounded-xl p-4" style={{ boxShadow: '0 0 0 1px var(--color-green), var(--shadow-card)' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full bg-[var(--color-green)] text-white">
              Recommended
            </span>
          </div>
          <p className="font-[family-name:var(--font-manrope)] font-bold text-[15px] text-[var(--color-green-light)] mb-1">Pro</p>
          <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-faint)] mb-4">from £2.99/month</p>
          {[
            { label: 'Unlimited trips', included: true },
            { label: 'PDF export', included: true },
            { label: 'Email alerts', included: true },
            { label: 'What-if planner', included: true },
            { label: 'Dashboard', included: true },
          ].map(({ label, included }) => (
            <div key={label} className="flex items-center gap-2 py-1">
              <span className="text-sm font-semibold w-4 shrink-0 text-[var(--color-green-light)]">✓</span>
              <span className={`text-[13px] ${included ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-faint)]'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selection + CTA */}
      <div className="px-6 pb-6">
        <div className="space-y-2 mb-4" role="radiogroup" aria-label="Select plan">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id
            return (
              <label
                key={plan.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--color-green)] bg-[var(--color-green-pale)]/20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-green)]/40'
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
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[var(--color-green)]' : 'border-[var(--color-border-strong)]'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--color-green)]" />}
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{plan.label}</span>
                  {plan.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      plan.badge === 'Save 30%'
                        ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]'
                        : 'bg-[var(--color-green-pale)] text-[var(--color-green)]'
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--color-text-primary)]">
                  {plan.price}
                  <span className="text-xs font-normal text-[var(--color-text-muted)]">{plan.period}</span>
                </span>
              </label>
            )
          })}
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style={{ background: 'var(--gradient-green)' }}
        >
          <span className="flex items-center justify-center gap-2">
            {loading && <Spinner />}
            {loading ? 'Redirecting to checkout…' : `Upgrade to Pro — ${currentPlan.detail}`}
          </span>
        </button>

        {error && (
          <p className="mt-2 text-xs text-center text-[var(--color-danger-text)]">{error}</p>
        )}
      </div>

      {/* Fine print */}
      <p className="text-center text-[11px] text-[var(--color-text-faint)] leading-relaxed px-6 pb-5">
        Cancel anytime via Stripe billing portal.{' '}
        {!inline && (
          <button onClick={handleDismiss} className="underline hover:text-[var(--color-text-muted)] transition-colors cursor-pointer">
            Not now
          </button>
        )}
      </p>
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
