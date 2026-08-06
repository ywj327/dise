'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { questions } from '@/lib/questions'
import { calculateResult } from '@/lib/scoring'
import { saveResult } from '@/lib/supabase'

export default function Assessment() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  const question = questions[current]
  const progressPct = ((current + 1) / questions.length) * 100

  const handleBack = () => {
    if (current === 0 || selected) return
    const prevIndex = current - 1
    setDirection(-1)
    setCurrent(prevIndex)
    setSelected(answers[questions[prevIndex].id] || null)
  }

  const handleSelect = (type: string) => {
    if (selected) return
    setSelected(type)

    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: type }
      setAnswers(newAnswers)

      if (current + 1 < questions.length) {
        setDirection(1)
        setCurrent((c) => c + 1)
        setSelected(null)
      } else {
        const result = calculateResult(newAnswers)
        saveResult({ ...result, answers: newAnswers })
        const params = new URLSearchParams({
          q1: result.q1,
          q2: result.q2,
          q3: result.q3,
          q4: result.q4,
        })
        router.push(`/result?${params.toString()}`)
      }
    }, 400)
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-12">
      {/* Progress — 只显示数字和进度条，不显示维度名 */}
      <div className="max-w-lg mx-auto w-full mb-16">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handleBack}
            className={`text-xs transition-colors ${
              current > 0 && !selected
                ? 'text-neutral-400 hover:text-neutral-700'
                : 'text-neutral-100 pointer-events-none'
            }`}
          >
            ← 上一题
          </button>
          <span className="text-xs text-neutral-300">
            {current + 1} / {questions.length}
          </span>
        </div>
        <div className="h-px bg-neutral-100 w-full">
          <motion.div
            className="h-px bg-neutral-400"
            initial={{ width: `${((current) / questions.length) * 100}%` }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: direction * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -32 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="text-xl font-light text-neutral-900 leading-relaxed mb-10">
                {question.text}
              </h2>

              <div className="flex flex-col gap-3">
                {question.options.map((option, i) => (
                  <motion.button
                    key={option.type}
                    onClick={() => handleSelect(option.type)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className={`text-left px-5 py-4 border text-sm leading-relaxed transition-all duration-200 ${
                      selected === option.type
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : selected
                        ? 'border-neutral-100 text-neutral-300 cursor-default'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
