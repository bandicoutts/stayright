const STEPS = [
  { n: '01', title: 'Log your trips', body: 'Enter the dates you left and returned to the UK. That’s the only manual step.' },
  { n: '02', title: 'We check every window', body: 'StayRight scans every rolling 12-month period across your qualifying span, automatically.' },
  { n: '03', title: 'Know you’re safe', body: 'See your status and days remaining — instantly, and always. No surprises, ever.', highlight: true },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-6 md:px-14" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1240px] mx-auto py-[72px]">
        <div
          className="font-[family-name:var(--font-mono)] tracking-[0.16em] uppercase mb-4"
          style={{ fontSize: '0.8125rem', color: 'var(--color-green-light)' }}
        >
          how it works
        </div>
        <h2
          className="font-[family-name:var(--font-manrope)] font-bold leading-[1.02] tracking-[-0.03em] mb-12 max-w-[720px]"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3.25rem)', color: 'var(--color-text-primary)' }}
        >
          Three steps to total peace of mind.
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl p-7"
              style={{
                border: s.highlight ? '1px solid var(--color-green)' : '1px solid var(--color-border)',
                background: s.highlight ? 'var(--color-green-pale)' : 'var(--color-surface)',
              }}
            >
              <div
                className="font-[family-name:var(--font-mono)] mb-5"
                style={{ fontSize: '0.875rem', color: 'var(--color-green-light)' }}
              >
                {s.n}
              </div>
              <h3
                className="font-[family-name:var(--font-manrope)] font-bold mb-2.5 tracking-[-0.01em]"
                style={{ fontSize: '1.375rem', color: 'var(--color-text-primary)' }}
              >
                {s.title}
              </h3>
              <p
                className="font-[family-name:var(--font-inter)] leading-[1.5]"
                style={{ fontSize: '0.96rem', color: 'var(--color-text-muted)' }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
