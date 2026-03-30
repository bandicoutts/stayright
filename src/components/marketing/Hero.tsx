import Link from 'next/link';

function QuotaRingMockup() {
  // SVG arc constants — do not change (42/180 days = 23.3% filled)
  const radius = 90;
  const strokeWidth = 16;
  const size = 212;
  const center = 106;
  const circumference = 565.49;  // 2π × 90
  const dashOffset = 433.42;     // circumference × (1 − 42/180)

  return (
    <div className="relative flex justify-center">
      {/* Ambient glow behind the card */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          width: 340,
          height: 340,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--color-border) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative z-10 w-full overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 16,
          maxWidth: 360,
          boxShadow:
            '0 2px 8px rgba(13,27,16,0.04), 0 16px 48px rgba(0,105,72,0.08), 0 1px 0 rgba(255,255,255,0.90) inset',
        }}
      >
        {/* Gold top hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-green), transparent)' }}
          aria-hidden="true"
        />

        {/* Card header */}
        <div
          className="flex items-center justify-between px-[22px] py-4"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-green-pale)/30',
          }}
        >
          <span
            className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Days Abroad
          </span>
          <span
            className="font-[family-name:var(--font-inter)] text-[10px] font-bold tracking-[0.08em] uppercase px-[10px] py-1 rounded-full"
            style={{
              background: 'var(--color-safe-bg)',
              color: 'var(--color-safe-text)',
            }}
          >
            ✓ Safe
          </span>
        </div>

        {/* Ring body */}
        <div className="flex flex-col items-center px-[22px] pt-8 pb-6">
          {/* SVG Ring */}
          <div className="relative">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label="Quota ring showing 42 of 180 days abroad used"
            >
              <defs>
                <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-green)" />
                  <stop offset="100%" stopColor="var(--color-green-light)" />
                </linearGradient>
                <filter id="heroArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(0,105,72,0.12)"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#heroRingGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
                filter="url(#heroArcGlow)"
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-[family-name:var(--font-manrope)] font-black leading-none tracking-[-0.04em]"
                style={{ fontSize: '3.5rem', color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
              >
                42
              </span>
              <span
                className="font-[family-name:var(--font-inter)] font-medium mt-1"
                style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}
              >
                of 180 days
              </span>
            </div>
          </div>

          {/* Trip rows */}
          <div className="w-full mt-5 flex flex-col gap-1">
            {/* Portugal */}
            <div
              className="flex items-center justify-between px-[14px] py-[10px] rounded-[8px] transition-colors duration-150"
              style={{
                background: 'var(--color-bg-tinted)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[18px] leading-none" role="img" aria-label="Portugal flag">🇵🇹</span>
                <div className="flex flex-col">
                  <span
                    className="font-[family-name:var(--font-inter)] font-medium"
                    style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}
                  >
                    Portugal
                  </span>
                  <span
                    className="font-[family-name:var(--font-inter)] mt-0.5"
                    style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}
                  >
                    Jan 8–22, 2025
                  </span>
                </div>
              </div>
              <span
                className="font-[family-name:var(--font-manrope)] font-bold px-[10px] py-1 rounded-[6px]"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-status-amber)',
                  background: 'rgba(217, 119, 6, 0.12)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                14 days
              </span>
            </div>

            {/* USA */}
            <div
              className="flex items-center justify-between px-[14px] py-[10px] rounded-[8px] transition-colors duration-150"
              style={{
                background: 'var(--color-bg-tinted)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[18px] leading-none" role="img" aria-label="United States flag">🇺🇸</span>
                <div className="flex flex-col">
                  <span
                    className="font-[family-name:var(--font-inter)] font-medium"
                    style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}
                  >
                    United States
                  </span>
                  <span
                    className="font-[family-name:var(--font-inter)] mt-0.5"
                    style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}
                  >
                    Oct 3–17, 2024
                  </span>
                </div>
              </div>
              <span
                className="font-[family-name:var(--font-manrope)] font-bold px-[10px] py-1 rounded-[6px]"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-green)',
                  background: 'var(--color-green-pale)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                28 days
              </span>
            </div>
          </div>

          {/* Add trip link */}
          <div className="w-full mt-3 text-right">
            <Link
              href="/signup"
              className="font-[family-name:var(--font-inter)] no-underline transition-colors duration-150"
              style={{ fontSize: '0.8125rem', color: 'var(--color-green)' }}
            >
              Add a trip →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="pt-[120px] pb-[90px] px-6 md:px-14 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">

        {/* ── Left column ── */}
        <div className="flex flex-col max-w-xl">

          {/* Headline */}
          <h1
            className="font-[family-name:var(--font-manrope)] font-extrabold leading-[1.04] tracking-[-0.04em] mb-6 animate-fade-up animate-fade-up-2"
            style={{ fontSize: 'clamp(3rem, 5.5vw, 5.5rem)', color: 'var(--color-text-primary)' }}
          >
            Don&apos;t risk your ILR{' '}
            <em
              className="not-italic block font-light"
              style={{
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '105%',
                background: 'var(--gradient-green-text)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              on a spreadsheet.
            </em>
          </h1>

          {/* Subheadline */}
          <p
            className="font-[family-name:var(--font-inter)] leading-[1.72] mb-11 max-w-[440px] animate-fade-up animate-fade-up-3"
            style={{ fontSize: '1.0625rem', color: 'var(--color-text-2)' }}
          >
            Precision tracking for the UK&apos;s 180-day rule. Automatically monitor
            every rolling 12-month window and ensure you&apos;re fully compliant with
            Appendix Continuous Residence.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5 mb-10 animate-fade-up animate-fade-up-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-[14px] rounded-[6px] font-[family-name:var(--font-inter)] text-[15px] font-semibold text-white no-underline transition-all duration-200"
              style={{
                background: 'var(--color-green)',
                boxShadow: 'var(--shadow-button)',
              }}
            >
              Start Free Tracker
            </Link>
          </div>

          {/* Trust micro-tags */}
          <div className="flex flex-wrap gap-2 animate-fade-up animate-fade-up-5">
            {[
              'Free to start',
              'No credit card',
              'Built for Skilled Worker compliance',
            ].map((tag) => (
              <span
                key={tag}
                className="font-[family-name:var(--font-inter)] tracking-[0.02em]"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-faint)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: '5px 12px',
                  borderRadius: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — ring card ── */}
        <div
          className="flex justify-center lg:justify-end animate-fade-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <div className="w-full max-w-[360px]">
            <QuotaRingMockup />
          </div>
        </div>

      </div>
    </section>
  );
}
