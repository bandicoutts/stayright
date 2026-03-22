/**
 * StayRight email templates
 *
 * Each function returns { subject, html, text }.
 * HTML uses inline styles + table layout for maximum email-client compatibility.
 * A plain-text fallback is always included alongside the HTML version.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stayright.vercel.app'

const PRIMARY = '#006948'
const BG = '#F8F9FA'
const TEXT_PRIMARY = '#191C1D'
const TEXT_SECONDARY = '#3D4A42'

const RISK_COLOURS: Record<string, { bg: string; text: string }> = {
  SAFE:    { bg: '#E6F4F0', text: '#006948' },
  WARNING: { bg: '#FDF3E7', text: '#D97706' },
  DANGER:  { bg: '#FBE9E9', text: '#BA1A1A' },
  BREACH:  { bg: '#F5E6E8', text: '#8E0009' },
}

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

function emailShell(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StayRight</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          ${bodyContent}
          <!-- Footer -->
          <tr>
            <td style="background:#F3F4F5;padding:24px 32px;border-top:1px solid #E5E7EB;">
              <p style="margin:0 0 8px;font-size:12px;color:${TEXT_SECONDARY};text-align:center;">
                <a href="${APP_URL}/settings" style="color:${PRIMARY};text-decoration:underline;">Manage preferences</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/settings" style="color:${PRIMARY};text-decoration:underline;">Unsubscribe</a>
              </p>
              <p style="margin:0;font-size:11px;color:#6B7280;text-align:center;">
                Not legal advice. Always verify with UKVI.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function headerRow(headline: string, subheadline: string): string {
  return `<tr>
    <td style="background:${PRIMARY};padding:32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">StayRight</p>
      <h1 style="margin:16px 0 8px;font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.2;">${headline}</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);">${subheadline}</p>
    </td>
  </tr>`
}

function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="background:${PRIMARY};border-radius:8px;text-align:center;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

export function welcomeEmail(params: { name: string | null }): {
  subject: string
  html: string
  text: string
} {
  const name = params.name ?? 'there'

  const html = emailShell(`
    ${headerRow('Welcome to StayRight', "Let's get you set up.")}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Thanks for joining StayRight — your UK visa absence tracker. We'll help you stay within your 180-day ILR absence limit so there are no surprises when you apply for Indefinite Leave to Remain.
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Your first step is to complete your profile: add your visa start date and import any past trips. This gives you an accurate picture of where you stand today.
        </p>
        <p style="margin:0 0 32px;text-align:center;">
          ${ctaButton('Set up your profile →', `${APP_URL}/onboarding`)}
        </p>
        <p style="margin:0;font-size:13px;color:#6B7280;text-align:center;">
          Questions? Email us at <a href="mailto:help@stayright.app" style="color:${PRIMARY};">help@stayright.app</a>
        </p>
      </td>
    </tr>`)

  const text = `Welcome to StayRight, ${name}!

Thanks for joining. Your first step is to complete your profile: add your visa start date and import any past trips.

Set up your profile: ${APP_URL}/onboarding

Questions? help@stayright.app

Not legal advice. Always verify with UKVI.`

  return {
    subject: 'Welcome to StayRight — let\'s set up your profile',
    html,
    text,
  }
}

// ---------------------------------------------------------------------------
// Threshold: 120 days
// ---------------------------------------------------------------------------

export function threshold120Email(params: {
  name: string | null
  daysUsed: number
}): { subject: string; html: string; text: string } {
  const name = params.name ?? 'there'
  const remaining = 180 - params.daysUsed
  const riskColour = RISK_COLOURS.WARNING

  const html = emailShell(`
    ${headerRow("Heads up — you've used 120 absence days", 'Your rolling 12-month window is filling up.')}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Your rolling 12-month absence count has reached <strong>${params.daysUsed} of 180 days</strong>. You have <strong>${remaining} days remaining</strong> before you'd breach the ILR absence limit.
        </p>
        <div style="background:${riskColour.bg};border-radius:8px;padding:20px;margin:0 0 24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:36px;font-weight:700;color:${riskColour.text};">${params.daysUsed} / 180</p>
          <span style="display:inline-block;background:${riskColour.text};color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:9999px;">WARNING</span>
          <p style="margin:8px 0 0;font-size:13px;color:${TEXT_SECONDARY};">${remaining} days remaining in your rolling window</p>
        </div>
        <p style="margin:0 0 24px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Use the what-if simulator to check how any planned trips will affect your count before you book.
        </p>
        <p style="margin:0 0 0;text-align:center;">
          ${ctaButton('Check your dashboard →', `${APP_URL}/dashboard`)}
        </p>
      </td>
    </tr>`)

  const text = `Hi ${name},

Your rolling 12-month absence count has reached ${params.daysUsed} of 180 days. You have ${remaining} days remaining.

Check your dashboard: ${APP_URL}/dashboard

Not legal advice. Always verify with UKVI.`

  return {
    subject: `Heads up — you've used 120 of 180 absence days`,
    html,
    text,
  }
}

// ---------------------------------------------------------------------------
// Threshold: 150 days
// ---------------------------------------------------------------------------

export function threshold150Email(params: {
  name: string | null
  daysUsed: number
}): { subject: string; html: string; text: string } {
  const name = params.name ?? 'there'
  const remaining = 180 - params.daysUsed
  const riskColour = RISK_COLOURS.DANGER

  const html = emailShell(`
    ${headerRow('⚠️ Warning — 150 absence days used', 'You are approaching your ILR absence limit.')}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          <strong>Important:</strong> Your rolling 12-month absence count has reached <strong>${params.daysUsed} of 180 days</strong>. You have only <strong>${remaining} days</strong> left before a breach.
        </p>
        <div style="background:${riskColour.bg};border-radius:8px;padding:20px;margin:0 0 24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:36px;font-weight:700;color:${riskColour.text};">${params.daysUsed} / 180</p>
          <span style="display:inline-block;background:${riskColour.text};color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:9999px;">DANGER</span>
          <p style="margin:8px 0 0;font-size:13px;color:${TEXT_SECONDARY};">Only ${remaining} days remaining</p>
        </div>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Breaching the 180-day limit can put your ILR application at risk. We strongly recommend using the what-if simulator before booking any further travel.
        </p>
        <p style="margin:0 0 0;text-align:center;">
          ${ctaButton('View your dashboard →', `${APP_URL}/dashboard`)}
        </p>
      </td>
    </tr>`)

  const text = `Hi ${name},

WARNING: Your rolling 12-month absence count has reached ${params.daysUsed} of 180 days. Only ${remaining} days remaining.

Breaching the 180-day limit can put your ILR application at risk. Check before booking any further travel.

View your dashboard: ${APP_URL}/dashboard

Not legal advice. Always verify with UKVI.`

  return {
    subject: `⚠️ Warning — ${params.daysUsed} of 180 absence days used`,
    html,
    text,
  }
}

// ---------------------------------------------------------------------------
// ILR reminder (90 days before eligibility)
// ---------------------------------------------------------------------------

export function ilrReminderEmail(params: {
  name: string | null
  ilrDate: string     // YYYY-MM-DD
  daysUsed: number
}): { subject: string; html: string; text: string } {
  const name = params.name ?? 'there'
  const formatted = new Date(params.ilrDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = emailShell(`
    ${headerRow('Your ILR window opens in 90 days', `Target date: ${formatted}`)}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Your ILR eligibility date is <strong>${formatted}</strong> — 90 days from today. Now is a good time to review your absence record and make sure everything is in order before you apply.
        </p>
        <div style="background:#E6F4F0;border-radius:8px;padding:20px;margin:0 0 24px;">
          <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:${PRIMARY};">Where you stand today</p>
          <p style="margin:0;font-size:14px;color:${TEXT_SECONDARY};">Absence days used (current window): <strong>${params.daysUsed} / 180</strong></p>
        </div>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Review all your trips, generate an ILR Absence Table report, and consult an immigration adviser if you have any concerns.
        </p>
        <p style="margin:0 0 0;text-align:center;">
          ${ctaButton('Review your record →', `${APP_URL}/reports`)}
        </p>
      </td>
    </tr>`)

  const text = `Hi ${name},

Your ILR eligibility date is ${formatted} — 90 days from today.

Absence days used (current window): ${params.daysUsed} / 180

Review your record and generate a report: ${APP_URL}/reports

Not legal advice. Always verify with UKVI.`

  return {
    subject: 'Your ILR application window opens in 90 days',
    html,
    text,
  }
}

// ---------------------------------------------------------------------------
// Return reminder (no return logged for trip)
// ---------------------------------------------------------------------------

export function returnReminderEmail(params: {
  name: string | null
  destination: string
  departureDate: string  // YYYY-MM-DD
}): { subject: string; html: string; text: string } {
  const name = params.name ?? 'there'
  const formattedDep = new Date(params.departureDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = emailShell(`
    ${headerRow("Welcome back — don't forget to log your return", `Trip to ${params.destination}`)}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>
        <p style="margin:0 0 16px;font-size:15px;color:${TEXT_SECONDARY};line-height:1.6;">
          Your trip to <strong>${params.destination}</strong> (departed ${formattedDep}) is still showing as ongoing in your tracker. If you've returned, log your return date so your absence record stays accurate.
        </p>
        <p style="margin:0 0 0;text-align:center;">
          ${ctaButton('Log your return →', `${APP_URL}/trips`)}
        </p>
      </td>
    </tr>`)

  const text = `Hi ${name},

Your trip to ${params.destination} (departed ${formattedDep}) is still showing as ongoing. If you've returned, please log your return date.

Log your return: ${APP_URL}/trips

Not legal advice. Always verify with UKVI.`

  return {
    subject: `Welcome back — don't forget to log your return from ${params.destination}`,
    html,
    text,
  }
}

// ---------------------------------------------------------------------------
// Monthly summary
// ---------------------------------------------------------------------------

export interface MonthlySummaryParams {
  name: string | null
  month: string          // e.g. "March 2026"
  daysUsed: number
  riskStatus: 'SAFE' | 'WARNING' | 'DANGER' | 'BREACH'
  tripsThisMonth: number
  percentComplete: number
  recentTrips: Array<{ destination: string; dates: string; days: number }>
  nextTrip: { destination: string; departureDate: string; daysImpact: number } | null
}

export function monthlySummaryEmail(params: MonthlySummaryParams): {
  subject: string
  html: string
  text: string
} {
  const name = params.name ?? 'there'
  const remaining = 180 - params.daysUsed
  const riskColour = RISK_COLOURS[params.riskStatus] ?? RISK_COLOURS.SAFE
  const barWidth = Math.min(Math.round((params.daysUsed / 180) * 100), 100)

  // Recent trips table (max 3)
  const tripRows = params.recentTrips.slice(0, 3).map(t =>
    `<tr>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT_PRIMARY};border-bottom:1px solid #E5E7EB;">${t.destination}</td>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT_SECONDARY};border-bottom:1px solid #E5E7EB;">${t.dates}</td>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT_SECONDARY};border-bottom:1px solid #E5E7EB;text-align:right;">${t.days}d</td>
    </tr>`
  ).join('')

  const recentTripsSection = params.recentTrips.length > 0 ? `
    <p style="margin:24px 0 12px;font-size:15px;font-weight:600;color:${TEXT_PRIMARY};">Recent trips</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;border-collapse:separate;border-spacing:0;">
      <thead>
        <tr style="background:#F3F4F5;">
          <th style="padding:10px 12px;font-size:12px;font-weight:600;color:${TEXT_SECONDARY};text-align:left;border-bottom:1px solid #E5E7EB;">Destination</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:600;color:${TEXT_SECONDARY};text-align:left;border-bottom:1px solid #E5E7EB;">Dates</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:600;color:${TEXT_SECONDARY};text-align:right;border-bottom:1px solid #E5E7EB;">Days</th>
        </tr>
      </thead>
      <tbody>
        ${tripRows}
      </tbody>
    </table>
    ${params.recentTrips.length > 3 ? `<p style="margin:8px 0 0;font-size:13px;color:${PRIMARY};"><a href="${APP_URL}/trips" style="color:${PRIMARY};">View all trips →</a></p>` : ''}` : ''

  const nextTripSection = params.nextTrip
    ? `<div style="background:#F3F4F5;border-radius:8px;padding:16px;margin:24px 0 0;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">Next logged trip</p>
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:${TEXT_PRIMARY};">${params.nextTrip.destination} · ${new Date(params.nextTrip.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <p style="margin:0;font-size:13px;color:${TEXT_SECONDARY};">This trip will use ${params.nextTrip.daysImpact} of your remaining ${remaining} days.</p>
      </div>`
    : `<div style="background:#F3F4F5;border-radius:8px;padding:16px;margin:24px 0 0;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:0.5px;">Next logged trip</p>
        <p style="margin:0 0 4px;font-size:14px;color:${TEXT_SECONDARY};">No upcoming trips logged.</p>
        <a href="${APP_URL}/trips/plan" style="font-size:13px;color:${PRIMARY};text-decoration:none;">Plan a trip →</a>
      </div>`

  const html = emailShell(`
    ${headerRow(`Your ${params.month} Absence Summary`, "Here's where you stand this month.")}
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 16px;font-size:16px;color:${TEXT_PRIMARY};">Hi ${name},</p>

        <!-- Status card -->
        <div style="background:${riskColour.bg};border-radius:8px;padding:24px;margin:0 0 20px;text-align:center;">
          <p style="margin:0 0 8px;font-size:48px;font-weight:700;color:${riskColour.text};line-height:1;">${params.daysUsed} / 180</p>
          <span style="display:inline-block;background:${riskColour.text};color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:9999px;margin-bottom:8px;">${params.riskStatus}</span>
          <p style="margin:0 0 12px;font-size:13px;color:${TEXT_SECONDARY};">In your current rolling 12-month window.</p>
          <!-- Progress bar -->
          <div style="background:#E5E7EB;border-radius:9999px;height:8px;overflow:hidden;">
            <div style="background:${riskColour.text};height:8px;width:${barWidth}%;border-radius:9999px;"></div>
          </div>
        </div>

        <!-- Key stats -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
          <tr>
            <td width="33%" style="padding:12px;background:#F3F4F5;border-radius:8px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${TEXT_PRIMARY};">${remaining}</p>
              <p style="margin:0;font-size:12px;color:${TEXT_SECONDARY};">Days remaining</p>
            </td>
            <td width="4%"></td>
            <td width="30%" style="padding:12px;background:#F3F4F5;border-radius:8px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${TEXT_PRIMARY};">${params.tripsThisMonth}</p>
              <p style="margin:0;font-size:12px;color:${TEXT_SECONDARY};">Trips this month</p>
            </td>
            <td width="4%"></td>
            <td width="29%" style="padding:12px;background:#F3F4F5;border-radius:8px;text-align:center;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${TEXT_PRIMARY};">${params.percentComplete}%</p>
              <p style="margin:0;font-size:12px;color:${TEXT_SECONDARY};">Qualifying period</p>
            </td>
          </tr>
        </table>

        ${recentTripsSection}
        ${nextTripSection}

        <p style="margin:28px 0 0;text-align:center;">
          ${ctaButton('View your full compliance dashboard →', `${APP_URL}/dashboard`)}
        </p>
      </td>
    </tr>`)

  const recentTripsTxt = params.recentTrips.length > 0
    ? `\nRecent trips:\n${params.recentTrips.slice(0, 3).map(t => `  ${t.destination} | ${t.dates} | ${t.days}d`).join('\n')}${params.recentTrips.length > 3 ? `\n  View all trips: ${APP_URL}/trips` : ''}`
    : ''

  const nextTripTxt = params.nextTrip
    ? `\nNext logged trip: ${params.nextTrip.destination} · ${params.nextTrip.departureDate} (uses ${params.nextTrip.daysImpact} of your ${remaining} remaining days)`
    : `\nNext logged trip: No upcoming trips logged. Plan one: ${APP_URL}/trips/plan`

  const text = `Your ${params.month} Absence Summary
Hi ${name},

${params.daysUsed} / 180 days used (${params.riskStatus})
${remaining} days remaining · ${params.tripsThisMonth} trips this month · ${params.percentComplete}% of qualifying period complete
${recentTripsTxt}${nextTripTxt}

View your dashboard: ${APP_URL}/dashboard

Not legal advice. Always verify with UKVI.`

  return {
    subject: `Your ${params.month} absence summary — ${params.daysUsed}/180 days used`,
    html,
    text,
  }
}
