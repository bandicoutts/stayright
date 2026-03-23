import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — StayRight',
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[#F8F9FA] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[#191C1D] mb-6">
            About Us
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-lg text-[#3D4A42] leading-relaxed mb-10">
            Placeholder for the StayRight story and mission.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
