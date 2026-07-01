'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/dateFormatters'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DateRangePickerProps {
  departureDate: string      // YYYY-MM-DD or ''
  returnDate: string         // YYYY-MM-DD or ''
  returnDateKnown: boolean
  onDepartureChange: (v: string) => void
  onReturnChange: (v: string) => void
  onReturnDateKnownChange: (v: boolean) => void
  /** When true, hides the "I'll log my return later" quick action.
   *  Use in contexts where a return date is always required (e.g. onboarding). */
  hideReturnLater?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayISO(): string {
  const d = new Date()
  return toISO(d.getFullYear(), d.getMonth(), d.getDate())
}


function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Returns 0 = Monday … 6 = Sunday
function firstWeekday(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DateRangePicker({
  departureDate,
  returnDate,
  returnDateKnown,
  onDepartureChange,
  onReturnChange,
  onReturnDateKnownChange,
  hideReturnLater = false,
}: DateRangePickerProps) {
  // Initialise view to the departure month (edit mode) or current month
  const [viewYear, setViewYear] = useState(() => {
    if (departureDate) return +departureDate.slice(0, 4)
    return new Date().getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    if (departureDate) return +departureDate.slice(5, 7) - 1
    return new Date().getMonth()
  })

  // Month/year jump picker — lets the user leap to a distant month without
  // stepping one month at a time (e.g. logging a 2023 trip from 2026).
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(viewYear)

  // Which date the user should pick next
  const [picking, setPicking] = useState<'departure' | 'return'>(() =>
    departureDate && !(returnDate && returnDateKnown) ? 'return' : 'departure'
  )

  // Hover preview: show a provisional range end while the user mouses over dates
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  const today = todayISO()
  const numDays = daysInMonth(viewYear, viewMonth)
  const offset = firstWeekday(viewYear, viewMonth)

  // The return date used for range rendering (confirmed or hover preview)
  const effectiveReturn =
    picking === 'return' && !returnDate && hoverDate ? hoverDate : returnDate

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  function togglePicker() {
    setPickerYear(viewYear)
    setPickerOpen((o) => !o)
  }

  function selectPickerMonth(monthIndex: number) {
    setViewYear(pickerYear)
    setViewMonth(monthIndex)
    setPickerOpen(false)
  }

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------

  function handleDayClick(iso: string) {
    if (picking === 'departure' || !departureDate) {
      onDepartureChange(iso)
      onReturnChange('')
      onReturnDateKnownChange(true)
      setPicking('return')
    } else {
      // picking === 'return'
      if (iso < departureDate) {
        // Tapped before departure — restart with this as the new departure
        onDepartureChange(iso)
        onReturnChange('')
        setPicking('return')
      } else {
        // Valid return (same day or after)
        onReturnChange(iso)
        onReturnDateKnownChange(true)
        // Reset picking so a subsequent tap restarts the flow
        setPicking('departure')
      }
    }
    setHoverDate(null)
  }

  function handleTodayShortcut() {
    onDepartureChange(today)
    onReturnChange('')
    onReturnDateKnownChange(true)
    setPicking('return')
    const d = new Date()
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function handleCurrentlyAbroad() {
    onReturnDateKnownChange(false)
    onReturnChange('')
    setPicking('departure')
  }

  function handleResetDeparture() {
    onDepartureChange('')
    onReturnChange('')
    onReturnDateKnownChange(true)
    setPicking('departure')
  }

  function handleResetReturn() {
    if (!departureDate) return
    onReturnChange('')
    onReturnDateKnownChange(true)
    setPicking('return')
  }

  // ---------------------------------------------------------------------------
  // Render helper: single day cell
  //
  // The whole grid column is the tap target (>=44px tall, full column wide) so
  // it's hard to mis-tap on a phone; the circular brand visual is a centred
  // inner element rather than the hit area itself.
  // ---------------------------------------------------------------------------

  function renderCell(day: number) {
    const iso = toISO(viewYear, viewMonth, day)
    const isDep = iso === departureDate
    const isRet = iso === returnDate
    const isToday = iso === today
    const isSelected = isDep || isRet

    // Range band
    const hasRange = !!(
      departureDate &&
      effectiveReturn &&
      effectiveReturn !== departureDate
    )
    const isRangeStart = isDep && hasRange
    const isRangeEnd = iso === effectiveReturn && hasRange && !isDep
    const isInRange = hasRange && iso > departureDate && iso < effectiveReturn

    // Is this the provisional hover end (not yet confirmed)?
    const isHoverEnd =
      picking === 'return' &&
      hoverDate === iso &&
      iso !== returnDate &&
      iso > (departureDate ?? '')

    return (
      <div key={iso} className="relative">
        {/* Range background band — sits behind the circle, vertically centred */}
        {(isInRange || isRangeStart || isRangeEnd) && (
          <div
            className={`absolute inset-y-[5px] bg-[var(--color-green-pale)] ${
              isRangeStart ? 'left-1/2 right-0' :
              isRangeEnd   ? 'left-0 right-1/2' :
              'left-0 right-0'
            }`}
          />
        )}

        {/* Full-column tap target (44px tall) wrapping the visual circle */}
        <button
          type="button"
          onClick={() => handleDayClick(iso)}
          onMouseEnter={() => {
            if (picking === 'return' && departureDate) setHoverDate(iso)
          }}
          onMouseLeave={() => setHoverDate(null)}
          aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}${isSelected ? ', selected' : ''}`}
          aria-pressed={isSelected}
          className="group relative z-10 flex w-full h-11 items-center justify-center cursor-pointer"
        >
          <span
            className={`flex w-9 h-9 items-center justify-center rounded-full text-sm transition-colors ${
              isSelected
                ? 'bg-[var(--color-green)] text-white font-semibold'
                : isHoverEnd
                ? 'bg-[var(--color-green-pale)] text-[var(--color-green)] font-medium'
                : 'text-[var(--color-text-primary)] group-hover:bg-[var(--color-surface-warm)] group-hover:shadow-sm'
            }`}
          >
            {day}
          </span>
        </button>

        {/* Today dot — shown only when the day is not selected */}
        {isToday && !isSelected && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-green)]" />
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Instruction prompt
  // ---------------------------------------------------------------------------

  const depIsSet = !!departureDate
  const retIsSet = returnDateKnown ? !!returnDate : true

  let prompt: string
  if (pickerOpen) {
    prompt = 'Jump to a month'
  } else if (!depIsSet) {
    prompt = 'Tap your departure date'
  } else if (returnDateKnown && !retIsSet) {
    prompt = 'Now tap your return date'
  } else {
    prompt = 'Tap any date to change'
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* ── Date summary boxes ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Departure box */}
        <button
          type="button"
          onClick={handleResetDeparture}
          className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
            picking === 'departure'
              ? 'border-[var(--color-green)] ring-2 ring-[var(--color-green)]/20 bg-[var(--color-green-pale)]/30'
              : 'border-[var(--color-border)] hover:border-[var(--color-green)]/30'
          }`}
        >
          <p className="text-xs text-[var(--color-text-muted)] mb-0.5 font-medium">Departed UK</p>
          <p className={`text-sm font-semibold leading-snug ${
            departureDate ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-faint)]'
          }`}>
            {departureDate ? formatDate(departureDate) : '—'}
          </p>
        </button>

        {/* Return box */}
        <button
          type="button"
          onClick={handleResetReturn}
          disabled={!departureDate}
          className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
            !departureDate
              ? 'border-[var(--color-border)] opacity-40 cursor-not-allowed'
              : picking === 'return' && returnDateKnown
              ? 'border-[var(--color-green)] ring-2 ring-[var(--color-green)]/20 bg-[var(--color-green-pale)]/30 cursor-pointer'
              : 'border-[var(--color-border)] hover:border-[var(--color-green)]/30 cursor-pointer'
          }`}
        >
          <p className="text-xs text-[var(--color-text-muted)] mb-0.5 font-medium">Returned to UK</p>
          <p className={`text-sm font-semibold leading-snug ${
            !returnDateKnown
              ? 'text-[var(--color-warning-text)]'
              : returnDate
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-faint)]'
          }`}>
            {!returnDateKnown
              ? 'Currently abroad'
              : returnDate
              ? formatDate(returnDate)
              : '—'}
          </p>
        </button>
      </div>

      {/* ── Calendar ────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-bg-tinted)] rounded-xl p-3 border border-[var(--color-border)]/50">
        {/* Instruction prompt */}
        <p className="text-xs text-center text-[var(--color-text-muted)] mb-3 font-medium">{prompt}</p>

        {/* Month navigation — centre label opens the month/year jump picker */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={pickerOpen}
            aria-label="Previous month"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePicker}
            aria-expanded={pickerOpen}
            aria-label="Choose month and year"
            className="flex items-center gap-1.5 px-3 h-11 rounded-lg text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)] transition-colors cursor-pointer select-none"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
            <svg className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform ${pickerOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextMonth}
            disabled={pickerOpen}
            aria-label="Next month"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {pickerOpen ? (
          /* ── Month / year jump picker ──────────────────────────────── */
          <div>
            {/* Year stepper */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                aria-label="Previous year"
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="font-[family-name:var(--font-mono)] text-base font-semibold text-[var(--color-text-primary)] select-none tabular-nums">
                {pickerYear}
              </span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                aria-label="Next year"
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Month grid (3 × 4) */}
            <div className="grid grid-cols-3 gap-1.5">
              {MONTH_ABBR.map((m, idx) => {
                const isCurrentView = idx === viewMonth && pickerYear === viewYear
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectPickerMonth(idx)}
                    aria-label={`${MONTH_NAMES[idx]} ${pickerYear}`}
                    aria-pressed={isCurrentView}
                    className={`h-11 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isCurrentView
                        ? 'bg-[var(--color-green)] text-white'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* ── Day grid ──────────────────────────────────────────────── */
          <>
            {/* Weekday labels */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-[var(--color-text-faint)] select-none py-0.5"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: numDays }, (_, i) => renderCell(i + 1))}
            </div>
          </>
        )}
      </div>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {/* "I'm leaving today" — only shown when no departure is set yet */}
        {!departureDate && (
          <button
            type="button"
            onClick={handleTodayShortcut}
            className="text-sm text-[var(--color-green-light)] font-medium hover:underline cursor-pointer"
            role="switch"
            aria-checked="false"
          >
            I&apos;m leaving today
          </button>
        )}

        {/* "Log return later" — shown while picking return (hidden when return date is required) */}
        {!hideReturnLater && picking === 'return' && returnDateKnown && !returnDate && (
          <button
            type="button"
            onClick={handleCurrentlyAbroad}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:underline cursor-pointer"
          >
            I&apos;ll log my return later →
          </button>
        )}

        {/* "Enter return date" — shown when currently abroad is active */}
        {!returnDateKnown && (
          <button
            type="button"
            onClick={handleResetReturn}
            className="text-sm text-[var(--color-green-light)] font-medium hover:underline cursor-pointer"
          >
            Enter return date
          </button>
        )}
      </div>
    </div>
  )
}
