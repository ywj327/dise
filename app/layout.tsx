import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: '底色 — 发现你人生的重复模式',
  description: '每件放不下的事背后，都有一个模式。',
  openGraph: {
    title: '底色 — 发现你人生的重复模式',
    description: '每件放不下的事背后，都有一个模式。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-white text-neutral-900 antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
