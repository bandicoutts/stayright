'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LayoutDashboard, Plane, FileText, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trips', label: 'Trips', icon: Plane },
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
    <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen bg-white border-r border-[#191C1D]/8">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#191C1D]/8">
        <Link href="/" className="inline-flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#006948]" strokeWidth={2} />
          <span className="font-[family-name:var(--font-manrope)] font-bold text-base tracking-tight text-[#191C1D]">
            StayRight
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#006948]/10 text-[#006948]'
                  : 'text-[#3D4A42] hover:bg-[#F8F9FA] hover:text-[#191C1D]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-[#191C1D]/8">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#006948] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">{userInitial}</span>
          </div>
          <span className="text-xs text-[#3D4A42] truncate">{userEmail}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#3D4A42] hover:bg-[#F8F9FA] hover:text-[#191C1D] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
