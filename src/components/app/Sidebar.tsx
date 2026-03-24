'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SquaresFour, FileText, Gear, SignOut } from '@/components/ui/Icons'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { href: '/reports',   label: 'Reports',   icon: FileText },
  { href: '/settings',  label: 'Settings',  icon: Gear },
]

interface Props {
  userEmail?: string | null
  userInitial?: string
}

export function Sidebar({ userEmail, userInitial = '?' }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 min-h-screen bg-[var(--color-surface-dark)]">

      {/* Logo */}
      <div className="px-8 pt-10 pb-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em] no-underline"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stayright
        </Link>
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

      {/* User + sign out */}
      <div className="px-4 pb-6 pt-4">
        <div
          className="flex items-center gap-3.5 px-4 py-3 mb-2 rounded-[10px]"
          style={{
            background: 'var(--color-surface-warm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-green)' }}
          >
            <span
              className="font-[family-name:var(--font-manrope)] font-bold"
              style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}
            >
              {userInitial}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span
              className="font-[family-name:var(--font-inter)] font-semibold leading-tight"
              style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}
            >
              Account
            </span>
            <span
              className="font-[family-name:var(--font-inter)] truncate leading-tight mt-0.5"
              style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}
            >
              {userEmail}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-faint)' }}
        >
          <SignOut className="w-4 h-4 shrink-0" weight="regular" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
