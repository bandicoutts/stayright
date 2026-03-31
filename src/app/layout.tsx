import type { Metadata } from 'next';
import { Manrope, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import CookieBanner from '@/components/marketing/CookieBanner';
import { SpeedInsights } from '@vercel/speed-insights/next';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
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

import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#006948" />
      </head>
      <body className="min-h-full">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-[#006948] focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#006948]"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>{children}</PostHogProvider>
          <CookieBanner />
          <ServiceWorkerRegistration />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
