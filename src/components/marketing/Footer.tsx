import Link from 'next/link';
import { Shield, Twitter, Linkedin } from 'lucide-react';

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
      { label: 'Privacy Policy', href: '/privacy' },
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

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#191C1D] text-white px-6 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Top: logo + columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-white" strokeWidth={2} />
              <span className="font-[family-name:var(--font-manrope)] font-bold text-white text-lg tracking-tight">
                StayRight
              </span>
            </div>
            <p className="text-sm text-white/60 font-[family-name:var(--font-inter)] leading-relaxed">
              Master your UK immigration compliance with precision.
            </p>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/40 font-[family-name:var(--font-inter)]">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors font-[family-name:var(--font-inter)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
            © {year} StayRight UK. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
