'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="max-w-lg w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="text-xs text-neutral-400 mb-16">底色</p>

        <h1 className="text-[28px] leading-tight font-light text-neutral-900 mb-6">
          你用了多少年，活在一个<br />别人能接受的版本里？
        </h1>

        <p className="text-sm text-neutral-500 leading-relaxed mb-16">
          15道题，四个维度。<br />
          不测你是什么类型，<br />
          测你真实的底色。
        </p>

        <Link
          href="/assessment"
          className="inline-block border border-neutral-900 text-neutral-900 text-sm tracking-widest px-10 py-4 hover:bg-neutral-900 hover:text-white transition-colors duration-300"
        >
          开始
        </Link>
      </motion.div>

      <motion.p
        className="absolute bottom-8 text-xs text-neutral-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        约5分钟完成
      </motion.p>
    </main>
  )
}
