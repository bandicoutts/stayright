'use client'

import { useEffect, useRef, useState } from 'react'
import { TripFlowClient } from './TripFlowClient'
import type { TripInput } from '@/lib/calculations/absenceEngine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TripRow {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

interface TripModalProps {
  open: boolean
  mode: 'plan' | 'log' | 'edit'
  onClose: () => void
  existingTrips: TripInput[]
  visaStartDate?: string
  isPro: boolean
  tripCount: number
  // Edit mode only — pre-fills the form
  initialTrip?: TripRow
  /** Where TripFlowClient navigates after save / "Just checking". Defaults to '/trips'. */
  redirectTo?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TripModal({
  open,
  mode,
  onClose,
  existingTrips,
  visaStartDate,
  isPro,
  tripCount,
  initialTrip,
  redirectTo,
}: TripModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  // Edit mode: form is pre-filled so treat as dirty from the start.
  // Plan/log: becomes dirty on first input change (caught via onChangeCapture).
  const [isDirty, setIsDirty] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Keep a ref so ESC handler always sees the latest isDirty value
  const requestCloseRef = useRef<() => void>(() => {})

  // Reset dirty / confirm state when drawer opens or mode changes
  useEffect(() => {
    if (open) {
      setIsDirty(mode === 'edit')
      setShowConfirm(false)
    } else {
      setIsDirty(false)
      setShowConfirm(false)
    }
  }, [open, mode])

  // Sync requestClose into ref (avoids stale closure in ESC effect)
  function requestClose() {
    if (isDirty) {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }
  requestCloseRef.current = requestClose

  // ESC key — always routes through requestClose so the user gets the
  // confirmation dialog if they've started filling in the form
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestCloseRef.current()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Focus trap: keep keyboard focus inside the drawer
  useEffect(() => {
    if (!open || !drawerRef.current) return
    const drawer = drawerRef.current

    function getFocusables(): HTMLElement[] {
      return Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), ' +
          'select:not([disabled]), textarea:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"])'
        )
      )
    }

    // Move focus into the drawer
    getFocusables()[0]?.focus()

    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const els = getFocusables()
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === last) {
          first?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', onTab)
    return () => document.removeEventListener('keydown', onTab)
  }, [open])

  // Lock body scroll when the drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const drawerLabel =
    mode === 'plan' ? 'Plan a trip' :
    mode === 'log'  ? 'Log a trip' :
                     'Edit trip'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => requestCloseRef.current()}
      />

      {/* Drawer panel:
           Mobile  — bottom sheet, slides up from the bottom
           Desktop — right-side panel (480 px wide, full height) */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={drawerLabel}
        tabIndex={-1}
        className={`
          fixed z-50 bg-[var(--color-surface)] shadow-2xl outline-none overflow-y-auto
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[92dvh]
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-2xl md:max-h-[85vh]
          animate-drawer-mobile md:animate-in md:fade-in-0 md:zoom-in-95 md:slide-in-from-bottom-[5%] md:duration-500 md:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none
        `}
        // Mark form as dirty on any input change so the user gets the
        // "Discard changes?" dialog if they try to close
        onChangeCapture={() => setIsDirty(true)}
      >
        {/* Mobile drag handle pill */}
        <div className="md:hidden flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 bg-[var(--color-text-muted)]/20 rounded-full" />
        </div>

        {/* Sticky drawer header with close button */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{drawerLabel}</p>
          <button
            type="button"
            onClick={() => requestCloseRef.current()}
            aria-label="Close"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1.5 rounded-lg hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Trip form */}
        <TripFlowClient
          mode={mode}
          existingTrips={existingTrips}
          visaStartDate={visaStartDate}
          isPro={isPro}
          tripCount={tripCount}
          initialTrip={initialTrip}
          redirectTo={redirectTo}
        />
      </div>

      {/* Discard changes confirmation dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-dialog-title"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
            <h2
              id="discard-dialog-title"
              className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-2"
            >
              Discard this trip?
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              Any details you've entered will be lost.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirm(false); onClose() }}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[var(--color-surface-dark)] border border-[var(--color-border)] rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
