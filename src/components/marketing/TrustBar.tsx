const trustCells = [
  {
    value: '2,000+',
    label: 'Skilled Worker visa holders',
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
    value: 'Built by a holder',
    label: 'Real-world visa experience',
  },
];

export default function TrustBar() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid rgba(201,168,76,0.15)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
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
              borderRight: i < trustCells.length - 1 ? '1px solid rgba(201,168,76,0.12)' : undefined,
            }}
          >
            <span
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight tracking-[-0.02em]"
              style={{ fontSize: '1.0625rem', color: '#1A1B19' }}
            >
              {cell.value}
            </span>
            <span
              className="font-[family-name:var(--font-inter)] leading-snug"
              style={{ fontSize: '0.8125rem', color: '#6B6D66' }}
            >
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
