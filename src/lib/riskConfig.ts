import type { RiskStatus } from '@/lib/calculations/absenceEngine'

// WCAG: colour + text label — colour alone fails WCAG AA
// chip: Tailwind classes for status badge (shared across QuotaRing, PeakWindowCard, etc.)
export const RISK_CONFIG: Record<RiskStatus, { bg: string; text: string; label: string; chip: string }> = {
  SAFE:    { bg: 'bg-[#9ff4ca]',  text: 'text-[#002114]',  label: 'Compliant',        chip: 'bg-[var(--color-safe-bg)] text-[var(--color-safe-text)]'       },
  WARNING: { bg: 'bg-[#ffdcbb]',  text: 'text-[#2c1600]',  label: 'Approaching Limit', chip: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]' },
  DANGER:  { bg: 'bg-[#ffdad6]',  text: 'text-[#410002]',  label: 'Near Breach',       chip: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'   },
  BREACH:  { bg: 'bg-[#ffdad6]',  text: 'text-[#410002]',  label: 'Breach',            chip: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'   },
}
