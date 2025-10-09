import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    template: '%s | Delta API Suite',
    default: 'Delta'
  },
  description: 'Professional API testing and comparison tool with advanced semantic analysis, intelligent order-insensitive matching, and world-class diff visualization.',
  keywords: ['API testing', 'API comparison', 'JSON diff', 'API development', 'Cricbuzz', 'DeltaPro'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  authors: [{ name: 'Cricbuzz Team' }],
  creator: 'Cricbuzz',
  publisher: 'Cricbuzz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://delta-api-suite.cricbuzz.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://delta-api-suite.cricbuzz.com',
    siteName: 'Delta API Suite',
    title: 'Delta API Suite - Professional API Testing Tool',
    description: 'Professional API testing and comparison tool with advanced semantic analysis and intelligent matching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Delta API Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delta API Suite - Professional API Testing Tool',
    description: 'Professional API testing and comparison tool with advanced semantic analysis and intelligent matching.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
