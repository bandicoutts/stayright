import Link from 'next/link';
import { TwitterLogo, LinkedinLogo } from '@/components/ui/Icons';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Centre', href: '/help' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
  },
];

// Footer background is always var(--color-surface-dark) = #080B08 regardless of theme.
// All text uses fixed light values so it remains readable in both light and dark modes.

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="px-6 md:px-14 pt-14 pb-8"
      style={{ background: 'var(--color-surface-dark)' }}
    >
      <div className="max-w-[1320px] mx-auto">

        {/* Top: brand + link columns */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <Link
              href="/"
              className="font-[family-name:var(--font-heading)] font-extrabold tracking-[-0.03em] no-underline"
              style={{ fontSize: '1.125rem', color: '#E8EDE9' }}
            >
              Stayright
            </Link>
            <p
              className="font-[family-name:var(--font-body)] leading-relaxed"
              style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.40)' }}
            >
              Know your number. Travel freely.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h4
                className="font-[family-name:var(--font-body)] font-semibold tracking-[0.10em] uppercase"
                style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.35)' }}
              >
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-[family-name:var(--font-body)] no-underline transition-colors duration-150 hover:text-white"
                      style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider accent */}
        <div
          style={{ width: 40, height: 1, background: 'var(--color-green)', opacity: 0.5, marginBottom: 24 }}
          aria-hidden="true"
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p
            className="font-[family-name:var(--font-body)]"
            style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}
          >
            © {year} Stayright. Built for UK Skilled Worker visa holders.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="transition-colors duration-150 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              <TwitterLogo className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors duration-150 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              <LinkedinLogo className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
