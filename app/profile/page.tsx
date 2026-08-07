'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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
}

const EMPTY: ProfileData = { discoveries: [], needs: [], sensitiveAreas: [], defensePatterns: [], hiddenRules: [] }

function fmt(iso: string) {
  try { const d = new Date(iso); return `${d.getMonth() + 1}月${d.getDate()}日` } catch { return '' }
}

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

  const count = profile.discoveries.length
  const hasData = count > 0

  function clearData() {
    if (confirm('清除所有底色数据？')) {
      localStorage.removeItem('dise_profile')
      setProfile(EMPTY)
    }
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      <div className="flex items-center justify-between mb-16">
        <p className="text-[10px] text-neutral-400 tracking-widest">我的底色</p>
        {hasData && (
          <button onClick={clearData} className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors">清除</button>
        )}
      </div>

      {/* 空状态 */}
      {loaded && !hasData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[55vh] flex flex-col justify-center">
          <p className="text-sm text-neutral-500 leading-relaxed mb-2">你的底色还在形成中。</p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-12">
            每完成一次探索，这里会沉淀你的发现。<br />用得越久，你对自己的了解越深。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 text-center hover:bg-neutral-700 transition-colors">
              开始第一次探索
            </Link>
            <Link href="/topics" className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 text-center hover:border-neutral-700 hover:text-neutral-800 transition-colors">
              浏览探索专题
            </Link>
          </div>
        </motion.div>
      )}

      {/* 有数据 */}
      {loaded && hasData && (
        <div>

          {/* 已探索次数 */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-neutral-400 mb-12">
            你已完成 <span className="text-neutral-900">{count}</span> 次探索
          </motion.p>

          {/* 最近的规则 - 置顶显示最新发现 */}
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

          {/* 核心需要 */}
          {profile.needs.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mb-10">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[10px] text-neutral-300">01</span>
                <p className="text-xs text-neutral-500 tracking-widest">核心需要</p>
              </div>
              <div className="flex flex-col gap-2 pl-7">
                {profile.needs.map((item, i) => (
                  <p key={i} className="text-sm text-neutral-700">{item}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* 敏感区 */}
          {profile.sensitiveAreas.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mb-10">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[10px] text-neutral-300">02</span>
                <p className="text-xs text-neutral-500 tracking-widest">容易触发的感受</p>
              </div>
              <div className="flex flex-col gap-2 pl-7">
                {profile.sensitiveAreas.map((item, i) => (
                  <p key={i} className="text-sm text-neutral-700">{item}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* 保护方式 */}
          {profile.defensePatterns.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="mb-10">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-[10px] text-neutral-300">03</span>
                <p className="text-xs text-neutral-500 tracking-widest">保护方式</p>
              </div>
              <div className="flex flex-col gap-2 pl-7">
                {profile.defensePatterns.map((item, i) => (
                  <p key={i} className="text-sm text-neutral-700">{item}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* 隐形规则 */}
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

          {/* 探索历史 - 可展开 */}
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
                      exit={{ opacity: 0, height: 0 }}
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
