'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  House,
  AirplaneTilt,
  FileText,
  Gear,
  SignOut,
  CaretUp,
} from '@/components/ui/Icons'
import { Spinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',     Icon: House },
  { href: '/trips',     label: 'Trips',    Icon: AirplaneTilt },
  { href: '/reports',   label: 'Reports',  Icon: FileText },
  { href: '/settings',  label: 'Settings', Icon: Gear },
] as const

interface Props {
  userName?: string
  userEmail?: string | null
  planLabel?: string | null
  userInitial?: string
}

/**
 * Persistent left sidebar — the desktop app shell (DECISION-019 / reskin Phase 1).
 * Hidden below `lg`; mobile uses AppMobileNav (top bar + bottom nav + FAB).
 */
export function AppSidebar({
  userName = 'Account',
  userEmail,
  planLabel,
  userInitial = '?',
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    setIsMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className="hidden min-[960px]:flex fixed top-0 left-0 z-40 h-screen w-[260px] flex-col px-4 py-5 border-r"
      style={{
        background: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-sidebar-border)',
      }}
      aria-label="Sidebar"
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 no-underline px-2 mb-7 shrink-0">
        <div
          className="w-[26px] h-[26px] rounded-lg flex items-center justify-center text-sm font-extrabold leading-none"
          style={{ background: 'var(--gradient-green)', color: '#fff' }}
          aria-hidden="true"
        >
          S
        </div>
        <span className="font-[family-name:var(--font-heading)] font-bold text-[1.25rem] tracking-[-0.02em] text-[var(--color-text-primary)]">
          Stayright
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors no-underline"
              style={
                active
                  ? {
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 600,
                    }
                  : {
                      border: '1px solid transparent',
                      color: 'var(--color-text-muted)',
                      fontWeight: 500,
                    }
              }
            >
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                weight={active ? 'fill' : 'regular'}
                style={{ color: active ? 'var(--color-green)' : 'var(--color-text-muted)' }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3">
        <div className="px-1">
          <ThemeToggle />
        </div>

        {/* User card + popover menu */}
        <div ref={menuRef} className="relative">
          {isMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{userName}</p>
                {userEmail && (
                  <p className="text-[11px] text-[var(--color-text-faint)] truncate mt-0.5">{userEmail}</p>
                )}
              </div>
              <div className="p-1">
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Gear className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" weight="regular" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer text-left disabled:opacity-50"
                  style={{ color: 'var(--color-status-red)' }}
                >
                  {signingOut ? <Spinner /> : <SignOut className="w-4 h-4 shrink-0" weight="regular" />}
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-colors cursor-pointer"
            style={{
              background: isMenuOpen ? 'var(--color-bg-tinted)' : 'var(--color-surface)',
              borderColor: isMenuOpen ? 'var(--color-border-strong)' : 'var(--color-border)',
            }}
            aria-expanded={isMenuOpen}
            aria-label="Account menu"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 border"
              style={{
                background: 'var(--color-surface-sunken)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-green-light)',
              }}
              aria-hidden="true"
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{userName}</p>
              {planLabel ? (
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-green)] uppercase tracking-[0.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)] inline-block" />
                  {planLabel}
                </p>
              ) : (
                <p className="text-[11px] text-[var(--color-text-faint)] truncate">Free plan</p>
              )}
            </div>
            <CaretUp
              className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-faint)] transition-transform"
              weight="bold"
              style={{ transform: isMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
