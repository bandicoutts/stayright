import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | StayRight',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="bg-[var(--color-bg)] pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-[3rem] leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)] mb-4">
            Privacy Policy
          </h1>
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-text-muted)] mb-10">Effective Date: [Date] [LEGAL REVIEW REQUIRED: Confirm effective date before publishing]</p>

          <div className="font-[family-name:var(--font-body)] text-base text-[var(--color-text-2)] leading-relaxed space-y-6">
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">1. Who we are</h2>
            <p>StayRight (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is the data controller for the personal information we collect about you.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Contact Email:</strong> [David&apos;s Contact Email or support@stayright.com]</li>
            </ul>
            <p className="text-sm text-[var(--color-green)] bg-[var(--color-green-pale)] p-4 rounded-xl border border-[var(--color-border-strong)]">
              [LEGAL REVIEW REQUIRED: Insert official company name, registered address, and physical contact point if different. We need to confirm ICO registration number once registered.]
            </p>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">2. What personal data we collect and why</h2>
            <p>Under the UK General Data Protection Regulation (UK GDPR), we rely on the following lawful bases to process your personal data:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Account data</strong> (name, email): Used to create and manage your account, provide customer support, and send essential service updates.
                <br/><span className="text-[var(--color-text-muted)] text-sm">Lawful Basis: Performance of a contract.</span>
              </li>
              <li>
                <strong>Visa and travel data</strong> (visa route, travel history, calculation dates): Used to power the 180-day tracker, simulator, and ILR timeline features. <strong>This data is highly sensitive but is not a &quot;special category&quot; under UK GDPR; however, we treat it with maximum security.</strong>
                <br/><span className="text-[var(--color-text-muted)] text-sm">Lawful Basis: Performance of a contract (core product functionality).</span>
              </li>
              <li>
                <strong>Payment data</strong> (billing address, transaction history): Used to process subscription payments. Stripe handles your full card details.
                <br/><span className="text-[var(--color-text-muted)] text-sm">Lawful Basis: Performance of a contract and compliance with a legal obligation (tax and accounting).</span>
              </li>
              <li>
                <strong>Analytics</strong> (Usage data, interaction metrics): Used to understand how our service is used and improve the platform.
                <br/><span className="text-[var(--color-text-muted)] text-sm">Lawful Basis: Legitimate interests (or Consent where cookies are involved).</span>
              </li>
            </ul>
            <p className="text-sm text-[var(--color-green)] bg-[var(--color-green-pale)] p-4 rounded-xl border border-[var(--color-border-strong)]">
              [LEGAL REVIEW REQUIRED: Ensure you are comfortable relying on &quot;Performance of a contract&quot; for the Visa/Travel data rather than &quot;Explicit Consent&quot;, as immigration data is highly confidential.]
            </p>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">3. Data retention</h2>
            <p>We keep your data only for as long as needed to provide our services and fulfil legal obligations:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Active Account Data / Travel Data:</strong> Retained for as long as your account remains active.</li>
              <li><strong>Deleted Accounts:</strong> If you delete your account, your data will be queued for deletion. It may remain in our database backups for up to <strong>30 days</strong> before being permanently erased.</li>
              <li><strong>Payment Records (Stripe):</strong> Generally retained by Stripe for 7 years to comply with financial, tax, and legal obligations, even after you delete your StayRight account.</li>
              <li><strong>Anonymised Analytics:</strong> Retained indefinitely to help us improve the service. This data cannot be linked back to you.</li>
            </ul>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">4. Data processors</h2>
            <p>We use third-party service providers (&quot;Data Processors&quot;) to run StayRight. We have Data Processing Agreements (DPAs) in place with them to protect your data.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase:</strong> Core database and hosting (Servers located in the UK).</li>
            </ul>
            <p className="text-sm text-[var(--color-green)] bg-[var(--color-green-pale)] p-4 rounded-xl border border-[var(--color-border-strong)]">
              [LEGAL REVIEW REQUIRED: Confirm Supabase server region is specifically set to eu-west-2 (London)]
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Stripe:</strong> Payment processing.</li>
              <li><strong>Resend:</strong> Email delivery and notifications.</li>
            </ul>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">5. Your rights under UK GDPR</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
              <li><strong>Erasure (&quot;Right to be Forgotten&quot;):</strong> Request that we delete your data (subject to certain exceptions, like tax records).</li>
              <li><strong>Restriction of Processing:</strong> Ask us to limit how we use your data.</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, commonly used format.</li>
              <li><strong>Objection:</strong> Object to our processing of your data based on legitimate interests.</li>
              <li><strong>Automated Decision Making:</strong> Not be subject to decisions based solely on automated processing. (Note: StayRight computes values based on formulas you input, but does not make legal decisions on your behalf).</li>
            </ul>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">6. How to exercise your rights</h2>
            <p>To exercise any of these rights, please contact us at [Contact Email]. We will respond to your request within one month. You can also view, edit, download, and delete your data directly within the application&apos;s account settings.</p>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">7. How to complain to the ICO</h2>
            <p>If you are unhappy with how we have handled your personal data, you have the right to complain to the Information Commissioner’s Office (ICO).</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Website:</strong> <a href="https://ico.org.uk/make-a-complaint/" className="text-[var(--color-green)] hover:underline">https://ico.org.uk/make-a-complaint/</a></li>
              <li><strong>Helpline:</strong> 0303 123 1113</li>
            </ul>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">8. Cookies</h2>
            <p>We use cookies to keep you logged in and to remember your preferences. Please review our <a href="/cookie-policy" className="text-[var(--color-green)] hover:underline">Cookie Policy</a> for details.</p>

            <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-text-primary)] mt-10 mb-4">9. Changes to this policy</h2>
            <p>We may update this policy periodically. We will notify you of any major changes by email or through a notice in the app.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
