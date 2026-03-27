'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/app/Sidebar'
import { MobileNav } from '@/components/app/MobileNav'
import { PostHogIdentify } from '@/components/app/PostHogIdentify'
import { LoginTracker } from '@/components/app/LoginTracker'
import { ReturnVisitTracker } from '@/components/ReturnVisitTracker'

interface Props {
  userId: string
  userEmail?: string | null
  userInitial: string
  isPaymentFailed: boolean
  children: ReactNode
}

export function MainLayoutClient({
  userId,
  userEmail,
  userInitial,
  isPaymentFailed,
  children
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--color-bg)]">
      <PostHogIdentify userId={userId} />
      <LoginTracker />
      <ReturnVisitTracker />

      {/* Mobile Header */}
      <MobileNav onOpenMenu={() => setIsMenuOpen(true)} />

      {/* Dashboard Sidebar */}
      <Sidebar
        userEmail={userEmail}
        userInitial={userInitial}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {isPaymentFailed && (
          <div className="bg-[var(--color-status-red)] text-white text-sm font-medium px-4 py-2.5 text-center">
            Your payment failed. Please{' '}
            <a href="/settings" className="underline font-semibold">
              update your payment method
            </a>{' '}
            to keep Pro features.
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
