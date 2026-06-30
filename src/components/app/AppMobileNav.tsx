'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  SquaresFour,
  AirplaneTilt,
  FileText,
  Gear,
  Plus,
  SignOut,
} from '@/components/ui/Icons'
import { Spinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: SquaresFour },
  { href: '/trips',     label: 'Trips',     Icon: AirplaneTilt },
  { href: '/reports',   label: 'Reports',   Icon: FileText },
  { href: '/settings',  label: 'Settings',  Icon: Gear },
] as const

interface Props {
  userName?: string
  userEmail?: string | null
  planLabel?: string | null
  userInitial?: string
}

/**
 * Mobile app shell (reskin Phase 1): a slim sticky top bar (logo + theme + account)
 * and a fixed bottom nav with a centered raised FAB that opens the log-trip modal.
 * Hidden at `lg` and up (desktop uses AppSidebar).
 */
export function AppMobileNav({
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
    <>
      {/* Top bar */}
      <header
        className="lg:hidden sticky top-0 z-40 h-[56px] flex items-center justify-between px-4 border-b"
        style={{
          background: 'var(--color-nav-bg)',
          borderColor: 'var(--color-nav-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div
            className="w-[26px] h-[26px] rounded-lg flex items-center justify-center text-sm font-extrabold leading-none"
            style={{ background: 'var(--gradient-green)', color: '#fff' }}
            aria-hidden="true"
          >
            S
          </div>
          <span className="font-[family-name:var(--font-manrope)] font-bold text-[1.15rem] tracking-[-0.02em] text-[var(--color-text-primary)]">
            Stayright
          </span>
        </Link>

        <div className="flex items-center gap-2" ref={menuRef}>
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold border cursor-pointer"
              style={{
                background: 'var(--color-surface-sunken)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-green-light)',
              }}
              aria-expanded={isMenuOpen}
              aria-label="Account menu"
            >
              {userInitial}
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{userName}</p>
                    {planLabel && (
                      <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[var(--color-green-pale)] text-[var(--color-green)] uppercase shrink-0">
                        {planLabel}
                      </span>
                    )}
                  </div>
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
          </div>
        </div>
      </header>

      {/* Bottom nav + FAB */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: 'var(--color-nav-bg)',
          borderColor: 'var(--color-nav-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Mobile navigation"
      >
        <div className="relative grid grid-cols-5 h-[62px]">
          {NAV_ITEMS.slice(0, 2).map(({ href, label, Icon }) => (
            <BottomItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}

          {/* Center FAB — opens the log-trip modal */}
          <div className="flex items-center justify-center">
            <Link
              href="/trips?modal=log"
              aria-label="Log trip"
              className="flex items-center justify-center w-[54px] h-[54px] rounded-[17px] -mt-7 no-underline border-[3px] shadow-lg"
              style={{
                background: 'var(--gradient-green)',
                borderColor: 'var(--color-bg)',
                color: '#fff',
              }}
            >
              <Plus className="w-6 h-6" weight="bold" />
            </Link>
          </div>

          {NAV_ITEMS.slice(2).map(({ href, label, Icon }) => (
            <BottomItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}
        </div>
      </nav>
    </>
  )
}

function BottomItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string
  label: string
  Icon: typeof SquaresFour
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="flex flex-col items-center justify-center gap-1 h-full no-underline"
      style={{ color: active ? 'var(--color-green)' : 'var(--color-text-faint)' }}
    >
      <Icon className="w-[22px] h-[22px] shrink-0" weight={active ? 'fill' : 'regular'} />
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">{label}</span>
    </Link>
  )
}
