import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Lobster } from "next/font/google";
import CookieProvider from '@/components/CookieProvider'

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
        <CookieProvider>
          {children}
        </CookieProvider>
      </body>
    </html>
  );
}