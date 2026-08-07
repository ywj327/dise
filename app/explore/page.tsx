'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'start' | 'emotion' | 'behavior' | 'emergence1' | 'need' | 'defense' | 'emergence2' | 'discovery'

interface Choices {
  event: string
  emotion: string
  behavior: string
  need: string
  defense: string
}

interface Discovery {
  experiencing: string
  pattern: string
  protecting: string
  rule: string
  helpedBefore: string
  costNow: string
  newQuestion: string
}

const EMOTION_OPTIONS = [
  '觉得自己被否定了',
  '感到被忽视了',
  '害怕让对方失望',
  '觉得失去了控制感',
]
const BEHAVIOR_OPTIONS = [
  '马上解释，想把事情说清楚',
  '先退开，让自己冷静一下',
  '假装没事，继续撑着',
  '反复回想，想找到原因',
]
const NEED_OPTIONS = [
  '被理解和认可',
  '感到安全和稳定',
  '保持自主和控制',
  '被重要的人选择',
]
const DEFENSE_OPTIONS = [
  '做得更好、更努力',
  '减少需要，假装不在乎',
  '提前撤退，不让自己受伤',
  '用解释或道歉来修复关系',
]

// ─── ChoiceCard ─────────────────────────────────────────────────────
function ChoiceCard({ question, options, onSelect, prevChoice }: {
  question: string
  options: string[]
  onSelect: (c: string) => void
  prevChoice?: string
}) {
  const [custom, setCustom] = useState(false)
  const [customText, setCustomText] = useState('')

  if (custom) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        {prevChoice && <p className="text-xs text-neutral-400 italic mb-2">「{prevChoice}」</p>}
        <p className="text-sm text-neutral-600 leading-relaxed mb-2">{question}</p>
        <input
          type="text"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && customText.trim()) onSelect(customText.trim()) }}
          placeholder="用你自己的话……"
          autoFocus
          className="w-full border-b border-neutral-300 focus:border-neutral-700 py-2 text-sm text-neutral-800 placeholder-neutral-300 outline-none bg-transparent transition-colors"
        />
        <button
          onClick={() => customText.trim() && onSelect(customText.trim())}
          disabled={!customText.trim()}
          className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-3 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-30"
        >
          继续
        </button>
        <button onClick={() => setCustom(false)} className="text-xs text-neutral-400 text-center hover:text-neutral-700 transition-colors">← 返回选项</button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
      {prevChoice && <p className="text-xs text-neutral-400 italic mb-1">「{prevChoice}」</p>}
      <p className="text-sm text-neutral-600 leading-relaxed mb-2">{question}</p>
      {options.map((opt, i) => (
        <motion.button
          key={opt}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={() => onSelect(opt)}
          className="text-left text-sm text-neutral-700 border border-neutral-200 px-4 py-3.5 hover:border-neutral-800 hover:text-neutral-900 hover:bg-neutral-50 transition-all leading-relaxed"
        >
          {opt}
        </motion.button>
      ))}
      <button
        onClick={() => setCustom(true)}
        className="text-xs text-neutral-400 text-left mt-1 hover:text-neutral-700 transition-colors underline underline-offset-2"
      >
        都不是，我自己说
      </button>
    </motion.div>
  )
}

// ─── EmergenceNode ──────────────────────────────────────────────────
function EmergenceNode({ opener, text, loading, onContinue, disabled }: {
  opener: string
  text: string
  loading: boolean
  onContinue: () => void
  disabled?: boolean
}) {
  const [showInsight, setShowInsight] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    setShowInsight(false)
    setShowButton(false)
    if (!loading && text) {
      const t1 = setTimeout(() => setShowInsight(true), 1000)
      const t2 = setTimeout(() => setShowButton(true), 2600)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [loading, text])

  return (
    <div className="min-h-[65vh] flex flex-col justify-center py-8">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-xs text-neutral-400 tracking-widest mb-10"
      >
        {loading ? '……' : opener}
      </motion.p>

      {loading && (
        <div className="flex gap-1.5 mb-10">
          {[0, 150, 300].map(d => (
            <span key={d} className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showInsight && text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-base text-neutral-900 leading-loose max-w-xs mb-14 font-light"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showButton && !loading && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => !disabled && onContinue()}
            disabled={disabled}
            className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors underline underline-offset-4 disabled:cursor-wait disabled:opacity-40 text-left"
          >
            {disabled ? '稍等一下……' : '继续往下看看'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── DiscoveryCard ──────────────────────────────────────────────────
function DiscoveryCard({ discovery, onSave }: { discovery: Discovery; onSave: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <p className="text-[10px] text-neutral-400 tracking-widest mb-10">本次发现</p>

      <section className="mb-8">
        <p className="text-[10px] text-neutral-400 mb-2">你正在经历</p>
        <p className="text-sm text-neutral-700 leading-relaxed">{discovery.experiencing}</p>
      </section>

      <div className="h-px bg-neutral-100 mb-8" />

      <section className="mb-8">
        <p className="text-[10px] text-neutral-400 mb-2">我注意到的模式</p>
        <p className="text-sm text-neutral-700 leading-relaxed">{discovery.pattern}</p>
      </section>

      <div className="h-px bg-neutral-100 mb-8" />

      <section className="mb-8">
        <p className="text-[10px] text-neutral-400 mb-2">你可能在保护什么</p>
        <p className="text-sm text-neutral-700 leading-relaxed">{discovery.protecting}</p>
      </section>

      <div className="h-px bg-neutral-100 mb-10" />

      {/* 隐形规则 - 视觉突出 */}
      <section className="mb-10">
        <p className="text-[10px] text-neutral-400 mb-5">一条可能存在很久的规则</p>
        <p className="text-2xl font-light text-neutral-900 leading-snug">
          {discovery.rule}
        </p>
      </section>

      <div className="h-px bg-neutral-100 mb-8" />

      <section className="mb-6">
        <p className="text-[10px] text-neutral-400 mb-2">它曾经怎样帮助你</p>
        <p className="text-sm text-neutral-500 leading-relaxed">{discovery.helpedBefore}</p>
      </section>

      <section className="mb-10">
        <p className="text-[10px] text-neutral-400 mb-2">它现在可能让你付出的代价</p>
        <p className="text-sm text-neutral-500 leading-relaxed">{discovery.costNow}</p>
      </section>

      <div className="h-px bg-neutral-100 mb-10" />

      <section className="mb-14">
        <p className="text-[10px] text-neutral-400 mb-4">一个新的问题</p>
        <p className="text-sm text-neutral-800 leading-relaxed">{discovery.newQuestion}</p>
      </section>

      <button
        onClick={onSave}
        className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-4 hover:bg-neutral-900 hover:text-white transition-colors mb-4"
      >
        写入我的底色
      </button>
      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        这不是关于你的结论。<br />只是几条值得继续确认的线索。
      </p>
    </motion.div>
  )
}

// ─── ExploreContent ─────────────────────────────────────────────────
function ExploreContent() {
  const params = useSearchParams()
  const router = useRouter()
  const initialEvent = params.get('event') || ''

  const [phase, setPhase] = useState<Phase>('start')
  const [choices, setChoices] = useState<Choices>({ event: initialEvent, emotion: '', behavior: '', need: '', defense: '' })
  const [emergence1Text, setEmergence1Text] = useState('')
  const [emergence1Loading, setEmergence1Loading] = useState(false)
  const [emergence2Text, setEmergence2Text] = useState('')
  const [emergence2Loading, setEmergence2Loading] = useState(false)
  const [discovery, setDiscovery] = useState<Discovery | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  function scrollUp() { setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) }

  async function fetchEmergence1(emotion: string, behavior: string) {
    setEmergence1Loading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'emergence', event: initialEvent, emotion, behavior }),
      })
      const data = await res.json()
      setEmergence1Text(data.text || '当某种感受一再出现，它不是偶然。它在说一件事，只是你还没听清楚。')
    } catch {
      setEmergence1Text('当某种感受一再出现，它不是偶然。它在说一件事，只是你还没听清楚。')
    }
    setEmergence1Loading(false)
  }

  async function fetchDiscovery(need: string, defense: string, emotion: string, behavior: string) {
    setEmergence2Loading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'discovery', event: initialEvent, emotion, behavior, need, defense }),
      })
      const data = await res.json()
      setEmergence2Text(data.emergence2 || '有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。')
      setDiscovery(data.discovery || null)
    } catch {
      setEmergence2Text('有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。')
    }
    setEmergence2Loading(false)
  }

  function handleEmotionSelect(emotion: string) {
    setChoices(p => ({ ...p, emotion }))
    setPhase('behavior')
    scrollUp()
  }

  function handleBehaviorSelect(behavior: string) {
    const updated = { ...choices, behavior }
    setChoices(updated)
    fetchEmergence1(choices.emotion, behavior)
    setPhase('emergence1')
    scrollUp()
  }

  function handleNeedSelect(need: string) {
    setChoices(p => ({ ...p, need }))
    setPhase('defense')
    scrollUp()
  }

  function handleDefenseSelect(defense: string) {
    const updated = { ...choices, defense }
    setChoices(updated)
    fetchDiscovery(choices.need, defense, choices.emotion, choices.behavior)
    setPhase('emergence2')
    scrollUp()
  }

  function handleSave() {
    if (!discovery) return
    const raw = localStorage.getItem('dise_profile') || '{}'
    const profile = JSON.parse(raw)
    if (!profile.discoveries) profile.discoveries = []
    if (!profile.needs) profile.needs = []
    if (!profile.sensitiveAreas) profile.sensitiveAreas = []
    if (!profile.defensePatterns) profile.defensePatterns = []
    if (!profile.hiddenRules) profile.hiddenRules = []

    profile.discoveries.push({ date: new Date().toISOString(), event: initialEvent, choices, discovery })
    if (choices.need && !profile.needs.includes(choices.need)) profile.needs.push(choices.need)
    if (choices.emotion && !profile.sensitiveAreas.includes(choices.emotion)) profile.sensitiveAreas.push(choices.emotion)
    if (choices.defense && !profile.defensePatterns.includes(choices.defense)) profile.defensePatterns.push(choices.defense)
    if (discovery.rule && !profile.hiddenRules.includes(discovery.rule)) profile.hiddenRules.push(discovery.rule)

    localStorage.setItem('dise_profile', JSON.stringify(profile))
    router.push('/profile')
  }

  if (!initialEvent) { router.replace('/'); return null }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pb-32">
      <div ref={topRef} className="py-8 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors">← 返回</button>
        <span className="text-[10px] text-neutral-300 tracking-widest">底色</span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── START ── */}
        {phase === 'start' && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col gap-6">
            <div className="flex justify-end">
              <p className="text-sm text-neutral-800 bg-neutral-100 px-4 py-3 leading-relaxed max-w-[88%]">{initialEvent}</p>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-neutral-500">
              先停在这里一秒。
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-col gap-2.5 mt-2">
              {[
                '说说当时的感受',
                '说说你当时的反应',
                '说说这件事为什么放不下',
              ].map((label, i) => (
                <button
                  key={i}
                  onClick={() => { setPhase('emotion'); scrollUp() }}
                  className="text-left text-sm text-neutral-600 border border-neutral-200 px-4 py-3.5 hover:border-neutral-700 hover:text-neutral-900 transition-all leading-relaxed"
                >
                  {label}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── EMOTION ── */}
        {phase === 'emotion' && (
          <motion.div key="emotion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ChoiceCard
              question="那一刻，最让你难受的是什么？"
              options={EMOTION_OPTIONS}
              onSelect={handleEmotionSelect}
            />
          </motion.div>
        )}

        {/* ── BEHAVIOR ── */}
        {phase === 'behavior' && (
          <motion.div key="behavior" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ChoiceCard
              question="之后你更容易做什么？"
              options={BEHAVIOR_OPTIONS}
              onSelect={handleBehaviorSelect}
              prevChoice={choices.emotion}
            />
          </motion.div>
        )}

        {/* ── 底色浮现 #1 ── */}
        {phase === 'emergence1' && (
          <motion.div key="emergence1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmergenceNode
              opener="我好像看到了一条线。"
              text={emergence1Text}
              loading={emergence1Loading}
              onContinue={() => { setPhase('need'); scrollUp() }}
            />
          </motion.div>
        )}

        {/* ── NEED ── */}
        {phase === 'need' && (
          <motion.div key="need" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ChoiceCard
              question="在这件事里，你真正需要的是什么？"
              options={NEED_OPTIONS}
              onSelect={handleNeedSelect}
            />
          </motion.div>
        )}

        {/* ── DEFENSE ── */}
        {phase === 'defense' && (
          <motion.div key="defense" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ChoiceCard
              question="为了保护自己，你通常会怎么做？"
              options={DEFENSE_OPTIONS}
              onSelect={handleDefenseSelect}
              prevChoice={choices.need}
            />
          </motion.div>
        )}

        {/* ── 底色浮现 #2 ── */}
        {phase === 'emergence2' && (
          <motion.div key="emergence2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmergenceNode
              opener="还有一件事。"
              text={emergence2Text}
              loading={emergence2Loading}
              disabled={!discovery}
              onContinue={() => { if (discovery) { setPhase('discovery'); scrollUp() } }}
            />
          </motion.div>
        )}

        {/* ── DISCOVERY ── */}
        {phase === 'discovery' && discovery && (
          <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DiscoveryCard discovery={discovery} onSave={handleSave} />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  )
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  )
}
