'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getCharacter } from '@/lib/scoring'
import { Result } from '@/types'
import { Suspense, useState, useEffect } from 'react'

function CharacterImage({ name, className }: { name: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={`/${name}.png`}
      alt={name}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

function ResultContent() {
  const params = useSearchParams()
  const [step, setStep] = useState(0)

  const result: Result = {
    q1: (params.get('q1') || '回避型') as Result['q1'],
    q2: (params.get('q2') || '意义驱动') as Result['q2'],
    q3: (params.get('q3') || '方向未定型') as Result['q3'],
    q4: (params.get('q4') || '影响力型') as Result['q4'],
  }

  const character = getCharacter(result.q1, result.q2)

  useEffect(() => {
    const delays = [300, 1200, 2400, 3800, 5600]
    const timers = delays.map((d, i) => setTimeout(() => setStep(s => Math.max(s, i + 1)), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  const exploreEvent = encodeURIComponent(`我想往里看看：${character.name}这个原型和我有什么关系？为什么我会习惯这样保护自己？`)

  return (
    <main className="min-h-screen px-6 py-16 bg-white">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <motion.p
          className="text-[10px] text-neutral-400 tracking-widest mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          底色
        </motion.p>

        {/* 底色原型标签 + 角色名 */}
        {step >= 1 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[10px] text-neutral-400 tracking-widest mb-4">你的底色原型</p>
            <div className="flex items-end gap-6 mb-6">
              <div className="w-28 h-28 flex-shrink-0">
                <CharacterImage name={character.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-5xl font-light text-neutral-900 tracking-tight mb-2">
                  {character.name}
                </h1>
                <p className="text-sm text-neutral-400 font-light">
                  「{character.tagline}」
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 核心洞察 — 传播句 */}
        {step >= 2 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-base font-light text-neutral-900 leading-loose">
              {character.insight}
            </p>
          </motion.div>
        )}

        {step >= 2 && <motion.div className="h-px bg-neutral-100 mb-10" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }} />}

        {/* 角色描述 */}
        {step >= 3 && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[10px] text-neutral-400 tracking-widest mb-4">关于你</p>
            <p className="text-sm text-neutral-600 leading-loose">
              {character.desc}
            </p>
          </motion.div>
        )}

        {step >= 3 && <div className="h-px bg-neutral-100 mb-10" />}

        {/* Tips — 值得留意 */}
        {step >= 3 && (
          <motion.div
            className="mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-[10px] text-neutral-400 tracking-widest mb-5">值得留意</p>
            <div className="flex flex-col gap-4">
              {character.tips.map((tip, i) => (
                <p key={i} className="text-sm text-neutral-600 leading-relaxed pl-3 border-l border-neutral-200">
                  {tip}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 3 && <div className="h-px bg-neutral-100 mb-12" />}

        {/* 往里看 CTA */}
        {step >= 4 && (
          <motion.div
            className="mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] text-neutral-400 tracking-widest mb-4">为什么我会成为这样的自己？</p>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              性格不会凭空出现。<br />
              有些习惯，可能比你以为的更早开始。
            </p>
            <Link
              href={`/explore?event=${exploreEvent}`}
              className="block w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors mb-3"
            >
              往里看看
            </Link>
            <Link
              href="/"
              className="block w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 text-center hover:border-neutral-700 hover:text-neutral-800 transition-colors"
            >
              回到首页
            </Link>
          </motion.div>
        )}

        {/* 分享卡 */}
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-neutral-100 mb-10" />
            <p className="text-[10px] text-neutral-400 tracking-widest mb-6">分享卡</p>

            <div className="border border-neutral-900 p-8 mb-6">
              <p className="text-[10px] text-neutral-400 mb-6 tracking-widest">底色</p>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 flex-shrink-0">
                  <CharacterImage name={character.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1">我的底色原型</p>
                  <p className="text-2xl font-light text-neutral-900">{character.name}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-500 mb-4 leading-relaxed italic">
                「{character.tagline}」
              </p>

              <p className="text-sm text-neutral-700 font-light leading-relaxed">
                {character.insight}
              </p>
            </div>

            <div className="flex gap-3 mb-10">
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => alert('链接已复制'))
                  }
                }}
                className="flex-1 border border-neutral-200 text-neutral-600 text-xs tracking-widest py-3 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              >
                复制链接
              </button>
              <Link
                href="/assessment"
                className="flex-1 border border-neutral-900 bg-neutral-900 text-white text-xs tracking-widest py-3 text-center hover:bg-white hover:text-neutral-900 transition-colors"
              >
                重新测试
              </Link>
            </div>

            <p className="text-[10px] text-neutral-300 text-center leading-loose">
              人不会只有一种样子。<br />
              这是你目前更熟悉的一种方式。
            </p>
          </motion.div>
        )}

      </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
