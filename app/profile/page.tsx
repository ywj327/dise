'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { SignalScores, Signal } from '@/lib/scoring'

// ─── Signal display helpers ───────────────────────────────────────────────────

const SIGNAL_LABEL: Record<Signal, string> = {
  approval: '被认可、被重视',
  security: '关系的稳定与确定感',
  autonomy: '自己的选择权',
  achievement: '结果与进展',
  control: '可预期的掌控感',
  suppression: '事情是否真的值得',
}

const SIGNAL_CARE: Record<Signal, string> = {
  approval: '别人怎么看我、有没有被认可',
  security: '关系是否稳定、是否有变化',
  autonomy: '自己有没有选择权、够不够自由',
  achievement: '做出来的结果、能不能证明什么',
  control: '事情是否在掌握中、是否可预期',
  suppression: '做的事有没有意义、值不值得',
}

const Q1_TRIGGER: Record<string, string> = {
  '回避型': '感觉空间被侵入；被强迫依赖的感觉',
  '焦虑型': '关系里的模糊信号；感觉被冷落或被忽视',
  '表演型': '没人在意时；不同版本之间的撕裂感',
  '安全型': '突如其来的失控局面；完全没有预期的变化',
}

const Q1_PROTECT: Record<string, string> = {
  '回避型': '先撤退，给自己留退路',
  '焦虑型': '持续确认，寻找更多信号',
  '表演型': '切换到合适的版本，让场面先稳住',
  '安全型': '让自己先稳下来，再去处理',
}

// ─── Profile data types ───────────────────────────────────────────────────────

interface Discovery {
  date: string
  event: string
  discovery: { rule: string; newQuestion: string; experiencing: string }
}

interface ProfileData {
  assessmentCompleted?: boolean
  assessmentCompletedAt?: string
  primaryArchetype?: string
  q1?: string
  q2?: string
  coreSignals?: SignalScores
  discoveries: Discovery[]
  hiddenRules: string[]
  needs: string[]
  sensitiveAreas: string[]
  defensePatterns: string[]
}

const EMPTY: ProfileData = {
  discoveries: [], hiddenRules: [], needs: [], sensitiveAreas: [], defensePatterns: [],
}

function fmt(iso: string) {
  try { const d = new Date(iso); return `${d.getMonth() + 1}月${d.getDate()}日` } catch { return '' }
}

function topSignalsFromScores(scores: SignalScores, n: number): Signal[] {
  return (Object.entries(scores) as [Signal, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dise_profile')
      if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) })
    } catch { }
    setLoaded(true)
  }, [])

  function clearData() {
    if (confirm('清除所有底色数据？')) {
      localStorage.removeItem('dise_profile')
      localStorage.removeItem('dise_firstReveal')
      localStorage.removeItem('dise_onboarded')
      setProfile(EMPTY)
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">
        <p className="text-[10px] text-neutral-400 tracking-widest">我的档案</p>
      </main>
    )
  }

  const hasAssessment = !!profile.assessmentCompleted
  const hasExplorations = profile.discoveries.length > 0

  // No assessment yet
  if (!hasAssessment) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">
        <div className="flex items-center justify-between mb-16">
          <p className="text-[10px] text-neutral-400 tracking-widest">我的档案</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[55vh] flex flex-col justify-center">
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">这里还是空的。</p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-12">
            不是因为你没有底色。<br />只是我们还没有一起看到它。
          </p>
          <Link
            href="/assessment"
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors block"
          >
            开始底色测试
          </Link>
        </motion.div>
      </main>
    )
  }

  const topSignals = profile.coreSignals ? topSignalsFromScores(profile.coreSignals, 3) : []
  const archetype = profile.primaryArchetype || ''
  const q1 = profile.q1 || ''

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      <div className="flex items-center justify-between mb-16">
        <p className="text-[10px] text-neutral-400 tracking-widest">我的档案</p>
        <button onClick={clearData} className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors">清除</button>
      </div>

      {/* 当前底色原型 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <p className="text-[10px] text-neutral-400 tracking-widest mb-4">当前底色原型</p>
        <p className="text-3xl font-light text-neutral-900 mb-2">{archetype}</p>
        {profile.assessmentCompletedAt && (
          <p className="text-[10px] text-neutral-300">测试于 {fmt(profile.assessmentCompletedAt)}</p>
        )}
        <div className="mt-5 flex gap-2">
          <Link
            href="/assessment"
            className="text-[10px] text-neutral-500 border border-neutral-200 px-3 py-2 hover:border-neutral-700 hover:text-neutral-800 transition-colors"
          >
            重测 →
          </Link>
          {profile.q1 && profile.q2 && (
            <Link
              href={`/result?q1=${encodeURIComponent(profile.q1)}&q2=${encodeURIComponent(profile.q2)}&q3=${encodeURIComponent(profile.q3 || '')}&q4=${encodeURIComponent(profile.q4 || '')}`}
              className="text-[10px] text-neutral-500 border border-neutral-200 px-3 py-2 hover:border-neutral-700 hover:text-neutral-800 transition-colors"
            >
              查看底色原型 →
            </Link>
          )}
        </div>
      </motion.div>

      <div className="h-px bg-neutral-100 mb-12" />

      {/* 核心信号 */}
      {topSignals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-7">测试中浮现的信号</p>
          <div className="flex flex-col gap-4">
            {topSignals.map((sig, i) => (
              <div key={sig} className="flex gap-4 items-baseline">
                <span className="text-[10px] text-neutral-300 flex-shrink-0 w-5">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm text-neutral-700">{SIGNAL_LABEL[sig]}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 内在倾向 */}
      {topSignals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-7">我更在意的</p>
          <div className="flex flex-col gap-3 pl-0">
            {topSignals.slice(0, 2).map((sig) => (
              <p key={sig} className="text-sm text-neutral-700 leading-relaxed border-l border-neutral-200 pl-4">
                {SIGNAL_CARE[sig]}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* 容易被刺中的 */}
      {q1 && Q1_TRIGGER[q1] && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-4">我容易被刺中的</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{Q1_TRIGGER[q1]}</p>
        </motion.div>
      )}

      {/* 习惯的保护方式 */}
      {q1 && Q1_PROTECT[q1] && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-4">我习惯的保护方式</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{Q1_PROTECT[q1]}</p>
        </motion.div>
      )}

      <div className="h-px bg-neutral-100 mb-12" />

      {/* 正在确认的规则 */}
      {profile.hiddenRules.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-6">正在确认的规则</p>
          <div className="flex flex-col gap-3">
            {profile.hiddenRules.map((rule, i) => (
              <div key={i} className="border border-neutral-200 px-4 py-4">
                <p className="text-sm font-light text-neutral-900 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 探索记录 */}
      {hasExplorations && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">
            探索记录 <span className="text-neutral-600 font-normal">{profile.discoveries.length}</span>
          </p>
          <div className="flex flex-col gap-3">
            {profile.discoveries.slice().reverse().map((d, i) => (
              <div key={i} className="border border-neutral-100">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full text-left px-4 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-400 mb-1">{fmt(d.date)}</p>
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{d.event}</p>
                  </div>
                  <span className="text-neutral-300 text-xs mt-0.5 flex-shrink-0">{expanded === i ? '↑' : '↓'}</span>
                </button>
                {expanded === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-neutral-100"
                  >
                    {d.discovery?.experiencing && (
                      <p className="text-xs text-neutral-500 leading-relaxed mt-3 mb-2">{d.discovery.experiencing}</p>
                    )}
                    {d.discovery?.rule && (
                      <p className="text-sm font-light text-neutral-900 mt-2">{d.discovery.rule}</p>
                    )}
                    {d.discovery?.newQuestion && (
                      <p className="text-xs text-neutral-400 leading-relaxed mt-3 italic">{d.discovery.newQuestion}</p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }} className="flex flex-col gap-3">
        <Link href="/" className="block w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors">
          回到今天
        </Link>
        <Link href="/topics" className="block w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 text-center hover:border-neutral-700 hover:text-neutral-800 transition-colors">
          浏览探索专题
        </Link>
      </motion.div>

    </main>
  )
}
