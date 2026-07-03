import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StayRight | UK Visa Absence Tracker for ILR Compliance',
  description:
    'Track your 180-day absence limit for Indefinite Leave to Remain. Check trips before you book. Built for Skilled Worker visa holders.',
  openGraph: {
    title: 'StayRight | UK Visa Absence Tracker for ILR Compliance',
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
