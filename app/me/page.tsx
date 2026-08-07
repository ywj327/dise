'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MePage() {
  const [rule, setRule] = useState('')
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    setOnboarded(localStorage.getItem('dise_onboarded') === 'true')
    try {
      const profile = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      if (Array.isArray(profile.hiddenRules) && profile.hiddenRules.length > 0) {
        setRule(profile.hiddenRules[0])
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">
      <p className="text-[10px] text-neutral-400 tracking-widest mb-16">我的</p>

      {onboarded && rule ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-neutral-400 mb-5">你的第一条线索</p>
          <p className="text-xl font-light text-neutral-900 leading-snug border-l-2 border-neutral-900 pl-4 mb-14">
            {rule}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="block w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors"
            >
              继续探索
            </Link>
            <Link
              href="/profile"
              className="block w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 text-center hover:border-neutral-700 hover:text-neutral-800 transition-colors"
            >
              查看我的底色地图
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-neutral-500 leading-relaxed mb-12">
            完成第一次显影后，<br />这里会显示你的初始底色。
          </p>
          {!onboarded && (
            <Link
              href="/onboarding"
              className="block w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors"
            >
              开始第一次显影
            </Link>
          )}
        </motion.div>
      )}
    </main>
  )
}
