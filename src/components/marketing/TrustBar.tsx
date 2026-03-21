import { UserCheck, Lock, Server, AlertCircle } from 'lucide-react';

const trustSignals = [
  {
    icon: UserCheck,
    text: 'Built by a Skilled Worker visa holder',
  },
  {
    icon: Lock,
    text: 'GDPR Compliant — Enterprise security',
  },
  {
    icon: Server,
    text: 'Data stored in UK — Sovereign infrastructure',
  },
  {
    icon: AlertCircle,
    text: 'Not legal advice — Always verify with UKVI',
  },
];

export default function TrustBar() {
  return (
    <section className="py-14 px-6 bg-[#F3F4F5]">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.text} className="flex items-start gap-3">
                <Icon
                  className="w-5 h-5 text-[#006948] mt-0.5 shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)] leading-snug">
                  {signal.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
