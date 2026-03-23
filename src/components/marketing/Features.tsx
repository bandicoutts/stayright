import {
  Calendar,
  PlaneTakeoff,
  ShieldCheck,
  Calculator,
  Bell,
  FileDown,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Rolling 12-month tracker',
    description:
      'Visual calendar and running total against the 180-day ILR limit. Never lose track of your window.',
    className: 'md:col-span-1 bg-white',
  },
  {
    icon: PlaneTakeoff,
    title: 'Trip logging',
    description:
      'Log departures and returns in seconds from any device. Precise tracking for every border crossing.',
    className: 'md:col-span-1 bg-white',
  },
  {
    icon: ShieldCheck,
    title: 'Instant risk status',
    description:
      'Green / amber / red compliance indicator at a glance. Instant peace of mind for your visa status.',
    className: 'md:col-span-1 bg-white',
  },
  {
    icon: Calculator,
    title: 'What-if simulator',
    description:
      'Plan any trip and instantly see its impact on your rolling window before you book.',
    className:
      'md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#004f35] to-[#006948] text-white relative overflow-hidden group',
    isLarge: true,
  },
  {
    icon: Bell,
    title: 'Smart alerts',
    description:
      "Email reminders before you approach your limit. We watch the clock so you don't have to.",
    className: 'md:col-span-1 bg-white',
  },
  {
    icon: FileDown,
    title: 'Export ready',
    description:
      'Generate absence tables formatted for your ILR or SET(O) application. One-click documentation.',
    className: 'md:col-span-1 bg-white',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-[#F3F4F5]">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-16 px-2">
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#006948] font-[family-name:var(--font-inter)]">
            The Features
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-manrope)] font-extrabold text-[2.5rem] md:text-[3rem] leading-[1.1] tracking-[-0.03em] text-[#191C1D]">
            Compliance,{' '}
            <em className="font-extrabold not-italic text-transparent bg-clip-text bg-gradient-to-br from-[#004F35] to-[#006948]">
              Simplified.
            </em>
          </h2>
          <p className="mt-5 font-[family-name:var(--font-inter)] text-lg text-[#3D4A42] leading-[1.6]">
            Everything you need to maintain your residency status without the
            spreadsheets or the stress.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[minmax(240px,auto)_minmax(240px,auto)_minmax(240px,auto)] gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isDark = feature.isLarge;

            return (
              <div
                key={feature.title}
                role="region"
                aria-labelledby={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                className={`rounded-[1.5rem] p-8 md:p-10 shadow-[0px_8px_32px_rgba(0,33,20,0.03)] flex flex-col gap-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_48px_rgba(0,33,20,0.06)] ${feature.className}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-white/10' : 'bg-[#006948]/5'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#006948]'}`}
                    strokeWidth={2}
                  />
                </div>
                
                <div className="flex flex-col gap-3 relative z-10 w-full sm:w-3/4 md:w-full">
                  <h3
                    id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`font-[family-name:var(--font-manrope)] font-bold ${
                      isDark ? 'text-3xl' : 'text-[1.25rem]'
                    } leading-snug tracking-[-0.02em] ${
                      isDark ? 'text-white' : 'text-[#191C1D]'
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`font-[family-name:var(--font-inter)] text-[15px] leading-[1.6] ${
                      isDark ? 'text-white/80 max-w-sm' : 'text-[#3D4A42]'
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Custom What-If UI Mockup specifically for the highlighted card */}
                {feature.isLarge && (
                  <div className="mt-auto pt-8 relative w-full h-full min-h-[160px]">
                    <div className="absolute -bottom-10 -right-2 md:-right-10 w-[110%] sm:w-[85%] md:w-[90%] lg:w-[400px] bg-white rounded-t-3xl p-6 shadow-[0px_24px_64px_rgba(0,33,20,0.3)] origin-bottom-right rotate-2 transition-transform duration-500 group-hover:rotate-0">
                      
                      {/* Destination Row */}
                      <div className="flex items-center justify-between border-b border-[#F3F4F5] pb-4 mb-4">
                        <div className="flex items-center gap-3.5">
                          <span className="text-[1.75rem] leading-none drop-shadow-sm">🇪🇸</span>
                          <div className="flex flex-col">
                            <p className="text-[15px] font-bold text-[#191C1D] leading-tight font-[family-name:var(--font-inter)]">Madrid, Spain</p>
                            <p className="text-xs font-medium text-[#3D4A42] leading-tight mt-1 font-[family-name:var(--font-inter)]">4 Nov &ndash; 11 Nov</p>
                          </div>
                        </div>
                        <span className="bg-[#F3F4F5] text-[#191C1D] px-3 py-1.5 rounded-lg text-xs font-bold font-[family-name:var(--font-inter)]">
                          +7 days
                        </span>
                      </div>

                      {/* Result Row */}
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[14px] text-[#3D4A42] font-semibold font-[family-name:var(--font-inter)]">
                          Projected window
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[15px] font-bold text-[#191C1D] font-[family-name:var(--font-inter)]">
                            174 / 180
                          </span>
                          <span className="bg-[#9ff4ca] text-[#002114] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase shadow-sm">
                            Safe
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
