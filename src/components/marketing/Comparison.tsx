import { Check, X } from '@/components/ui/Icons';

const SPREADSHEET = [
  'Enter every trip and formula yourself',
  'Recheck each rolling 12-month window by hand',
  'Miss one formula and the count is wrong',
  'Hard to test a trip before booking',
  'No clear record when you need evidence',
];

const STAYRIGHT = [
  'Log each trip with departure and return dates',
  'Check every rolling 12-month window',
  'Use the same absence formula each time',
  'Test planned travel before you book',
  'Export your travel history for ILR records',
];

export default function Comparison() {
  return (
    <section className="px-6 md:px-14" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1240px] mx-auto py-[72px]">
        <div
          className="font-[family-name:var(--font-mono)] tracking-[0.16em] uppercase mb-4"
          style={{ fontSize: '0.8125rem', color: 'var(--color-green-light)' }}
        >
          spreadsheets vs StayRight
        </div>
        <h2
          className="font-[family-name:var(--font-heading)] font-bold leading-[1.02] tracking-[-0.03em] mb-3 max-w-[760px]"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3.25rem)', color: 'var(--color-text-primary)' }}
        >
          Spreadsheets make the 180-day rule easy to misread.
        </h2>
        <p
          className="font-[family-name:var(--font-body)] leading-[1.55] mb-11 max-w-[600px]"
          style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)' }}
        >
          StayRight keeps the calculation, trip history, and planned travel check
          in one place.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Spreadsheet */}
          <div
            className="rounded-2xl p-7 md:p-8"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <span
              className="inline-flex items-center font-[family-name:var(--font-mono)] mb-6 px-3 py-1.5 rounded-full"
              style={{ fontSize: '0.8125rem', color: 'var(--color-status-red)', border: '1px solid var(--color-danger-border)', background: 'var(--color-danger-bg)' }}
            >
              The spreadsheet
            </span>
            <ul className="flex flex-col gap-[18px]">
              {SPREADSHEET.map((t) => (
                <li key={t} className="flex gap-3" style={{ color: 'var(--color-text-muted)' }}>
                  <X className="w-4 h-4 mt-0.5 shrink-0" weight="bold" style={{ color: 'var(--color-status-red)' }} />
                  <span className="font-[family-name:var(--font-body)] text-[15px] leading-[1.45]">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* StayRight */}
          <div
            className="rounded-2xl p-7 md:p-8"
            style={{
              border: '1px solid var(--color-green)',
              background: 'var(--color-green-pale)',
            }}
          >
            <span
              className="inline-flex items-center font-[family-name:var(--font-mono)] mb-6 px-3 py-1.5 rounded-full"
              style={{ fontSize: '0.8125rem', color: 'var(--color-green)', border: '1px solid var(--color-green)', background: 'var(--color-surface)' }}
            >
              StayRight
            </span>
            <ul className="flex flex-col gap-[18px]">
              {STAYRIGHT.map((t) => (
                <li key={t} className="flex gap-3" style={{ color: 'var(--color-text-2)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" weight="bold" style={{ color: 'var(--color-green)' }} />
                  <span className="font-[family-name:var(--font-body)] text-[15px] leading-[1.45]">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
