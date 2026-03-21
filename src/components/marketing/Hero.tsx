import Link from 'next/link';

function QuotaRingMockup() {
  // SVG arc for 42/180 = 23.3% of the circle
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = 42 / 180;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_12px_40px_rgba(0,33,20,0.08)] w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#3D4A42] font-[family-name:var(--font-inter)]">
          Current Status
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-[#006948]">
          SAFE
        </span>
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center gap-3 mb-5">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#F3F4F5"
              strokeWidth="12"
            />
            {/* Progress */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#006948"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-manrope)] font-extrabold text-4xl text-[#191C1D] leading-none">
              42
            </span>
            <span className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42] mt-0.5">
              / 180 days
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-[#006948] font-[family-name:var(--font-inter)]">
          138 days remaining
        </p>
      </div>

      {/* Trip rows */}
      <div className="space-y-2 border-t border-[#F3F4F5] pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#191C1D] font-[family-name:var(--font-inter)]">
            🇵🇹 Lisbon, Portugal
          </span>
          <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
            7 days
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#191C1D] font-[family-name:var(--font-inter)]">
            🇺🇸 New York, USA
          </span>
          <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
            12 days
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-6 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#006948] font-[family-name:var(--font-inter)]">
            UK Immigration Compliance
          </span>

          {/* Headline */}
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-[3.5rem] leading-[1.1] tracking-[-0.02em] text-[#191C1D]">
            Know exactly where you{' '}
            <em className="not-italic text-[#006948]">stand.</em>
          </h1>

          {/* Subheadline */}
          <p className="font-[family-name:var(--font-inter)] text-base text-[#3D4A42] leading-relaxed max-w-md">
            Master the 180-day absence rule with precision. Automatically track
            your travel and secure your residency status without the paperwork
            headache.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#006948] to-[#00855D] hover:opacity-90 transition-opacity shadow-[0px_4px_16px_rgba(0,105,72,0.24)]"
            >
              Start Free Tracker
            </Link>
            <a
              href="#features"
              className="inline-flex items-center text-sm font-semibold text-[#006948] hover:underline transition-colors"
            >
              See how it works →
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <span className="text-[11px] font-medium text-[#3D4A42] font-[family-name:var(--font-inter)]">
              Built by a Skilled Worker visa holder
            </span>
            <span className="text-[#3D4A42]/30 hidden sm:block">·</span>
            <span className="text-[11px] font-medium text-[#3D4A42] font-[family-name:var(--font-inter)]">
              GDPR compliant · Data stored in the UK
            </span>
          </div>
        </div>

        {/* Right column — mockup */}
        <div className="flex justify-center md:justify-end">
          <QuotaRingMockup />
        </div>
      </div>
    </section>
  );
}
