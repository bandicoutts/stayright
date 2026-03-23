'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) {
      // Focus back to button when closed
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#191C1D]/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#006948]" strokeWidth={2} />
          <span className="font-[family-name:var(--font-manrope)] font-bold text-[#191C1D] text-lg tracking-tight">
            StayRight
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <a
              href="#features"
              className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors"
            >
              Pricing
            </a>
          </li>
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#006948] to-[#00855D] hover:opacity-90 transition-opacity"
          >
            Start Free Tracker
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={btnRef}
          className="md:hidden p-2 text-[#191C1D]"
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
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-[#191C1D]/5 px-6 py-4 flex flex-col gap-4"
        >
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors py-1"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors py-1"
          >
            Pricing
          </a>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-[#3D4A42] hover:text-[#006948] hover:underline focus:underline transition-colors py-1"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#006948] to-[#00855D]"
          >
            Start Free Tracker
          </Link>
        </div>
      )}
    </nav>
  );
}
