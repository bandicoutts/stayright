import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings — StayRight' }

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
        Settings
      </h1>
      <p className="text-sm text-[#3D4A42]">Account settings — coming soon.</p>
    </div>
  )
}
