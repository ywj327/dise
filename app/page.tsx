'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [event, setEvent] = useState('')

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEvent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  function startExplore() {
    if (!event.trim()) return
    router.push(`/explore?event=${encodeURIComponent(event.trim())}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="max-w-lg w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="text-xs text-neutral-400 mb-16">底色</p>

        <h1 className="text-[28px] leading-tight font-light text-neutral-900 mb-4">
          每件放不下的事<br />背后都有一个模式
        </h1>

        <p className="text-sm text-neutral-500 leading-relaxed mb-10">
          说一件最近放不下的事<br />
          我们来看看，是什么在运作
        </p>

        <div className="mb-4">
          <textarea
            value={event}
            onChange={handleInput}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                startExplore()
              }
            }}
            placeholder="比如：和一个朋友的摩擦，一个一直拖着的决定，某段关系里说不清楚的感觉……"
            rows={3}
            className="w-full text-sm text-neutral-800 placeholder-neutral-300 border border-neutral-200 rounded-2xl px-4 py-3.5 outline-none focus:border-neutral-400 transition-colors resize-none leading-relaxed bg-white"
          />
        </div>

        <button
          onClick={startExplore}
          disabled={!event.trim()}
          className="w-full border border-neutral-900 text-neutral-900 text-sm tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed mb-12"
        >
          开始探索
        </button>

        <p className="text-xs text-neutral-300">
          或者，先{' '}
          <Link
            href="/assessment"
            className="text-neutral-400 hover:text-neutral-700 underline underline-offset-2 transition-colors"
          >
            了解你的底色类型
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
