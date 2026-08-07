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
  },
  {
    q: '为什么别人一冷淡，我就控制不住地想很多？',
    event: '我想探索：为什么对方一旦冷淡下来，我就会开始想很多，停不下来。',
  },
  {
    q: '我是真的想要现在的人生吗？',
    event: '我最近一直在想：我现在过的生活，真的是我想要的吗？还是我只是顺着走过来的。',
  },
  {
    q: '为什么我总觉得自己落后了？',
    event: '我想搞清楚：为什么我总有一种感觉，觉得自己落后于同龄人，停不下来地焦虑。',
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
        className="text-[10px] text-neutral-400 tracking-widest mb-14"
      >
        想从哪里继续？
      </motion.p>

      {/* Primary entries — Two equal cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col gap-4 mb-14"
      >
        {/* Card 1: Assessment */}
        <Link
          href="/assessment"
          className="block border-2 border-neutral-900 px-6 py-6 hover:bg-neutral-50 transition-colors group"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-light text-neutral-900">测测我的底色</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">约 5 分钟</p>
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed mb-5">
            15 个生活瞬间，找到你的底色原型——<br />
            独行者、隐光者、建造者、攀登者……
          </p>
          <p className="text-[10px] text-neutral-700 tracking-widest group-hover:text-neutral-900 transition-colors">
            开始测试 →
          </p>
        </Link>

        {/* Card 2: Free explore */}
        <div className="border border-neutral-200 px-6 py-6">
          <div className="mb-3">
            <p className="text-sm font-light text-neutral-800">从最近的一件事开始</p>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed mb-5">
            脑子里已经有件反复想的事？
          </p>
          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && freeText.trim()) {
                e.preventDefault()
                startFree()
              }
            }}
            placeholder="说说发生了什么……"
            rows={2}
            className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-b border-neutral-200 pb-2 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed mb-4"
          />
          <button
            onClick={startFree}
            disabled={!freeText.trim()}
            className="w-full border border-neutral-500 text-neutral-600 text-xs tracking-widest py-3 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            开始探索
          </button>
        </div>
      </motion.div>

      {/* 为你推荐 — only if has profile */}
      {recs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-14"
        >
          <p className="text-[10px] text-neutral-400 tracking-widest mb-6">为你推荐</p>
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

      {/* 很多人也在想 — 4 topics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-14"
      >
        <p className="text-[10px] text-neutral-400 tracking-widest mb-6">很多人也在想</p>
        <div className="flex flex-col gap-2.5">
          {HOT_TOPICS.map((topic, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.05 }}
              onClick={() => startTopic(topic.event)}
              className="text-left border border-neutral-200 px-5 py-4 hover:border-neutral-700 transition-all group"
            >
              <p className="text-sm text-neutral-800 leading-relaxed group-hover:text-neutral-900">
                {topic.q}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </main>
  )
}
