import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — StayRight',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-3xl text-[#191C1D] tracking-[-0.02em] mb-4">
          Cookie Policy
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-base text-[#3D4A42] mb-6 leading-relaxed">
          StayRight uses cookies to keep you logged in and to understand how the
          product is used. We do not use advertising cookies or sell your data.
        </p>
        <h2 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[#191C1D] mb-3">
          Strictly Necessary Cookies
        </h2>
        <p className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42] mb-6 leading-relaxed">
          These cookies are required for StayRight to function. They include
          session cookies that keep you logged in. You cannot opt out of these.
        </p>
        <h2 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[#191C1D] mb-3">
          Analytics Cookies (Optional)
        </h2>
        <p className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42] mb-6 leading-relaxed">
          If you accept all cookies, we use privacy-friendly analytics (PostHog,
          EU region) to understand how the product is used. No personal data is
          stored in analytics.
        </p>
        <Link
          href="/"
          className="text-sm text-[#006948] font-medium hover:underline font-[family-name:var(--font-inter)]"
        >
          ← Back to StayRight
        </Link>
      </div>
    </div>
  );
}
