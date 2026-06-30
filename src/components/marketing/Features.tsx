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
    title: 'Rolling-window calculation',
    description: 'Checks every possible 12-month period across your whole qualifying span, not just a single calendar year.',
  },
  {
    icon: Calculator,
    title: 'What-if trip simulator',
    description: 'Add a future trip and see instantly whether it keeps you under 180 days, before you book a thing.',
  },
  {
    icon: ShieldCheck,
    title: 'Live 180-day tracker',
    description: 'A real-time count of days used and days left in your tightest rolling window, always up to date.',
  },
  {
    icon: AirplaneTilt,
    title: 'Quick trip logging',
    description: 'Enter the dates you left and returned. Compliance recalculates the moment you save.',
  },
  {
    icon: Check,
    title: 'At-a-glance status',
    description: 'One clear signal: safe, getting close, or over the line. No maths in your head.',
  },
  {
    icon: FileArrowDown,
    title: 'One-click ILR export',
    description: 'Generate a clean, Home Office-ready PDF of your full travel history whenever you need it.',
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
          everything the rule demands
        </div>
        <h2
          className="font-[family-name:var(--font-manrope)] font-bold leading-[1.02] tracking-[-0.03em] mb-12 max-w-[720px]"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3.25rem)', color: 'var(--color-text-primary)' }}
        >
          Six tools that keep your timeline airtight.
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
                  className="font-[family-name:var(--font-manrope)] font-bold leading-[1.25] tracking-[-0.01em] mb-2"
                  style={{ fontSize: '1.1875rem', color: 'var(--color-text-primary)' }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-[family-name:var(--font-inter)] leading-[1.5]"
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
