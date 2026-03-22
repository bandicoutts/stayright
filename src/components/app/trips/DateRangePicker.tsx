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
      <div key={iso} className="relative py-[3px]">
        {/* Range background band — sits behind the circle */}
        {(isInRange || isRangeStart || isRangeEnd) && (
          <div
            className={`absolute inset-y-0 bg-[#006948]/10 ${
              isRangeStart ? 'left-1/2 right-0' :
              isRangeEnd   ? 'left-0 right-1/2' :
              'left-0 right-0'
            }`}
          />
        )}

        {/* Day circle */}
        <button
          type="button"
          onClick={() => handleDayClick(iso)}
          onMouseEnter={() => {
            if (picking === 'return' && departureDate) setHoverDate(iso)
          }}
          onMouseLeave={() => setHoverDate(null)}
          aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}${isSelected ? ', selected' : ''}`}
          aria-pressed={isSelected}
          className={`
            relative z-10 mx-auto flex w-9 h-9 items-center justify-center
            rounded-full text-sm transition-colors cursor-pointer
            ${isSelected
              ? 'bg-[#006948] text-white font-semibold'
              : isHoverEnd
              ? 'bg-[#006948]/20 text-[#006948] font-medium'
              : 'hover:bg-white hover:shadow-sm text-[#191C1D]'
            }
          `}
        >
          {day}
        </button>

        {/* Today dot — shown only when the day is not selected */}
        {isToday && !isSelected && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#006948]" />
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
  if (!depIsSet) {
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
              ? 'border-[#006948] ring-2 ring-[#006948]/20 bg-[#006948]/4'
              : 'border-[#191C1D]/15 hover:border-[#191C1D]/30'
          }`}
        >
          <p className="text-xs text-[#3D4A42] mb-0.5 font-medium">Departed UK</p>
          <p className={`text-sm font-semibold leading-snug ${
            departureDate ? 'text-[#191C1D]' : 'text-[#3D4A42]/40'
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
              ? 'border-[#191C1D]/8 opacity-40 cursor-not-allowed'
              : picking === 'return' && returnDateKnown
              ? 'border-[#006948] ring-2 ring-[#006948]/20 bg-[#006948]/4 cursor-pointer'
              : 'border-[#191C1D]/15 hover:border-[#191C1D]/30 cursor-pointer'
          }`}
        >
          <p className="text-xs text-[#3D4A42] mb-0.5 font-medium">Returned to UK</p>
          <p className={`text-sm font-semibold leading-snug ${
            !returnDateKnown
              ? 'text-[#D97706]'
              : returnDate
              ? 'text-[#191C1D]'
              : 'text-[#3D4A42]/40'
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
      <div className="bg-[#F3F4F5] rounded-xl p-3">
        {/* Instruction prompt */}
        <p className="text-xs text-center text-[#3D4A42] mb-3 font-medium">{prompt}</p>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#3D4A42] hover:text-[#191C1D] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-[#191C1D] select-none">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#3D4A42] hover:text-[#191C1D] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-[#3D4A42] select-none py-0.5"
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
      </div>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {/* "I'm leaving today" — only shown when no departure is set yet */}
        {!departureDate && (
          <button
            type="button"
            onClick={handleTodayShortcut}
            className="text-sm text-[#006948] font-medium hover:underline cursor-pointer"
          >
            I'm leaving today
          </button>
        )}

        {/* "Log return later" — shown while picking return (hidden when return date is required) */}
        {!hideReturnLater && picking === 'return' && returnDateKnown && !returnDate && (
          <button
            type="button"
            onClick={handleCurrentlyAbroad}
            className="text-sm text-[#3D4A42] hover:text-[#191C1D] hover:underline cursor-pointer"
          >
            I'll log my return later →
          </button>
        )}

        {/* "Enter return date" — shown when currently abroad is active */}
        {!returnDateKnown && (
          <button
            type="button"
            onClick={handleResetReturn}
            className="text-sm text-[#006948] font-medium hover:underline cursor-pointer"
          >
            Enter return date
          </button>
        )}
      </div>
    </div>
  )
}
