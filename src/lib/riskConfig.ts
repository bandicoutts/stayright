import type { RiskStatus } from '@/lib/calculations/absenceEngine'

// WCAG: colour + text label — colour alone fails WCAG AA
export const RISK_CONFIG: Record<RiskStatus, { bg: string; text: string; label: string }> = {
  SAFE:    { bg: 'bg-[#006948]/10',  text: 'text-[#006948]',  label: 'Safe'    },
  WARNING: { bg: 'bg-[#D97706]/10',  text: 'text-[#92400E]',  label: 'Warning' },
  DANGER:  { bg: 'bg-[#BA1A1A]/10',  text: 'text-[#BA1A1A]',  label: 'Danger'  },
  BREACH:  { bg: 'bg-[#8E0009]/10',  text: 'text-[#8E0009]',  label: 'Breach'  },
}
