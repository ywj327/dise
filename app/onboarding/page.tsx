'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

type Signal = 'approval' | 'security' | 'autonomy' | 'control' | 'achievement' | 'suppression'
type SignalScores = Record<Signal, number>
type Phase =
  | 'scene1' | 'scene2' | 'scene3'
  | 'emergence1'
  | 'scene4' | 'scene5' | 'scene6'
  | 'emergence2'
  | 'result'
  | 'invite'

interface SceneChoice { text: string; signals: Partial<SignalScores> }
interface SceneDef { id: number; phase: Phase; situation: string; question: string; choices: SceneChoice[] }
interface EmergenceLine { text: string; style?: 'normal' | 'large' | 'heading' }

// ─── Scene Data ───────────────────────────────────────────────────────────────

const SCENES: SceneDef[] = [
  {
    id: 1, phase: 'scene1',
    situation: '你发了一大段消息。\n\n过了一会儿，\n对方只回了一个：\n\n"嗯。"',
    question: '你更接近——',
    choices: [
      { text: '算了，不想再说了。', signals: { suppression: 1, autonomy: 1 } },
      { text: '开始想，是不是自己哪里说错了。', signals: { approval: 1, security: 1 } },
      { text: '很想马上确认他到底什么意思。', signals: { control: 1, security: 1 } },
      { text: '表面没事，但之后会明显冷下来。', signals: { suppression: 1, autonomy: 1 } },
    ],
  },
  {
    id: 2, phase: 'scene2',
    situation: '你认真准备了很久的一件事，\n最后结果并不好。',
    question: '你的第一反应更接近——',
    choices: [
      { text: '先想哪里出了问题，赶紧补回来。', signals: { achievement: 1, control: 1 } },
      { text: '会有点怀疑自己是不是没有想象中那么好。', signals: { achievement: 1, approval: 1 } },
      { text: '很烦，暂时不想再碰这件事。', signals: { suppression: 1 } },
      { text: '更在意别人会不会因此觉得我不行。', signals: { approval: 1, achievement: 1 } },
    ],
  },
  {
    id: 3, phase: 'scene3',
    situation: '一个你很在意的人，\n最近明显没有以前主动。',
    question: '你更容易——',
    choices: [
      { text: '我也会慢慢变冷。', signals: { autonomy: 1, suppression: 1 } },
      { text: '开始回想最近是不是发生了什么。', signals: { security: 1, control: 1 } },
      { text: '很想直接确认他到底怎么了。', signals: { security: 1, control: 1 } },
      { text: '告诉自己没关系，但还是会注意他的反应。', signals: { security: 1, suppression: 1 } },
    ],
  },
  {
    id: 4, phase: 'scene4',
    situation: '领导看完你的方案，\n只说了一句：\n\n"再想想。"',
    question: '你更容易——',
    choices: [
      { text: '马上开始想怎么改。', signals: { achievement: 1, control: 1 } },
      { text: '很想知道他到底哪里不满意。', signals: { security: 1, control: 1 } },
      { text: '会有点怀疑是不是自己能力不够。', signals: { achievement: 1, approval: 1 } },
      { text: '觉得只是正常反馈，不会想太多。', signals: { autonomy: 1 } },
    ],
  },
  {
    id: 5, phase: 'scene5',
    situation: '你做了一个自己其实很满意的决定，\n但家里人明显不赞同。',
    question: '最刺你的更可能是——',
    choices: [
      { text: '他们为什么不能理解我。', signals: { autonomy: 1 } },
      { text: '我明明知道不用管，但还是会受到影响。', signals: { approval: 1, suppression: 1 } },
      { text: '会忍不住想自己是不是确实选错了。', signals: { approval: 1, achievement: 1 } },
      { text: '最不舒服的是他们想替我决定。', signals: { autonomy: 1 } },
    ],
  },
  {
    id: 6, phase: 'scene6',
    situation: '突然有完整的一天：\n没人找你，\n没有工作，\n也没有必须完成的事情。',
    question: '你更接近——',
    choices: [
      { text: '终于可以彻底放空。', signals: { autonomy: 1 } },
      { text: '很难真的休息，总觉得应该做点什么。', signals: { achievement: 1, control: 1 } },
      { text: '会开始想自己最近到底在干什么。', signals: { achievement: 1, control: 1 } },
      { text: '如果很久没人找我，会有一点空。', signals: { security: 1, approval: 1 } },
    ],
  },
]

const SCENE_PHASES: Phase[] = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6']
const EMPTY_SCORES: SignalScores = { approval: 0, security: 0, autonomy: 0, control: 0, achievement: 0, suppression: 0 }

function addSignals(current: SignalScores, delta: Partial<SignalScores>): SignalScores {
  const next = { ...current }
  for (const [k, v] of Object.entries(delta) as [Signal, number][]) next[k] += v
  return next
}

function topTwo(scores: SignalScores): [Signal, Signal] {
  const sorted = (Object.entries(scores) as [Signal, number][])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return [sorted[0][0], sorted[1][0]]
}

// ─── Reveal 1 Content (6 variants by topSignal) ───────────────────────────────

const REVEAL1: Record<Signal, EmergenceLine[]> = {
  approval: [
    { text: '我好像先看到了一点。', style: 'heading' },
    { text: '当别人突然没有给你\n期待中的回应时，\n\n你似乎很容易开始确认：\n\n是不是我哪里做得不够好。' },
    { text: '你在意的\n可能不只是事情本身。' },
    { text: '还有——\n我在对方眼里，\n还是不是那个\n值得认可的人。', style: 'large' },
  ],
  security: [
    { text: '我好像看到了一条线。', style: 'heading' },
    { text: '你似乎对关系里的变化\n非常敏锐。\n\n一个语气、一次没回复、\n一点点不同，\n\n你都会比自己想象得\n更早察觉。' },
    { text: '真正让你难受的，\n可能不是冷淡本身——' },
    { text: '而是不知道\n这意味着什么。', style: 'large' },
  ],
  autonomy: [
    { text: '你好像很习惯一个动作。', style: 'heading' },
    { text: '当关系、期待或者情绪\n开始变得太靠近时，\n\n你会先给自己\n留一点距离。' },
    { text: '你保护的\n可能不是冷静。\n\n而是：' },
    { text: '我始终还有\n离开的选择。', style: 'large' },
  ],
  control: [
    { text: '你似乎不太怕答案不好。', style: 'heading' },
    { text: '真正让你难受的，\n可能是：\n\n没有答案。' },
    { text: '很多时候，你会通过\n分析、确认、补救，\n\n把事情重新变得\n可预测。', style: 'large' },
  ],
  achievement: [
    { text: '你好像很难只把失败\n理解成一次失败。', style: 'heading' },
    { text: '一件事情没做好以后，\n\n你很容易继续问：' },
    { text: '这是不是说明\n我其实没有那么好？', style: 'large' },
  ],
  suppression: [
    { text: '有些事情\n你不是没有感觉。', style: 'heading' },
    { text: '只是你似乎很擅长\n告诉自己：\n\n算了。\n没事。\n不重要。' },
    { text: '你压下去的，\n有时候不只是情绪。\n\n还有自己的需要。', style: 'large' },
  ],
}

// ─── Reveal 2 Content (by top2 combo key) ────────────────────────────────────

const REVEAL2_MAP: Partial<Record<string, EmergenceLine[]>> = {
  'approval_achievement': [
    { text: '刚才这些事情\n看起来并不一样。' },
    { text: '关系。\n工作。\n别人的评价。', style: 'heading' },
    { text: '但它们好像\n都在碰同一个地方。' },
    { text: '我做得够不够好，\n会不会改变别人\n怎么看我？', style: 'large' },
    { text: '有没有一种可能——\n\n你以为自己只是\n对很多事情比较认真。\n\n但你努力维持的，\n有时候是：\n\n「我不能让重要的人失望。」' },
  ],
  'achievement_approval': [
    { text: '你好像很难对自己的表现\n感到真正满意。' },
    { text: '很多时候\n不是结果不够好，\n而是——' },
    { text: '如果不够好，\n是不是意味着\n我本身也不够好？', style: 'large' },
    { text: '有没有一种可能——\n\n做得足够好，\n才有资格被真正喜欢。' },
  ],
  'security_control': [
    { text: '你似乎很擅长\n捕捉变化。' },
    { text: '真正让你进入\n反复思考的，\n往往不是坏结果，\n而是：' },
    { text: '我还不知道\n结果会是什么。', style: 'large' },
    { text: '有没有一种可能——\n\n只要我能\n早点发现变化，\n就不会突然失去什么。' },
  ],
  'control_security': [
    { text: '你不太擅长等待。' },
    { text: '更准确地说，\n是不太擅长\n忍受不确定。' },
    { text: '当事情进入模糊地带，\n你会更快想要把它\n变得清晰——\n\n哪怕答案不好，\n也好过什么都不知道。', style: 'large' },
  ],
  'autonomy_suppression': [
    { text: '你很少直接说：\n「我需要你。」' },
    { text: '更多时候，\n当需要开始变强时，\n\n你反而会\n往后退一点。' },
    { text: '只要我不那么需要别人，\n我就不会\n失去主动权。', style: 'large' },
  ],
  'suppression_autonomy': [
    { text: '有些时候，\n你知道自己\n其实是有感觉的。' },
    { text: '但你告诉自己：\n现在不是时候。' },
    { text: '于是慢慢地，\n感觉被压成了一个习惯——\n\n让距离代替需要说话。', style: 'large' },
  ],
  'approval_suppression': [
    { text: '你不太容易直接说：\n「我需要这件事\n带来的认可。」' },
    { text: '更多时候，\n你把这种需要\n包裹成另一个形式：' },
    { text: '我只是想把事情做好。\n让别人不会\n因我而失望。', style: 'large' },
  ],
  'autonomy_control': [
    { text: '你好像习惯用控制\n来保护自己的边界。' },
    { text: '当你感觉对某件事\n失去掌控时，\n\n不确定本身\n比结果更让你不安。' },
    { text: '因为不确定意味着：\n我不再是\n主动的那一个。', style: 'large' },
  ],
  'security_approval': [
    { text: '你好像很难\n对关系里的"冷"\n真正无动于衷。' },
    { text: '你会问自己：\n他还在意吗？\n还是我哪里出了问题？' },
    { text: '真正让你不安的，\n可能是两件事\n同时发生：\n\n关系变了，\n而你也开始\n怀疑自己。', style: 'large' },
  ],
  'achievement_control': [
    { text: '你似乎不太能接受\n「结果不在掌控中」\n这件事。' },
    { text: '不是怕失败本身，\n而是：\n\n失败发生了\n我还没搞清楚为什么。' },
    { text: '有没有一种可能——\n\n只要能搞清楚\n哪里出了问题，\n下次就还有机会。', style: 'large' },
  ],
}

const REVEAL2_FALLBACK: EmergenceLine[] = [
  { text: '刚才这几个场景\n看起来属于不同的领域。' },
  { text: '关系。\n工作。\n家人的评价。', style: 'heading' },
  { text: '但你对它们的反应，\n好像都有一条相似的线。' },
  { text: '你可能比自己以为的\n更早感知到变化——\n\n也更习惯用某种方式，\n让自己不至于太暴露。', style: 'large' },
]

// ─── Result Section Content ──────────────────────────────────────────────────

const CARES_ABOUT: Record<Signal, string> = {
  approval: '重要的人如何看待你。',
  security: '关系是否仍然稳定。',
  autonomy: '自己是否仍然拥有选择权。',
  control: '事情是否在可预测范围内。',
  achievement: '自己的表现是否足够好。',
  suppression: '内心的需要是否被看见。',
}

const PROTECTION: Record<Signal, string> = {
  approval: '把需要表达成「只是想把事情做好」。',
  security: '不断回想，寻找关系变化的早期信号。',
  autonomy: '在真正受伤以前先退一点。',
  control: '快速寻找原因，让不确定变得可预测。',
  achievement: '把事情做得更好、更完美。',
  suppression: '先把需要压下去。',
}

const COMBO_RULES: Partial<Record<string, string>> = {
  'approval_achievement': '「我不能让重要的人失望。」',
  'achievement_approval': '「做得足够好，我才有资格被肯定。」',
  'security_control': '「只要我能早点发现变化，就不会突然失去什么。」',
  'control_security': '「只要我搞清楚了，就能应对它。」',
  'autonomy_suppression': '「只要我不那么需要别人，我就不会失去主动权。」',
  'suppression_autonomy': '「我的需要可以先放着，等以后再说。」',
  'approval_suppression': '「我的情绪不要给别人添麻烦。」',
  'autonomy_control': '「只有我自己掌握选择，我才是安全的。」',
  'security_approval': '「只要我在乎的人还认可我，我就是安全的。」',
  'achievement_control': '「把结果掌握好，才不会突然失控。」',
  'suppression_approval': '「我的需要先收起来，不让别人失望更重要。」',
  'control_achievement': '「只要能搞清楚原因，下次就还有机会。」',
}

const FALLBACK_RULE = '「我需要先确保事情在控制之内，才能真正放松。」'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((l, i, arr) => (
        <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
      ))}
    </>
  )
}

// ─── SceneView ───────────────────────────────────────────────────────────────

function SceneView({ scene, onSelect, filledDots }: {
  scene: SceneDef
  onSelect: (c: SceneChoice) => void
  filledDots: number
}) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-32 max-w-lg mx-auto">
      <div className="flex gap-2 mb-14">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i < filledDots ? 'bg-neutral-500' : 'bg-neutral-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-base font-light text-neutral-900 leading-loose mb-12"
        >
          <Lines text={scene.situation} />
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}>
          <p className="text-xs text-neutral-400 mb-4">{scene.question}</p>
          <div className="flex flex-col gap-2.5">
            {scene.choices.map((choice, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={() => onSelect(choice)}
                className="text-left text-sm text-neutral-700 border border-neutral-200 px-4 py-4 hover:border-neutral-800 hover:text-neutral-900 hover:bg-neutral-50 transition-all leading-relaxed"
              >
                {choice.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── EmergenceView ───────────────────────────────────────────────────────────

const LINE_DELAYS = [700, 2600, 5000, 7400, 9900]

function EmergenceView({ lines, opts, denialMsg, onAdvance }: {
  lines: EmergenceLine[]
  opts: [string, string, string]
  denialMsg: string
  onAdvance: (feedback: string) => void
}) {
  const [visible, setVisible] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    setVisible(0)
    setShowFeedback(false)
    setDenied(false)
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisible(v => Math.max(v, i + 1)), LINE_DELAYS[i] ?? (i * 2400 + 700))
    )
    const lastDelay = LINE_DELAYS[Math.min(lines.length - 1, LINE_DELAYS.length - 1)]
    const fbTimer = setTimeout(() => setShowFeedback(true), lastDelay + 1800)
    return () => { timers.forEach(clearTimeout); clearTimeout(fbTimer) }
  }, [])

  function handleClick(label: string, isDenial: boolean) {
    if (isDenial) {
      setDenied(true)
      setTimeout(() => onAdvance(label), 1800)
    } else {
      onAdvance(label)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-8 pt-20 pb-24 max-w-xs mx-auto">
      {lines.map((line, i) =>
        visible > i ? (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            className={`mb-7 leading-loose ${
              line.style === 'large'
                ? 'text-xl font-light text-neutral-900'
                : line.style === 'heading'
                ? 'text-xs text-neutral-400 tracking-wider'
                : 'text-sm text-neutral-600 font-light'
            }`}
          >
            <Lines text={line.text} />
          </motion.p>
        ) : null
      )}

      {showFeedback && !denied && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="flex gap-6 mt-8 flex-wrap">
          {opts.map((label, i) => (
            <button
              key={label}
              onClick={() => handleClick(label, i === 2)}
              className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors underline underline-offset-4"
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}

      {denied && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-xs text-neutral-500 leading-loose"
        >
          {denialMsg}
        </motion.p>
      )}
    </div>
  )
}

// ─── ResultView ──────────────────────────────────────────────────────────────

function ResultView({ top, second, reveal2Denied, onContinue }: {
  top: Signal
  second: Signal
  reveal2Denied: boolean
  onContinue: () => void
}) {
  const comboKey = `${top}_${second}`
  const caresAbout = CARES_ABOUT[top]
  const protection = PROTECTION[second]
  const rule = COMBO_RULES[comboKey] || FALLBACK_RULE

  const [step, setStep] = useState(0)

  useEffect(() => {
    const delays = [500, 1900, 3500, 5400]
    const timers = delays.map((d, i) => setTimeout(() => setStep(s => Math.max(s, i + 1)), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-32 max-w-lg mx-auto">
      {step >= 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-neutral-400 tracking-widest mb-14">
          目前，我们看到的你
        </motion.p>
      )}

      <div className="flex flex-col gap-10 mb-14">
        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex gap-4">
            <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">01</span>
            <div>
              <p className="text-[10px] text-neutral-400 mb-2">你比较在意什么</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{caresAbout}</p>
            </div>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex gap-4">
            <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">02</span>
            <div>
              <p className="text-[10px] text-neutral-400 mb-2">你习惯怎样保护自己</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{protection}</p>
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex gap-4">
            <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">03</span>
            <div>
              <p className="text-[10px] text-neutral-400 mb-3">一条值得继续确认的规则</p>
              <p className="text-xl font-light text-neutral-900 leading-snug">{rule}</p>
              {reveal2Denied && (
                <p className="text-[10px] text-neutral-300 mt-2">（你还没有确认这条线索）</p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {step >= 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] text-neutral-400 leading-relaxed mb-8">
            目前只看见了一小部分。<br />每一次真实探索，都会让这张地图多一点细节。
          </p>
          <button
            onClick={onContinue}
            className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors underline underline-offset-4"
          >
            继续往下
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ─── InviteView ───────────────────────────────────────────────────────────────

function InviteView({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-32 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <p className="text-sm text-neutral-500 leading-relaxed mb-2">
          选择题能看到一些模式。
        </p>
        <p className="text-base font-light text-neutral-900 leading-loose mb-14">
          但真正属于你的部分，<br />通常藏在真实发生过的事情里。
        </p>

        <p className="text-xs text-neutral-400 mb-4 leading-loose">
          最近有没有一个瞬间，让你突然觉得：<br />
          <span className="text-neutral-600">&ldquo;为什么我又这样了？&rdquo;</span>
        </p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="可以是一段关系、一次反应、一种说不清的感觉……"
          rows={4}
          className="w-full text-sm text-neutral-800 placeholder-neutral-300 bg-transparent border-b border-neutral-200 py-3 outline-none focus:border-neutral-600 transition-colors resize-none leading-relaxed mb-8"
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            className="w-full bg-neutral-900 text-white text-xs tracking-widest py-4 hover:bg-neutral-700 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            从这件事继续往下看
          </button>
          <button
            onClick={() => onSubmit('')}
            className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-4 hover:border-neutral-700 hover:text-neutral-800 transition-colors"
          >
            先看看我的底色
          </button>
        </div>

        <p className="text-[10px] text-neutral-300 text-center mt-8 leading-relaxed">
          不用讲完整的故事。一句话就够。
        </p>
      </motion.div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('scene1')
  const [signals, setSignals] = useState<SignalScores>(EMPTY_SCORES)
  const [topSignal1, setTopSignal1] = useState<Signal>('approval')
  const [topSignal2, setTopSignal2] = useState<Signal>('approval')
  const [secondSignal, setSecondSignal] = useState<Signal>('security')
  const [reveal1Feedback, setReveal1Feedback] = useState('')
  const [reveal2Feedback, setReveal2Feedback] = useState('')
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('dise_onboarded') === 'true') {
      router.replace('/')
    }
  }, [])

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  function handleSceneSelect(sceneId: number, choice: SceneChoice) {
    const newSignals = addSignals(signals, choice.signals)
    setSignals(newSignals)

    if (sceneId === 3) {
      const [top] = topTwo(newSignals)
      setTopSignal1(top)
      setPhase('emergence1')
    } else if (sceneId === 6) {
      const [top, second] = topTwo(newSignals)
      setTopSignal2(top)
      setSecondSignal(second)
      setPhase('emergence2')
    } else {
      const idx = SCENE_PHASES.indexOf(`scene${sceneId}` as Phase)
      setPhase(SCENE_PHASES[idx + 1] ?? 'result')
    }
    scrollTop()
  }

  function handleReveal1Advance(feedback: string) {
    setReveal1Feedback(feedback)
    setPhase('scene4')
    scrollTop()
  }

  function handleReveal2Advance(feedback: string) {
    setReveal2Feedback(feedback)
    setPhase('result')
    scrollTop()
  }

  function handleInviteSubmit(text: string) {
    const comboKey = `${topSignal2}_${secondSignal}`
    const rule = COMBO_RULES[comboKey] || FALLBACK_RULE
    const caresAbout = CARES_ABOUT[topSignal2]
    const protection = PROTECTION[secondSignal]

    const firstRevealData = {
      completed: true,
      signals,
      topSignal: topSignal2,
      secondSignal,
      caresAbout,
      protection,
      rule,
      reveal1Feedback,
      reveal2Feedback,
      ruleConfidence: reveal2Feedback === '不像我' ? 'unconfirmed' : 'confirmed',
    }

    try {
      localStorage.setItem('dise_firstReveal', JSON.stringify(firstRevealData))
      const profile = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      if (!profile.hiddenRules) profile.hiddenRules = []
      if (!profile.hiddenRules.includes(rule)) profile.hiddenRules.push(rule)
      localStorage.setItem('dise_profile', JSON.stringify(profile))
    } catch { /* ignore */ }

    localStorage.setItem('dise_onboarded', 'true')

    if (text) {
      router.push(`/explore?event=${encodeURIComponent(text)}`)
    } else {
      router.push('/profile')
    }
  }

  const currentScene = SCENES.find(s => s.phase === phase)
  const sceneIdx = SCENE_PHASES.indexOf(phase)
  const filledDots = sceneIdx >= 0 ? sceneIdx + 1 : 0
  const reveal2Denied = reveal2Feedback === '不像我'

  const reveal2Lines = REVEAL2_MAP[`${topSignal2}_${secondSignal}`] || REVEAL2_FALLBACK

  return (
    <div ref={topRef} className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentScene && (
          <motion.div
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
          >
            <SceneView
              scene={currentScene}
              onSelect={c => handleSceneSelect(currentScene.id, c)}
              filledDots={filledDots}
            />
          </motion.div>
        )}

        {phase === 'emergence1' && (
          <motion.div key="e1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <EmergenceView
              lines={REVEAL1[topSignal1]}
              opts={['很像我', '有一点', '不太像']}
              denialMsg="那好，我们先记录一下，继续往下看。"
              onAdvance={handleReveal1Advance}
            />
          </motion.div>
        )}

        {phase === 'emergence2' && (
          <motion.div key="e2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <EmergenceView
              lines={reveal2Lines}
              opts={['这句话有点戳我', '好像有一点', '不像我']}
              denialMsg="那我们先把它当成一条未确认的线索。"
              onAdvance={handleReveal2Advance}
            />
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <ResultView
              top={topSignal2}
              second={secondSignal}
              reveal2Denied={reveal2Denied}
              onContinue={() => { setPhase('invite'); scrollTop() }}
            />
          </motion.div>
        )}

        {phase === 'invite' && (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <InviteView onSubmit={handleInviteSubmit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
