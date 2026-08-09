'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// ─── Daily content per archetype ─────────────────────────────────────────────

const DAILY_OBS: Record<string, string> = {
  独行者: '当你又想说「不用，我自己来」的时候，\n是真的不需要别人，\n还是不太想冒险开口？',
  隐光者: '被人认可了，你有没有让自己好好接住那一刻，\n而不是立刻转移话题？',
  潜行者: '有没有哪件正在做的事，你其实希望有人知道它的重量？',
  建造者: '你对自己的标准，是在推动你，还是在折磨你？',
  镜中人: '如果今天某个人的回复少了一些，你最先想到的是什么？',
  拉锯者: '你保持距离的那个人，你是真的不需要他，还是在等他先靠近？',
  燃尽者: '你倾注很多的那件事，对方感受到它的重量了吗？',
  证明者: '你在努力的事情里，有没有一件是只给自己看的？',
  舞台人: '今天切换了几次版本？有没有一刻，你想放下所有版本？',
  设局者: '有没有一件事，你愿意在没有任何准备的情况下就开始？',
  叙事者: '如果今天这一天不需要有意义，你会怎么过？',
  策展人: '你做的哪件事，从来没有想过要被人看见？',
  向阳者: '有没有一件事，你其实希望有人认可，但没有说出来？',
  远行者: '你最近走了多远？有没有想过回头确认一下那个稳的地方还在？',
  深耕者: '你在慢慢积累的那件事，今天感觉到它在往前走了吗？',
  攀登者: '你在登的这座山，还是你当初选的那座吗？',
}

const DAILY_REC: Record<string, { q: string; event: string }> = {
  独行者: { q: '为什么开口求助，比自己撑着更难？', event: '我想探索：为什么开口求助对我来说那么难' },
  隐光者: { q: '我渴望被看见，但真的被看见了又想消失——这是怎么回事？', event: '我想探索：我对"被认可"这件事真正的感受' },
  潜行者: { q: '做一件没有人关注的事，我真的甘心吗？', event: '我想探索：意义感和外部回应之间哪个更重要' },
  建造者: { q: '我对自己的标准，到底是动力还是枷锁？', event: '我想探索：我用什么衡量"做得够好了"' },
  镜中人: { q: '为什么我总害怕别人失望？', event: '我想探索：我为什么需要持续确认关系还在' },
  拉锯者: { q: '我想要连接，但连接了又想撤——这两件事是怎么回事？', event: '我想探索：我对亲密感的真实想法' },
  燃尽者: { q: '我付出了很多，为什么还是觉得不被看见？', event: '我想探索：我的付出和期待之间发生了什么' },
  证明者: { q: '"够好"对我来说，到底是多好？', event: '我想探索：我不停证明自己的背后是什么在推着我' },
  舞台人: { q: '最里面那个版本的我，是什么样子？', event: '我想探索：当所有版本都放下，剩下的是什么' },
  设局者: { q: '我很擅长设计局面，但有没有什么是我没法设计的？', event: '我想探索：失控的时候我第一个感受是什么' },
  叙事者: { q: '如果这一段经历没有主题，我能接受吗？', event: '我想探索：我为什么需要每件事都有意义' },
  策展人: { q: '有没有一个成就只是属于我自己的？', event: '我想探索：呈现和内心满足之间我更在意哪一个' },
  向阳者: { q: '我不需要认可才能往前走，但我真的不在意吗？', event: '我想探索：我对被认可这件事真正的需求' },
  远行者: { q: '我走得很远，但那个让我有底气出发的地方，我认真感谢过吗？', event: '我想探索：自由和连接对我来说是什么关系' },
  深耕者: { q: '我在积累的这件事，是真的值得，还是我已经习惯了这个节奏？', event: '我想探索：节奏稳和方向对哪个更重要' },
  攀登者: { q: '我爬的这座山，当初为什么选它？', event: '我想探索：我的目标是自己选的还是"应该选的"' },
}

const DEFAULT_OBS = '今天，有没有某件事放在心里没有说出来？'
const DEFAULT_REC = { q: '有什么事最近一直放不下？', event: '我想探索最近放不下的一件事' }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [archetype, setArchetype] = useState('')
  const [hiddenRules, setHiddenRules] = useState<string[]>([])
  const [event, setEvent] = useState('')

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      if (!p.assessmentCompleted) { router.replace('/'); return }
      setArchetype(p.primaryArchetype || '')
      setHiddenRules(p.hiddenRules || [])
    } catch { }
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-screen bg-white" />

  const obs = DAILY_OBS[archetype] || DEFAULT_OBS
  const rec = DAILY_REC[archetype] || DEFAULT_REC

  function startExplore(e: string) {
    if (!e.trim()) return
    router.push(`/explore?event=${encodeURIComponent(e.trim())}`)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 pt-14 pb-28">
      <div className="max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-16">
          <p className="text-[10px] text-neutral-400 tracking-widest">底色</p>
          <p className="text-[10px] text-neutral-300">{archetype}</p>
        </div>

        {/* 今日观察 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-14">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">今天可以留意一下</p>
          <p className="text-sm text-neutral-700 leading-loose whitespace-pre-line">{obs}</p>
        </motion.div>

        <div className="h-px bg-neutral-100 mb-12" />

        {/* 今日推荐 */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
          <p className="text-[10px] text-neutral-400 tracking-widest mb-5">今日推荐</p>
          <button
            onClick={() => startExplore(rec.event)}
            className="w-full text-left border border-neutral-200 px-4 py-5 hover:border-neutral-700 hover:bg-neutral-50 transition-all group"
          >
            <p className="text-sm font-light text-neutral-800 leading-snug mb-2">{rec.q}</p>
            <p className="text-[10px] text-neutral-400 group-hover:text-neutral-600 transition-colors">点击开始 →</p>
          </button>
        </motion.div>

        {/* 最近浮现 */}
        {hiddenRules.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-12">
            <p className="text-[10px] text-neutral-400 tracking-widest mb-5">最近浮现</p>
            <Link href="/base" className="block border-l-2 border-neutral-200 pl-4 hover:border-neutral-600 transition-colors">
              <p className="text-base font-light text-neutral-900 leading-snug">
                {hiddenRules[hiddenRules.length - 1]}
              </p>
            </Link>
          </motion.div>
        )}

        <div className="h-px bg-neutral-100 mb-12" />

        {/* 快速入口 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <p className="text-[10px] text-neutral-400 mb-5">快速开始</p>
          <div className="flex gap-2.5">
            {[
              { label: '关系', event: '我想探索一段关系里让我放不下的事' },
              { label: '工作学业', event: '我想探索工作或学业上的困惑' },
              { label: '自己', event: '我想探索关于自己和未来的问题' },
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

        {/* 自由输入 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <textarea
            value={event}
            onChange={e => setEvent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startExplore(event) }
            }}
            placeholder="或者直接写——最近放不下的一件事……"
            rows={3}
            className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-0 border-b border-neutral-200 py-3 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed"
          />
          {event.trim() && (
            <button
              onClick={() => startExplore(event)}
              className="mt-4 w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              开始探索
            </button>
          )}
        </motion.div>
      </div>
    </main>
  )
}
