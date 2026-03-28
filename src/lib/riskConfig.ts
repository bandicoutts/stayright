import type { RiskStatus } from '@/lib/calculations/absenceEngine'

// WCAG: colour + text label — colour alone fails WCAG AA
export const RISK_CONFIG: Record<RiskStatus, { bg: string; text: string; label: string }> = {
  SAFE:    { bg: 'bg-[#9ff4ca]',  text: 'text-[#002114]',  label: 'Compliant'       },
  WARNING: { bg: 'bg-[#ffdcbb]',  text: 'text-[#2c1600]',  label: 'Approaching Limit' },
  DANGER:  { bg: 'bg-[#ffdad6]',  text: 'text-[#410002]',  label: 'Near Breach'     },
  BREACH:  { bg: 'bg-[#ffdad6]',  text: 'text-[#410002]',  label: 'Breach'  },
}
