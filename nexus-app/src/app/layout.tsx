import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/store'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Nexus — Academic OS',
  description: 'Your AI-powered academic command center. Manage courses, tasks, notes, and opportunities in one intelligent workspace.',
}

export const viewport: Viewport = {
  themeColor: '#F5F4F1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} antialiased h-full`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
