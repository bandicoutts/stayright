import type { RiskStatus } from '@/lib/calculations/absenceEngine'

// WCAG: colour + text label — colour alone fails WCAG AA
// chip: Tailwind classes for status badge (shared across QuotaRing, PeakWindowCard, etc.)
export const RISK_CONFIG: Record<RiskStatus, { bg: string; text: string; label: string; chip: string }> = {
  SAFE:    { bg: 'bg-[var(--color-safe-bg)]',    text: 'text-[var(--color-safe-text)]',    label: 'Compliant',        chip: 'bg-[var(--color-safe-bg)] text-[var(--color-safe-text)]'       },
  WARNING: { bg: 'bg-[var(--color-warning-bg)]', text: 'text-[var(--color-warning-text)]', label: 'Approaching Limit', chip: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]' },
  DANGER:  { bg: 'bg-[var(--color-danger-bg)]',  text: 'text-[var(--color-danger-text)]',  label: 'Near Breach',       chip: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'   },
  BREACH:  { bg: 'bg-[var(--color-danger-bg)]',  text: 'text-[var(--color-danger-text)]',  label: 'Breach',            chip: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'   },
}
