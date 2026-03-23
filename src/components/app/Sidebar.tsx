'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LayoutDashboard, Plane, FileText, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
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
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 min-h-screen bg-[#F3F4F5]">
      {/* Logo */}
      <div className="px-8 pt-10 pb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Shield className="w-6 h-6 text-[#004F35] transition-transform duration-300 group-hover:scale-105" strokeWidth={2.5} />
          <span className="font-[family-name:var(--font-manrope)] font-extrabold text-[1.25rem] tracking-[-0.03em] text-[#191C1D]">
            StayRight
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1.5">
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#3D4A42]/60 px-4 pb-3 pt-2 font-[family-name:var(--font-inter)]">
          Manage
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-[15px] font-medium transition-colors ${
                active
                  ? 'bg-[#9ff4ca] text-[#002114] shadow-sm'
                  : 'text-[#3D4A42] hover:bg-black/5 hover:text-[#191C1D]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-4 pb-6 pt-4">
        <div className="flex items-center gap-3.5 px-4 py-3 mb-2 rounded-2xl bg-white shadow-[0px_8px_24px_rgba(0,33,20,0.03)] border border-[#191C1D]/[0.02]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004f35] to-[#006948] flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-white text-[13px] font-bold tracking-wide">{userInitial}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-semibold text-[#191C1D] font-[family-name:var(--font-inter)] leading-tight">Account</span>
            <span className="text-[11px] text-[#3D4A42] truncate font-[family-name:var(--font-inter)] leading-tight mt-0.5">{userEmail}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[14px] font-medium text-[#3D4A42] hover:bg-black/5 hover:text-[#191C1D] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
