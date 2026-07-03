import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact StayRight',
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-6">
            Contact StayRight
          </h1>
          <p className="font-[family-name:var(--font-body)] text-lg text-[var(--color-text-2)] leading-relaxed mb-10">
            Need help with your account, billing, or a trip calculation? Email
            support and include the dates you are checking. Do not send passport
            scans or immigration documents unless support asks for them.
          </p>
          <a
            href="mailto:support@stayright.co.uk"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white no-underline"
            style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
          >
            Email support
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
