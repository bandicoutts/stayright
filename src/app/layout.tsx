import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import CookieBanner from '@/components/marketing/CookieBanner';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StayRight',
  description: 'UK Visa Absence Tracker for ILR Compliance',
  // PWA — theme colour and apple touch icon
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'StayRight',
  },
  icons: {
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#006948" />
      </head>
      <body className="min-h-full">
        <PostHogProvider>{children}</PostHogProvider>
        <CookieBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
