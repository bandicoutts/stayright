'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

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
          ? 'bg-[rgba(250,248,242,0.90)] backdrop-blur-[20px] border-b border-[rgba(201,168,76,0.20)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1320px] mx-auto px-6 md:px-14 h-[62px] flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em] text-[#1A1B19] no-underline"
        >
          Stayright
        </Link>

        {/* Desktop nav links — centred */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-8">
          <a
            href="#features"
            className="text-[14px] font-normal text-[#6B6D66] hover:text-[#1A1B19] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-[14px] font-normal text-[#6B6D66] hover:text-[#1A1B19] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Pricing
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-[14px] font-normal text-[#6B6D66] hover:text-[#1A1B19] tracking-[0.01em] transition-colors duration-150 no-underline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-[9px] rounded-[6px] text-[13px] font-semibold text-[#1A1B19] no-underline"
            style={{
              background: 'linear-gradient(135deg, #E8C87A 0%, #C9A84C 100%)',
              boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
            }}
          >
            Start Free Tracker
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={btnRef}
          className="md:hidden p-2 -mr-2 text-[#1A1B19]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="md:hidden absolute w-full bg-[rgba(250,248,242,0.97)] backdrop-blur-[24px] border-t border-[rgba(201,168,76,0.15)] px-6 py-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-normal text-[#6B6D66] hover:text-[#1A1B19] transition-colors py-3 border-b border-[rgba(201,168,76,0.12)] no-underline"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-[15px] font-normal text-[#6B6D66] hover:text-[#1A1B19] transition-colors py-3 no-underline"
            >
              Pricing
            </a>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-[6px] text-[15px] font-normal text-[#1A1B19] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.20)] transition-colors no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-[6px] text-[15px] font-semibold text-[#1A1B19] no-underline"
              style={{
                background: 'linear-gradient(135deg, #E8C87A 0%, #C9A84C 100%)',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
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
