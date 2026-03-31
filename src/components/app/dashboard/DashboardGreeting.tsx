'use client'

export function DashboardGreeting({ firstName }: { firstName: string }) {
  const h = new Date().getHours()
  const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return <>{`Good ${period}, ${firstName}`}</>
}
