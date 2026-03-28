const trustCells = [
  {
    value: 'Home Office aligned',
    label: 'Built for Skilled Worker compliance',
  },
  {
    value: 'Solicitor reviewed',
    label: 'Immigration law verified',
  },
  {
    value: 'GDPR compliant',
    label: 'UK-based data storage',
  },
  {
    value: 'Built by a Tier 2/Skilled Worker veteran',
    label: 'Real-world visa experience',
  },
];

export default function TrustBar() {
  return (
    <div
      style={{
        background: 'var(--color-bg-tinted)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="max-w-[1320px] mx-auto grid grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label="Trust signals"
      >
        {trustCells.map((cell, i) => (
          <div
            key={cell.label}
            role="listitem"
            className="flex flex-col gap-1 px-8 py-7"
            style={{
              borderRight: i < trustCells.length - 1 ? '1px solid var(--color-border)' : undefined,
            }}
          >
            <span
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight tracking-[-0.02em]"
              style={{ fontSize: '1.0625rem', color: 'var(--color-text-primary)' }}
            >
              {cell.value}
            </span>
            <span
              className="font-[family-name:var(--font-inter)] leading-snug"
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
            >
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
