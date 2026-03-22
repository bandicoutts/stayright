import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-[family-name:var(--font-manrope)] font-extrabold text-[#006948] mb-4">
          404
        </p>
        <h1 className="text-xl font-[family-name:var(--font-manrope)] font-bold text-[#191C1D] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[#3D4A42] mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#006948] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#00855D] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
