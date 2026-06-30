'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  updateProfileAction,
  updateNotificationsAction,
  updateEmailAction,
  updatePasswordAction,
  exportDataAction,
  deleteAccountAction,
} from '@/app/(app)/(main)/settings/actions'
import { track } from '@/lib/posthog'
import { Spinner } from '@/components/ui/Spinner'
import { Calendar, Envelope, CreditCard, Bell, Palette, Shield, Check, Sun, Moon } from '@/components/ui/Icons'
import type { Profile, Subscription } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SettingsProfile = Pick<
  Profile,
  | 'first_name'
  | 'last_name'
  | 'visa_route'
  | 'visa_start_date'
  | 'notifications_120_day'
  | 'notifications_150_day'
  | 'notifications_return_reminder'
  | 'notifications_ilr_reminder'
  | 'notifications_monthly'
>

type SettingsSubscription = Pick<Subscription, 'plan' | 'current_period_end'>

interface SettingsClientProps {
  profile: SettingsProfile
  subscription: SettingsSubscription | null
  userEmail: string
  isPro: boolean
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] font-semibold text-[var(--color-text-faint)] uppercase tracking-[0.06em] mb-1.5">
      {children}
    </label>
  )
}

function TextInput({ id, value, onChange, type = 'text', placeholder, disabled }: {
  id?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      className="block w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface-warm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 disabled:bg-[var(--color-bg-tinted)] disabled:text-[var(--color-text-muted)]"
    />
  )
}

function Toggle({ checked, onChange, label, description, locked }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; locked?: boolean
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3.5 border-b border-[var(--color-border)] last:border-0 ${locked ? 'opacity-60' : ''}`}>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
          {locked && (
            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[var(--color-bg-tinted)] text-[var(--color-text-faint)] uppercase tracking-[0.5px]">Pro</span>
          )}
        </div>
        {description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>}
      </div>
      <button
        role="switch" aria-checked={checked && !locked} aria-label={label} disabled={locked}
        onClick={() => !locked && onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} ${checked && !locked ? 'bg-[var(--color-green)]' : 'bg-[var(--color-text-faint)]'}`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked && !locked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function SaveButton({ saving, onClick, children = 'Save changes' }: { saving: boolean; onClick: () => void; children?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      style={{ background: 'var(--gradient-green)' }}>
      {saving ? 'Saving…' : children}
    </button>
  )
}

function StatusMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
  return <p className={`text-sm mt-2 ${type === 'success' ? 'text-[var(--color-green)]' : 'text-[var(--color-danger-text)]'}`}>{message}</p>
}

function Card({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border p-5" style={{ boxShadow: 'var(--shadow-card)', borderColor: danger ? 'var(--color-danger-border)' : 'var(--color-border)' }}>
      {children}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-text-primary)] mb-4">{children}</h2>
}

function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case 'pro_monthly': return 'Pro — Monthly'
    case 'pro_annual': return 'Pro — Annual'
    case 'pro_lifetime': return 'Pro — Lifetime'
    default: return 'Free'
  }
}

// All four plans (DECISION-074 reconciliation: annual included; Free = 10 trips).
const PLAN_CARDS = [
  { key: 'free', name: 'Free', price: '£0', period: 'forever', features: ['Up to 10 trips', 'Live 180-day tracker', 'At-a-glance status'] },
  { key: 'pro_monthly', name: 'Pro — Monthly', price: '£2.99', period: '/month', features: ['Unlimited trips', 'What-if simulator', 'Threshold alerts', 'PDF export'] },
  { key: 'pro_annual', name: 'Pro — Annual', price: '£24.99', period: '/year', badge: 'Save 30%', features: ['Everything in Pro', 'Two months free'] },
  { key: 'pro_lifetime', name: 'Lifetime', price: '£49.99', period: 'once', features: ['Everything in Pro', 'No subscription, ever', 'All future updates'] },
] as const

const SECTIONS = [
  { id: 'visa', label: 'Visa & ILR', Icon: Calendar },
  { id: 'account', label: 'Account', Icon: Envelope },
  { id: 'subscription', label: 'Subscription', Icon: CreditCard },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'appearance', label: 'Appearance', Icon: Palette },
  { id: 'privacy', label: 'Data & privacy', Icon: Shield },
] as const

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function SettingsClient({ profile, subscription, userEmail, isPro }: SettingsClientProps) {
  const router = useRouter()

  // Visa
  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [lastName, setLastName] = useState(profile.last_name ?? '')
  const [visaRoute, setVisaRoute] = useState(profile.visa_route)
  const [visaStart, setVisaStart] = useState(profile.visa_start_date ?? '')
  const [visaSaving, setVisaSaving] = useState(false)
  const [visaStatus, setVisaStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Notifications
  const [notif120, setNotif120] = useState(profile.notifications_120_day)
  const [notif150, setNotif150] = useState(profile.notifications_150_day)
  const [notifReturn, setNotifReturn] = useState(profile.notifications_return_reminder)
  const [notifIlr, setNotifIlr] = useState(profile.notifications_ilr_reminder)
  const [notifMonthly, setNotifMonthly] = useState(profile.notifications_monthly)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifStatus, setNotifStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Account: email / password
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Data
  const [exporting, setExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Billing
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // Appearance
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Scrollspy
  const [activeSection, setActiveSection] = useState<string>('visa')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    )
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const ilrDate = visaStart
    ? (() => {
        const d = new Date(visaStart + 'T00:00:00Z')
        d.setUTCFullYear(d.getUTCFullYear() + 5)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      })()
    : null

  const currentPlan = subscription?.plan ?? 'free'

  // ---- Handlers ----
  function fullProfilePayload() {
    return { first_name: firstName, last_name: lastName, visa_route: visaRoute, visa_start_date: visaStart }
  }

  async function handleSaveVisa() {
    if (!firstName.trim()) { setVisaStatus({ type: 'error', msg: 'First name is required (set it under Account).' }); return }
    if (!visaStart) { setVisaStatus({ type: 'error', msg: 'Visa start date is required.' }); return }
    setVisaSaving(true); setVisaStatus(null)
    const result = await updateProfileAction(fullProfilePayload())
    setVisaSaving(false)
    if ('error' in result) setVisaStatus({ type: 'error', msg: result.error })
    else { setVisaStatus({ type: 'success', msg: 'Saved.' }); router.refresh() }
  }

  async function handleSaveName() {
    if (!firstName.trim()) { setNameStatus({ type: 'error', msg: 'First name is required.' }); return }
    setNameSaving(true); setNameStatus(null)
    const result = await updateProfileAction(fullProfilePayload())
    setNameSaving(false)
    if ('error' in result) setNameStatus({ type: 'error', msg: result.error })
    else { setNameStatus({ type: 'success', msg: 'Saved.' }); router.refresh() }
  }

  async function handleSaveNotifications() {
    setNotifSaving(true); setNotifStatus(null)
    const result = await updateNotificationsAction({
      notifications_120_day: notif120, notifications_150_day: notif150,
      notifications_return_reminder: notifReturn, notifications_ilr_reminder: notifIlr, notifications_monthly: notifMonthly,
    })
    setNotifSaving(false)
    if ('error' in result) setNotifStatus({ type: 'error', msg: result.error })
    else setNotifStatus({ type: 'success', msg: 'Preferences saved.' })
  }

  async function handleUpdateEmail() {
    if (!newEmail) return
    setEmailSaving(true); setEmailStatus(null)
    const result = await updateEmailAction(newEmail)
    setEmailSaving(false)
    if ('error' in result) setEmailStatus({ type: 'error', msg: result.error })
    else { setEmailStatus({ type: 'success', msg: 'Confirmation sent to your new address. Click the link to complete the change.' }); setNewEmail('') }
  }

  async function handleUpdatePassword() {
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', msg: 'New passwords do not match.' }); return }
    if (newPw.length < 8) { setPwStatus({ type: 'error', msg: 'Password must be at least 8 characters.' }); return }
    setPwSaving(true); setPwStatus(null)
    const result = await updatePasswordAction(currentPw, newPw)
    setPwSaving(false)
    if ('error' in result) setPwStatus({ type: 'error', msg: result.error })
    else { setPwStatus({ type: 'success', msg: 'Password updated.' }); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  async function handleExportData() {
    setExporting(true)
    try {
      const result = await exportDataAction()
      if ('error' in result) { alert(`Export failed: ${result.error}`); return }
      const blob = new Blob([result.json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `StayRight_Export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } finally { setExporting(false) }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'delete my account') return
    setDeleting(true); setDeleteError(null)
    const result = await deleteAccountAction()
    if ('error' in result) { setDeleting(false); setDeleteError(result.error); return }
    track('account_deleted')
    router.push('/login')
  }

  async function handlePortal() {
    setPortalLoading(true); setBillingError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) { setBillingError(data.error ?? 'Could not open billing portal.'); return }
      window.location.href = data.url
    } catch { setBillingError('Could not connect. Please try again.') } finally { setPortalLoading(false) }
  }

  async function handleCheckout(plan: string) {
    track('upgrade_clicked', { plan })
    setCheckoutLoading(plan); setBillingError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
      const data = await res.json()
      if (!res.ok || !data.url) { setBillingError(data.error ?? 'Something went wrong. Please try again.'); return }
      window.location.href = data.url
    } catch { setBillingError('Could not connect. Please try again.') } finally { setCheckoutLoading(null) }
  }

  const resolvedTheme = mounted ? theme : undefined

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl tracking-tight text-[var(--color-text-primary)] mb-2">Settings</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Manage your visa profile, account, billing, and preferences.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[212px_minmax(0,1fr)] gap-8 max-w-5xl">
        {/* Jump nav */}
        <aside className="lg:sticky lg:top-6 self-start">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Settings sections">
            {SECTIONS.map(({ id, label, Icon }) => {
              const active = activeSection === id
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActiveSection(id)}
                  aria-current={active ? 'true' : undefined}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors no-underline"
                  style={active
                    ? { background: 'var(--color-green-pale)', color: 'var(--color-green)' }
                    : { color: 'var(--color-text-muted)' }}
                >
                  <Icon className="w-4 h-4 shrink-0" weight={active ? 'fill' : 'regular'} />
                  {label}
                </a>
              )
            })}
          </nav>
        </aside>

        {/* Sections */}
        <div className="flex flex-col gap-10 min-w-0">

          {/* VISA & ILR */}
          <section id="visa" className="scroll-mt-6">
            <SectionHeading>Visa &amp; ILR</SectionHeading>
            <Card>
              <div className="flex flex-col gap-4">
                <div>
                  <FieldLabel htmlFor="visa-route">Visa route</FieldLabel>
                  <select id="visa-route" value={visaRoute} onChange={(e) => setVisaRoute(e.target.value)}
                    className="block w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface-warm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30">
                    <option value="Skilled Worker">Skilled Worker</option>
                    <option value="Health and Care Worker">Health and Care Worker</option>
                    <option value="Intra-company Transfer">Intra-company Transfer</option>
                    <option value="Global Talent">Global Talent</option>
                    <option value="Innovator Founder">Innovator Founder</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="visa-start">Visa start date</FieldLabel>
                  <TextInput id="visa-start" type="date" value={visaStart} onChange={setVisaStart} />
                </div>
                {ilrDate && (
                  <div className="px-3.5 py-3 bg-[var(--color-green-pale)] rounded-xl">
                    <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.1em] uppercase text-[var(--color-green)] mb-0.5">ILR eligibility date</p>
                    <p className="font-[family-name:var(--font-manrope)] font-bold text-lg text-[var(--color-green)]">{ilrDate}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">5 years from your visa start date</p>
                  </div>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <SaveButton saving={visaSaving} onClick={handleSaveVisa} />
                  <Link href="/onboarding/visa?force=1" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors underline underline-offset-2">Redo visa setup</Link>
                  {visaStatus && <StatusMessage type={visaStatus.type} message={visaStatus.msg} />}
                </div>
              </div>
            </Card>
          </section>

          {/* ACCOUNT */}
          <section id="account" className="scroll-mt-6">
            <SectionHeading>Account</SectionHeading>
            <div className="flex flex-col gap-4">
              <Card>
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-4">Your name</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel htmlFor="first-name">First name</FieldLabel>
                    <TextInput id="first-name" value={firstName} onChange={setFirstName} placeholder="First name" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                    <TextInput id="last-name" value={lastName} onChange={setLastName} placeholder="Last name" />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">Used in your PDF evidence pack.</p>
                <div className="mt-3 flex items-center gap-3">
                  <SaveButton saving={nameSaving} onClick={handleSaveName}>Save name</SaveButton>
                  {nameStatus && <StatusMessage type={nameStatus.type} message={nameStatus.msg} />}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-3">Email address</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">Current: <span className="font-medium text-[var(--color-text-primary)] font-[family-name:var(--font-mono)] text-xs">{userEmail}</span></p>
                <FieldLabel htmlFor="new-email">New email address</FieldLabel>
                <TextInput id="new-email" type="email" value={newEmail} onChange={setNewEmail} placeholder="New email address" />
                <div className="mt-3">
                  <SaveButton saving={emailSaving} onClick={handleUpdateEmail}>Update email</SaveButton>
                  {emailStatus && <StatusMessage type={emailStatus.type} message={emailStatus.msg} />}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-4">Change password</h3>
                <div className="flex flex-col gap-2.5">
                  <div><FieldLabel htmlFor="current-pw">Current password</FieldLabel><TextInput id="current-pw" type="password" value={currentPw} onChange={setCurrentPw} placeholder="Current password" /></div>
                  <div><FieldLabel htmlFor="new-pw">New password</FieldLabel><TextInput id="new-pw" type="password" value={newPw} onChange={setNewPw} placeholder="At least 8 characters" /></div>
                  <div><FieldLabel htmlFor="confirm-pw">Confirm new password</FieldLabel><TextInput id="confirm-pw" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Confirm new password" /></div>
                </div>
                <div className="mt-3">
                  <SaveButton saving={pwSaving} onClick={handleUpdatePassword}>Change password</SaveButton>
                  {pwStatus && <StatusMessage type={pwStatus.type} message={pwStatus.msg} />}
                </div>
              </Card>
            </div>
          </section>

          {/* SUBSCRIPTION */}
          <section id="subscription" className="scroll-mt-6">
            <SectionHeading>Subscription &amp; billing</SectionHeading>
            <Card>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--color-text-primary)]">{planLabel(currentPlan)}</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--color-green-pale)', color: 'var(--color-green)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />Current
                  </span>
                  {subscription?.current_period_end && currentPlan !== 'pro_lifetime' && currentPlan !== 'free' && (
                    <span className="text-xs text-[var(--color-text-muted)]">· renews {new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                </div>
                {currentPlan !== 'free' && currentPlan !== 'pro_lifetime' && (
                  <button onClick={handlePortal} disabled={portalLoading}
                    className="px-3.5 py-2 text-sm font-medium rounded-xl border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tinted)] transition-colors cursor-pointer disabled:opacity-50">
                    <span className="flex items-center gap-2">{portalLoading && <Spinner />}{portalLoading ? 'Opening…' : 'Manage billing'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {PLAN_CARDS.map((p) => {
                  const isCurrent = p.key === currentPlan
                  const isPaid = p.key !== 'free'
                  return (
                    <div key={p.key} className="rounded-xl border p-4 flex flex-col"
                      style={isCurrent
                        ? { borderColor: 'var(--color-green)', background: 'var(--color-green-pale)' }
                        : { borderColor: 'var(--color-border)', background: 'var(--color-surface-warm)' }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{p.name}</span>
                        {'badge' in p && p.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--gradient-green)' }}>{p.badge}</span>}
                      </div>
                      <p className="mb-2"><span className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[var(--color-text-primary)]">{p.price}</span> <span className="text-xs text-[var(--color-text-muted)]">{p.period}</span></p>
                      <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                            <Check className="w-3.5 h-3.5 shrink-0 text-[var(--color-green)]" weight="bold" />{f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <span className="text-center px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-green)] border border-[var(--color-green)]">Current plan</span>
                      ) : isPaid ? (
                        <button onClick={() => handleCheckout(p.key)} disabled={checkoutLoading !== null}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                          style={{ background: 'var(--gradient-green)' }}>
                          {checkoutLoading === p.key && <Spinner />}{currentPlan === 'free' ? 'Upgrade' : 'Switch'}
                        </button>
                      ) : (
                        <span className="text-center px-3 py-2 rounded-lg text-xs font-medium text-[var(--color-text-faint)]">Free tier</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {billingError && <p className="mt-3 text-xs text-[var(--color-danger-text)]">{billingError}</p>}
            </Card>
          </section>

          {/* NOTIFICATIONS */}
          <section id="notifications" className="scroll-mt-6">
            <SectionHeading>Notifications &amp; alerts</SectionHeading>
            <Card>
              <Toggle checked={notif120} onChange={setNotif120} label="Email me at 120 days" description="When your rolling window reaches 120 absence days." locked={!isPro} />
              <Toggle checked={notif150} onChange={setNotif150} label="Email me at 150 days" description="When your rolling window reaches 150 absence days." locked={!isPro} />
              <Toggle checked={notifReturn} onChange={setNotifReturn} label="Remind me to log my return" description="After an open-ended trip, a nudge to log your return date." locked={!isPro} />
              <Toggle checked={notifIlr} onChange={setNotifIlr} label="ILR reminder" description="Email 90 days before your ILR eligibility date." locked={!isPro} />
              <Toggle checked={notifMonthly} onChange={setNotifMonthly} label="Monthly status summary" description="A monthly email with your rolling-window count and status." locked={!isPro} />
            </Card>
            {!isPro ? (
              <div className="flex items-start gap-3 px-4 py-3 mt-4 bg-[var(--color-green-pale)] rounded-xl">
                <span className="text-lg shrink-0">🔒</span>
                <p className="text-sm text-[var(--color-text-muted)]">Email alerts are a Pro feature. <a href="#subscription" className="text-[var(--color-green-light)] underline font-medium">See plans</a> to enable them.</p>
              </div>
            ) : (
              <div className="mt-4"><SaveButton saving={notifSaving} onClick={handleSaveNotifications} />{notifStatus && <StatusMessage type={notifStatus.type} message={notifStatus.msg} />}</div>
            )}
          </section>

          {/* APPEARANCE */}
          <section id="appearance" className="scroll-mt-6">
            <SectionHeading>Appearance</SectionHeading>
            <Card>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ] as const).map((opt) => {
                  const selected = resolvedTheme === opt.value
                  return (
                    <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                      className="relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-colors cursor-pointer"
                      style={selected
                        ? { borderColor: 'var(--color-green)', background: 'var(--color-green-pale)' }
                        : { borderColor: 'var(--color-border)', background: 'var(--color-surface-warm)' }}
                      aria-pressed={selected}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: opt.value === 'dark' ? '#08090c' : opt.value === 'light' ? '#f4f0e8' : 'linear-gradient(135deg,#f4f0e8 50%,#08090c 50%)', border: '1px solid var(--color-border)' }}>
                        {opt.value === 'dark' ? <Moon className="w-4 h-4 text-white" weight="fill" /> : opt.value === 'light' ? <Sun className="w-4 h-4 text-[#1c1f25]" weight="fill" /> : null}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">{opt.label}</span>
                      {selected && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-[var(--color-green)]" weight="bold" />}
                    </button>
                  )
                })}
              </div>
            </Card>
          </section>

          {/* DATA & PRIVACY */}
          <section id="privacy" className="scroll-mt-6">
            <SectionHeading>Data &amp; privacy</SectionHeading>
            <div className="flex flex-col gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 bg-[var(--color-green-pale)] text-[var(--color-green)] text-[10px] font-semibold rounded-full">GDPR compliant</span>
                  <span className="inline-flex items-center px-2.5 py-1 bg-[var(--color-green-pale)] text-[var(--color-green)] text-[10px] font-semibold rounded-full">Data stored in the EU</span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">Download a copy of your profile, trips, and account information as JSON.</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={handleExportData} disabled={exporting}
                    className="px-4 py-2 bg-[var(--color-bg-tinted)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors border border-[var(--color-border)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="flex items-center gap-2">{exporting && <Spinner />}{exporting ? 'Exporting…' : 'Export my data'}</span>
                  </button>
                  <a href="/privacy-policy" className="text-sm text-[var(--color-green-light)] underline">Privacy policy</a>
                  <a href="/help" className="text-sm text-[var(--color-green-light)] underline">Help centre</a>
                </div>
              </Card>

              <Card danger>
                {!showDeleteConfirm ? (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-danger-text)]">Delete account</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Permanently delete your account and all data. This cannot be undone.</p>
                    </div>
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="shrink-0 px-4 py-2 text-[var(--color-danger-text)] text-sm font-semibold rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] hover:opacity-90 transition-opacity cursor-pointer">
                      Delete account
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-danger-text)] mb-2">Confirm account deletion</p>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">This will permanently delete your profile, all trips, and your account. This action cannot be undone.</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Type <strong>delete my account</strong> to confirm:</p>
                    <TextInput value={deleteConfirmText} onChange={setDeleteConfirmText} placeholder="delete my account" />
                    {deleteError && <StatusMessage type="error" message={deleteError} />}
                    <div className="flex gap-3 mt-3">
                      <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'delete my account' || deleting}
                        className="px-4 py-2 bg-[var(--color-danger-text)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                        <span className="flex items-center gap-2">{deleting && <Spinner />}{deleting ? 'Deleting…' : 'Delete my account'}</span>
                      </button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(null) }}
                        className="px-4 py-2 bg-[var(--color-bg-tinted)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors border border-[var(--color-border)] cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
