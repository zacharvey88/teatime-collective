import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Lobster } from "next/font/google";
import CookieProvider from '@/components/CookieProvider'
import { SettingsProvider } from '@/lib/settingsContext'
import AppWrapper from '@/components/AppWrapper'

// Import debug utils in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/debugUtils')
}

const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: 'Teatime Collective - Delicious Vegan Cakes',
  description: 'Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013.',
  openGraph: {
    title: 'Teatime Collective',
    description: 'Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teatime Collective',
    description: 'Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013.',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${lobster.variable}`}>
      <head>
        <link rel="icon" href="https://framerusercontent.com/images/9BRXJQRTuoR7dflavQsmPR1Pfpw.png" />
      </head>
      <body className="antialiased">
        <SettingsProvider>
          <CookieProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </CookieProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}