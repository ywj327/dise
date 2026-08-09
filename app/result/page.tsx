'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { typeDescriptions, getCharacter } from '@/lib/scoring'
import { Result } from '@/types'
import { Suspense } from 'react'

const quadrantOrder: (keyof Result)[] = ['q1', 'q2', 'q3', 'q4']

function CharacterImage({ name, large }: { name: string; large?: boolean }) {
  return (
    <div className={`${large ? 'w-36 h-36' : 'w-16 h-16'} flex-shrink-0 flex items-center justify-center bg-neutral-50 border border-neutral-100`}>
      <span className={`font-light text-neutral-500 ${large ? 'text-2xl' : 'text-base'}`}>{name}</span>
    </div>
  )
}

function ResultContent() {
  const params = useSearchParams()

  const result: Result = {
    q1: (params.get('q1') || '回避型') as Result['q1'],
    q2: (params.get('q2') || '意义驱动') as Result['q2'],
    q3: (params.get('q3') || '方向未定型') as Result['q3'],
    q4: (params.get('q4') || '影响力型') as Result['q4'],
  }

  const character = getCharacter(result.q1, result.q2)
  const types = quadrantOrder.map((k) => result[k])

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <motion.p
          className="text-xs text-neutral-400 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          底色
        </motion.p>

        {/* IP 形象 + 角色名 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-end gap-8 mb-8">
            <CharacterImage name={character.name} large />
            <div className="pb-1">
              <p className="text-xs text-neutral-400 mb-3">你是</p>
              <h1 className="text-5xl font-light text-neutral-900 tracking-tight">
                {character.name}
              </h1>
            </div>
          </div>
          <p className="text-sm text-neutral-600 leading-loose">
            {character.desc}
          </p>
        </motion.div>

        {/* 分割线 */}
        <motion.div
          className="h-px bg-neutral-100 mb-12"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />

        {/* 四个维度 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <p className="text-xs text-neutral-400 mb-6">你的四个维度</p>
          <div className="flex flex-col gap-5">
            {quadrantOrder.map((key) => {
              const typeName = result[key]
              const info = typeDescriptions[typeName]
              if (!info) return null
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">{info.quadrant}</span>
                    <span className="text-sm font-medium text-neutral-900">{info.label}</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">{info.desc}</p>
                  <div className="h-px bg-neutral-100 mt-3" />
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* 建议 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <p className="text-xs text-neutral-400 mb-4">可以试试</p>
          <div className="flex flex-col gap-3">
            {character.tips.map((tip, i) => (
              <p key={i} className="text-sm text-neutral-600 leading-relaxed pl-3 border-l border-neutral-200">
                {tip}
              </p>
            ))}
          </div>
        </motion.div>

        {/* 分享卡片 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="border border-neutral-900 p-8 mb-8">
            <p className="text-xs text-neutral-400 mb-6">底色</p>
            <div className="flex items-center gap-5 mb-5">
              <CharacterImage name={character.name} />
              <div>
                <p className="text-xs text-neutral-400 mb-1">我是</p>
                <p className="text-2xl font-light text-neutral-900">{character.name}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              {types.join('  ·  ')}
            </p>
          </div>

          <p className="text-xs text-neutral-400 mb-6 text-center">
            截图分享，或复制链接给朋友测试
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => alert('链接已复制'))
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

          <div className="mt-4">
            <Link
              href="/base"
              className="block w-full border border-neutral-300 text-neutral-600 text-xs tracking-widest py-3 text-center hover:border-neutral-700 hover:text-neutral-900 transition-colors"
            >
              查看我的底色档案 →
            </Link>
          </div>

          <p className="text-xs text-neutral-300 text-center mt-10 leading-relaxed">
            测试结果仅供参考，基于你当下的状态。<br />
            底色会变，这只是此刻的坐标。
          </p>
        </motion.div>

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
