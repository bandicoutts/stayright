'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports',   label: 'Reports',   icon: FileText },
  { href: '/settings',  label: 'Settings',  icon: Settings },
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
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 min-h-screen bg-[#1A1B19]">

      {/* Logo */}
      <div className="px-8 pt-10 pb-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.125rem] tracking-[-0.03em] no-underline"
          style={{ color: '#FEF3CC' }}
        >
          Stayright
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div
          className="font-[family-name:var(--font-inter)] px-4 pb-3 pt-2"
          style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(232,213,160,0.30)' }}
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
                ? { background: 'rgba(201,168,76,0.14)', color: '#E8C87A' }
                : { color: 'rgba(232,213,160,0.50)' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
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
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,168,76,0.12)',
          }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #E8C87A 0%, #C9A84C 100%)' }}
          >
            <span
              className="font-[family-name:var(--font-manrope)] font-bold"
              style={{ fontSize: '13px', color: '#1A1B19' }}
            >
              {userInitial}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span
              className="font-[family-name:var(--font-inter)] font-semibold leading-tight"
              style={{ fontSize: '13px', color: 'rgba(232,213,160,0.80)' }}
            >
              Account
            </span>
            <span
              className="font-[family-name:var(--font-inter)] truncate leading-tight mt-0.5"
              style={{ fontSize: '11px', color: 'rgba(232,213,160,0.40)' }}
            >
              {userEmail}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer"
          style={{ color: 'rgba(232,213,160,0.40)' }}
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
