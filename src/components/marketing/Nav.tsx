'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { List, X } from '@/components/ui/Icons';
import { ThemeToggle } from '@/components/app/ThemeToggle';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      btnRef.current?.focus();
      return;
    }

    const focusables = menuRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    ) as NodeListOf<HTMLElement>;

    if (!focusables?.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b' : 'border-b border-transparent'
      }`}
      style={scrolled ? {
        background: 'var(--color-nav-bg)',
        borderColor: 'var(--color-nav-border)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      } : {}}
    >
      <div className="px-6 md:px-14 h-[64px] flex items-center">

        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] font-extrabold text-[1.0625rem] tracking-[-0.03em] flex items-center gap-2.5 no-underline mr-6 shrink-0"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold leading-none"
            style={{ background: 'var(--gradient-green)', color: '#fff' }}
            aria-hidden="true"
          >
            S
          </div>
          StayRight
        </Link>

        {/* Desktop nav links — left-aligned after logo, matching dashboard */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Marketing navigation">
          <a
            href="#features"
            className="px-3.5 py-2 rounded-lg text-[13px] font-medium no-underline text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] focus-visible:text-[var(--color-text-primary)] focus-visible:bg-[var(--color-bg-tinted)] focus-visible:outline-none transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="px-3.5 py-2 rounded-lg text-[13px] font-medium no-underline text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] focus-visible:text-[var(--color-text-primary)] focus-visible:bg-[var(--color-bg-tinted)] focus-visible:outline-none transition-colors duration-150"
          >
            Pricing
          </a>
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center px-3.5 py-1.5 rounded-xl border text-[13px] font-medium no-underline transition-colors"
            style={{
              background: scrolled ? 'var(--color-surface)' : 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-[9px] rounded-lg text-[13px] font-semibold text-white no-underline transition-all duration-200"
            style={{
              background: 'var(--gradient-green)',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            Start free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={btnRef}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 ml-auto text-[var(--color-text-primary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute w-full bg-[var(--color-bg)]/98 backdrop-blur-[24px] border-t border-[var(--color-border)] px-6 py-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-normal text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors py-3 border-b border-[var(--color-border)] no-underline"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-normal text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors py-3 no-underline"
            >
              Pricing
            </a>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-lg text-[15px] font-normal text-[var(--color-text-primary)] bg-[var(--color-bg-tinted)] border border-[var(--color-border)] transition-colors no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-lg text-[15px] font-semibold text-white no-underline"
              style={{
                background: 'var(--gradient-green)',
                boxShadow: 'var(--shadow-button)',
              }}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
