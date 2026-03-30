'use client'

import { useState, type ReactNode } from 'react'
import { TopNav } from '@/components/app/TopNav'
import { PostHogIdentify } from '@/components/app/PostHogIdentify'
import { LoginTracker } from '@/components/app/LoginTracker'
import { ReturnVisitTracker } from '@/components/ReturnVisitTracker'
import { NavigationTracker } from '@/components/app/NavigationTracker'
import { isPlanPro } from '@/lib/subscriptionUtils'

interface Props {
  userId: string
  userEmail?: string | null
  userInitial: string
  userName: string
  subscriptionPlan?: string | null
  subscriptionStatus?: string | null
  isPaymentFailed: boolean
  children: ReactNode
}

export function MainLayoutClient({
  userId,
  userEmail,
  userInitial,
  userName,
  subscriptionPlan,
  subscriptionStatus,
  isPaymentFailed,
  children,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isPro = isPlanPro(subscriptionPlan, subscriptionStatus)
  const planLabel = isPro ? 'Pro' : null

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <PostHogIdentify userId={userId} />
      <LoginTracker />
      <ReturnVisitTracker />
      <NavigationTracker />

      <TopNav
        userName={userName}
        userEmail={userEmail}
        planLabel={planLabel}
        isPro={isPro}
        userInitial={userInitial}
        isMenuOpen={isMenuOpen}
        onOpenMenu={() => setIsMenuOpen(true)}
        onCloseMenu={() => setIsMenuOpen(false)}
      />

      {isPaymentFailed && (
        <div className="bg-[var(--color-status-red)] text-white text-sm font-medium px-4 py-2.5 text-center">
          Your payment failed. Please{' '}
          <a href="/settings" className="underline font-semibold">
            update your payment method
          </a>{' '}
          to keep Pro features.
        </div>
      )}

      <main className="flex-1" id="main-content">
        {children}
      </main>
    </div>
  )
}
