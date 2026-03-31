import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — StayRight',
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-6">
            Blog
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-lg text-[var(--color-text-2)] leading-relaxed mb-10">
            Placeholder for blog articles.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
