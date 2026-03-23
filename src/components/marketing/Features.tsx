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
  },
  {
    icon: PlaneTakeoff,
    title: 'Trip logging',
    description:
      'Log departures and returns in seconds from any device. Precise tracking for every border crossing.',
  },
  {
    icon: ShieldCheck,
    title: 'Instant risk status',
    description:
      'Green / amber / red compliance indicator at a glance. Instant peace of mind for your visa status.',
  },
  {
    icon: Calculator,
    title: 'What-if simulator',
    description:
      'Plan any trip and instantly see its impact on your rolling window before you book.',
  },
  {
    icon: Bell,
    title: 'Smart alerts',
    description:
      "Email reminders before you approach your limit. We watch the clock so you don't have to.",
  },
  {
    icon: FileDown,
    title: 'Export ready',
    description:
      'Generate absence tables formatted for your ILR or SET(O) application. One-click documentation.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-[#F3F4F5]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#006948] font-[family-name:var(--font-inter)]">
            The Features
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-manrope)] font-extrabold text-[2.25rem] leading-tight tracking-[-0.02em] text-[#191C1D]">
            Compliance,{' '}
            <em className="not-italic text-[#006948]">Simplified.</em>
          </h2>
          <p className="mt-3 font-[family-name:var(--font-inter)] text-base text-[#3D4A42] leading-relaxed">
            Everything you need to maintain your residency status without the
            spreadsheets or the stress.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                role="region"
                aria-labelledby={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-xl p-6 shadow-[0px_2px_12px_rgba(25,28,29,0.04)] flex flex-col gap-3"
              >
                <Icon className="w-6 h-6 text-[#006948]" strokeWidth={1.5} />
                <h3 id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`} className="font-[family-name:var(--font-manrope)] font-bold text-[1rem] text-[#191C1D] leading-snug">
                  {feature.title}
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
