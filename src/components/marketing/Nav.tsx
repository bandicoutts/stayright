'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-[20px] border-b border-[#191C1D]/[0.03] shadow-[0px_4px_24px_rgba(0,33,20,0.02)]' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Shield className="w-6 h-6 text-[#004F35] transition-transform duration-300 group-hover:scale-105" strokeWidth={2.5} />
          <span className="font-[family-name:var(--font-manrope)] font-extrabold text-[#191C1D] text-[1.25rem] tracking-[-0.03em]">
            StayRight
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-8">
          <a
            href="#features"
            className="text-[14px] font-medium text-[#3D4A42] hover:text-[#004f35] transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-[14px] font-medium text-[#3D4A42] hover:text-[#004f35] transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-[14px] font-semibold text-[#191C1D] hover:text-[#004f35] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-semibold text-white bg-gradient-to-br from-[#004f35] to-[#006948] hover:scale-[0.98] hover:shadow-[0px_4px_12px_rgba(0,105,72,0.15)] transition-all duration-200"
          >
            Start Free Tracker
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={btnRef}
          className="md:hidden p-2 text-[#191C1D] -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div 
          ref={menuRef}
          className="md:hidden bg-white/95 backdrop-blur-[24px] border-t border-[#191C1D]/[0.03] px-6 py-6 flex flex-col gap-6 shadow-xl absolute w-full"
        >
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-[#3D4A42] hover:text-[#004f35] transition-colors py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-[#3D4A42] hover:text-[#004f35] transition-colors py-2"
            >
              Pricing
            </a>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-[#F3F4F5]">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-xl text-base font-semibold text-[#191C1D] bg-[#F8F9FA] hover:bg-[#F3F4F5] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-4 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-br from-[#004f35] to-[#006948] shadow-[0px_4px_12px_rgba(0,105,72,0.15)]"
            >
              Start Free Tracker
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
