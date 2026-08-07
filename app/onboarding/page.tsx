'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

type AnswerType = 'A' | 'B' | 'C' | 'D'
type Pattern = 'A' | 'B' | 'C' | 'BD'
type Phase =
  | 'scene1' | 'scene2' | 'scene3'
  | 'emergence1'
  | 'scene4' | 'scene5' | 'scene6'
  | 'emergence2'
  | 'result'
  | 'invite'

interface Answer { scene: number; type: AnswerType }
interface SceneChoice { text: string; type: AnswerType }
interface SceneDef { id: number; phase: Phase; situation: string; question: string; choices: SceneChoice[] }
interface EmergenceLine { text: string; style?: 'normal' | 'large' | 'heading' }

const SCENES: SceneDef[] = [
  {
    id: 1, phase: 'scene1',
    situation: '你发了一大段消息。\n\n过了一会儿，\n对方只回了一个：\n\n"嗯。"',
    question: '你更容易——',
    choices: [
      { text: '算了，不想再说了。', type: 'A' },
      { text: '开始想，是不是自己哪里说错了。', type: 'B' },
      { text: '很想直接问一句："你什么意思？"', type: 'C' },
      { text: '嘴上觉得没什么，但之后会明显冷下来。', type: 'D' },
    ],
  },
  {
    id: 2, phase: 'scene2',
    situation: '你认真准备了很久的一件事，\n最后结果并不好。',
    question: '你的第一反应更接近——',
    choices: [
      { text: '哪里出了问题？我要赶紧补回来。', type: 'B' },
      { text: '是不是我其实没有自己想得那么好。', type: 'B' },
      { text: '很烦，暂时什么都不想碰。', type: 'A' },
      { text: '更在意别人会不会觉得我不行。', type: 'D' },
    ],
  },
  {
    id: 3, phase: 'scene3',
    situation: '一个你很在意的人，\n最近明显没有以前主动。',
    question: '你更容易——',
    choices: [
      { text: '我也会慢慢变冷。', type: 'A' },
      { text: '开始回想最近是不是发生了什么。', type: 'B' },
      { text: '很想直接确认他到底怎么了。', type: 'C' },
      { text: '告诉自己没关系，但会忍不住注意他的反应。', type: 'D' },
    ],
  },
  {
    id: 4, phase: 'scene4',
    situation: '领导看完你的方案，\n只说了一句：\n\n"再想想。"',
    question: '你更容易——',
    choices: [
      { text: '马上开始推翻自己的方案。', type: 'B' },
      { text: '很想知道他到底哪里不满意。', type: 'C' },
      { text: '觉得只是正常反馈，不太受影响。', type: 'A' },
      { text: '嘴上说好，但之后会反复琢磨这三个字。', type: 'D' },
    ],
  },
  {
    id: 5, phase: 'scene5',
    situation: '你做了一个自己其实很满意的决定，\n但家里人明显不赞同。',
    question: '最刺你的更可能是——',
    choices: [
      { text: '他们不理解我。', type: 'A' },
      { text: '我是不是做错了。', type: 'B' },
      { text: '为什么我必须按照他们想的走。', type: 'C' },
      { text: '我知道不用管，但还是会受到影响。', type: 'D' },
    ],
  },
  {
    id: 6, phase: 'scene6',
    situation: '没有工作、消息和安排的一整天。',
    question: '你更接近——',
    choices: [
      { text: '终于可以什么都不管。', type: 'A' },
      { text: '很难真的放松，总觉得应该做点什么。', type: 'B' },
      { text: '会开始想自己最近到底在干什么。', type: 'B' },
      { text: '如果没有人在找我，会有一点空。', type: 'D' },
    ],
  },
]

const SCENE_PHASES: Phase[] = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6']

function getPattern(answers: Answer[]): Pattern {
  const c = { A: 0, B: 0, C: 0, D: 0 }
  answers.forEach(a => c[a.type]++)
  if (c.A >= 3) return 'A'
  if (c.C >= 3) return 'C'
  if (c.B >= 4 && c.D <= 1) return 'B'
  return 'BD'
}

const EMERGENCE1: Record<Pattern, EmergenceLine[]> = {
  BD: [
    { text: '我好像先看到了你的一点。', style: 'heading' },
    { text: '当重要的人或事情\n突然变得不确定时，\n\n你似乎很容易开始确认：\n\n是不是哪里出了问题。' },
    { text: '而有时候，\n你确认的不只是事情。' },
    { text: '还有自己\n是不是依然重要。', style: 'large' },
  ],
  A: [
    { text: '我好像先看到了你的一点。', style: 'heading' },
    { text: '当有些东西开始不对劲，\n你的第一反应\n往往不是走近——\n\n而是先退一步。' },
    { text: '而有时候，' },
    { text: '这一步，\n你不是真的不在乎。', style: 'large' },
  ],
  C: [
    { text: '我好像先看到了你的一点。', style: 'heading' },
    { text: '不确定让你难受。\n所以你第一时间\n想弄清楚——\n\n到底发生了什么。' },
    { text: '而有时候，' },
    { text: '你寻找的\n不只是一个答案。', style: 'large' },
  ],
  B: [
    { text: '我好像先看到了你的一点。', style: 'heading' },
    { text: '当事情出了问题，\n你的第一反应\n往往是先看向自己：\n\n是不是我哪里不对。' },
    { text: '而有时候，' },
    { text: '这个问题，\n你问得比事情本身还要快。', style: 'large' },
  ],
}

const EMERGENCE2: Record<Pattern, EmergenceLine[]> = {
  BD: [
    { text: '刚才的几个场景\n看起来没什么关系。' },
    { text: '关系。\n工作。\n家人的评价。', style: 'heading' },
    { text: '但它们好像\n都在碰同一件事。' },
    { text: '我做得够不够好，\n会不会改变别人怎么看我？', style: 'large' },
    { text: '有没有一种可能——\n\n你以为自己只是\n对很多事情比较认真，\n\n但你真正努力维持的，\n有时候是：\n\n「我应该是一个\n不会让人失望的人。」' },
  ],
  A: [
    { text: '刚才的几个场景\n看起来没什么关系。' },
    { text: '关系。\n工作。\n家人的评价。', style: 'heading' },
    { text: '但它们好像\n都在碰同一件事。' },
    { text: '当事情开始变得不确定，\n你习惯先往后退一点。', style: 'large' },
    { text: '有没有一种可能——\n\n你不是真的不在乎。\n\n你只是很早就学会了：\n在意又没有用时，\n最好先保护自己。' },
  ],
  C: [
    { text: '刚才的几个场景\n看起来没什么关系。' },
    { text: '关系。\n工作。\n家人的评价。', style: 'heading' },
    { text: '但它们好像\n都在碰同一件事。' },
    { text: '不确定让你不舒服，\n你第一时间想搞清楚原因。', style: 'large' },
    { text: '有没有一种可能——\n\n你寻找的，\n不只是一个答案。\n\n而是一种「我知道发生什么了，\n所以我还有控制」\n的感觉。' },
  ],
  B: [
    { text: '刚才的几个场景\n看起来没什么关系。' },
    { text: '关系。\n工作。\n家人的评价。', style: 'heading' },
    { text: '但它们好像\n都在碰同一件事。' },
    { text: '事情出了问题，\n你的第一反应往往指向自己。', style: 'large' },
    { text: '有没有一种可能——\n\n你已经习惯了\n用「是我的问题」\n来解释那些让你不舒服的时刻。\n\n即使有时候，它真的不是。' },
  ],
}

const RESULT_DATA: Record<Pattern, { observations: string[]; rule: string }> = {
  BD: {
    observations: [
      '你似乎比自己以为的，\n更在意重要的人如何看待你。',
      '不确定出现时，你习惯先寻找原因，\n而不是先放着不管。',
      '你很少把这种在意直接说成「我需要」。\n更容易把它表现成：「我只是想把事情做好。」',
    ],
    rule: '「我不能让重要的人失望。」',
  },
  A: {
    observations: [
      '当事情开始变得不可控，\n你倾向于先退开一步。',
      '你不是真的不在乎。\n只是在意又没有用时，你学会了先保护自己。',
      '你很少主动说「我需要你靠近一点」。\n更容易让距离代替你说话。',
    ],
    rule: '「如果我先撤，就不会那么容易受伤。」',
  },
  C: {
    observations: [
      '不确定让你不舒服。\n你第一时间想弄清楚到底发生了什么。',
      '你需要知道「为什么」，\n才能让自己安定下来。',
      '你不太擅长等待。\n更习惯主动走向那个答案，不管它是什么。',
    ],
    rule: '「只要我搞清楚了，我就能应对它。」',
  },
  B: {
    observations: [
      '事情出了问题时，你的第一反应\n是先看向自己：是不是我哪里不对。',
      '这个习惯让你变得敏锐，\n也让你比别人多承担了很多\n不属于你的重量。',
      '你很少说「这不是我的问题」。\n更容易说「让我再想想哪里出了问题」。',
    ],
    rule: '「事情出了问题，通常是我的责任。」',
  },
}

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}
    </>
  )
}

function SceneView({ scene, onSelect, filledDots }: {
  scene: SceneDef
  onSelect: (c: SceneChoice) => void
  filledDots: number
}) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-32 max-w-lg mx-auto">
      <div className="flex gap-2 mb-14">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i < filledDots ? 'bg-neutral-500' : 'bg-neutral-200'}`}
          />
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

const LINE_DELAYS = [700, 2600, 5000, 7400, 9900]

function EmergenceView({ lines, onAdvance }: {
  lines: EmergenceLine[]
  onAdvance: () => void
}) {
  const [visible, setVisible] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisible(v => Math.max(v, i + 1)), LINE_DELAYS[i] ?? (i * 2400 + 700))
    )
    const lastDelay = LINE_DELAYS[Math.min(lines.length - 1, LINE_DELAYS.length - 1)]
    const feedbackTimer = setTimeout(() => setShowFeedback(true), lastDelay + 1800)
    return () => { timers.forEach(clearTimeout); clearTimeout(feedbackTimer) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-8 pt-20 pb-24 max-w-xs mx-auto">
      {lines.map((line, i) => (
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
      ))}

      {showFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex gap-8 mt-8"
        >
          {['很像我', '有一点', '不太像'].map(f => (
            <button
              key={f}
              onClick={onAdvance}
              className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors underline underline-offset-4"
            >
              {f}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function ResultView({ pattern, onContinue }: { pattern: Pattern; onContinue: () => void }) {
  const data = RESULT_DATA[pattern]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const delays = [500, 1800, 3300, 5200, 6800]
    const timers = delays.map((d, i) => setTimeout(() => setStep(s => Math.max(s, i + 1)), d))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-32 max-w-lg mx-auto">
      {step >= 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-neutral-400 tracking-widest mb-14"
        >
          目前，我们看到的你
        </motion.p>
      )}

      <div className="flex flex-col gap-8 mb-12">
        {data.observations.map((obs, i) => (
          step > i ? (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex gap-4 items-start"
            >
              <span className="text-[10px] text-neutral-300 mt-0.5 flex-shrink-0">0{i + 1}</span>
              <p className="text-sm text-neutral-700 leading-loose"><Lines text={obs} /></p>
            </motion.div>
          ) : null
        ))}
      </div>

      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="border-l-2 border-neutral-900 pl-5 mb-14"
        >
          <p className="text-[10px] text-neutral-400 mb-3">一条值得继续确认的线索</p>
          <p className="text-xl font-light text-neutral-900 leading-snug">{data.rule}</p>
        </motion.div>
      )}

      {step >= 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] text-neutral-400 mb-8 leading-relaxed">
            这不是关于你的结论。<br />只是我们暂时看到的一条线。
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

function InviteView({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-32 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <p className="text-sm text-neutral-500 leading-relaxed mb-2">到了这里，</p>
        <p className="text-base font-light text-neutral-900 leading-loose mb-14">
          如果愿意，我们可以从<br />真实的一件事继续。
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

export default function OnboardingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('scene1')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [pattern, setPattern] = useState<Pattern>('BD')
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
    const newAnswers = [...answers, { scene: sceneId, type: choice.type }]
    setAnswers(newAnswers)

    if (sceneId === 3) {
      setPattern(getPattern(newAnswers))
      setPhase('emergence1')
    } else if (sceneId === 6) {
      setPattern(getPattern(newAnswers))
      setPhase('emergence2')
    } else {
      const idx = SCENE_PHASES.indexOf(`scene${sceneId}` as Phase)
      setPhase(SCENE_PHASES[idx + 1] ?? 'result')
    }
    scrollTop()
  }

  function handleInviteSubmit(text: string) {
    const resultData = RESULT_DATA[pattern]
    try {
      const profile = JSON.parse(localStorage.getItem('dise_profile') || '{}')
      if (!profile.hiddenRules) profile.hiddenRules = []
      if (!profile.hiddenRules.includes(resultData.rule)) {
        profile.hiddenRules.push(resultData.rule)
      }
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
              lines={EMERGENCE1[pattern]}
              onAdvance={() => { setPhase('scene4'); scrollTop() }}
            />
          </motion.div>
        )}

        {phase === 'emergence2' && (
          <motion.div key="e2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <EmergenceView
              lines={EMERGENCE2[pattern]}
              onAdvance={() => { setPhase('result'); scrollTop() }}
            />
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <ResultView
              pattern={pattern}
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
