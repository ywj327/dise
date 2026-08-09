'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function MePage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)

  function clearAll() {
    if (!confirmed) { setConfirmed(true); return }
    localStorage.removeItem('dise_profile')
    localStorage.removeItem('dise_firstReveal')
    localStorage.removeItem('dise_onboarded')
    router.push('/')
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-24">
      <motion.p
        className="text-[10px] text-neutral-400 tracking-widest mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        我的
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

        <div className="mb-12">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">关于底色</p>
          <p className="text-xs text-neutral-500 leading-loose">
            底色帮你看见一直在你身上运作的模式。<br />
            不做诊断，不给建议，只是陪你把自己看清楚一点。
          </p>
        </div>

        <div className="h-px bg-neutral-100 mb-12" />

        <div className="mb-12">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">数据</p>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6">
            所有数据存储在你的设备本地。<br />
            底色不会上传你的任何内容。
          </p>
          <button
            onClick={clearAll}
            className={`text-xs border px-4 py-3 transition-colors ${
              confirmed
                ? 'border-red-300 text-red-500 hover:bg-red-50'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-600 hover:text-neutral-800'
            }`}
          >
            {confirmed ? '再点一次确认清除全部数据' : '清除本地数据'}
          </button>
        </div>

        <div className="h-px bg-neutral-100 mb-12" />

        <div>
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">版本</p>
          <p className="text-xs text-neutral-400">底色 · 内测版</p>
        </div>

      </motion.div>
    </main>
  )
}
