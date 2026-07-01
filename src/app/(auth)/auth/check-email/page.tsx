import Link from 'next/link'
import { Envelope } from '@/components/ui/Icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check your email',
}

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="w-14 h-14 bg-[var(--color-green-pale)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Envelope className="w-7 h-7 text-[var(--color-green)]" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
          We&apos;ve sent a password reset link to your email address. The link
          expires in 24 hours.
        </p>

        <Link
          href="/login"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
        Didn&apos;t receive an email? Check your spam folder.
      </p>
    </div>
  )
}
