'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: '今天' },
  { href: '/topics', label: '探索' },
  { href: '/profile', label: '底色' },
  { href: '/me', label: '我的' },
]

const HIDE_ON = ['/explore', '/chat', '/onboarding']

export default function BottomNav() {
  const path = usePathname()
  if (HIDE_ON.some(p => path?.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100">
      <div className="max-w-lg mx-auto flex items-center">
        {NAV.map(item => {
          const active = item.href === '/' ? path === '/' : path?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3.5 transition-colors ${
                active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <span className="text-[11px] tracking-wide">{item.label}</span>
              {active && <span className="w-1 h-1 bg-neutral-900 rounded-full mt-1" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
