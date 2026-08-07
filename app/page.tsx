'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
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
            你很清楚<br />别人希望你成为什么样的人。
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            但你还记得，自己原本是什么样子吗？
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
            <p className="text-xs text-neutral-400 mb-3">不知道从哪里开始？</p>
            <Link
              href="/assessment"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              花 5 分钟，先看看你的第一层底色 →
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  )
}
