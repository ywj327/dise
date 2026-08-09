'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [phase, setPhase] = useState<'unknown' | 'landing'>('unknown')

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      if (p.assessmentCompleted) {
        router.replace('/today')
        return
      }
    } catch { }
    setPhase('landing')
  }, [])

  // Pure white while checking — prevents any flash
  if (phase === 'unknown') return <div className="h-screen bg-white" />

  return (
    <main className="min-h-screen flex flex-col px-6 pt-16 pb-28">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <motion.p
          className="text-[10px] text-neutral-400 tracking-widest mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          底色
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-16"
        >
          <h1 className="text-2xl font-light text-neutral-900 leading-snug mb-6">
            在认识你之前，<br />先看看你习惯怎样<br />面对这个世界。
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            15 道题。<br />不是性格测试，<br />是一次安静的观察。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 hover:bg-neutral-700 transition-colors duration-300 mb-8"
          >
            开始底色测试
          </button>
          <p className="text-xs text-neutral-300 leading-relaxed">
            大约 5 分钟。<br />没有对错，只有你真实的反应。
          </p>
        </motion.div>
      </div>
    </main>
  )
}
