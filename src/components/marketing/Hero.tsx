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
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative z-10 w-full overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 16,
          maxWidth: 360,
          boxShadow:
            '0 2px 8px rgba(26,27,25,0.04), 0 16px 48px rgba(201,168,76,0.08), 0 1px 0 rgba(255,255,255,0.90) inset',
        }}
      >
        {/* Gold top hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
          aria-hidden="true"
        />

        {/* Card header */}
        <div
          className="flex items-center justify-between px-[22px] py-4"
          style={{
            borderBottom: '1px solid rgba(201,168,76,0.20)',
            background: 'rgba(201,168,76,0.04)',
          }}
        >
          <span
            className="font-[family-name:var(--font-inter)] text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: '#A0A298' }}
          >
            Days Abroad
          </span>
          <span
            className="font-[family-name:var(--font-inter)] text-[10px] font-bold tracking-[0.08em] uppercase px-[10px] py-1 rounded-full"
            style={{
              background: '#9FF4CA',
              color: '#002114',
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
                  <stop offset="0%" stopColor="#C9A84C" />
                  <stop offset="100%" stopColor="#E8C87A" />
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
                stroke="rgba(201,168,76,0.10)"
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
                style={{ fontSize: '3.5rem', color: '#1A1B19', fontVariantNumeric: 'tabular-nums' }}
              >
                42
              </span>
              <span
                className="font-[family-name:var(--font-inter)] font-medium mt-1"
                style={{ fontSize: '0.75rem', color: '#A0A298' }}
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
                background: '#F5F0E6',
                border: '1px solid rgba(201,168,76,0.20)',
              }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[18px] leading-none" role="img" aria-label="Portugal flag">🇵🇹</span>
                <div className="flex flex-col">
                  <span
                    className="font-[family-name:var(--font-inter)] font-medium"
                    style={{ fontSize: '0.8125rem', color: '#1A1B19' }}
                  >
                    Portugal
                  </span>
                  <span
                    className="font-[family-name:var(--font-inter)] mt-0.5"
                    style={{ fontSize: '0.6875rem', color: '#A0A298' }}
                  >
                    Jan 8–22, 2025
                  </span>
                </div>
              </div>
              <span
                className="font-[family-name:var(--font-manrope)] font-bold px-[10px] py-1 rounded-[6px]"
                style={{
                  fontSize: '0.875rem',
                  color: '#A88730',
                  background: '#FEF3CC',
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
                background: '#F5F0E6',
                border: '1px solid rgba(201,168,76,0.20)',
              }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[18px] leading-none" role="img" aria-label="United States flag">🇺🇸</span>
                <div className="flex flex-col">
                  <span
                    className="font-[family-name:var(--font-inter)] font-medium"
                    style={{ fontSize: '0.8125rem', color: '#1A1B19' }}
                  >
                    United States
                  </span>
                  <span
                    className="font-[family-name:var(--font-inter)] mt-0.5"
                    style={{ fontSize: '0.6875rem', color: '#A0A298' }}
                  >
                    Oct 3–17, 2024
                  </span>
                </div>
              </div>
              <span
                className="font-[family-name:var(--font-manrope)] font-bold px-[10px] py-1 rounded-[6px]"
                style={{
                  fontSize: '0.875rem',
                  color: '#A88730',
                  background: '#FEF3CC',
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
              style={{ fontSize: '0.8125rem', color: '#C9A84C' }}
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
      style={{ background: '#FAF8F2' }}
    >
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">

        {/* ── Left column ── */}
        <div className="flex flex-col max-w-xl">

          {/* Eyebrow */}
          <div
            className="flex items-center gap-3 mb-7 animate-fade-up animate-fade-up-1"
            style={{ color: '#A88730' }}
          >
            <span
              className="block shrink-0"
              style={{ width: 28, height: 1, background: '#C9A84C' }}
              aria-hidden="true"
            />
            <span
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.16em] uppercase"
              style={{ fontSize: '0.625rem' }}
            >
              UK Skilled Worker Visa
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-[family-name:var(--font-manrope)] font-extrabold leading-[1.04] tracking-[-0.04em] mb-6 animate-fade-up animate-fade-up-2"
            style={{ fontSize: 'clamp(3rem, 5.5vw, 5.5rem)', color: '#1A1B19' }}
          >
            Know exactly where you{' '}
            <em
              className="not-italic block font-light"
              style={{
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '105%',
                background: 'linear-gradient(135deg, #A88730 0%, #E8C87A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              stand.
            </em>
          </h1>

          {/* Subheadline */}
          <p
            className="font-[family-name:var(--font-inter)] leading-[1.72] mb-11 max-w-[440px] animate-fade-up animate-fade-up-3"
            style={{ fontSize: '1.0625rem', color: '#2C2E2A' }}
          >
            Master the 180-day absence rule with precision. Automatically track
            your travel and secure your residency status without the paperwork
            headache.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5 mb-10 animate-fade-up animate-fade-up-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-[14px] rounded-[6px] font-[family-name:var(--font-inter)] text-[15px] font-semibold text-[#1A1B19] no-underline transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #E8C87A 0%, #C9A84C 100%)',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
              }}
            >
              Start Free Tracker
            </Link>
            <a
              href="#features"
              className="inline-flex items-center font-[family-name:var(--font-inter)] text-[15px] font-normal no-underline transition-all duration-150"
              style={{
                color: '#6B6D66',
                borderBottom: '1px solid rgba(26,27,25,0.20)',
                paddingBottom: 2,
                gap: 6,
              }}
            >
              See how it works →
            </a>
          </div>

          {/* Trust micro-tags */}
          <div className="flex flex-wrap gap-2 animate-fade-up animate-fade-up-5">
            {[
              'Free to start',
              'No credit card',
              'Used by 2,000+ visa holders',
            ].map((tag) => (
              <span
                key={tag}
                className="font-[family-name:var(--font-inter)] tracking-[0.02em]"
                style={{
                  fontSize: '0.75rem',
                  color: '#A0A298',
                  background: '#FFFDF7',
                  border: '1px solid rgba(201,168,76,0.20)',
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
