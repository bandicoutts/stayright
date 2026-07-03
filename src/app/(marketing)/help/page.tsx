import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Centre | StayRight',
};

export default function HelpCentrePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-6">
            Help Centre
          </h1>
          <p className="font-[family-name:var(--font-body)] text-lg text-[var(--color-text-2)] leading-relaxed mb-10">
            Get help with logging trips, checking the 180-day rule, updating
            your visa profile, and exporting your travel history.
          </p>
          <div className="grid gap-4 text-left">
            {[
              'How absence days are counted',
              'How to log a trip with no return date',
              'How the what-if trip check works',
              'How to export your ILR travel history',
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-sm font-medium text-[var(--color-text-primary)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
