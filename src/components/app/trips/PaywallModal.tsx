'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  /** When true, renders as a full-width card (no overlay) for page-level paywall gates */
  inline?: boolean
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

export function PaywallModal({ open, onClose, inline = false }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly')
  const [toast, setToast] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button on open (modal mode)
  useEffect(() => {
    if (open && !inline) {
      closeRef.current?.focus()
    }
  }, [open, inline])

  // Keyboard close
  useEffect(() => {
    if (!open || inline) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, inline, onClose])

  if (!open && !inline) return null

  const currentPlan = PLANS.find((p) => p.id === selectedPlan)!

  function handleUpgrade() {
    // TODO: wire to Stripe Checkout in the payments sprint (DECISION-021)
    console.warn('[PaywallModal] Stripe Checkout not yet wired. Plan selected:', selectedPlan)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const content = (
    <div className="relative bg-white rounded-2xl shadow-xl border border-[#191C1D]/8 p-8 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-xl text-[#191C1D]">
            Unlock Pro
          </h2>
          <p className="text-sm text-[#3D4A42] mt-0.5">
            Keep tracking without limits
          </p>
        </div>
        {!inline && (
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="text-[#3D4A42] hover:text-[#191C1D] transition-colors cursor-pointer -mt-1 -mr-1 p-1 rounded-lg hover:bg-[#F8F9FA]"
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
          <li key={benefit} className="flex items-center gap-3 text-sm text-[#191C1D]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#006948]/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#006948]" viewBox="0 0 12 12" fill="none">
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
                  ? 'border-[#006948] bg-[#006948]/5'
                  : 'border-[#191C1D]/12 hover:border-[#191C1D]/25'
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
                  isSelected ? 'border-[#006948]' : 'border-[#191C1D]/30'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#006948]" />
                  )}
                </div>
                <span className="text-sm font-medium text-[#191C1D]">{plan.label}</span>
                {plan.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    plan.badge === 'Save 30%'
                      ? 'bg-[#D97706]/10 text-[#D97706]'
                      : 'bg-[#006948]/10 text-[#006948]'
                  }`}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-[#191C1D]">
                {plan.price}
                <span className="text-xs font-normal text-[#3D4A42]">{plan.period}</span>
              </span>
            </label>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleUpgrade}
        className="w-full bg-gradient-to-r from-[#006948] to-[#00855D] text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
      >
        Upgrade to Pro — {currentPlan.detail}
      </button>

      {/* Coming soon toast */}
      {toast && (
        <div className="mt-3 px-4 py-2 bg-[#191C1D]/8 rounded-xl text-xs text-center text-[#3D4A42]">
          Payments coming soon — thank you for your patience!
        </div>
      )}

      {/* Dismiss */}
      {!inline && (
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-sm text-[#3D4A42] hover:text-[#191C1D] transition-colors cursor-pointer"
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {content}
    </div>
  )
}
