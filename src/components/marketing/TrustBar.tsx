const trustCells = [
  {
    value: 'Home Office aligned',
    label: 'Built for Skilled Worker compliance',
  },
  {
    value: 'GDPR compliant',
    label: 'Your data stays in the UK',
  },
];

export default function TrustBar() {
  return (
    <div
      style={{
        background: 'var(--color-bg-tinted)',
      }}
    >
      <div
        className="max-w-[1320px] mx-auto grid grid-cols-2"
        role="list"
        aria-label="Trust signals"
      >
        {trustCells.map((cell) => (
          <div
            key={cell.label}
            role="listitem"
            className="flex flex-col gap-1 px-6 sm:px-10 lg:px-12 py-7"
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
