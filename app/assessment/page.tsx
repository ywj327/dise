'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { questions } from '@/lib/questions'
import { calculateResult, getCharacter, topSignal, topTwoSignals, ZERO_SIGNALS } from '@/lib/scoring'
import type { Signal, SignalScores } from '@/lib/scoring'

// ─── Reveal content ───────────────────────────────────────────────────────────

type RevealFeedback = 'resonate' | 'partial' | 'no'

const REVEAL1: Record<Signal, { hook: string; heading: string; body: string }> = {
  autonomy: {
    hook: '我好像先看到了一点。',
    heading: '你似乎很在意：\n\n自己始终拥有选择权。',
    body: '很多时候，\n你不是不需要别人。\n\n只是会本能地给自己留一点退路。',
  },
  approval: {
    hook: '有一件事，似乎比结果本身更容易影响你。',
    heading: '别人会怎么看我。',
    body: '有时候，你想把事情做好，\n也可能是在确保：\n\n自己仍然值得被认可。',
  },
  security: {
    hook: '你似乎比自己想象中\n更容易察觉关系里的变化。',
    heading: '真正难受的可能不是变化本身，\n\n而是——\n\n不知道它意味着什么。',
    body: '',
  },
  achievement: {
    hook: '我好像注意到了一件事。',
    heading: '结果对你很重要。\n\n但真正在意的，\n可能不只是做得好不好——',
    body: '而是那些进展，\n能不能证明些什么。',
  },
  control: {
    hook: '我好像注意到了一点。',
    heading: '你似乎很难接受：\n\n事情走向不在自己掌控之内。',
    body: '不是想控制别人，\n\n是没有确定感，\n就没办法真的放下。',
  },
  suppression: {
    hook: '有一件事我好像隐约看到了。',
    heading: '你做很多事，\n可能也在静静地确认：\n\n这件事，真的有意义吗？',
    body: '那个"值不值"的标准，\n比看起来更重要。',
  },
}

const REVEAL2: Record<string, { hook: string; question: string; deeper: string }> = {
  'approval-achievement': {
    hook: '刚才那些看起来完全不同的事，\n好像都碰到了同一个地方。',
    question: '"我做得够不够好，\n\n会不会影响别人怎么看我？"',
    deeper: '有没有一种可能——\n你以为自己只是认真。\n\n但有时候真正努力维持的是：\n"我不能让重要的人失望。"',
  },
  'approval-security': {
    hook: '两件看起来不同的事，\n好像一直在互相影响。',
    question: '"他还在乎我吗？\n我有没有让他失望？"',
    deeper: '有没有一种可能——\n你不是在问关系好不好。\n\n你在问的是：\n我还值不值得被在乎。',
  },
  'autonomy-security': {
    hook: '我好像看到两条线，\n同时在你身上拉扯。',
    question: '"我想保有自己的空间，\n但也需要知道关系是稳的。"',
    deeper: '这两件事同时成立，\n也经常互相干扰。\n\n一边想自由，一边担心失去连接。',
  },
  'autonomy-achievement': {
    hook: '好像有两个东西在同时推着你。',
    question: '"按自己的方式做，\n同时做到让自己满意。"',
    deeper: '但有时候这两件事会冲突——\n自己判断的方向，\n不一定是最快到达结果的路。',
  },
  'security-achievement': {
    hook: '我好像注意到了一件事。',
    question: '"我想在稳定的环境里，\n做出让自己满意的结果。"',
    deeper: '两者都很重要。\n\n但当环境开始不稳定——\n你首先感受到的，\n可能是被抽走了地基。',
  },
  'autonomy-approval': {
    hook: '有两件事好像一直在你身上共存。',
    question: '"我想按自己的方式做，\n但还是希望被理解。"',
    deeper: '有没有一种可能——\n你其实很在意别人的感受，\n只是不太愿意因为这个改变自己。',
  },
}

const REVEAL2_DEFAULT = {
  hook: '刚才那些看起来不同的场景，\n好像都指向了一个相似的地方。',
  question: '"这对我来说，真正重要的是什么？"',
  deeper: '这个问题不一定有标准答案。\n\n但你对每一道题的选择，\n已经开始给出一些线索。',
}

// ─── Feedback buttons ─────────────────────────────────────────────────────────

function FeedbackButtons({ onSelect }: { onSelect: (v: RevealFeedback) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {([['resonate', '很像我'], ['partial', '有一点'], ['no', '不太像我']] as [RevealFeedback, string][]).map(([v, label]) => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className="text-left text-sm text-neutral-700 border border-neutral-200 px-4 py-4 hover:border-neutral-800 hover:bg-neutral-50 transition-all leading-relaxed"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Reveal 1 ────────────────────────────────────────────────────────────────

function Reveal1Screen({ signals, onContinue }: { signals: SignalScores; onContinue: (fb: RevealFeedback) => void }) {
  const top = topSignal(signals)
  const content = REVEAL1[top]
  const [selected, setSelected] = useState<RevealFeedback | null>(null)

  function pick(v: RevealFeedback) {
    setSelected(v)
    setTimeout(() => onContinue(v), v === 'no' ? 1800 : 1200)
  }

  return (
    <div className="min-h-[65vh] flex flex-col justify-center py-8">
      <motion.p className="text-[10px] text-neutral-400 tracking-widest mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        还有一件事。
      </motion.p>
      <motion.p className="text-xs text-neutral-500 mb-8 leading-loose whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {content.hook}
      </motion.p>
      <motion.p className="text-xl font-light text-neutral-900 leading-snug mb-8 whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
        {content.heading}
      </motion.p>
      {content.body ? (
        <motion.p className="text-sm text-neutral-500 leading-loose mb-12 whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}>
          {content.body}
        </motion.p>
      ) : <div className="mb-12" />}
      {!selected ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: content.body ? 3.0 : 2.2 }}>
          <p className="text-xs text-neutral-400 mb-5">这条线索——</p>
          <FeedbackButtons onSelect={pick} />
        </motion.div>
      ) : (
        <motion.p className="text-xs text-neutral-400 italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selected === 'no' ? '记下了。接下来继续看看。' : '好。继续往下走。'}
        </motion.p>
      )}
    </div>
  )
}

// ─── Reveal 2 ────────────────────────────────────────────────────────────────

function Reveal2Screen({ signals, onContinue }: { signals: SignalScores; onContinue: (fb: RevealFeedback) => void }) {
  const [s1, s2] = topTwoSignals(signals)
  const key1 = `${s1}-${s2}`
  const key2 = `${s2}-${s1}`
  const content = REVEAL2[key1] || REVEAL2[key2] || REVEAL2_DEFAULT
  const [selected, setSelected] = useState<RevealFeedback | null>(null)

  function pick(v: RevealFeedback) {
    setSelected(v)
    setTimeout(() => onContinue(v), v === 'no' ? 1800 : 1200)
  }

  return (
    <div className="min-h-[65vh] flex flex-col justify-center py-8">
      <motion.p className="text-[10px] text-neutral-400 tracking-widest mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        还有一件事。
      </motion.p>
      <motion.p className="text-xs text-neutral-500 mb-8 leading-loose whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {content.hook}
      </motion.p>
      <motion.p className="text-xl font-light text-neutral-900 leading-snug mb-8 whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
        {content.question}
      </motion.p>
      <motion.p className="text-sm text-neutral-500 leading-loose mb-12 whitespace-pre-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
        {content.deeper}
      </motion.p>
      {!selected ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4 }}>
          <p className="text-xs text-neutral-400 mb-5">这句话——</p>
          <FeedbackButtons onSelect={pick} />
        </motion.div>
      ) : (
        <motion.p className="text-xs text-neutral-400 italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selected === 'no' ? '记下了。最后几题了。' : '好。快结束了。'}
        </motion.p>
      )}
    </div>
  )
}

// ─── Assessment ───────────────────────────────────────────────────────────────

type Phase = 'question' | 'reveal1' | 'reveal2'

export default function AssessmentPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('question')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [signals, setSignals] = useState<SignalScores>({ ...ZERO_SIGNALS })
  const [done, setDone] = useState(false)

  const total = questions.length
  const q = questions[current]

  function handleAnswer(type: string) {
    const newAnswers = { ...answers, [q.id]: type }
    const newSignals = { ...signals }
    const signalMap: Record<string, Signal> = {
      '回避型': 'autonomy', '焦虑型': 'security', '表演型': 'approval', '安全型': 'security',
      '认可驱动': 'approval', '自主驱动': 'autonomy', '意义驱动': 'achievement', '成就驱动': 'achievement',
      '方向未定型': 'control', '执行卡壳型': 'achievement', '身份过渡型': 'autonomy', '过载运转型': 'control',
      '能力拓展型': 'achievement', '生活方式型': 'autonomy', '影响力型': 'approval', '稳定感型': 'security',
    }
    const sig = signalMap[type]
    if (sig) newSignals[sig]++

    setAnswers(newAnswers)
    setSignals(newSignals)

    const next = current + 1
    if (next === 5) {
      setPhase('reveal1')
    } else if (next === 10) {
      setPhase('reveal2')
    } else if (next >= total) {
      complete(newAnswers, newSignals)
    } else {
      setCurrent(next)
    }
  }

  function complete(finalAnswers: Record<number, string>, finalSignals: SignalScores) {
    const result = calculateResult(finalAnswers)
    const character = getCharacter(result.q1, result.q2)
    setDone(true)
    try {
      const raw = localStorage.getItem('dise_profile') || '{}'
      const existing = JSON.parse(raw)
      const profile = {
        ...existing,
        assessmentCompleted: true,
        assessmentCompletedAt: new Date().toISOString(),
        primaryArchetype: character.name,
        q1: result.q1, q2: result.q2, q3: result.q3, q4: result.q4,
        coreSignals: finalSignals,
        discoveries: existing.discoveries || [],
        hiddenRules: existing.hiddenRules || [],
        needs: existing.needs || [],
        sensitiveAreas: existing.sensitiveAreas || [],
        defensePatterns: existing.defensePatterns || [],
      }
      localStorage.setItem('dise_profile', JSON.stringify(profile))
    } catch { }
    router.push(`/result?q1=${encodeURIComponent(result.q1)}&q2=${encodeURIComponent(result.q2)}&q3=${encodeURIComponent(result.q3)}&q4=${encodeURIComponent(result.q4)}`)
  }

  if (done) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 flex items-center justify-center">
        <p className="text-xs text-neutral-400">正在整理……</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => {
            if (phase === 'reveal1') { setPhase('question'); setCurrent(4) }
            else if (phase === 'reveal2') { setPhase('question'); setCurrent(9) }
            else if (current > 0) { setCurrent(current - 1) }
            else router.back()
          }}
          className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors"
        >
          ← 返回
        </button>
        {phase === 'question' && (
          <p className="text-[10px] text-neutral-300 tracking-widest">
            {String(current + 1).padStart(2, '0')} · {String(total).padStart(2, '0')}
          </p>
        )}
      </div>

      {/* Progress line */}
      {phase === 'question' && (
        <div className="w-full h-px bg-neutral-100 mb-10 relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-neutral-400"
            animate={{ width: `${((current + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'reveal1' && (
          <motion.div key="reveal1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Reveal1Screen
              signals={signals}
              onContinue={() => { setPhase('question'); setCurrent(5) }}
            />
          </motion.div>
        )}

        {phase === 'reveal2' && (
          <motion.div key="reveal2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Reveal2Screen
              signals={signals}
              onContinue={() => { setPhase('question'); setCurrent(10) }}
            />
          </motion.div>
        )}

        {phase === 'question' && q && (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base font-light text-neutral-900 leading-loose mb-10 whitespace-pre-line">
              {q.text}
            </p>
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => (
                <motion.button
                  key={opt.type}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => handleAnswer(opt.type)}
                  className="text-left text-sm text-neutral-700 border border-neutral-200 px-4 py-4 hover:border-neutral-800 hover:text-neutral-900 hover:bg-neutral-50 transition-all leading-relaxed"
                >
                  {opt.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
