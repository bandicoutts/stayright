import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Trips — StayRight' }

export default function TripsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[#191C1D] mb-2">
        Trips
      </h1>
      <p className="text-sm text-[#3D4A42]">Trip log — coming soon.</p>
    </div>
  )
}
