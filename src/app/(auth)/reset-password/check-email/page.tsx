import Link from 'next/link'
import { Mail, Shield } from 'lucide-react'

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Shield className="w-7 h-7 text-[#006948]" strokeWidth={2} />
        <span className="font-manrope text-xl font-bold text-[#191c1d]">StayRight</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-[#006948]/10 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#006948]" />
          </div>
        </div>

        <h1 className="font-manrope text-xl font-bold text-[#191c1d] mb-2">
          Check your inbox
        </h1>
        <p className="text-[#3d4a42] text-sm leading-relaxed mb-1">
          We&apos;ve sent a password reset link to
        </p>
        {email && (
          <p className="font-medium text-[#191c1d] text-sm mb-4 break-all">{email}</p>
        )}
        <p className="text-[#3d4a42] text-sm leading-relaxed mb-6">
          Click the link in the email to set a new password. The link expires after 24 hours.
        </p>

        <p className="text-xs text-[#3d4a42]/60">
          Check your spam folder if it doesn&apos;t appear within a few minutes.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 mt-6">
        <Link href="/reset-password" className="text-sm text-[#006948] font-medium hover:underline">
          Send another link
        </Link>
        <Link href="/login" className="text-sm text-[#3d4a42] hover:underline">
          Back to log in
        </Link>
      </div>
    </div>
  )
}
