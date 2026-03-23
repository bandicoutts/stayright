import Link from 'next/link';

function QuotaRingMockup() {
  // SVG arc for 42/180 = 23.3% of the circle
  const radius = 90;
  const strokeWidth = 16;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 42 / 180;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-8 shadow-[0px_12px_32px_rgba(0,33,20,0.06)] w-full max-w-md mx-auto relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#3D4A42] font-[family-name:var(--font-inter)]">
          Current Status
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-[#002114] bg-[#9ff4ca]">
          SAFE
        </span>
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Quota ring mockup displaying 42 out of 180 days used.">
            <defs>
              <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#006948" />
                <stop offset="100%" stopColor="#00855D" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#F3F4F5"
              strokeWidth={strokeWidth}
            />
            {/* Progress */}
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
              className="transition-all duration-1000 ease-out"
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="font-[family-name:var(--font-manrope)] font-bold text-[4rem] text-[#191C1D] leading-none tracking-[-0.04em]">
              42
            </span>
            <span className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42] mt-1 font-medium">
              / 180 days
            </span>
          </div>
        </div>
      </div>

      {/* Trip rows */}
      <div className="space-y-4 pt-6 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F3F4F5] before:to-transparent">
        <div className="flex items-center justify-between group/trip cursor-default">
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none" role="img" aria-label="Portugal flag">🇵🇹</span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#191C1D] font-[family-name:var(--font-inter)]">
                Lisbon, Portugal
              </span>
              <span className="text-xs text-[#3D4A42] font-[family-name:var(--font-inter)] mt-0.5">
                12 Oct &ndash; 19 Oct
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#191C1D] font-[family-name:var(--font-inter)] bg-[#F3F4F5] px-2.5 py-1 rounded-md">
            7 days
          </span>
        </div>
        <div className="flex items-center justify-between group/trip cursor-default">
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none" role="img" aria-label="USA flag">🇺🇸</span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#191C1D] font-[family-name:var(--font-inter)]">
                New York, USA
              </span>
              <span className="text-xs text-[#3D4A42] font-[family-name:var(--font-inter)] mt-0.5">
                04 Nov &ndash; 16 Nov
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#191C1D] font-[family-name:var(--font-inter)] bg-[#F3F4F5] px-2.5 py-1 rounded-md">
            12 days
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 bg-[#F8F9FA] overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-8 items-center">
        {/* Left column */}
        <div className="flex flex-col gap-8 max-w-xl xl:pl-8">
          <div className="flex flex-col gap-6">
            {/* Eyebrow */}
            <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#006948] font-[family-name:var(--font-inter)]">
              UK Immigration Compliance
            </span>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-manrope)] text-[4rem] sm:text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-[#191C1D]">
              <span className="font-medium">Know exactly where you</span>{' '}
              <br className="hidden sm:block" />
              <em className="font-extrabold not-italic text-transparent bg-clip-text bg-gradient-to-br from-[#004F35] to-[#006948]">
                stand.
              </em>
            </h1>

            {/* Subheadline */}
            <p className="font-[family-name:var(--font-inter)] text-lg text-[#3D4A42] leading-[1.6] max-w-[480px]">
              Master the 180-day absence rule with precision. Automatically track
              your travel and secure your residency status without the paperwork
              headache.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-semibold text-white bg-gradient-to-br from-[#004f35] to-[#006948] hover:scale-[0.98] hover:shadow-[0px_8px_24px_rgba(0,105,72,0.2)] transition-all duration-200"
            >
              Start Free Tracker
            </Link>
            <a
              href="#features"
              className="inline-flex items-center text-[15px] font-semibold text-[#004f35] hover:text-[#006948] transition-colors"
            >
              See how it works &rarr;
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 mt-2 border-t border-[#F3F4F5]">
            <span className="text-xs font-medium text-[#3D4A42] font-[family-name:var(--font-inter)]">
              Built by a Skilled Worker visa holder
            </span>
            <span className="text-[#3D4A42]/20 hidden sm:block">&bull;</span>
            <span className="text-xs font-medium text-[#3D4A42] font-[family-name:var(--font-inter)]">
              GDPR compliant
            </span>
          </div>
        </div>

        {/* Right column — mockup bleeding into whitespace */}
        <div className="flex justify-center lg:justify-end relative lg:translate-x-12 xl:translate-x-20">
          {/* Subtle background element for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#006948]/5 to-transparent rounded-[2.5rem] blur-3xl -z-10 scale-110 translate-y-8" />
          <QuotaRingMockup />
        </div>
      </div>
    </section>
  );
}
