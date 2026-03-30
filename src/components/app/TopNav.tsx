'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { List, X, Gear, SignOut } from '@/components/ui/Icons'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/trips',     label: 'Trips'     },
  { href: '/reports',   label: 'Reports'   },
  { href: '/settings',  label: 'Settings'  },
]

interface Props {
  userName?: string
  userEmail?: string | null
  planLabel?: string | null
  isPro?: boolean
  userInitial?: string
  isMenuOpen: boolean
  onOpenMenu: () => void
  onCloseMenu: () => void
}

export function TopNav({
  userName = 'Account',
  userEmail,
  planLabel,
  isPro,
  userInitial = '?',
  isMenuOpen,
  onOpenMenu,
  onCloseMenu,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    onCloseMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  async function handleSignOut() {
    setIsProfileOpen(false)
    onCloseMenu()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Sticky top bar */}
      <header
        className="sticky top-0 z-40 h-[60px] flex items-center px-4 sm:px-6 border-b"
        style={{
          background: 'var(--color-nav-bg)',
          borderColor: 'var(--color-nav-border)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 no-underline mr-6 shrink-0"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold leading-none"
            style={{ background: 'var(--gradient-green)', color: '#fff' }}
            aria-hidden="true"
          >
            S
          </div>
          <span className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.0625rem] tracking-[-0.03em] text-[var(--color-text-primary)] hidden sm:block">
            Stayright
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors no-underline"
                style={
                  active
                    ? { background: 'var(--color-accent-subtle, rgba(0,168,116,0.1))', color: 'var(--color-green-light)' }
                    : { color: 'var(--color-text-muted)' }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--color-bg-tinted)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {/* User identity — desktop */}
          <div ref={profileRef} className="hidden md:block relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border transition-colors cursor-pointer"
              style={{
                background: isProfileOpen ? 'var(--color-bg-tinted)' : 'var(--color-surface)',
                borderColor: isProfileOpen ? 'var(--color-border-strong)' : 'var(--color-border)',
              }}
              aria-expanded={isProfileOpen}
              aria-label="User menu"
            >
              {planLabel && (
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[var(--color-green-pale)] text-[var(--color-green)] uppercase tracking-[0.5px]">
                  {planLabel}
                </span>
              )}
              <span className="text-[13px] font-medium text-[var(--color-text-muted)] max-w-[120px] truncate">
                {userName}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 border"
                style={{
                  background: 'var(--color-surface-sunken)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-green-light)',
                }}
                aria-hidden="true"
              >
                {userInitial}
              </div>
            </button>

            {/* Profile popover */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Gear className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" weight="regular" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer text-left"
                    style={{ color: 'var(--color-status-red)' }}
                  >
                    <SignOut className="w-4 h-4 shrink-0" weight="regular" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={isMenuOpen ? onCloseMenu : onOpenMenu}
            className="md:hidden p-2 -mr-1 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" weight="bold" />
            ) : (
              <List className="w-5 h-5" weight="bold" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onCloseMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-[60px] left-0 right-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xl md:hidden transition-all duration-200 ease-in-out ${
          isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="px-4 pt-3 pb-2 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-3 rounded-xl text-[15px] font-medium transition-colors no-underline"
                style={
                  active
                    ? { background: 'var(--color-green-pale)', color: 'var(--color-green)' }
                    : { color: 'var(--color-text-muted)' }
                }
                onClick={onCloseMenu}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile user section */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)] mt-1">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
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
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{userName}</p>
              {userEmail && (
                <p className="text-[11px] text-[var(--color-text-faint)] truncate">{userEmail}</p>
              )}
            </div>
            {planLabel && (
              <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[var(--color-green-pale)] text-[var(--color-green)] uppercase shrink-0">
                {planLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-pointer transition-colors hover:bg-[var(--color-danger-bg)]"
            style={{ color: 'var(--color-status-red)' }}
          >
            <SignOut className="w-4 h-4 shrink-0" weight="regular" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}
