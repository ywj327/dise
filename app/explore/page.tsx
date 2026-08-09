'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'question' | 'custom_input' | 'thinking' | 'synthesis_load' | 'emergence' | 'discovery'

interface HistoryEntry { role: 'user' | 'ai'; content: string; stage: string }

interface AiStep {
  reflection: string
  question: string
  options: string[]
  stage: string
  isDomainCheck: boolean
  insightCandidate: string | null
  readyForSynthesis: boolean
  synthesisContext: { emotion: string; behavior: string; need: string; defense: string }
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

interface UserProfile {
  caresAbout?: string
  protection?: string
  rule?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readProfile(): UserProfile | null {
  try {
    const fr = localStorage.getItem('dise_firstReveal')
    if (fr) {
      const p = JSON.parse(fr)
      return { caresAbout: p.caresAbout, protection: p.protection, rule: p.rule }
    }
  } catch { }
  return null
}

function buildContextFromHistory(history: HistoryEntry[], event: string) {
  const byStage: Record<string, string> = {}
  for (const h of history) {
    if (h.role === 'user') byStage[h.stage] = h.content
  }
  return {
    emotion: byStage['locate_pain'] || byStage['understand_event'] || event,
    behavior: byStage['behavior'] || byStage['pattern'] || '',
    need: byStage['need'] || '',
    defense: byStage['rule'] || byStage['pattern'] || byStage['behavior'] || '',
  }
}

function makeFallbackDiscovery(ctx: ReturnType<typeof buildContextFromHistory>): Discovery {
  return {
    experiencing: `你正在经历一种难以明确说清的压力，它和「${ctx.emotion || '某种感受'}」有关`,
    pattern: `当这种感受出现时，你倾向于${ctx.behavior || '某种方式'}来回应——这可能不是第一次了`,
    protecting: `你可能更在意某种内在的稳定感；失去它，会让你感到不安`,
    rule: `「只要${ctx.defense || '维持某种方式'}，事情就还在可控的范围内」`,
    helpedBefore: `这种方式曾经帮你维持了稳定，避免了更多的暴露和摩擦`,
    costNow: `但它也让你习惯性地先压缩自己真正的感受，再去顾及外部`,
    newQuestion: `下一次这种感觉出现时，可以先停一下：我真正需要的是什么？`,
  }
}

// ─── LoadingDots ─────────────────────────────────────────────────────────────

function LoadingDots({ small }: { small?: boolean }) {
  return (
    <div className="flex gap-1.5">
      {[0, 150, 300].map(d => (
        <span
          key={d}
          className={`${small ? 'w-1 h-1' : 'w-1.5 h-1.5'} bg-neutral-300 rounded-full animate-bounce`}
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  )
}

// ─── QuestionStep ─────────────────────────────────────────────────────────────

function QuestionStep({ step, lastChoice, onSelect, onCustom }: {
  step: AiStep
  lastChoice: string
  onSelect: (opt: string) => void
  onCustom: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {lastChoice && (
        <p className="text-xs text-neutral-400 italic mb-4">「{lastChoice}」</p>
      )}

      {step.reflection && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-base font-light text-neutral-900 leading-loose mb-6"
        >
          {step.reflection}
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: step.reflection ? 0.5 : 0.1, duration: 0.5 }}
        className="text-xs text-neutral-500 leading-relaxed"
      >
        {step.question}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-2.5 mt-1"
      >
        {step.options.map((opt, i) => (
          <motion.button
            key={opt}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.07 }}
            onClick={() => onSelect(opt)}
            className="text-left text-sm text-neutral-700 border border-neutral-200 px-4 py-3.5 hover:border-neutral-800 hover:text-neutral-900 hover:bg-neutral-50 transition-all leading-relaxed"
          >
            {opt}
          </motion.button>
        ))}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 + step.options.length * 0.07 }}
          onClick={onCustom}
          className="text-xs text-neutral-400 text-left mt-1 hover:text-neutral-600 transition-colors underline underline-offset-2"
        >
          都不太像，我想自己说
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── CustomInput ──────────────────────────────────────────────────────────────

function CustomInput({ question, lastChoice, onSubmit, onBack }: {
  question: string
  lastChoice: string
  onSubmit: (text: string) => void
  onBack: () => void
}) {
  const [text, setText] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4"
    >
      {lastChoice && <p className="text-xs text-neutral-400 italic mb-1">「{lastChoice}」</p>}
      <p className="text-sm text-neutral-700 leading-relaxed mb-1">{question}</p>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onSubmit(text.trim()) }}
        placeholder="用你自己的话……"
        autoFocus
        className="w-full border-b border-neutral-300 focus:border-neutral-700 py-2 text-sm text-neutral-800 placeholder-neutral-300 outline-none bg-transparent transition-colors"
      />
      <button
        onClick={() => text.trim() && onSubmit(text.trim())}
        disabled={!text.trim()}
        className="w-full border border-neutral-900 text-neutral-900 text-xs tracking-widest py-3 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-30"
      >
        继续
      </button>
      <button onClick={onBack} className="text-xs text-neutral-400 text-center hover:text-neutral-600 transition-colors">← 返回选项</button>
    </motion.div>
  )
}

// ─── EmergenceNode ────────────────────────────────────────────────────────────

function EmergenceNode({ text, onContinue }: { text: string; onContinue: () => void }) {
  const [showText, setShowText] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 900)
    const t2 = setTimeout(() => setShowButton(true), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60vh] flex flex-col justify-center py-8"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="text-xs text-neutral-400 tracking-widest mb-10"
      >
        还有一件事。
      </motion.p>

      {showText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-base text-neutral-900 leading-loose max-w-xs mb-14 font-light"
        >
          {text}
        </motion.p>
      )}

      {showButton && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onContinue}
          className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors underline underline-offset-4 text-left"
        >
          继续往下看看
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── DiscoveryCard ────────────────────────────────────────────────────────────

function DiscoveryCard({ discovery, onSave, onRestart }: {
  discovery: Discovery
  onSave: () => void
  onRestart: () => void
}) {
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

      <section className="mb-10">
        <p className="text-[10px] text-neutral-400 mb-5">一条可能存在很久的规则</p>
        <p className="text-2xl font-light text-neutral-900 leading-snug">{discovery.rule}</p>
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

      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={onSave}
          className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 hover:bg-neutral-700 transition-colors"
        >
          写入我的底色 →
        </button>
        <button
          onClick={onRestart}
          className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 hover:border-neutral-600 hover:text-neutral-800 transition-colors"
        >
          再说一件事
        </button>
      </div>

      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        这不是结论。只是几条值得继续确认的线索。
      </p>
    </motion.div>
  )
}

// ─── ExploreContent ───────────────────────────────────────────────────────────

function ExploreContent() {
  const params = useSearchParams()
  const router = useRouter()
  const event = params.get('event') || ''

  const [phase, setPhase] = useState<Phase>('loading')
  const [aiStep, setAiStep] = useState<AiStep | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastChoice, setLastChoice] = useState('')
  const [emergenceText, setEmergenceText] = useState('')
  const [discovery, setDiscovery] = useState<Discovery | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  function scrollUp() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  async function fetchStep(hist: HistoryEntry[]) {
    try {
      const profile = readProfile()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'dynamic_explore', event, history: hist, userProfile: profile }),
      })
      const data: AiStep = await res.json()
      setAiStep(data)
      setPhase('question')
    } catch {
      setAiStep({
        reflection: '我在听。',
        question: '这件事，最让你放不下的是哪里？',
        options: ['一种说不清的难受', '对关系或事情走向的担心', '对自己的某种怀疑', '失去了掌控感'],
        stage: 'locate_pain',
        isDomainCheck: false,
        insightCandidate: null,
        readyForSynthesis: false,
        synthesisContext: { emotion: '', behavior: '', need: '', defense: '' },
      })
      setPhase('question')
    }
  }

  async function fetchSynthesis(ctx: { emotion: string; behavior: string; need: string; defense: string }) {
    setPhase('synthesis_load')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'discovery', event, ...ctx }),
      })
      const data = await res.json()
      setEmergenceText(data.emergence2 || '有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。')
      setDiscovery(data.discovery ?? makeFallbackDiscovery(ctx))
    } catch {
      setEmergenceText('有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。')
      setDiscovery(makeFallbackDiscovery(ctx))
    }
    setPhase('emergence')
    scrollUp()
  }

  useEffect(() => {
    if (!event) { router.replace('/topics'); return }
    fetchStep([])
  }, [])

  function handleSelect(option: string) {
    if (!aiStep) return
    const newHistory: HistoryEntry[] = [
      ...history,
      { role: 'user', content: option, stage: aiStep.stage },
    ]
    setHistory(newHistory)
    setLastChoice(option)

    const shouldSynthesize = aiStep.readyForSynthesis
    const ctx = shouldSynthesize
      ? (aiStep.synthesisContext?.emotion
          ? aiStep.synthesisContext
          : buildContextFromHistory(newHistory, event))
      : null

    if (shouldSynthesize && ctx) {
      fetchSynthesis(ctx)
    } else if (newHistory.filter(h => h.role === 'user').length >= 7) {
      // Hard cap: force synthesis after 7 turns
      const fallbackCtx = buildContextFromHistory(newHistory, event)
      fetchSynthesis(fallbackCtx)
    } else {
      setPhase('thinking')
      fetchStep(newHistory)
      scrollUp()
    }
  }

  function handleCustomSubmit(text: string) {
    handleSelect(text)
  }

  function handleSave() {
    if (!discovery) return
    try {
      const raw = localStorage.getItem('dise_profile') || '{}'
      const profile = JSON.parse(raw)
      if (!profile.discoveries) profile.discoveries = []
      if (!profile.hiddenRules) profile.hiddenRules = []

      profile.discoveries.push({ date: new Date().toISOString(), event, discovery })
      if (discovery.rule && !profile.hiddenRules.includes(discovery.rule)) {
        profile.hiddenRules.push(discovery.rule)
      }
      localStorage.setItem('dise_profile', JSON.stringify(profile))
    } catch { }
    router.push('/base')

  }

  if (!event) return null

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pb-32">
      <div ref={topRef} className="py-8 flex items-center justify-between">
        <button onClick={() => router.push('/today')} className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors">← 返回</button>
        <span className="text-[10px] text-neutral-300 tracking-widest">底色</span>
      </div>

      {/* Light context reference — only on first turn */}
      {history.length === 0 && (
        <p className="text-[10px] text-neutral-400 leading-relaxed mb-8">
          你刚刚提到 「{event.length > 50 ? event.slice(0, 50) + '…' : event}」
        </p>
      )}

      <AnimatePresence mode="wait">

        {(phase === 'loading') && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
            <LoadingDots />
          </motion.div>
        )}

        {(phase === 'thinking') && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
            <p className="text-xs text-neutral-400 mb-3 italic">「{lastChoice}」</p>
            <LoadingDots />
          </motion.div>
        )}

        {(phase === 'synthesis_load') && (
          <motion.div key="synthesis_load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
            <p className="text-xs text-neutral-400 mb-6 tracking-widest">我在整理思路……</p>
            <LoadingDots />
          </motion.div>
        )}

        {phase === 'question' && aiStep && (
          <motion.div key={`q-${history.length}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuestionStep
              step={aiStep}
              lastChoice={lastChoice}
              onSelect={handleSelect}
              onCustom={() => setPhase('custom_input')}
            />
          </motion.div>
        )}

        {phase === 'custom_input' && aiStep && (
          <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CustomInput
              question={aiStep.question}
              lastChoice={lastChoice}
              onSubmit={handleCustomSubmit}
              onBack={() => setPhase('question')}
            />
          </motion.div>
        )}

        {phase === 'emergence' && (
          <motion.div key="emergence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmergenceNode
              text={emergenceText}
              onContinue={() => { setPhase('discovery'); scrollUp() }}
            />
          </motion.div>
        )}

        {phase === 'discovery' && discovery && (
          <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DiscoveryCard discovery={discovery} onSave={handleSave} onRestart={() => router.push('/topics')} />
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
