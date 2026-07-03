import {
  Calendar,
  Calculator,
  ShieldCheck,
  AirplaneTilt,
  Check,
  FileArrowDown,
} from '@/components/ui/Icons';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Rolling-window checks',
    description: 'Checks each 12-month period across your qualifying span, not only the calendar year.',
  },
  {
    icon: Calculator,
    title: 'What-if trip simulator',
    description: 'Add dates for a planned trip and see how it affects your 180-day count before you book.',
  },
  {
    icon: ShieldCheck,
    title: 'Live 180-day tracker',
    description: 'See days used and days left in your highest rolling window, based on your saved trips.',
  },
  {
    icon: AirplaneTilt,
    title: 'Quick trip logging',
    description: 'Enter the dates you left and returned. StayRight recalculates when you save.',
  },
  {
    icon: Check,
    title: 'Status at a glance',
    description: 'See whether your current window is safe, getting close, or over the limit.',
  },
  {
    icon: FileArrowDown,
    title: 'One-click ILR export',
    description: 'Generate a PDF of your travel history when you need records for your ILR application.',
  },
];

export default function Features() {
  return (
    <section id="features" className="px-6 md:px-14" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-[1240px] mx-auto py-[72px]">
        <div
          className="font-[family-name:var(--font-mono)] tracking-[0.16em] uppercase mb-4"
          style={{ fontSize: '0.8125rem', color: 'var(--color-green-light)' }}
        >
          what StayRight tracks
        </div>
        <h2
          className="font-[family-name:var(--font-heading)] font-bold leading-[1.02] tracking-[-0.03em] mb-12 max-w-[720px]"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3.25rem)', color: 'var(--color-text-primary)' }}
        >
          The main checks in one place.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl p-7"
                style={{ background: 'var(--color-surface-warm)', border: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center mb-4 shrink-0"
                  style={{ background: 'var(--color-green-pale)' }}
                  aria-hidden="true"
                >
                  <Icon className="w-[18px] h-[18px]" weight="regular" style={{ color: 'var(--color-green)' }} />
                </div>
                <h3
                  className="font-[family-name:var(--font-heading)] font-bold leading-[1.25] tracking-[-0.01em] mb-2"
                  style={{ fontSize: '1.1875rem', color: 'var(--color-text-primary)' }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-[family-name:var(--font-body)] leading-[1.5]"
                  style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}
                >
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
