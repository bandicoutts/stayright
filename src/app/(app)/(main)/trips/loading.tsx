export default function TripsLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-24 bg-[var(--color-surface-sunken)] rounded-lg" />
        <div className="h-9 w-28 bg-[var(--color-surface-sunken)] rounded-xl" />
      </div>

      {/* Table */}
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--color-border)]">
          <div className="h-3 w-24 bg-[var(--color-surface-sunken)] rounded" />
          <div className="h-3 w-20 bg-[var(--color-surface-sunken)] rounded ml-auto" />
          <div className="h-3 w-20 bg-[var(--color-surface-sunken)] rounded" />
          <div className="h-3 w-16 bg-[var(--color-surface-sunken)] rounded" />
        </div>

        {/* Table rows */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 bg-[var(--color-surface-sunken)] rounded-full shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-[var(--color-surface-sunken)] rounded" />
                <div className="h-3 w-24 bg-[var(--color-surface-sunken)] rounded" />
              </div>
            </div>
            <div className="h-3.5 w-24 bg-[var(--color-surface-sunken)] rounded" />
            <div className="h-3.5 w-24 bg-[var(--color-surface-sunken)] rounded" />
            <div className="h-5 w-14 bg-[var(--color-surface-sunken)] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
