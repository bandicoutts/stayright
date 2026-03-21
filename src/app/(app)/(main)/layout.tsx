import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/app/Sidebar'
import type { ReactNode } from 'react'

export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initial = user.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar userEmail={user.email} userInitial={initial} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
