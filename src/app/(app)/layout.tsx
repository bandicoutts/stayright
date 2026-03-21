import type { ReactNode } from 'react'

// Root layout for the authenticated app.
// Auth is enforced by middleware — no need to re-check here.
// Individual sections (onboarding, dashboard, etc.) provide their own UI chrome.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
