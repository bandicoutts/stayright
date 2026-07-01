import { getRiskStatus, type RiskStatus } from '@/lib/calculations/absenceEngine'
import { formatDate } from '@/lib/utils/dateFormatters'

export interface PreviewRow {
  id: string
  destination: string
  departure_date: string
  return_date: string
  days: number
  isCrown: boolean
  notes: string | null
}

interface Props {
  profile: { firstName: string; lastName: string | null; visaRoute: string; visaStartDate: string | null }
  periodLabel: string
  periodStart: string | null
  periodEnd: string
  rows: PreviewRow[]
  totalDays: number
  peakDays: number
  periodDays: number
  generatedOn: string
}

const VERDICT: Record<RiskStatus, { label: string; tone: string }> = {
  SAFE: { label: 'Compliant', tone: 'var(--color-green)' },
  WARNING: { label: 'Approaching limit', tone: 'var(--color-status-amber)' },
  DANGER: { label: 'At risk of breach', tone: 'var(--color-status-red)' },
  BREACH: { label: 'Breach', tone: 'var(--color-status-red)' },
}

function addYears(isoStr: string, years: number): string {
  const d = new Date(isoStr + 'T00:00:00Z')
  d.setUTCFullYear(d.getUTCFullYear() + years)
  return d.toISOString().split('T')[0]
}

/**
 * On-screen A4 mirror of the @react-pdf absence record. Derives the same figures
 * from absenceEngine so the preview matches the exported PDF (it is NOT a second
 * source of truth — the export still streams the PDF document).
 */
export function ReportPreview({
  profile, periodLabel, periodStart, periodEnd, rows, totalDays, peakDays, periodDays, generatedOn,
}: Props) {
  const status = getRiskStatus(peakDays)
  const verdict = VERDICT[status]
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Not set'
  const ilrTarget = profile.visaStartDate ? formatDate(addYears(profile.visaStartDate, 5)) : 'N/A'

  return (
    <div
      className="w-full max-w-[820px] rounded-lg overflow-hidden text-[#191C1D]"
      style={{ background: '#ffffff', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="p-6 sm:p-10 font-[family-name:var(--font-body)]">
        {/* Letterhead */}
        <div className="rounded-md px-5 py-4 mb-6" style={{ background: '#006948' }}>
          <p className="font-[family-name:var(--font-heading)] font-bold text-[18px] text-white leading-tight">
            StayRight · Absence History &amp; Compliance Record
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#CCEDE3' }}>UK Skilled Worker Visa · 180-Day Absence Rule</p>
        </div>

        {/* Applicant + period meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Name', value: name },
            { label: 'Visa route', value: profile.visaRoute },
            { label: 'Visa start', value: profile.visaStartDate ? formatDate(profile.visaStartDate) : 'N/A' },
            { label: 'ILR target', value: ilrTarget },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[8px] uppercase tracking-[0.5px] text-[#3D4A42] mb-0.5">{m.label}</p>
              <p className="font-semibold text-[11px]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Reporting period + compliance statement */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 mb-6" style={{ background: '#E8F5F0' }}>
          <div>
            <p className="text-[8px] uppercase tracking-[0.5px] text-[#3D4A42] mb-0.5">Reporting period</p>
            <p className="font-semibold text-[12px]">
              {periodLabel}
              {periodStart && (
                <span className="font-normal text-[#3D4A42]"> · {formatDate(periodStart)} – {formatDate(periodEnd)}</span>
              )}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: '#fff', color: verdict.tone, border: `1px solid ${verdict.tone}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: verdict.tone }} />
            {verdict.label}
          </span>
        </div>

        {/* 4-up summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryCell label="Total days absent" value={`${totalDays}`} sub="/ 180" />
          <SummaryCell label="Rolling window peak" value={`${peakDays}`} sub="/ 180" tone={verdict.tone} />
          <SummaryCell label="Days to spare" value={`${Math.max(0, 180 - peakDays)}`} sub="days" />
          <SummaryCell label="Days in period" value={`${periodDays}`} sub="days" />
        </div>

        {/* Absence table */}
        <p className="font-[family-name:var(--font-heading)] font-bold text-[12px] text-[#006948] border-b border-[#006948] pb-1.5 mb-2">
          Absence record
        </p>
        <div className="overflow-hidden rounded-sm">
          <div className="grid grid-cols-[1fr_1fr_1.6fr_0.5fr] gap-2 px-2.5 py-1.5 text-white text-[8px] font-bold uppercase tracking-[0.3px]" style={{ background: '#006948' }}>
            <span>Departure</span><span>Return</span><span>Destination</span><span className="text-right">Days</span>
          </div>
          {rows.length === 0 ? (
            <p className="px-2.5 py-4 text-[10px] italic text-[#3D4A42]">No absences recorded during this period.</p>
          ) : (
            rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-[1fr_1fr_1.6fr_0.5fr] gap-2 px-2.5 py-1.5 text-[10px] border-b border-[#E8EAE8]" style={{ background: i % 2 ? '#F3F4F5' : '#fff' }}>
                <span>{formatDate(r.departure_date)}</span>
                <span>{formatDate(r.return_date)}</span>
                <span className="truncate">{r.destination}{r.isCrown ? ' (Crown Dep.)' : ''}</span>
                <span className="text-right text-[#3D4A42]">{r.days}</span>
              </div>
            ))
          )}
          {rows.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_1.6fr_0.5fr] gap-2 px-2.5 py-2 text-[10px] font-bold" style={{ background: '#E8F5F0', color: '#006948' }}>
              <span className="col-span-3">Total absence days</span>
              <span className="text-right text-[#191C1D]">{totalDays}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-2.5 border-t border-[#E8EAE8] text-[8px] text-[#9BA8A2]">
          <span>StayRight · Absence History &amp; Compliance Record</span>
          <span>Generated {generatedOn} · For immigration advice, consult a registered adviser</span>
        </div>
      </div>
    </div>
  )
}

function SummaryCell({ label, value, sub, tone, small }: { label: string; value: string; sub?: string; tone?: string; small?: boolean }) {
  return (
    <div className="rounded-md border border-[#E8EAE8] px-3 py-2.5" style={{ background: '#fff' }}>
      <p className="text-[8px] uppercase tracking-[0.5px] text-[#3D4A42] mb-1">{label}</p>
      <p className="font-[family-name:var(--font-mono)] font-semibold leading-none" style={{ color: tone ?? '#191C1D', fontSize: small ? '13px' : '22px' }}>
        {value}
        {sub && <span className="text-[10px] font-normal text-[#3D4A42]"> {sub}</span>}
      </p>
    </div>
  )
}
