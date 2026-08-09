'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today', label: '今天' },
  { href: '/topics', label: '探索' },
  { href: '/base', label: '底色' },
  { href: '/me', label: '我的' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 py-4 text-center text-xs tracking-widest transition-colors ${
                active ? 'text-neutral-900' : 'text-neutral-300 hover:text-neutral-600'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
