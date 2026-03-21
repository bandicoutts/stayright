import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StayRight — UK Visa Absence Tracker for ILR Compliance',
  description:
    'Track your 180-day absence limit for Indefinite Leave to Remain. Plan trips safely with the what-if simulator. Built for Skilled Worker visa holders.',
  openGraph: {
    title: 'StayRight — UK Visa Absence Tracker for ILR Compliance',
    description:
      'Track your 180-day absence limit for Indefinite Leave to Remain.',
    type: 'website',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
