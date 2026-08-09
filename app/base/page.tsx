'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SignalScores, Signal } from '@/lib/scoring'

// ─── Signal labels ────────────────────────────────────────────────────────────

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
  security: '关系是否稳定、有没有变化',
  autonomy: '自己有没有选择权、够不够自由',
  achievement: '做出来的结果、能不能证明什么',
  control: '事情是否在掌握中、是否可预期',
  suppression: '做的事有没有意义、值不值得',
}

const ARCHETYPE_LINE: Record<string, string> = {
  独行者: '很多时候，你还是更习惯先自己处理。',
  隐光者: '你渴望被看见，但靠得太近了又不舒服。',
  潜行者: '你做事认真，但不需要有人看着。',
  建造者: '你对自己的标准，比对外界评价更在意。',
  镜中人: '你对关系里的信号，比自己想象的更敏感。',
  拉锯者: '你想要连接，但连接了又想退一步。',
  燃尽者: '你付出的时候是真心的，对方的回应会影响你很深。',
  证明者: '你做得好，但很难真的安心下来。',
  舞台人: '你在不同人面前有不同的样子，都很流畅。',
  设局者: '你清楚自己在设计局面，只是偶尔会想，卸下来是什么。',
  叙事者: '你喜欢给经历找主题，不太能接受平淡的章节。',
  策展人: '做好了还不够，你也在意它怎么被看见。',
  向阳者: '你不需要认可才能往前走，但有了会真心高兴。',
  远行者: '你走得远，因为知道有地方可以回。',
  深耕者: '你不快，但不会停。',
  攀登者: '你知道自己要去哪，不需要别人催。',
}

const Q1_TRIGGER: Record<string, string> = {
  回避型: '感觉空间被侵入；被强迫依赖的感觉',
  焦虑型: '关系里的模糊信号；感觉被冷落或被忽视',
  表演型: '没人在意时；不同版本之间的撕裂感',
  安全型: '突如其来的失控局面；完全没有预期的变化',
}

const Q1_PROTECT: Record<string, string> = {
  回避型: '先撤退，给自己留退路',
  焦虑型: '持续确认，寻找更多信号',
  表演型: '切换到合适的版本，让场面先稳住',
  安全型: '让自己先稳下来，再去处理',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Discovery {
  date: string
  event: string
  discovery: { rule: string; newQuestion: string; experiencing: string }
}

interface ProfileData {
  assessmentCompleted?: boolean
  assessmentCompletedAt?: string
  primaryArchetype?: string
  q1?: string; q2?: string; q3?: string; q4?: string
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

function topSignals(scores: SignalScores, n: number): Signal[] {
  return (Object.entries(scores) as [Signal, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BasePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      setProfile({ ...EMPTY, ...p })
    } catch { }
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-screen bg-white" />

  const hasAssessment = !!profile.assessmentCompleted
  const signals = profile.coreSignals ? topSignals(profile.coreSignals, 3) : []
  const archetype = profile.primaryArchetype || ''
  const q1 = profile.q1 || ''

  // No assessment
  if (!hasAssessment) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-28">
        <p className="text-[10px] text-neutral-400 tracking-widest mb-16">我的底色</p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[55vh] flex flex-col justify-center">
          <p className="text-sm text-neutral-500 leading-relaxed mb-3">这里还是空的。</p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-12">
            不是因为你没有底色。<br />只是我们还没有一起看到它。
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 hover:bg-neutral-700 transition-colors"
          >
            开始底色测试
          </button>
        </motion.div>
      </main>
    )
  }

  const archetypeLine = ARCHETYPE_LINE[archetype] || ''

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-28">

      <p className="text-[10px] text-neutral-400 tracking-widest mb-16">我的底色</p>

      {/* A. 当前的我 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <p className="text-[10px] text-neutral-400 tracking-widest mb-4">当前</p>
        <p className="text-3xl font-light text-neutral-900 mb-3">{archetype}</p>
        {archetypeLine && (
          <p className="text-sm text-neutral-500 leading-relaxed mb-5">{archetypeLine}</p>
        )}
        <div className="flex gap-2">
          {profile.q1 && profile.q2 && (
            <Link
              href={`/result?q1=${encodeURIComponent(profile.q1)}&q2=${encodeURIComponent(profile.q2)}&q3=${encodeURIComponent(profile.q3 || '')}&q4=${encodeURIComponent(profile.q4 || '')}`}
              className="text-[10px] text-neutral-400 border border-neutral-200 px-3 py-2 hover:border-neutral-600 hover:text-neutral-700 transition-colors"
            >
              查看最初的测试结果 →
            </Link>
          )}
          <button
            onClick={() => router.push('/assessment')}
            className="text-[10px] text-neutral-400 border border-neutral-200 px-3 py-2 hover:border-neutral-600 hover:text-neutral-700 transition-colors"
          >
            重测
          </button>
        </div>
      </motion.div>

      <div className="h-px bg-neutral-100 mb-12" />

      {/* B. 我比较在意什么 */}
      {signals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-6">我比较在意</p>
          <div className="flex flex-col gap-3">
            {signals.slice(0, 2).map(sig => (
              <p key={sig} className="text-sm text-neutral-700 leading-relaxed border-l border-neutral-200 pl-4">
                {SIGNAL_CARE[sig]}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* C. 我容易被什么刺中 */}
      {q1 && Q1_TRIGGER[q1] && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-4">我容易被刺中的</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{Q1_TRIGGER[q1]}</p>
        </motion.div>
      )}

      {/* D. 我习惯怎样保护自己 */}
      {q1 && Q1_PROTECT[q1] && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-4">我习惯的保护方式</p>
          <p className="text-sm text-neutral-700 leading-relaxed">{Q1_PROTECT[q1]}</p>
        </motion.div>
      )}

      {(signals.length > 0 || q1) && <div className="h-px bg-neutral-100 mb-12" />}

      {/* E. 我一直相信的（规则） */}
      {profile.hiddenRules.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-6">我一直相信的</p>
          <div className="flex flex-col gap-3">
            {profile.hiddenRules.map((rule, i) => (
              <div key={i} className="border border-neutral-200 px-4 py-4">
                <p className="text-sm font-light text-neutral-900 leading-relaxed">{rule}</p>
                <p className="text-[10px] text-neutral-400 mt-2">出现 {profile.discoveries.filter(d => d.discovery?.rule === rule).length + 1} 次</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 探索记录 */}
      {profile.discoveries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }} className="mb-12">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">
            探索记录 <span className="text-neutral-600">{profile.discoveries.length}</span>
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
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 pb-4 border-t border-neutral-100">
                    {d.discovery?.experiencing && <p className="text-xs text-neutral-500 leading-relaxed mt-3 mb-2">{d.discovery.experiencing}</p>}
                    {d.discovery?.rule && <p className="text-sm font-light text-neutral-900 mt-2">{d.discovery.rule}</p>}
                    {d.discovery?.newQuestion && <p className="text-xs text-neutral-400 leading-relaxed mt-3 italic">{d.discovery.newQuestion}</p>}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
        <Link href="/topics" className="block w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 text-center hover:bg-neutral-900 hover:text-white transition-colors">
          开始新的探索
        </Link>
      </motion.div>

    </main>
  )
}
