'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileData {
  discoveries: Array<{
    date: string
    event: string
    discovery: {
      rule: string
      experiencing: string
    }
  }>
  needs: string[]
  sensitiveAreas: string[]
  defensePatterns: string[]
  hiddenRules: string[]
}

const EMPTY: ProfileData = {
  discoveries: [],
  needs: [],
  sensitiveAreas: [],
  defensePatterns: [],
  hiddenRules: [],
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  } catch {
    return ''
  }
}

function Section({ index, title, items, emptyText }: {
  index: string
  title: string
  items: string[]
  emptyText: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Number(index) * 0.08 }}
      className="mb-12"
    >
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[10px] text-neutral-300">{index.toString().padStart(2, '0')}</span>
        <p className="text-xs text-neutral-500 tracking-widest">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-neutral-300 pl-7">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2 pl-7">
          {items.map((item, i) => (
            <div key={i} className="text-sm text-neutral-700 leading-relaxed">
              {item}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>(EMPTY)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dise_profile')
      if (raw) {
        const p = JSON.parse(raw)
        setProfile({ ...EMPTY, ...p })
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  const hasData = profile.discoveries.length > 0

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-16"
      >
        <p className="text-[10px] text-neutral-400 tracking-widest">我的底色</p>
        {hasData && (
          <button
            onClick={() => { if (confirm('清除所有底色数据？')) { localStorage.removeItem('dise_profile'); setProfile(EMPTY) } }}
            className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            清除
          </button>
        )}
      </motion.div>

      {loaded && !hasData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[50vh] flex flex-col justify-center"
        >
          <p className="text-sm text-neutral-400 leading-relaxed mb-2">你的底色还在形成中。</p>
          <p className="text-sm text-neutral-300 leading-relaxed mb-12">从一件放不下的事开始探索，这里会慢慢沉淀你的发现。</p>
          <Link
            href="/"
            className="inline-block border border-neutral-900 text-neutral-900 text-xs tracking-widest px-8 py-4 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            开始探索
          </Link>
        </motion.div>
      )}

      {loaded && hasData && (
        <div>
          {/* 最近的探索 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-14">
            <p className="text-[10px] text-neutral-400 tracking-widest mb-5">最近的探索</p>
            <div className="flex flex-col gap-4">
              {profile.discoveries.slice(-3).reverse().map((d, i) => (
                <div key={i} className="border-l-2 border-neutral-200 pl-4">
                  <p className="text-[10px] text-neutral-400 mb-1">{formatDate(d.date)}</p>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{d.event}</p>
                  {d.discovery?.rule && (
                    <p className="text-xs text-neutral-900 mt-1.5 font-light">{d.discovery.rule}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="h-px bg-neutral-100 mb-12" />

          {/* 内在地图 */}
          <p className="text-[10px] text-neutral-400 tracking-widest mb-10">我的内在地图</p>

          <Section
            index="1"
            title="我的核心需要"
            items={profile.needs}
            emptyText="还未发现"
          />

          <Section
            index="2"
            title="我的敏感区"
            items={profile.sensitiveAreas}
            emptyText="还未发现"
          />

          <Section
            index="3"
            title="我的保护方式"
            items={profile.defensePatterns}
            emptyText="还未发现"
          />

          {/* 隐形规则 - 视觉突出 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-12"
          >
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[10px] text-neutral-300">04</span>
              <p className="text-xs text-neutral-500 tracking-widest">我的隐形规则</p>
            </div>
            {profile.hiddenRules.length === 0 ? (
              <p className="text-xs text-neutral-300 pl-7">还未发现</p>
            ) : (
              <div className="flex flex-col gap-4 pl-7">
                {profile.hiddenRules.map((rule, i) => (
                  <div key={i} className="border border-neutral-200 px-4 py-4">
                    <p className="text-base font-light text-neutral-900 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="h-px bg-neutral-100 mb-12" />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <p className="text-xs text-neutral-400 mb-3">继续发现</p>
            <Link
              href="/"
              className="block w-full border border-neutral-200 text-neutral-600 text-xs tracking-widest py-4 text-center hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              探索新的一件事 →
            </Link>
          </motion.div>
        </div>
      )}
    </main>
  )
}
