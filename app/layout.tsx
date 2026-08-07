import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: '底色 — 找到你真实的自我坐标',
  description: '15道题，四个维度，帮你找到自己的底色。',
  openGraph: {
    title: '底色 — 找到你真实的自我坐标',
    description: '15道题，四个维度，帮你找到自己的底色。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  )
}
