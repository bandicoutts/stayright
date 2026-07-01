import Link from 'next/link';
import { WindowSpeedometer } from '@/components/app/dashboard/WindowSpeedometer';
import { getCurrentRollingWindow, type TripInput } from '@/lib/calculations/absenceEngine';

// Sample data for the hero — a SAFE story (well under the 120-day watch line),
// so the verdict derives to a truthful green "Safe" with the needle in the green zone (reskin D5).
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_TRIPS: TripInput[] = [
  { id: 'a', destination: '🇵🇹 Portugal', departure_date: isoDaysAgo(330), return_date: isoDaysAgo(284) },
  { id: 'b', destination: '🇺🇸 United States', departure_date: isoDaysAgo(200), return_date: isoDaysAgo(165) },
  { id: 'c', destination: '🇪🇸 Spain', departure_date: isoDaysAgo(70), return_date: isoDaysAgo(42) },
];

export default function Hero() {
  const today = new Date();
  const window = getCurrentRollingWindow(SAMPLE_TRIPS, today);

  return (
    <section
      className="pt-[120px] pb-[90px] px-6 md:px-14 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">

        {/* ── Left column ── */}
        <div className="flex flex-col max-w-xl">
          <h1
            className="font-[family-name:var(--font-heading)] font-extrabold leading-[0.98] tracking-[-0.04em] mb-6 animate-fade-up animate-fade-up-2"
            style={{ fontSize: 'clamp(2.75rem, 5.6vw, 5rem)', color: 'var(--color-text-primary)' }}
          >
            Travel freely.<br />
            <span style={{ color: 'var(--color-green-light)' }}>Stay under 180.</span><br />
            Reach ILR.
          </h1>

          <p
            className="font-[family-name:var(--font-body)] leading-[1.6] mb-10 max-w-[480px] animate-fade-up animate-fade-up-3"
            style={{ fontSize: '1.0625rem', color: 'var(--color-text-2)' }}
          >
            StayRight automatically tracks every rolling 12-month window of your visa
            against the Home Office 180-day rule, so you always know you&apos;re safe.
            No spreadsheets. No second-guessing.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mb-10 animate-fade-up animate-fade-up-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-7 py-[14px] rounded-xl font-[family-name:var(--font-body)] text-[15px] font-semibold text-white no-underline transition-all duration-200"
              style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
            >
              Start tracking free
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center px-7 py-[14px] rounded-xl font-[family-name:var(--font-body)] text-[15px] font-medium no-underline transition-colors duration-200"
              style={{ color: 'var(--color-text-2)', border: '1px solid var(--color-border-strong)' }}
            >
              See how it works →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 animate-fade-up animate-fade-up-5">
            {['Free to start', 'No credit card', 'UK-based team', 'Cancel anytime'].map((tag) => (
              <span
                key={tag}
                className="font-[family-name:var(--font-body)] tracking-[0.02em]"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-faint)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: '5px 12px',
                  borderRadius: 6,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — signature window speedometer ── */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <WindowSpeedometer
            days={window.days}
            status={window.status}
            windowStart={window.windowStart}
            windowEnd={window.windowEnd}
            trips={SAMPLE_TRIPS}
          />
        </div>

      </div>
    </section>
  );
}
