import Link from 'next/link'
import { Envelope } from '@/components/ui/Icons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check your email',
}

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-[#191C1D]/8 p-8 text-center">
        <div className="w-14 h-14 bg-[#006948]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Envelope className="w-7 h-7 text-[#006948]" />
        </div>

        <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
          Check your email
        </h1>
        <p className="text-sm text-[#3D4A42] mb-6 leading-relaxed">
          We&apos;ve sent a password reset link to your email address. The link
          expires in 24 hours.
        </p>

        <Link
          href="/login"
          className="text-sm text-[#3D4A42] hover:text-[#006948] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-[#3D4A42]">
        Didn&apos;t receive an email? Check your spam folder.
      </p>
    </div>
  )
}
