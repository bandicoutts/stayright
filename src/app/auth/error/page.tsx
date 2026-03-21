import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,33,20,0.06)] w-full max-w-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-10 h-10 text-[#ba1a1a]" />
        </div>
        <h1 className="font-manrope text-xl font-bold text-[#191c1d] mb-2">
          Link expired or invalid
        </h1>
        <p className="text-[#3d4a42] text-sm mb-6">
          This link has expired. Request a new password reset.
        </p>
        <Link
          href="/reset-password"
          className="block w-full bg-gradient-to-r from-[#006948] to-[#00855d] text-white font-semibold rounded-full py-3 text-center text-sm"
        >
          Request new link
        </Link>
        <Link
          href="/login"
          className="block mt-4 text-sm text-[#006948] font-medium hover:underline"
        >
          Back to log in
        </Link>
      </div>
    </div>
  )
}
