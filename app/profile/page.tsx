'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FirstReveal {
  completed: boolean
  caresAbout: string
  protection: string
  rule: string
  ruleConfidence: 'confirmed' | 'unconfirmed'
}

interface AssessmentData {
  source: string
  date: string
  character: string
  q1: string
  q2: string
}

interface ProfileData {
  discoveries: Array<{
    date: string
    event: string
    discovery: { rule: string; newQuestion: string; experiencing: string }
  }>
  needs: string[]
  sensitiveAreas: string[]
  defensePatterns: string[]
  hiddenRules: string[]
  assessment?: AssessmentData
}

const EMPTY: ProfileData = { discoveries: [], needs: [], sensitiveAreas: [], defensePatterns: [], hiddenRules: [] }

function fmt(iso: string) {
  try { const d = new Date(iso); return `${d.getMonth() + 1}月${d.getDate()}日` } catch { return '' }
}

export default function ProfilePage() {
  const [firstReveal, setFirstReveal] = useState<FirstReveal | null>(null)
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    try {
      const fr = localStorage.getItem('dise_firstReveal')
      if (fr) {
        const parsed = JSON.parse(fr)
        if (parsed.completed) setFirstReveal(parsed)
      }
    } catch { }
    try {
      const raw = localStorage.getItem('dise_profile')
      if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) })
    } catch { }
    setLoaded(true)
  }, [])

  const explorationCount = profile.discoveries.length
  const hasExplorations = explorationCount > 0
  const hasFirstReveal = !!firstReveal

  function clearData() {
    if (confirm('清除所有底色数据？')) {
      localStorage.removeItem('dise_profile')
      localStorage.removeItem('dise_firstReveal')
      localStorage.removeItem('dise_onboarded')
      setProfile(EMPTY)
      setFirstReveal(null)
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">
        <p className="text-[10px] text-neutral-400 tracking-widest">我的底色</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      <div className="flex items-center justify-between mb-16">
        <p className="text-[10px] text-neutral-400 tracking-widest">我的底色</p>
        {(hasFirstReveal || hasExplorations) && (
          <button onClick={clearData} className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors">清除</button>
        )}
      </div>

      {/* 空状态：没有第一次显影 */}
      {!hasFirstReveal && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[55vh] flex flex-col justify-center">
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">
            这里暂时还是空的。
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-12">
            不是因为你没有底色。<br />只是我们还没有一起看到它。
          </p>
          <Link
            href="/onboarding"
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors block"
          >
            开始第一次显影
          </Link>
        </motion.div>
      )}

      {/* 有第一次显影数据 */}
      {hasFirstReveal && firstReveal && (
        <div>

          {/* 目前浮现的线索 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-14">
            <p className="text-[10px] text-neutral-400 tracking-widest mb-8">目前浮现的线索</p>

            <div className="flex flex-col gap-8">
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
                <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">01</span>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-2">我比较在意什么</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{firstReveal.caresAbout}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
                <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">02</span>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-2">我通常如何保护自己</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{firstReveal.protection}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4">
                <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">03</span>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-3">一条值得继续确认的规则</p>
                  <p className="text-lg font-light text-neutral-900 leading-snug">{firstReveal.rule}</p>
                  {firstReveal.ruleConfidence === 'unconfirmed' && (
                    <p className="text-[10px] text-neutral-300 mt-2">（尚未确认）</p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="h-px bg-neutral-100 mb-12" />

          {/* 底色测试区块 */}
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
            {!profile.assessment ? (
              <div className="border border-dashed border-neutral-200 px-5 py-5">
                <p className="text-xs text-neutral-600 mb-1">还缺一块拼图</p>
                <p className="text-[10px] text-neutral-400 leading-relaxed mb-5">
                  完成一次底色测试，快速找到你的底色原型。
                </p>
                <Link
                  href="/assessment"
                  className="inline-block text-[10px] text-neutral-900 tracking-widest border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  去测试 →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-neutral-400 tracking-widest mb-3">来自底色测试</p>
                <p className="text-sm text-neutral-700 mb-1">{profile.assessment.character}</p>
                <p className="text-[10px] text-neutral-300 mb-3">上次测试：{fmt(profile.assessment.date)}</p>
                <Link
                  href="/assessment"
                  className="text-[10px] text-neutral-400 hover:text-neutral-700 underline underline-offset-4 transition-colors"
                >
                  重新测一次 →
                </Link>
              </div>
            )}
          </motion.div>

          {/* 探索发现：只有有探索记录才显示 */}
          {hasExplorations && (
            <>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-neutral-400 mb-10">
                你已完成 <span className="text-neutral-900">{explorationCount}</span> 次探索
              </motion.p>

              {/* 最近规则 */}
              {profile.hiddenRules.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                  <p className="text-[10px] text-neutral-400 tracking-widest mb-5">最近浮现的规则</p>
                  <p className="text-xl font-light text-neutral-900 leading-snug border-l-2 border-neutral-900 pl-4">
                    {profile.hiddenRules[profile.hiddenRules.length - 1]}
                  </p>
                </motion.div>
              )}

              <div className="h-px bg-neutral-100 mb-12" />

              {/* 内在地图 */}
              <p className="text-[10px] text-neutral-400 tracking-widest mb-10">我的内在地图</p>

              {profile.needs.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mb-10">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[10px] text-neutral-300">01</span>
                    <p className="text-xs text-neutral-500 tracking-widest">核心需要</p>
                  </div>
                  <div className="flex flex-col gap-2 pl-7">
                    {profile.needs.map((item, i) => <p key={i} className="text-sm text-neutral-700">{item}</p>)}
                  </div>
                </motion.div>
              )}

              {profile.sensitiveAreas.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mb-10">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[10px] text-neutral-300">02</span>
                    <p className="text-xs text-neutral-500 tracking-widest">容易触发的感受</p>
                  </div>
                  <div className="flex flex-col gap-2 pl-7">
                    {profile.sensitiveAreas.map((item, i) => <p key={i} className="text-sm text-neutral-700">{item}</p>)}
                  </div>
                </motion.div>
              )}

              {profile.defensePatterns.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="mb-10">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[10px] text-neutral-300">03</span>
                    <p className="text-xs text-neutral-500 tracking-widest">保护方式</p>
                  </div>
                  <div className="flex flex-col gap-2 pl-7">
                    {profile.defensePatterns.map((item, i) => <p key={i} className="text-sm text-neutral-700">{item}</p>)}
                  </div>
                </motion.div>
              )}

              {profile.hiddenRules.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-[10px] text-neutral-300">04</span>
                    <p className="text-xs text-neutral-500 tracking-widest">隐形规则</p>
                  </div>
                  <div className="flex flex-col gap-3 pl-7">
                    {profile.hiddenRules.map((rule, i) => (
                      <div key={i} className="border border-neutral-200 px-4 py-4">
                        <p className="text-sm font-light text-neutral-900 leading-relaxed">{rule}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="h-px bg-neutral-100 mb-12" />

              {/* 探索记录 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }} className="mb-12">
                <p className="text-[10px] text-neutral-400 tracking-widest mb-5">探索记录</p>
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
            </>
          )}

          {/* 继续探索 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-3">
            <Link href="/" className="block w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors">
              继续探索
            </Link>
            <Link href="/topics" className="block w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 text-center hover:border-neutral-700 hover:text-neutral-800 transition-colors">
              浏览探索专题
            </Link>
          </motion.div>

        </div>
      )}
    </main>
  )
}
