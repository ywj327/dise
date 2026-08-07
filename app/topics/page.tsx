'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

// ─── Signal → Personalized Recommendation ────────────────────────────────────

type Signal = 'approval' | 'security' | 'autonomy' | 'control' | 'achievement' | 'suppression'

interface TopicRec {
  q: string
  event: string
  why: string
}

const SIGNAL_RECS: Record<Signal, TopicRec> = {
  security: {
    q: '为什么别人一冷淡，我就控制不住地想很多？',
    event: '我想探索：为什么对方一旦冷淡下来，我就会开始想很多，停不下来。',
    why: '你在第一次显影里，对关系里的变化显得特别敏锐。',
  },
  approval: {
    q: '为什么我总害怕别人失望？',
    event: '我想探索：为什么我总是很害怕让别人失望？这个感觉困扰了我很久。',
    why: '你好像很在意重要的人如何看待你。',
  },
  autonomy: {
    q: '为什么有人越靠近，我越想逃？',
    event: '我想探索：为什么每当一段关系开始变得亲密，我就会不自觉地想要退开。',
    why: '你在第一次显影里，表现出对"保留离开选择"的需要。',
  },
  achievement: {
    q: '如果我不再优秀，我还有什么值得被喜欢？',
    event: '我想探索：我的价值是不是和"优秀"绑得太紧了？如果我不够优秀，我还值得被爱吗？',
    why: '你似乎很难只把失败理解成一次失败。',
  },
  control: {
    q: '为什么我总觉得没有掌控感就很难安心？',
    event: '我想探索：为什么我对"不确定"这么不耐受？为什么没搞清楚原因我就没办法放松？',
    why: '你好像真正难受的不是结果不好，而是没有答案。',
  },
  suppression: {
    q: '为什么我总觉得自己的需要不值得被说出来？',
    event: '我想探索：为什么我总是先压下自己的感受？那些被我"算了"的事，后来去哪了？',
    why: '你压下去的，有时候不只是情绪，还有自己的需要。',
  },
}

// ─── Hot Topics ───────────────────────────────────────────────────────────────

const HOT_TOPICS = [
  {
    q: '为什么我总害怕别人失望？',
    event: '我想探索：为什么我总是很害怕让别人失望？这个感觉困扰了我很久。',
    tags: ['认可', '完美主义'],
  },
  {
    q: '为什么别人一冷淡，我就控制不住地想很多？',
    event: '我想探索：为什么对方一旦冷淡下来，我就会开始想很多，停不下来。',
    tags: ['安全感', '关系'],
  },
  {
    q: '为什么有人越靠近，我越想逃？',
    event: '我想探索：为什么每当一段关系开始变得亲密，我就会不自觉地想要退开。',
    tags: ['亲密', '自主'],
  },
  {
    q: '我是真的想要现在的人生吗？',
    event: '我最近一直在想：我现在过的生活，真的是我想要的吗？还是我只是顺着走过来的。',
    tags: ['意义', '身份'],
  },
  {
    q: '为什么我总觉得自己落后了？',
    event: '我想搞清楚：为什么我总有一种感觉，觉得自己落后于同龄人，停不下来地焦虑。',
    tags: ['比较', '焦虑'],
  },
  {
    q: '如果我不再优秀，我还有什么值得被喜欢？',
    event: '我想探索：我的价值是不是和"优秀"绑得太紧了？如果我不够优秀，我还值得被爱吗？',
    tags: ['自我价值', '认可'],
  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TopicsPage() {
  const router = useRouter()
  const [recs, setRecs] = useState<TopicRec[]>([])
  const [freeText, setFreeText] = useState('')

  useEffect(() => {
    try {
      const fr = localStorage.getItem('dise_firstReveal')
      if (fr) {
        const data = JSON.parse(fr)
        const topSignal: Signal = data.topSignal
        const secondSignal: Signal = data.secondSignal
        const topRec = SIGNAL_RECS[topSignal]
        const secondRec = SIGNAL_RECS[secondSignal]
        const dedupedRecs = [topRec]
        if (secondRec && secondRec.q !== topRec.q) dedupedRecs.push(secondRec)
        setRecs(dedupedRecs)
      }
    } catch { }
  }, [])

  function startTopic(event: string) {
    router.push(`/explore?event=${encodeURIComponent(event)}`)
  }

  function startFree() {
    if (!freeText.trim()) return
    router.push(`/explore?event=${encodeURIComponent(freeText.trim())}`)
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] text-neutral-400 tracking-widest mb-16"
      >
        想从哪里继续？
      </motion.p>

      {/* 为你推荐 */}
      {recs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-14">
          <p className="text-xs text-neutral-400 tracking-widest mb-6">为你推荐</p>
          <div className="flex flex-col gap-3">
            {recs.map((rec, i) => (
              <button
                key={i}
                onClick={() => startTopic(rec.event)}
                className="text-left border border-neutral-200 px-5 py-5 hover:border-neutral-700 transition-all group"
              >
                <p className="text-[10px] text-neutral-400 mb-2 leading-relaxed">{rec.why}</p>
                <p className="text-sm text-neutral-800 leading-relaxed group-hover:text-neutral-900">
                  {rec.q}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 很多人也在想 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
        <p className="text-xs text-neutral-400 tracking-widest mb-6">很多人也在想</p>
        <div className="flex flex-col gap-3">
          {HOT_TOPICS.map((topic, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              onClick={() => startTopic(topic.event)}
              className="text-left border border-neutral-200 px-5 py-5 hover:border-neutral-700 transition-all group"
            >
              <p className="text-sm text-neutral-800 leading-relaxed mb-3 group-hover:text-neutral-900">
                {topic.q}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topic.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-neutral-400 border border-neutral-200 px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 快速认识自己 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-14">
        <p className="text-xs text-neutral-400 tracking-widest mb-6">快速认识自己</p>
        <div className="border border-neutral-200 px-5 py-5">
          <p className="text-sm text-neutral-800 mb-1">底色测试</p>
          <p className="text-[10px] text-neutral-400 mb-4">约 5 分钟</p>
          <p className="text-xs text-neutral-500 leading-relaxed mb-5">
            15 个生活选择，看看你现在更容易被什么驱动、又习惯怎样保护自己。
          </p>
          <Link
            href="/assessment"
            className="block w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-3 text-center hover:bg-neutral-900 hover:text-white transition-colors"
          >
            开始测试
          </Link>
        </div>
      </motion.div>

      {/* 自由输入 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <p className="text-xs text-neutral-400 tracking-widest mb-6">或者，说说你自己的事</p>
        <textarea
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          placeholder="最近发生了什么？"
          rows={3}
          className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-b border-neutral-200 py-3 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed mb-4"
        />
        <button
          onClick={startFree}
          disabled={!freeText.trim()}
          className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          从这件事开始
        </button>
      </motion.div>

    </main>
  )
}
