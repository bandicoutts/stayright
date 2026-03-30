export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-[var(--color-surface-sunken)] rounded-lg" />
          <div className="h-4 w-40 bg-[var(--color-surface-sunken)] rounded" />
        </div>
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="h-10 w-24 bg-[var(--color-surface-sunken)] rounded-xl" />
          <div className="h-10 w-24 bg-[var(--color-surface-sunken)] rounded-xl" />
        </div>
      </div>

      {/* Stat cards — 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="h-3 w-28 bg-[var(--color-surface-sunken)] rounded" />
              <div className="h-5 w-16 bg-[var(--color-surface-sunken)] rounded-full" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-28 w-28 bg-[var(--color-surface-sunken)] rounded-full" />
              <div className="h-4 w-32 bg-[var(--color-surface-sunken)] rounded" />
              <div className="h-3 w-40 bg-[var(--color-surface-sunken)] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent trips preview */}
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="h-4 w-32 bg-[var(--color-surface-sunken)] rounded" />
          <div className="h-8 w-20 bg-[var(--color-surface-sunken)] rounded-lg" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[var(--color-surface-sunken)] rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-[var(--color-surface-sunken)] rounded" />
                  <div className="h-3 w-20 bg-[var(--color-surface-sunken)] rounded" />
                </div>
              </div>
              <div className="h-3.5 w-16 bg-[var(--color-surface-sunken)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
