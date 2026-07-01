import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-[family-name:var(--font-heading)] font-extrabold text-[var(--color-green)] mb-4">
          404
        </p>
        <h1 className="text-xl font-[family-name:var(--font-heading)] font-bold text-[var(--color-text-primary)] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: 'var(--gradient-green)', boxShadow: 'var(--shadow-button)' }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
