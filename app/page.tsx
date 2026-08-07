'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

function FirstVisitHome() {
  const router = useRouter()

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
          className="mb-14"
        >
          <h1 className="text-2xl font-light text-neutral-900 leading-snug mb-5">
            有些习惯，<br />你以为只是性格。
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            其实它们可能已经替你<br />做了很多年的决定。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors duration-300 mb-10"
          >
            看看我没意识到的自己
          </button>
          <p className="text-xs text-neutral-300 leading-relaxed">
            不用讲故事。<br />先从几个生活瞬间开始。
          </p>
        </motion.div>
      </div>
    </main>
  )
}

function ReturningHome() {
  const router = useRouter()
  const [event, setEvent] = useState('')

  function startExplore() {
    if (!event.trim()) return
    router.push(`/explore?event=${encodeURIComponent(event.trim())}`)
  }

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
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-14"
        >
          <h1 className="text-2xl font-light text-neutral-900 leading-snug mb-5">
            今天，<br />有什么放不下的？
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            每件放不下的事背后，都有一个模式。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex-1"
        >
          <p className="text-xs text-neutral-400 mb-3">最近，哪件事让你有点放不下？</p>

          <textarea
            value={event}
            onChange={e => setEvent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                startExplore()
              }
            }}
            placeholder="可以是一段关系、一份工作、一次争吵，或者一种说不上来的感觉……"
            rows={4}
            className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-0 border-b border-neutral-200 py-3 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed"
          />

          <button
            onClick={startExplore}
            disabled={!event.trim()}
            className="mt-6 w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            和底色聊聊
          </button>

          <div className="mt-14 pt-8 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 mb-5">或者，换一个开始方式——</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/assessment"
                className="flex items-center justify-between border border-neutral-200 px-4 py-3.5 hover:border-neutral-700 hover:text-neutral-900 transition-colors group"
              >
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">测测我的底色</span>
                <span className="text-[10px] text-neutral-400">5 分钟 · 底色原型 →</span>
              </Link>
              <Link
                href="/topics"
                className="flex items-center justify-between border border-neutral-200 px-4 py-3.5 hover:border-neutral-700 hover:text-neutral-900 transition-colors group"
              >
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">选一个最近的困惑</span>
                <span className="text-[10px] text-neutral-400">浏览专题 →</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    setOnboarded(localStorage.getItem('dise_onboarded') === 'true')
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col px-6 pt-16">
        <p className="text-[10px] text-neutral-400 tracking-widest">底色</p>
      </main>
    )
  }

  return onboarded ? <ReturningHome /> : <FirstVisitHome />
}
