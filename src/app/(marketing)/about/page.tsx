import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About StayRight',
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-6">
            About StayRight
          </h1>
          <p className="font-[family-name:var(--font-body)] text-lg text-[var(--color-text-2)] leading-relaxed mb-10">
            StayRight helps UK Skilled Worker visa holders track absences for
            Indefinite Leave to Remain. It checks travel dates against the
            180-day rule, shows the current rolling-window count, and helps you
            keep a clear record for your application.
          </p>
          <p className="font-[family-name:var(--font-body)] text-base text-[var(--color-text-muted)] leading-relaxed">
            The product is built from the problem it serves: planning travel
            while protecting a five-year qualifying period. StayRight is a
            tracker and calculator. It is not legal advice.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
