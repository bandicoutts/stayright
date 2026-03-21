// PDF document components for StayRight reports.
// This file is client-only — only ever imported dynamically inside event handlers.
// Do NOT import at module level in any Server Component.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import {
  calculateTripAbsenceDays,
  getCurrentRollingWindow,
  isCrownDependency,
} from '@/lib/calculations/absenceEngine'
import type { TripInput } from '@/lib/calculations/absenceEngine'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ReportProfile {
  fullName: string | null
  visaRoute: string
  visaStartDate: string | null
}

export interface ReportTrip {
  id: string
  destination: string
  departure_date: string
  return_date: string | null
  notes: string | null
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const PRIMARY = '#006948'
const GREY = '#3D4A42'
const LIGHT_GREY = '#F3F4F5'
const TEXT = '#191C1D'
const DANGER = '#BA1A1A'
const AMBER = '#D97706'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  // Header
  headerBar: {
    backgroundColor: PRIMARY,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 8,
    color: '#CCEDE3',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  metaGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: GREY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: TEXT,
  },
  // Section heading
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: PRIMARY,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAE8',
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GREY,
  },
  tableCell: {
    fontSize: 8,
    color: TEXT,
  },
  tableCellGrey: {
    fontSize: 8,
    color: GREY,
  },
  // Summary row
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#E8F5F0',
    borderRadius: 2,
    marginTop: 4,
  },
  summaryLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: PRIMARY,
  },
  summaryValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: TEXT,
  },
  // Empty state
  emptyNote: {
    fontSize: 8,
    color: GREY,
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8EAE8',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#9BA8A2',
  },
  // Risk chip colours (text only in PDF)
  riskSafe: { color: PRIMARY },
  riskWarning: { color: AMBER },
  riskDanger: { color: DANGER },
  riskBreach: { color: '#8E0009' },
  disclaimer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF8E7',
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: AMBER,
  },
  disclaimerText: {
    fontSize: 7,
    color: '#6B5000',
  },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

function formatIlrDate(iso: string): string {
  // Returns e.g. "14 Jan 2028"
  return formatDate(iso)
}

function addYears(iso: string, years: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCFullYear(d.getUTCFullYear() + years)
  return d.toISOString().split('T')[0]
}

function getRiskStyle(status: string) {
  switch (status) {
    case 'WARNING': return s.riskWarning
    case 'DANGER': return s.riskDanger
    case 'BREACH': return s.riskBreach
    default: return s.riskSafe
  }
}

function generateFooter(reportType: string, generatedOn: string) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>StayRight — {reportType}</Text>
      <Text style={s.footerText}>Generated {generatedOn} · For immigration advice, consult a registered adviser</Text>
    </View>
  )
}

function PageHeader({ title, profile, generatedOn }: {
  title: string
  profile: ReportProfile
  generatedOn: string
}) {
  const ilrDate = profile.visaStartDate ? formatIlrDate(addYears(profile.visaStartDate, 5)) : 'N/A'
  const visaStart = profile.visaStartDate ? formatDate(profile.visaStartDate) : 'N/A'

  return (
    <>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>StayRight — {title}</Text>
        <Text style={s.headerSub}>UK Skilled Worker Visa · 180-Day Absence Rule</Text>
      </View>
      <View style={s.metaRow}>
        <View style={s.metaGroup}>
          <Text style={s.metaLabel}>Name</Text>
          <Text style={s.metaValue}>{profile.fullName ?? 'Not set'}</Text>
        </View>
        <View style={s.metaGroup}>
          <Text style={s.metaLabel}>Visa Route</Text>
          <Text style={s.metaValue}>{profile.visaRoute}</Text>
        </View>
        <View style={s.metaGroup}>
          <Text style={s.metaLabel}>Visa Start Date</Text>
          <Text style={s.metaValue}>{visaStart}</Text>
        </View>
        <View style={s.metaGroup}>
          <Text style={s.metaLabel}>ILR Target Date</Text>
          <Text style={s.metaValue}>{ilrDate}</Text>
        </View>
        <View style={s.metaGroup}>
          <Text style={s.metaLabel}>Generated</Text>
          <Text style={s.metaValue}>{generatedOn}</Text>
        </View>
      </View>
    </>
  )
}

// ---------------------------------------------------------------------------
// ILR Absence Table document
// ---------------------------------------------------------------------------

interface ILRAbsenceTableProps {
  trips: ReportTrip[]
  profile: ReportProfile
  generatedOn: string
}

export function ILRAbsenceTableDocument({ trips, profile, generatedOn }: ILRAbsenceTableProps) {
  // Sort chronologically (oldest first — SET(O) form convention)
  // Only include completed trips (return_date is not null)
  const sorted = [...trips]
    .filter((t): t is ReportTrip & { return_date: string } => t.return_date !== null)
    .sort((a, b) => a.departure_date.localeCompare(b.departure_date))

  const totalDays = sorted.reduce((sum, t) => {
    return sum + calculateTripAbsenceDays({
      destination: t.destination,
      departure_date: t.departure_date,
      return_date: t.return_date,
    })
  }, 0)

  // Column widths (out of 515pt available)
  const colW = { dep: 70, ret: 70, dest: 130, days: 45, reason: 200 }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PageHeader title="ILR Absence Table" profile={profile} generatedOn={generatedOn} />

        <Text style={s.sectionHeading}>Absence Record — Full Qualifying Period</Text>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: colW.dep }]}>Departure</Text>
          <Text style={[s.tableHeaderCell, { width: colW.ret }]}>Return</Text>
          <Text style={[s.tableHeaderCell, { width: colW.dest }]}>Destination</Text>
          <Text style={[s.tableHeaderCell, { width: colW.days }]}>Days</Text>
          <Text style={[s.tableHeaderCell, { width: colW.reason }]}>Reason for Travel</Text>
        </View>

        {sorted.length === 0 ? (
          <Text style={s.emptyNote}>No absences recorded during this period.</Text>
        ) : (
          sorted.map((trip, i) => {
            const days = calculateTripAbsenceDays({
              destination: trip.destination,
              departure_date: trip.departure_date,
              return_date: trip.return_date,
            })
            const isCD = isCrownDependency(trip.destination)
            return (
              <View key={trip.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tableCell, { width: colW.dep }]}>{formatDate(trip.departure_date)}</Text>
                <Text style={[s.tableCell, { width: colW.ret }]}>{formatDate(trip.return_date)}</Text>
                <Text style={[s.tableCell, { width: colW.dest }]}>{trip.destination}{isCD ? ' (Crown Dep.)' : ''}</Text>
                <Text style={[s.tableCellGrey, { width: colW.days }]}>{days}</Text>
                <Text style={[s.tableCellGrey, { width: colW.reason }]}>{trip.notes ?? '—'}</Text>
              </View>
            )
          })
        )}

        {/* Summary row */}
        {sorted.length > 0 && (
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, { width: colW.dep + colW.ret + colW.dest }]}>Total absence days</Text>
            <Text style={[s.summaryValue, { width: colW.days }]}>{totalDays}</Text>
            <Text style={[s.summaryLabel, { width: colW.reason }]}></Text>
          </View>
        )}

        {/* Crown Dependency / BOT disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Time in Crown Dependencies (Jersey, Guernsey, Isle of Man) does not count as absence from the UK and is recorded as 0 days.
            Time in British Overseas Territories (Gibraltar, Bermuda, etc.) counts as absence.
            This report is for reference only — always verify dates with your travel documents before submitting an ILR application.
            If in doubt, consult a registered immigration adviser.
          </Text>
        </View>

        {generateFooter('ILR Absence Table', generatedOn)}
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Rolling Window History document
// ---------------------------------------------------------------------------

interface RollingWindowHistoryProps {
  trips: ReportTrip[]
  profile: ReportProfile
  generatedOn: string
}

export function RollingWindowHistoryDocument({ trips, profile, generatedOn }: RollingWindowHistoryProps) {
  if (!profile.visaStartDate) {
    return (
      <Document>
        <Page size="A4" style={s.page}>
          <PageHeader title="Rolling Window History" profile={profile} generatedOn={generatedOn} />
          <Text style={s.emptyNote}>Visa start date not set. Please update your profile in Settings.</Text>
          {generateFooter('Rolling Window History', generatedOn)}
        </Page>
      </Document>
    )
  }

  const tripInputs: TripInput[] = trips.map((t) => ({
    id: t.id,
    destination: t.destination,
    departure_date: t.departure_date,
    return_date: t.return_date,
  }))

  // Build monthly snapshots: 1st of each month from visa start to today
  const visaStart = new Date(profile.visaStartDate + 'T00:00:00Z')
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const months: Array<{
    label: string
    days: number
    status: string
    windowStart: string
    windowEnd: string
  }> = []

  const dateToIso = (d: Date) => d.toISOString().split('T')[0]

  const cursor = new Date(Date.UTC(visaStart.getUTCFullYear(), visaStart.getUTCMonth(), 1))
  while (cursor <= today) {
    const snap = new Date(cursor)
    const result = getCurrentRollingWindow(tripInputs, snap, profile.visaStartDate)
    months.push({
      label: `${monthNames[snap.getUTCMonth()]} ${snap.getUTCFullYear()}`,
      days: result.days,
      status: result.status,
      windowStart: dateToIso(result.windowStart),
      windowEnd: dateToIso(result.windowEnd),
    })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  const colW = { month: 70, wStart: 80, wEnd: 80, days: 55, bar: 80, status: 80 }

  const riskLabel = (status: string) => {
    switch (status) {
      case 'WARNING': return 'Warning'
      case 'DANGER': return 'Danger'
      case 'BREACH': return 'Breach'
      default: return 'Safe'
    }
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PageHeader title="Rolling Window History" profile={profile} generatedOn={generatedOn} />

        <Text style={s.sectionHeading}>Month-by-Month Rolling Window Breakdown</Text>

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: colW.month }]}>Month</Text>
          <Text style={[s.tableHeaderCell, { width: colW.wStart }]}>Window Start</Text>
          <Text style={[s.tableHeaderCell, { width: colW.wEnd }]}>Window End</Text>
          <Text style={[s.tableHeaderCell, { width: colW.days }]}>Days Absent</Text>
          <Text style={[s.tableHeaderCell, { width: colW.bar }]}>Out of 180</Text>
          <Text style={[s.tableHeaderCell, { width: colW.status }]}>Status</Text>
        </View>

        {months.length === 0 ? (
          <Text style={s.emptyNote}>No data to display.</Text>
        ) : (
          months.map((row, i) => {
            const pct = Math.min((row.days / 180) * 100, 100)
            const riskStyle = getRiskStyle(row.status)
            return (
              <View key={row.label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tableCell, { width: colW.month }]}>{row.label}</Text>
                <Text style={[s.tableCellGrey, { width: colW.wStart }]}>{formatDate(row.windowStart)}</Text>
                <Text style={[s.tableCellGrey, { width: colW.wEnd }]}>{formatDate(row.windowEnd)}</Text>
                <Text style={[s.tableCell, { width: colW.days }]}>{row.days}</Text>
                <Text style={[s.tableCellGrey, { width: colW.bar }]}>{pct.toFixed(0)}%</Text>
                <Text style={[s.tableCell, riskStyle, { width: colW.status }]}>{riskLabel(row.status)}</Text>
              </View>
            )
          })
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Each row shows the rolling 12-month window count as at the 1st of that month.
            Status thresholds: Safe ≤120 days · Warning 121–150 · Danger 151–170 · Breach &gt;180.
            Consult a registered immigration adviser before relying on this report for an ILR application.
          </Text>
        </View>

        {generateFooter('Rolling Window History', generatedOn)}
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Custom Date Range document
// ---------------------------------------------------------------------------

interface CustomDateRangeProps {
  trips: ReportTrip[]
  profile: ReportProfile
  generatedOn: string
  startDate: string
  endDate: string
}

export function CustomDateRangeDocument({ trips, profile, generatedOn, startDate, endDate }: CustomDateRangeProps) {
  // Filter trips that overlap with the date range
  const filtered = trips
    .filter((t): t is ReportTrip & { return_date: string } => {
      if (!t.return_date) return false
      return t.departure_date <= endDate && t.return_date >= startDate
    })
    .sort((a, b) => a.departure_date.localeCompare(b.departure_date))

  const totalDays = filtered.reduce((sum, t) => {
    return sum + calculateTripAbsenceDays({
      destination: t.destination,
      departure_date: t.departure_date,
      return_date: t.return_date,
    })
  }, 0)

  const colW = { dep: 70, ret: 70, dest: 130, days: 45, reason: 200 }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PageHeader title="Custom Date Range Report" profile={profile} generatedOn={generatedOn} />

        <View style={{ marginBottom: 12 }}>
          <Text style={[s.metaLabel, { marginBottom: 2 }]}>Date Range</Text>
          <Text style={s.metaValue}>{formatDate(startDate)} — {formatDate(endDate)}</Text>
        </View>

        <Text style={s.sectionHeading}>Absence Record — Custom Period</Text>

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: colW.dep }]}>Departure</Text>
          <Text style={[s.tableHeaderCell, { width: colW.ret }]}>Return</Text>
          <Text style={[s.tableHeaderCell, { width: colW.dest }]}>Destination</Text>
          <Text style={[s.tableHeaderCell, { width: colW.days }]}>Days</Text>
          <Text style={[s.tableHeaderCell, { width: colW.reason }]}>Reason for Travel</Text>
        </View>

        {filtered.length === 0 ? (
          <Text style={s.emptyNote}>No absences recorded during this period.</Text>
        ) : (
          filtered.map((trip, i) => {
            const days = calculateTripAbsenceDays({
              destination: trip.destination,
              departure_date: trip.departure_date,
              return_date: trip.return_date,
            })
            const isCD = isCrownDependency(trip.destination)
            return (
              <View key={trip.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tableCell, { width: colW.dep }]}>{formatDate(trip.departure_date)}</Text>
                <Text style={[s.tableCell, { width: colW.ret }]}>{formatDate(trip.return_date)}</Text>
                <Text style={[s.tableCell, { width: colW.dest }]}>{trip.destination}{isCD ? ' (Crown Dep.)' : ''}</Text>
                <Text style={[s.tableCellGrey, { width: colW.days }]}>{days}</Text>
                <Text style={[s.tableCellGrey, { width: colW.reason }]}>{trip.notes ?? '—'}</Text>
              </View>
            )
          })
        )}

        {filtered.length > 0 && (
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, { width: colW.dep + colW.ret + colW.dest }]}>Total absence days</Text>
            <Text style={[s.summaryValue, { width: colW.days }]}>{totalDays}</Text>
            <Text style={[s.summaryLabel, { width: colW.reason }]}></Text>
          </View>
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            This report covers trips that overlap with the selected date range.
            Crown Dependencies (Jersey, Guernsey, Isle of Man) are recorded as 0 days absence.
            British Overseas Territories (Gibraltar, Bermuda, etc.) count as absence.
            This report is for reference only — consult a registered immigration adviser before submitting an ILR application.
          </Text>
        </View>

        {generateFooter('Custom Date Range', generatedOn)}
      </Page>
    </Document>
  )
}
