'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// ─── Daily observation per archetype ─────────────────────────────────────────

const DAILY_OBS: Record<string, string> = {
  独行者: '今天可以留意一下：\n当你又想说「不用，我自己来」的时候，\n是真的不需要别人，\n还是不太想冒险开口？',
  隐光者: '今天可以留意一下：\n被人认可了，你有没有让自己好好接住那一刻，\n而不是立刻转移话题？',
  潜行者: '今天可以留意一下：\n有没有哪件正在做的事，你其实希望有人知道它的重量？',
  建造者: '今天可以留意一下：\n你对自己的标准，是在推动你，还是在折磨你？',
  镜中人: '今天可以留意一下：\n如果今天某个人的回复少了一些，\n你最先想到的是什么？',
  拉锯者: '今天可以留意一下：\n你保持距离的那个人，你是真的不需要他，\n还是在等他先靠近？',
  燃尽者: '今天可以留意一下：\n你倾注很多的那件事，\n对方感受到它的重量了吗？',
  证明者: '今天可以留意一下：\n你在努力的事情里，有没有一件是只给自己看的？',
  舞台人: '今天可以留意一下：\n今天切换了几次版本？\n有没有一刻，你想放下所有版本？',
  设局者: '今天可以留意一下：\n有没有一件事，你愿意在没有任何准备的情况下就开始？',
  叙事者: '今天可以留意一下：\n如果今天这一天不需要有意义，你会怎么过？',
  策展人: '今天可以留意一下：\n你做的哪件事，从来没有想过要被人看见？',
  向阳者: '今天可以留意一下：\n有没有一件事，你其实希望有人认可，\n但没有说出来？',
  远行者: '今天可以留意一下：\n你最近走了多远？有没有想过回头确认一下那个稳的地方还在？',
  深耕者: '今天可以留意一下：\n你在慢慢积累的那件事，\n今天感觉到它在往前走了吗？',
  攀登者: '今天可以留意一下：\n你在登的这座山，还是你当初选的那座吗？',
}

// ─── Daily recommendation per archetype ──────────────────────────────────────

interface DailyRec {
  q: string
  event: string
}

const DAILY_REC: Record<string, DailyRec> = {
  独行者: {
    q: '为什么我明明可以求助，却总是先选择自己扛？',
    event: '我想探索：为什么开口求助对我来说比自己撑着更难',
  },
  隐光者: {
    q: '为什么我渴望被看见，但真的被看见了又想消失？',
    event: '我想探索：我对"被认可"这件事真正的感受',
  },
  潜行者: {
    q: '做一件没有人关注的事，我真的甘心吗？',
    event: '我想探索：意义感和外部回应之间，我更需要哪一个',
  },
  建造者: {
    q: '我对自己的标准，到底是动力还是枷锁？',
    event: '我想探索：我用什么衡量"做得够好了"',
  },
  镜中人: {
    q: '为什么我总害怕别人失望？',
    event: '我想探索：我为什么需要持续确认关系还在',
  },
  拉锯者: {
    q: '我想要连接，但连接了又想撤，这两件事是怎么回事？',
    event: '我想探索：我对亲密感的真实想法',
  },
  燃尽者: {
    q: '我付出了很多，为什么还是觉得不被看见？',
    event: '我想探索：我的付出和期待之间发生了什么',
  },
  证明者: {
    q: '"够好"对我来说，到底是多好？',
    event: '我想探索：我不停证明自己的背后，是什么在推着我',
  },
  舞台人: {
    q: '我同时活在那么多个版本里，最里面那个是谁？',
    event: '我想探索：当所有版本都放下，剩下的是什么',
  },
  设局者: {
    q: '我很擅长设计局面，但有没有什么是我没法设计的？',
    event: '我想探索：失控的时候，我第一个感受是什么',
  },
  叙事者: {
    q: '如果这一段经历没有主题，我能接受吗？',
    event: '我想探索：我为什么需要每件事都有意义',
  },
  策展人: {
    q: '我在意结果被看见——但有没有一个成就只是属于我自己的？',
    event: '我想探索：呈现和内心满足之间，我更在意哪一个',
  },
  向阳者: {
    q: '我不需要认可才能往前走，但我心里其实希望被看见吗？',
    event: '我想探索：我对被认可这件事真正的需求',
  },
  远行者: {
    q: '我走得很远，但那个让我有底气出发的地方，我有没有认真感谢过？',
    event: '我想探索：自由和连接对我来说是什么关系',
  },
  深耕者: {
    q: '我在慢慢积累的这件事，是真的值得，还是我已经习惯了这个节奏？',
    event: '我想探索：节奏稳和方向对，哪个更重要',
  },
  攀登者: {
    q: '我爬的这座山，当初为什么选它？',
    event: '我想探索：我的目标是自己选的，还是"应该选的"',
  },
}

const DEFAULT_OBS = '今天可以留意一下：\n有没有某件事，让你有点放不下？'
const DEFAULT_REC: DailyRec = {
  q: '有什么事情，最近一直放在心里？',
  event: '我想探索：最近放不下的一件事',
}

// ─── Landing (new user) ───────────────────────────────────────────────────────

function LandingHome() {
  const router = useRouter()
  return (
    <main className="min-h-screen flex flex-col px-6 pt-16 pb-28">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <motion.p
          className="text-[10px] text-neutral-400 tracking-widest mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          底色
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-16"
        >
          <h1 className="text-2xl font-light text-neutral-900 leading-snug mb-6">
            在认识你之前，<br />先看看你习惯怎样<br />面对这个世界。
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            15 道题。<br />不是性格测试，<br />是一次安静的观察。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 hover:bg-neutral-700 transition-colors duration-300 mb-8"
          >
            开始底色测试
          </button>
          <p className="text-xs text-neutral-300 leading-relaxed">
            大约 5 分钟。<br />没有对错，只有你真实的反应。
          </p>
        </motion.div>
      </div>
    </main>
  )
}

// ─── Today (returning user) ──────────────────────────────────────────────────

function TodayHome({ archetype, hiddenRules }: { archetype: string; hiddenRules: string[] }) {
  const router = useRouter()
  const [event, setEvent] = useState('')

  const obs = DAILY_OBS[archetype] || DEFAULT_OBS
  const rec = DAILY_REC[archetype] || DEFAULT_REC

  function startExplore(e: string) {
    if (!e.trim()) return
    router.push(`/explore?event=${encodeURIComponent(e.trim())}`)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 pt-14 pb-32">
      <div className="max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-16">
          <p className="text-[10px] text-neutral-400 tracking-widest">底色</p>
          <Link href="/profile" className="text-[10px] text-neutral-300 hover:text-neutral-600 transition-colors">
            我的档案
          </Link>
        </div>

        {/* 今日观察 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">今日观察</p>
          <p className="text-sm text-neutral-700 leading-loose whitespace-pre-line">{obs}</p>
        </motion.div>

        <div className="h-px bg-neutral-100 mb-12" />

        {/* 今日推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-12"
        >
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">今日推荐</p>
          <button
            onClick={() => startExplore(rec.event)}
            className="w-full text-left border border-neutral-200 px-4 py-5 hover:border-neutral-700 hover:bg-neutral-50 transition-all group"
          >
            <p className="text-sm font-light text-neutral-800 leading-snug mb-2">{rec.q}</p>
            <p className="text-[10px] text-neutral-400 group-hover:text-neutral-600 transition-colors">点击开始探索 →</p>
          </button>
        </motion.div>

        {/* 最近浮现 */}
        {hiddenRules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-12"
          >
            <p className="text-[10px] text-neutral-400 tracking-widest mb-5">最近浮现</p>
            <p className="text-base font-light text-neutral-900 leading-snug border-l-2 border-neutral-200 pl-4">
              {hiddenRules[hiddenRules.length - 1]}
            </p>
          </motion.div>
        )}

        <div className="h-px bg-neutral-100 mb-12" />

        {/* Quick entry buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-[10px] text-neutral-400 mb-5">快速进入</p>
          <div className="flex gap-2.5">
            {[
              { label: '关系', event: '我想探索一段关系' },
              { label: '工作学业', event: '我想探索工作或学业上的困惑' },
              { label: '自己和未来', event: '我想探索自己和未来的方向' },
            ].map(({ label, event: e }) => (
              <button
                key={label}
                onClick={() => startExplore(e)}
                className="flex-1 text-xs text-neutral-600 border border-neutral-200 py-3 hover:border-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Free text input */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <textarea
            value={event}
            onChange={e => setEvent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                startExplore(event)
              }
            }}
            placeholder="或者直接写——最近放不下的一件事……"
            rows={3}
            className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-0 border-b border-neutral-200 py-3 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed"
          />
          {event.trim() && (
            <button
              onClick={() => startExplore(event)}
              className="mt-4 w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors duration-300"
            >
              开始探索
            </button>
          )}
        </motion.div>
      </div>
    </main>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [archetype, setArchetype] = useState('')
  const [hiddenRules, setHiddenRules] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dise_profile')
      if (raw) {
        const p = JSON.parse(raw)

        // Migration: old schema had p.assessment.character, no assessmentCompleted
        if (!p.assessmentCompleted && p.assessment?.character) {
          p.assessmentCompleted = true
          p.primaryArchetype = p.assessment.character
          localStorage.setItem('dise_profile', JSON.stringify(p))
        }

        if (p.assessmentCompleted) {
          setAssessmentCompleted(true)
          setArchetype(p.primaryArchetype || '')
          setHiddenRules(p.hiddenRules || [])
        }
      }
    } catch { }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col px-6 pt-16">
        <p className="text-[10px] text-neutral-400 tracking-widest">底色</p>
      </main>
    )
  }

  if (!assessmentCompleted) return <LandingHome />
  return <TodayHome archetype={archetype} hiddenRules={hiddenRules} />
}
