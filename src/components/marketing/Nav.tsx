'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { List, X } from '@/components/ui/Icons';

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
        scrolled
          ? 'bg-[var(--color-bg-tinted)]/90 backdrop-blur-[20px] border-b border-[var(--color-border)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1320px] mx-auto px-6 md:px-14 h-[62px] flex items-center justify-between">

        {/* Logo */}
        <div
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em] flex items-center gap-2 text-[var(--color-text-primary)]"
        >
          <span className="w-5 h-5 rounded-[5px] bg-[var(--gradient-green)]" />
          Stayright
        </div>

        {/* Desktop nav links — centred */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-8">
          <a
            href="#features"
            className="text-[14px] font-normal text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-[14px] font-normal text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Pricing
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-[14px] font-normal text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-[9px] rounded-[6px] text-[13px] font-semibold text-white no-underline bg-[var(--color-green)] hover:bg-[var(--color-green-light)] transition-all duration-200"
            style={{
              boxShadow: 'var(--shadow-button)',
            }}
          >
            Start Free Tracker
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={btnRef}
          className="md:hidden p-2 -mr-2 text-[var(--color-text-primary)]"
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
              className="flex items-center justify-center px-4 py-3 rounded-[6px] text-[15px] font-normal text-[var(--color-text-primary)] bg-[var(--color-bg-tinted)] border border-[var(--color-border)] transition-colors no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-[6px] text-[15px] font-semibold text-white bg-[var(--color-green)] no-underline"
              style={{
                boxShadow: 'var(--shadow-button)',
              }}
            >
              Start Free Tracker
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
