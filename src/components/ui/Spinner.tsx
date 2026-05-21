/**
 * Inline button spinner — inherits currentColor, works on any button style.
 * Usage: {loading && <Spinner />}
 */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70 shrink-0 ${className}`}
      aria-hidden="true"
    />
  )
}
