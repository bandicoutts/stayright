'use client'

import Link from 'next/link'
import { List } from '@/components/ui/Icons'

interface Props {
  onOpenMenu: () => void
}

import { ThemeToggle } from './ThemeToggle'

export function MobileNav({ onOpenMenu }: Props) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[var(--color-surface-dark)] border-b border-[var(--color-border)] md:hidden">
      <div
        className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em] flex items-center gap-2 text-[var(--color-text-primary)]"
      >
        <span className="w-5 h-5 rounded-[5px] bg-[var(--gradient-green)]" />
        Stayright
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={onOpenMenu}
          className="p-2 -mr-2 text-[var(--color-text-primary)] hover:bg-[var(--color-border-strong)] rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <List className="w-6 h-6" weight="bold" />
        </button>
      </div>
    </header>
  )
}
