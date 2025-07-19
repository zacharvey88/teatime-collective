import './globals.css'
import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-poppins'
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
})

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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="https://framerusercontent.com/images/9BRXJQRTuoR7dflavQsmPR1Pfpw.png" />
      </head>
      <body className="bg-cream font-poppins min-h-screen">{children}</body>
    </html>
  )
}