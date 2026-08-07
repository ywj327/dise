'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { questions } from '@/lib/questions'
import { calculateResult, getCharacter } from '@/lib/scoring'

export default function AssessmentPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [done, setDone] = useState(false)

  const q = questions[current]
  const total = questions.length
  const filled = Object.keys(answers).length

  function handleAnswer(type: string) {
    const newAnswers = { ...answers, [q.id]: type }
    setAnswers(newAnswers)

    if (current < total - 1) {
      setCurrent(current + 1)
    } else {
      // All answered — calculate and save
      const result = calculateResult(newAnswers)
      const character = getCharacter(result.q1, result.q2)

      // Save to localStorage profile
      try {
        const raw = localStorage.getItem('dise_profile') || '{}'
        const profile = JSON.parse(raw)
        profile.assessment = {
          source: 'assessment',
          date: new Date().toISOString(),
          result,
          character: character.name,
          q1: result.q1,
          q2: result.q2,
          q3: result.q3,
          q4: result.q4,
        }
        // Merge into hiddenRules if relevant
        if (!profile.hiddenRules) profile.hiddenRules = []
        localStorage.setItem('dise_profile', JSON.stringify(profile))
      } catch { }

      setDone(true)

      // Navigate to result page
      router.push(`/result?q1=${encodeURIComponent(result.q1)}&q2=${encodeURIComponent(result.q2)}&q3=${encodeURIComponent(result.q3)}&q4=${encodeURIComponent(result.q4)}`)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32 flex flex-col items-center justify-center">
        <p className="text-xs text-neutral-400">正在整理结果……</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-14">
        <button
          onClick={() => router.back()}
          className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors"
        >
          ← 返回
        </button>
        <p className="text-[10px] text-neutral-300 tracking-widest">
          底色测试 {current + 1} / {total}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-neutral-100 mb-10 relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-neutral-400"
          animate={{ width: `${((current + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35 }}
        >
          {/* Quadrant label */}
          <p className="text-[10px] text-neutral-300 tracking-widest mb-8">
            {q.quadrant === 1 && '你和别人之间'}
            {q.quadrant === 2 && '你拿什么驱动自己'}
            {q.quadrant === 3 && '你卡在哪里'}
            {q.quadrant === 4 && '接下来想去哪里'}
          </p>

          {/* Question */}
          <p className="text-base font-light text-neutral-900 leading-loose mb-10">
            {q.text}
          </p>

          {/* Options */}
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
      </AnimatePresence>

      {/* Back button if not first */}
      {current > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCurrent(current - 1)}
          className="mt-10 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ← 上一题
        </motion.button>
      )}
    </main>
  )
}
