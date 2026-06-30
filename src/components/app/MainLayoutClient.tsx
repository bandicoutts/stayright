'use client'

import { type ReactNode } from 'react'
import { AppSidebar } from '@/components/app/AppSidebar'
import { AppMobileNav } from '@/components/app/AppMobileNav'
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
  const isPro = isPlanPro(subscriptionPlan, subscriptionStatus)
  const planLabel = isPro ? 'Pro' : null

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <PostHogIdentify userId={userId} />
      <LoginTracker />
      <ReturnVisitTracker />
      <NavigationTracker />

      {/* Desktop: persistent left sidebar */}
      <AppSidebar
        userName={userName}
        userEmail={userEmail}
        planLabel={planLabel}
        userInitial={userInitial}
      />

      {/* Mobile: top bar + bottom nav + FAB */}
      <AppMobileNav
        userName={userName}
        userEmail={userEmail}
        planLabel={planLabel}
        userInitial={userInitial}
      />

      {/* Content — offset for the sidebar on desktop; padded for the bottom nav on mobile */}
      <div className="min-[960px]:pl-[260px]">
        {isPaymentFailed && (
          <div className="bg-[var(--color-status-red)] text-white text-sm font-medium px-4 py-2.5 text-center">
            Your payment failed. Please{' '}
            <a href="/settings" className="underline font-semibold">
              update your payment method
            </a>{' '}
            to keep Pro features.
          </div>
        )}

        <main className="pb-24 min-[960px]:pb-0" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
