import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — StayRight',
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#191C1D] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 text-white/80 font-[family-name:var(--font-inter)] leading-relaxed">
        <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-manrope)]">Cookie Policy</h1>
        <p className="mb-8 text-sm text-white/60">Last Updated: [Date]</p>

        <p className="mb-6">This Cookie Policy explains how StayRight uses cookies and similar technologies when you visit our website. Our aim is to ensure our platform functions securely and smoothly.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">1. What Are Cookies?</h2>
        <p className="mb-6">Cookies are small text files stored on your browser or device by websites you visit. They are widely used to make websites work, or work more efficiently, and to provide information to the owners of the site.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">2. How We Use Cookies</h2>

        <h3 className="text-lg font-semibold text-white mt-8 mb-3 font-[family-name:var(--font-manrope)]">2.1 Essential Cookies (Strictly Necessary)</h3>
        <p className="mb-4">These cookies are required for the operation of StayRight. Without them, you would not be able to log in or use the core application. <strong>Under UK law, we do not require your consent to set these cookies.</strong></p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Supabase Authentication Cookies:</strong> Used to manage your session securely when you log into the platform. (They ensure you remain logged in as you navigate the app).</li>
          <li><strong>Cookie Preference:</strong> <code>cookie_consent</code> – Used purely to remember whether you have accepted or declined non-essential cookies.</li>
        </ul>

        <h3 className="text-lg font-semibold text-white mt-8 mb-3 font-[family-name:var(--font-manrope)]">2.2 Analytics Cookies</h3>
        <p className="mb-4"><em>(Note: At this stage, StayRight has not implemented a broader tracking system. This section will be updated when analytics tools are added.)</em></p>
        <p className="mb-6">In the future, we may deploy analytics cookies to understand how our site is used (e.g., measuring which features are most popular). <strong>We will always ask for your explicit consent before enabling these.</strong></p>

        <h3 className="text-lg font-semibold text-white mt-8 mb-3 font-[family-name:var(--font-manrope)]">2.3 Third-Party Cookies</h3>
        <p className="mb-6">When you purchase a Pro subscription, payments are processed by <strong>Stripe</strong>. Stripe may set cookies on your device to facilitate a secure transaction and to detect fraud. These are managed securely by Stripe according to their own privacy policies. For more details, visit: <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Stripe Cookie Policy</a></p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">3. How to Manage Your Cookies</h2>
        <p className="mb-4">Most modern web browsers allow you to control cookies through their settings. You can choose to block or delete cookies entirely. However, if you disable strictly necessary cookies, StayRight’s authentication system will not work, and you will not be able to log in.</p>
        <p className="mb-6">If you have any questions about our use of cookies, please contact us at [Contact Email].</p>
      </div>
    </main>
  );
}
