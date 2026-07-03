'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Intentional: syncing state from localStorage (external system) on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const focusables = dialogRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    ) as NodeListOf<HTMLElement>;
    
    if (!focusables?.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();

    function handleKeyDown(e: KeyboardEvent) {
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
  }, [visible]);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    // Notify PostHogProvider in this tab (native storage events only fire in other tabs)
    window.dispatchEvent(new CustomEvent('cookie-consent', { detail: 'accepted' }));
    setVisible(false);
  }

  function necessary() {
    localStorage.setItem('cookie_consent', 'necessary');
    window.dispatchEvent(new CustomEvent('cookie-consent', { detail: 'necessary' }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] shadow-[0px_-4px_24px_rgba(0,0,0,0.1)] border-t border-[var(--color-border)] px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-[var(--color-text-muted)] font-[family-name:var(--font-body)] leading-relaxed max-w-xl">
          We use necessary cookies to keep you signed in. With your consent, we
          use analytics cookies to understand how StayRight is used.{' '}
          <Link
            href="/cookie-policy"
            className="text-[var(--color-green)] hover:underline"
          >
            Cookie settings
          </Link>
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={necessary}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-tinted)] hover:bg-[var(--color-border)] transition-colors font-[family-name:var(--font-body)]"
          >
            Necessary only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--gradient-green)] hover:opacity-90 transition-opacity font-[family-name:var(--font-body)]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
