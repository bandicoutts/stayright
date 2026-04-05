import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SquaresFour, FileText, Gear, SignOut, CaretUp } from '@/components/ui/Icons'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { href: '/reports',   label: 'Reports',   icon: FileText },
]

interface Props {
  userName?: string
  userEmail?: string | null
  userInitial?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ userName = 'Account', userEmail, isOpen, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] w-[240px] flex flex-col shrink-0 min-h-screen bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)]
          transition-transform duration-300 ease-in-out md:translate-x-0 md:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

      {/* Logo Area */}
      <div className="px-8 pt-10 pb-6 flex items-center justify-between gap-4">
        <div
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stayright
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div
          className="font-[family-name:var(--font-inter)] px-4 pb-3 pt-2"
          style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}
        >
          Manage
        </div>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3.5 px-4 py-3 rounded-[8px] text-[15px] font-medium transition-colors no-underline"
              onClick={onClose}
              style={active
                ? { background: 'var(--color-border-strong)', color: 'var(--color-green-light)' }
                : { color: 'var(--color-text-muted)' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" weight={active ? 'bold' : 'regular'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User Card with Popover */}
      <div ref={popoverRef} className="px-4 pb-6 pt-4 relative">
        {/* Popover */}
        {isProfileOpen && (
          <div
            className="absolute bottom-full left-4 right-4 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="p-1.5 flex flex-col gap-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-medium transition-colors hover:bg-[var(--color-bg-tinted)] no-underline"
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => {
                  setIsProfileOpen(false)
                  onClose?.()
                }}
              >
                <Gear className="w-4 h-4 shrink-0" weight="regular" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false)
                  handleSignOut()
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] font-medium transition-colors hover:bg-[var(--color-bg-tinted)] cursor-pointer text-left"
                style={{ color: 'var(--color-status-red)' }}
              >
                <SignOut className="w-4 h-4 shrink-0" weight="regular" />
                Sign out
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] transition-all group border
            ${isProfileOpen ? 'bg-[var(--color-bg-tinted)] border-[var(--color-border-strong)]' : 'bg-[var(--color-surface-warm)] border-[var(--color-border)]'}
          `}
        >
          <div className="flex flex-col min-w-0 text-left">
            <span
              className="font-[family-name:var(--font-inter)] font-semibold leading-tight truncate"
              style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}
            >
              {userName}
            </span>
            <span
              className="font-[family-name:var(--font-inter)] truncate leading-tight mt-0.5"
              style={{ fontSize: '11.5px', color: 'var(--color-text-faint)' }}
            >
              {userEmail}
            </span>
          </div>
          <CaretUp className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-faint)' }} />
        </button>
      </div>
      </aside>
    </>
  )
}
