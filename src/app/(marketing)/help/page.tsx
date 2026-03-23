import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Centre — StayRight',
};

export default function HelpCentrePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[#F8F9FA] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[#191C1D] mb-6">
            Help Centre
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-lg text-[#3D4A42] leading-relaxed mb-10">
            Placeholder for Support articles and FAQ.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
