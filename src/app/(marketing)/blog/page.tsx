import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | StayRight',
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-6">
            Blog
          </h1>
          <p className="font-[family-name:var(--font-body)] text-lg text-[var(--color-text-2)] leading-relaxed mb-10">
            Practical notes on the UK 180-day absence rule, trip planning, and
            keeping travel records for ILR.
          </p>
          <p className="font-[family-name:var(--font-body)] text-base text-[var(--color-text-muted)] leading-relaxed">
            Articles are coming soon.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
