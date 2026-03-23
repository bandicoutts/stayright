import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — StayRight',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#191C1D] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 text-white/80 font-[family-name:var(--font-inter)] leading-relaxed">
        <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-manrope)]">Privacy Policy</h1>
        <p className="mb-8 text-sm text-white/60">Effective Date: [Date] [LEGAL REVIEW REQUIRED: Confirm effective date before publishing]</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">1. Who We Are</h2>
        <p className="mb-4">StayRight ("we", "us", or "our") is the data controller for the personal information we collect about you.</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Contact Email:</strong> [David's Contact Email or support@stayright.com]</li>
        </ul>
        <p className="text-sm text-yellow-400/80 mb-6 bg-yellow-400/10 p-3 rounded-md border border-yellow-400/20">
          [LEGAL REVIEW REQUIRED: Insert official company name, registered address, and physical contact point if different. We need to confirm ICO registration number once registered.]
        </p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">2. What Personal Data We Collect and Why (Lawful Basis)</h2>
        <p className="mb-4">Under the UK General Data Protection Regulation (UK GDPR), we rely on the following lawful bases to process your personal data:</p>
        <ul className="list-disc pl-5 mb-4 space-y-3">
          <li>
            <strong>Account Data</strong> (Name, Email): Used to create and manage your account, provide customer support, and communicate essential service updates.
            <br/><span className="text-white/60 text-sm">Lawful Basis: Performance of a contract.</span>
          </li>
          <li>
            <strong>Visa and Travel Data</strong> (Visa route, travel history, calculation dates): Used directly to power our 180-day tracker, simulator, and ILR timeline features. <strong>This data is highly sensitive but is not a "special category" under UK GDPR; however, we treat it with maximum security.</strong>
            <br/><span className="text-white/60 text-sm">Lawful Basis: Performance of a contract (core product functionality).</span>
          </li>
          <li>
            <strong>Payment Data</strong> (Billing address, transaction history): Processed to facilitate subscription payments. Your full card details are handled directly by our payment processor (Stripe).
            <br/><span className="text-white/60 text-sm">Lawful Basis: Performance of a contract and compliance with a legal obligation (tax and accounting).</span>
          </li>
          <li>
            <strong>Analytics</strong> (Usage data, interaction metrics): Used to understand how our service is used and improve the platform.
            <br/><span className="text-white/60 text-sm">Lawful Basis: Legitimate interests (or Consent where cookies are involved).</span>
          </li>
        </ul>
        <p className="text-sm text-yellow-400/80 mb-6 bg-yellow-400/10 p-3 rounded-md border border-yellow-400/20">
          [LEGAL REVIEW REQUIRED: Ensure you are comfortable relying on "Performance of a contract" for the Visa/Travel data rather than "Explicit Consent", as immigration data is highly confidential.]
        </p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">3. Data Retention Policy</h2>
        <p className="mb-4">We keep your data only for as long as needed to provide our services and fulfil legal obligations:</p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Active Account Data / Travel Data:</strong> Retained for as long as your account remains active.</li>
          <li><strong>Deleted Accounts:</strong> If you delete your account, your data will be queued for deletion. It may remain in our database backups for up to <strong>30 days</strong> before being permanently erased.</li>
          <li><strong>Payment Records (Stripe):</strong> Generally retained by Stripe for 7 years to comply with financial, tax, and legal obligations, even after you delete your StayRight account.</li>
          <li><strong>Anonymised Analytics:</strong> Retained indefinitely to help us improve the service. This data cannot be linked back to you.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">4. Data Processors (Who We Share Your Data With)</h2>
        <p className="mb-4">We use trusted third-party service providers ("Data Processors") to run StayRight. We have Data Processing Agreements (DPAs) in place with them to protect your data.</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Supabase:</strong> Core database and hosting (Servers located in the UK).</li>
        </ul>
        <p className="text-sm text-yellow-400/80 mb-4 bg-yellow-400/10 p-3 rounded-md border border-yellow-400/20">
          [LEGAL REVIEW REQUIRED: Confirm Supabase server region is specifically set to eu-west-2 (London)]
        </p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Stripe:</strong> Payment processing.</li>
          <li><strong>Resend:</strong> Email delivery and notifications.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">5. Your Rights Under UK GDPR</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
          <li><strong>Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
          <li><strong>Erasure ("Right to be Forgotten"):</strong> Request that we delete your data (subject to certain exceptions, like tax records).</li>
          <li><strong>Restriction of Processing:</strong> Ask us to limit how we use your data.</li>
          <li><strong>Data Portability:</strong> Request your data in a structured, commonly used format.</li>
          <li><strong>Objection:</strong> Object to our processing of your data based on legitimate interests.</li>
          <li><strong>Automated Decision Making:</strong> Not be subject to decisions based solely on automated processing. (Note: StayRight computes values based on formulas you input, but does not make legal decisions on your behalf).</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">6. How to Exercise Your Rights</h2>
        <p className="mb-6">To exercise any of these rights, please contact us at [Contact Email]. We will respond to your request within one month. You can also view, edit, download, and delete your data directly within the application's account settings.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">7. How to Complain to the ICO</h2>
        <p className="mb-4">If you are unhappy with how we have handled your personal data, you have the right to complain to the Information Commissioner’s Office (ICO).</p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Website:</strong> <a href="https://ico.org.uk/make-a-complaint/" className="text-white hover:underline">https://ico.org.uk/make-a-complaint/</a></li>
          <li><strong>Helpline:</strong> 0303 123 1113</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">8. Cookies</h2>
        <p className="mb-6">We use cookies to keep you logged in and to remember your preferences. Please review our <a href="/cookie-policy" className="text-white hover:underline">Cookie Policy</a> for details.</p>

        <h2 className="text-xl font-semibold text-white mt-10 mb-4 font-[family-name:var(--font-manrope)]">9. Changes to this Policy</h2>
        <p className="mb-6">We may update this policy periodically. We will notify you of any major changes by email or through a notice in the app.</p>
      </div>
    </main>
  );
}
