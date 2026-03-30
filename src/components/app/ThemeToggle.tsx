'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from '@/components/ui/Icons'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch: this pattern is intentional. We set mounted after
  // first render so the SSR output (mounted=false) matches the initial client
  // render, preventing a hydration mismatch on the theme toggle.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-tinted)] border border-[var(--color-border)] animate-pulse" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-tinted)] hover:border-[var(--color-border-strong)] transition-all group shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <div 
          className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isDark ? 'translate-y-0 rotate-0' : '-translate-y-8 rotate-45'
          }`}
        >
          <Moon weight="bold" className="w-5 h-5 text-[var(--color-text-primary)]" />
        </div>
        <div 
          className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isDark ? 'translate-y-8 rotate-45' : 'translate-y-0 rotate-0'
          }`}
        >
          <Sun weight="bold" className="w-5 h-5 text-[var(--color-text-primary)]" />
        </div>
      </div>
      
      {/* Tooltip for desktop */}
      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--color-text-primary)] text-[var(--color-bg)] text-[10px] font-bold tracking-wider uppercase rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl hidden md:block">
        {isDark ? 'Switch to Light' : 'Switch to Dark'}
      </span>
    </button>
  )
}
