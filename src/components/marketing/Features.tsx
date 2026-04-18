import {
  Calendar,
  AirplaneTilt,
  ShieldCheck,
  Calculator,
  Bell,
  FileArrowDown,
} from '@/components/ui/Icons';

const features = [
  {
    icon: Calendar,
    title: 'Continuous Residence Monitor',
    description:
      'Visual calendar and running total against the 180-day ILR limit. Never lose track of your window.',
  },
  {
    icon: AirplaneTilt,
    title: 'Trip logging',
    description:
      'Log departures and returns in seconds from any device. Precise tracking for every border crossing.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Dashboard',
    description:
      'Green / amber / red compliance indicator at a glance. Instant peace of mind for your visa status.',
  },
  {
    icon: Bell,
    title: 'Breach Prevention Alerts',
    description:
      "Email reminders before you approach your limit. We watch the clock so you don't have to.",
  },
  {
    icon: FileArrowDown,
    title: 'Export ready',
    description:
      'Generate absence tables formatted for your ILR application (SET(O) form). One-click documentation.',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="px-6 md:px-14"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="max-w-[1320px] mx-auto py-[90px]">

        {/* Section header */}
        <div className="max-w-2xl mb-14">
          <div className="mb-[14px]">
            <span
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.16em] uppercase"
              style={{ fontSize: '0.6875rem', color: 'var(--color-green)' }}
            >
              Features
            </span>
          </div>
          <h2
            className="font-[family-name:var(--font-manrope)] font-extrabold leading-[1.06] tracking-[-0.038em]"
            style={{ fontSize: 'clamp(2rem, 3.2vw, 3.25rem)', color: 'var(--color-text-primary)' }}
          >
            Built for the{' '}
            <em
              className="not-italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.015em',
                color: 'var(--color-text-muted)',
              }}
            >
              &apos;any 12-month&apos; rule.
            </em>
          </h2>
          <p
            className="font-[family-name:var(--font-inter)] leading-[1.65] mt-5 max-w-[480px]"
            style={{ fontSize: '1.0625rem', color: 'var(--color-text-2)' }}
          >
            The Home Office doesn&apos;t just look at the last year. They check every
            possible 12-month window in your 5-year history. StayRight does the
            math for you.
          </p>
        </div>

        {/* Bento grid — hero left, feature cards right */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-3 items-stretch">

          {/* Hero card — What-If Simulator */}
          <div
            role="region"
            aria-labelledby="feature-what-if-title"
            className="flex flex-col p-10 group relative overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderRadius: 12,
              borderTop: '2px solid var(--color-green)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center mb-4 shrink-0"
              style={{ background: 'var(--color-border)' }}
              aria-hidden="true"
            >
              <Calculator
                className="w-[18px] h-[18px]"
                style={{ color: '#00A874' }}
                weight="light"
              />
            </div>

            <h3
              id="feature-what-if-title"
              className="font-[family-name:var(--font-manrope)] font-bold leading-[1.2] tracking-[-0.02em] mb-3"
              style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}
            >
              What-if simulator
            </h3>
            <p
              className="font-[family-name:var(--font-inter)] leading-[1.6] mb-auto max-w-[280px]"
              style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}
            >
              Plan any trip and instantly see its impact on your rolling window before you book.
            </p>

            {/* Mockup UI */}
            <div className="mt-10 relative min-h-[160px]">
              <div
                className="absolute -bottom-10 -right-2 md:-right-10 w-[110%] sm:w-[85%] md:w-[90%] lg:w-[380px] rounded-t-2xl p-6 origin-bottom-right rotate-2 transition-transform duration-500 group-hover:rotate-0"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
                }}
              >
                {/* Destination Row */}
                <div
                  className="flex items-center justify-between pb-4 mb-4"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-[14px]">
                    <span className="text-[1.75rem] leading-none drop-shadow-sm">🇪🇸</span>
                    <div>
                      <p
                        className="font-[family-name:var(--font-inter)] font-bold leading-tight"
                        style={{ fontSize: 15, color: 'var(--color-text-primary)' }}
                      >
                        Madrid, Spain
                      </p>
                      <p
                        className="font-[family-name:var(--font-inter)] font-medium leading-tight mt-1"
                        style={{ fontSize: 12, color: 'var(--color-text-muted)' }}
                      >
                        4 Nov &ndash; 11 Nov
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-[family-name:var(--font-inter)] font-bold px-3 py-1.5 rounded-[6px]"
                    style={{ background: 'var(--color-bg-tinted)', color: 'var(--color-text-primary)', fontSize: 12 }}
                  >
                    +7 days
                  </span>
                </div>

                {/* Result Row */}
                <div className="flex items-center justify-between pt-1">
                  <p
                    className="font-[family-name:var(--font-inter)] font-semibold"
                    style={{ fontSize: 14, color: 'var(--color-text-muted)' }}
                  >
                    Projected window
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-[family-name:var(--font-inter)] font-bold"
                      style={{ fontSize: 15, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      174 / 180
                    </span>
                    <span
                      className="font-[family-name:var(--font-manrope)] font-bold tracking-[0.05em] uppercase px-2.5 py-1 rounded-full"
                      style={{ fontSize: 10, background: 'var(--color-safe-bg)', color: 'var(--color-safe-text)' }}
                    >
                      Safe
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standard feature cards — 2-col nested grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const id = `feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`;
            const isLoneLastCard = i === features.length - 1 && features.length % 2 !== 0;
            return (
              <div
                key={feature.title}
                role="region"
                aria-labelledby={id}
                className={`bento-feature-card p-7 ${isLoneLastCard ? 'sm:col-span-2' : ''}`}
              >
                <div
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center mb-4 shrink-0"
                  style={{ background: 'var(--color-border)' }}
                  aria-hidden="true"
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    style={{ color: '#006948' }}
                    weight="light"
                  />
                </div>
                <h3
                  id={id}
                  className="font-[family-name:var(--font-manrope)] font-semibold leading-[1.3] tracking-[-0.01em] mb-2"
                  style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="font-[family-name:var(--font-inter)] leading-[1.6]"
                  style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
