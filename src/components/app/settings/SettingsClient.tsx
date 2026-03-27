'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProfileAction,
  updateNotificationsAction,
  updateEmailAction,
  updatePasswordAction,
  exportDataAction,
  deleteAccountAction,
} from '@/app/(app)/(main)/settings/actions'
import { track } from '@/lib/posthog'
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-manrope)] font-bold text-base text-[var(--color-text-primary)] mb-4">
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 mb-4">
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="block w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 disabled:bg-[var(--color-bg-tinted)] disabled:text-[var(--color-text-muted)]"
    />
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30 ${
          checked ? 'bg-[var(--color-green)]' : 'bg-[var(--color-text-faint)]'
        }`}
      >
        <span
          className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function SaveButton({
  saving,
  onClick,
  children = 'Save changes',
}: {
  saving: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: 'var(--gradient-green)' }}
    >
      {saving ? 'Saving…' : children}
    </button>
  )
}

function StatusMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <p
      className={`text-sm mt-2 ${
        type === 'success' ? 'text-[var(--color-green)]' : 'text-[var(--color-danger-text)]'
      }`}
    >
      {message}
    </p>
  )
}

function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case 'pro_monthly': return 'Pro — Monthly'
    case 'pro_annual': return 'Pro — Annual'
    case 'pro_lifetime': return 'Pro — Lifetime'
    default: return 'Free'
  }
}

function planPrice(plan: string | null | undefined): string {
  switch (plan) {
    case 'pro_monthly': return '£2.99/month'
    case 'pro_annual': return '£24.99/year'
    case 'pro_lifetime': return '£49.99 one-time'
    default: return '£0 — forever'
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SettingsClient({ profile, subscription, userEmail }: SettingsClientProps) {
  const router = useRouter()

  // ---- Visa profile state ----
  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [lastName, setLastName] = useState(profile.last_name ?? '')
  const [visaRoute, setVisaRoute] = useState(profile.visa_route)
  const [visaStart, setVisaStart] = useState(profile.visa_start_date ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ---- Notifications state ----
  const [notif120, setNotif120] = useState(profile.notifications_120_day)
  const [notif150, setNotif150] = useState(profile.notifications_150_day)
  const [notifReturn, setNotifReturn] = useState(profile.notifications_return_reminder)
  const [notifIlr, setNotifIlr] = useState(profile.notifications_ilr_reminder)
  const [notifMonthly, setNotifMonthly] = useState(profile.notifications_monthly)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifStatus, setNotifStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ---- Account: email ----
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ---- Account: password ----
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ---- Delete account ----
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ---- Subscription management ----
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  // ---- ILR target date (computed) ----
  const ilrDate = visaStart
    ? (() => {
        const d = new Date(visaStart + 'T00:00:00Z')
        d.setUTCFullYear(d.getUTCFullYear() + 5)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      })()
    : null

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleSaveProfile() {
    if (!firstName.trim()) {
      setProfileStatus({ type: 'error', msg: 'First name is required.' })
      return
    }
    if (!visaStart) {
      setProfileStatus({ type: 'error', msg: 'Visa start date is required.' })
      return
    }
    setProfileSaving(true)
    setProfileStatus(null)
    const result = await updateProfileAction({ first_name: firstName, last_name: lastName, visa_route: visaRoute, visa_start_date: visaStart })
    setProfileSaving(false)
    if ('error' in result) {
      setProfileStatus({ type: 'error', msg: result.error })
    } else {
      setProfileStatus({ type: 'success', msg: 'Profile saved.' })
      router.refresh()
    }
  }

  async function handleSaveNotifications() {
    setNotifSaving(true)
    setNotifStatus(null)
    const result = await updateNotificationsAction({
      notifications_120_day: notif120,
      notifications_150_day: notif150,
      notifications_return_reminder: notifReturn,
      notifications_ilr_reminder: notifIlr,
      notifications_monthly: notifMonthly,
    })
    setNotifSaving(false)
    if ('error' in result) {
      setNotifStatus({ type: 'error', msg: result.error })
    } else {
      setNotifStatus({ type: 'success', msg: 'Preferences saved.' })
    }
  }

  async function handleUpdateEmail() {
    if (!newEmail) return
    setEmailSaving(true)
    setEmailStatus(null)
    const result = await updateEmailAction(newEmail)
    setEmailSaving(false)
    if ('error' in result) {
      setEmailStatus({ type: 'error', msg: result.error })
    } else {
      setEmailStatus({ type: 'success', msg: 'Confirmation sent to your new address. Click the link to complete the change.' })
      setNewEmail('')
    }
  }

  async function handleUpdatePassword() {
    if (newPw !== confirmPw) {
      setPwStatus({ type: 'error', msg: 'New passwords do not match.' })
      return
    }
    if (newPw.length < 8) {
      setPwStatus({ type: 'error', msg: 'Password must be at least 8 characters.' })
      return
    }
    setPwSaving(true)
    setPwStatus(null)
    const result = await updatePasswordAction(currentPw, newPw)
    setPwSaving(false)
    if ('error' in result) {
      setPwStatus({ type: 'error', msg: result.error })
    } else {
      setPwStatus({ type: 'success', msg: 'Password updated.' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }
  }

  async function handleExportData() {
    const result = await exportDataAction()
    if ('error' in result) {
      alert(`Export failed: ${result.error}`)
      return
    }
    const blob = new Blob([result.json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `StayRight_Export_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'delete my account') return
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteAccountAction()
    if ('error' in result) {
      setDeleting(false)
      setDeleteError(result.error)
      return
    }
    track('account_deleted')
    // Redirect to login — account is gone
    router.push('/login')
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-manrope)] font-extrabold text-2xl text-[var(--color-text-primary)] mb-8">
        Settings
      </h1>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Visa Profile */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Visa Profile</SectionHeading>
      <Card>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>First name *</FieldLabel>
              <TextInput value={firstName} onChange={setFirstName} placeholder="First name" />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <TextInput value={lastName} onChange={setLastName} placeholder="Last name" />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Used in PDF exports</p>
            </div>
          </div>
          <div>
            <FieldLabel>Visa route</FieldLabel>
            <select
              value={visaRoute}
              onChange={(e) => setVisaRoute(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green)]/30"
            >
              <option value="Skilled Worker">Skilled Worker</option>
              <option value="Health and Care Worker">Health and Care Worker</option>
              <option value="Intra-company Transfer">Intra-company Transfer</option>
              <option value="Global Talent">Global Talent</option>
              <option value="Innovator Founder">Innovator Founder</option>
            </select>
          </div>
          <div>
            <FieldLabel>Visa start date</FieldLabel>
            <TextInput type="date" value={visaStart} onChange={setVisaStart} />
          </div>
          {ilrDate && (
            <div className="px-3 py-2 bg-[var(--color-bg-tinted)] rounded-xl text-sm text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text-primary)]">ILR target date:</span> {ilrDate}
              <span className="ml-2 text-xs">(5 years from visa start)</span>
            </div>
          )}
          <div>
            <SaveButton saving={profileSaving} onClick={handleSaveProfile} />
            {profileStatus && <StatusMessage type={profileStatus.type} message={profileStatus.msg} />}
          </div>
        </div>

        {/* ILR Mode toggle — disabled in v1 */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Citizenship Mode (450/90 rule)</p>
            <p className="text-xs text-[var(--color-text-faint)] mt-0.5">Coming soon</p>
          </div>
          <div className="relative group">
            <button
              disabled
              className="relative flex-shrink-0 w-10 h-6 rounded-full bg-[var(--color-text-faint)]/30 opacity-50 cursor-not-allowed"
              aria-label="Citizenship mode — coming soon"
            >
              <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow" />
            </button>
            <div className="absolute right-0 bottom-8 w-44 px-2 py-1 bg-[var(--color-surface-dark)] text-[var(--color-text-primary)] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 border border-[var(--color-border)] shadow-xl">
              Coming soon — citizenship mode is not available in v1.
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Notifications */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Notifications</SectionHeading>
      <Card>
        <Toggle
          checked={notif120}
          onChange={setNotif120}
          label="Warn at 120 days"
          description="Email when your rolling window reaches 120 absence days."
        />
        <Toggle
          checked={notif150}
          onChange={setNotif150}
          label="Warn at 150 days"
          description="Email when your rolling window reaches 150 absence days."
        />
        <Toggle
          checked={notifReturn}
          onChange={setNotifReturn}
          label="Log return reminder"
          description="Email reminder to log your return date after an open-ended trip."
        />
        <Toggle
          checked={notifIlr}
          onChange={setNotifIlr}
          label="ILR reminder"
          description="Email 90 days before your ILR eligibility date."
        />
        <Toggle
          checked={notifMonthly}
          onChange={setNotifMonthly}
          label="Monthly compliance summary"
          description="Monthly email with your rolling window count and compliance status."
        />
        <div className="pt-3">
          <SaveButton saving={notifSaving} onClick={handleSaveNotifications} />
          {notifStatus && <StatusMessage type={notifStatus.type} message={notifStatus.msg} />}
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Account */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Account</SectionHeading>
      <Card>
        {/* Email */}
        <div className="mb-5 pb-5 border-b border-[var(--color-border)]">
          <FieldLabel>Email address</FieldLabel>
          <p className="text-sm text-[var(--color-text-primary)] mb-2">{userEmail}</p>
          <TextInput
            type="email"
            value={newEmail}
            onChange={setNewEmail}
            placeholder="New email address"
          />
          <div className="mt-2">
            <SaveButton saving={emailSaving} onClick={handleUpdateEmail}>
              Update email
            </SaveButton>
            {emailStatus && <StatusMessage type={emailStatus.type} message={emailStatus.msg} />}
          </div>
        </div>

        {/* Password */}
        <div>
          <FieldLabel>Change password</FieldLabel>
          <div className="flex flex-col gap-2 mt-1">
            <TextInput
              type="password"
              value={currentPw}
              onChange={setCurrentPw}
              placeholder="Current password"
            />
            <TextInput
              type="password"
              value={newPw}
              onChange={setNewPw}
              placeholder="New password (min 8 characters)"
            />
            <TextInput
              type="password"
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Confirm new password"
            />
          </div>
          <div className="mt-2">
            <SaveButton saving={pwSaving} onClick={handleUpdatePassword}>
              Change password
            </SaveButton>
            {pwStatus && <StatusMessage type={pwStatus.type} message={pwStatus.msg} />}
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Subscription */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Subscription</SectionHeading>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{planLabel(subscription?.plan)}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{planPrice(subscription?.plan)}</p>
            {subscription?.current_period_end && subscription.plan !== 'pro_lifetime' && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Next payment:{' '}
                {new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
            {subscription?.plan === 'pro_lifetime' && (
              <p className="text-xs text-[var(--color-green-light)] mt-1 font-medium">Lifetime — no renewal</p>
            )}
          </div>
          {subscription?.plan && subscription.plan !== 'free' && subscription.plan !== 'pro_lifetime' && (
            <button
              onClick={async () => {
                setPortalLoading(true)
                setPortalError(null)
                try {
                  const res = await fetch('/api/stripe/portal', { method: 'POST' })
                  const data = await res.json()
                  if (!res.ok || !data.url) {
                    setPortalError(data.error ?? 'Could not open billing portal.')
                    return
                  }
                  window.location.href = data.url
                } catch {
                  setPortalError('Could not connect. Please try again.')
                } finally {
                  setPortalLoading(false)
                }
              }}
              disabled={portalLoading}
              className="px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--gradient-green)' }}
            >
              {portalLoading ? 'Opening…' : 'Manage subscription'}
            </button>
          )}
          {portalError && <p className="mt-2 text-xs text-[var(--color-danger-text)]">{portalError}</p>}
        </div>
        {(!subscription?.plan || subscription.plan === 'free') && (
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            Upgrade to Pro for unlimited trips, PDF exports, and email alerts.{' '}
            <a href="/trips" className="text-[var(--color-green-light)] underline font-medium">
              View Pro plans
            </a>
          </p>
        )}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Data & Privacy */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Data &amp; Privacy</SectionHeading>
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-green-pale)] text-[var(--color-green-light)] text-xs font-semibold rounded-full">
            GDPR compliant
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-green-pale)] text-[var(--color-green-light)] text-xs font-semibold rounded-full">
            Data stored in EU
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Download a copy of all your data — profile, trips, and account information — as a JSON file.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-[var(--color-bg-tinted)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors border border-[var(--color-border)]"
          >
            Export my data
          </button>
          <a
            href="/privacy-policy"
            className="text-sm text-[var(--color-green-light)] underline"
          >
            Privacy policy
          </a>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Help & Support */}
      {/* ------------------------------------------------------------------ */}
      <SectionHeading>Help &amp; Support</SectionHeading>
      <Card>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          For questions about your visa, absence calculations, or how to use StayRight, visit the help centre or email us directly.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:help@stayright.app"
            className="text-sm text-[var(--color-green-light)] font-medium underline"
          >
            help@stayright.app
          </a>
          <a
            href="/help"
            className="text-sm text-[var(--color-green-light)] font-medium underline"
          >
            Visit Help Centre
          </a>
        </div>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Delete account — danger zone */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-2 mb-8">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-[var(--color-danger-text)] underline"
          >
            Delete account
          </button>
        ) : (
          <div className="p-5 border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] rounded-2xl">
            <p className="text-sm font-semibold text-[var(--color-danger-text)] mb-2">Delete account</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              This will permanently delete your profile, all trips, and your account. This action cannot be undone.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Type <strong>delete my account</strong> to confirm:
            </p>
            <TextInput
              value={deleteConfirmText}
              onChange={setDeleteConfirmText}
              placeholder="delete my account"
            />
            {deleteError && <StatusMessage type="error" message={deleteError} />}
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'delete my account' || deleting}
                className="px-4 py-2 bg-[var(--color-danger-text)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete my account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                  setDeleteError(null)
                }}
                className="px-4 py-2 bg-[var(--color-bg-tinted)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-surface-warm)] transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
