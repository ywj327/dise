'use client'

import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'

// Routes that show the bottom nav
const NAV_PATHS = ['/today', '/topics', '/base', '/me']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = NAV_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  return (
    <>
      {children}
      {showNav && <BottomNav />}
    </>
  )
}
