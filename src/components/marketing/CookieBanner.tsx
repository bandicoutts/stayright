'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

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
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0px_-4px_24px_rgba(25,28,29,0.08)] px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
          We use cookies to keep you logged in and to understand how StayRight
          is used. You can manage your preferences.{' '}
          <Link
            href="/cookie-policy"
            className="text-[#006948] hover:underline"
          >
            Cookie settings
          </Link>
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={necessary}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#191C1D] bg-[#F3F4F5] hover:bg-[#E5E7E8] transition-colors font-[family-name:var(--font-inter)]"
          >
            Necessary only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#006948] to-[#00855D] hover:opacity-90 transition-opacity font-[family-name:var(--font-inter)]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
