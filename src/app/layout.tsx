// diagnostics check
import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import CookieBanner from '@/components/marketing/CookieBanner';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Reskin fonts (DECISION-074): Bricolage Grotesque (headings) + Hanken Grotesk
// (body), exposed as the semantic CSS variables `--font-heading` / `--font-body`
// (renamed from the legacy `--font-manrope` / `--font-inter` slots in Phase 9).
const heading = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const body = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
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
      className={`${heading.variable} ${body.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
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
