'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getCharacter } from '@/lib/scoring'
import type { Result } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isSynthesis?: boolean
}

function ChatContent() {
  const params = useSearchParams()
  const result: Result = {
    q1: (params.get('q1') || '回避型') as Result['q1'],
    q2: (params.get('q2') || '意义驱动') as Result['q2'],
    q3: (params.get('q3') || '方向未定型') as Result['q3'],
    q4: (params.get('q4') || '影响力型') as Result['q4'],
  }
  const character = getCharacter(result.q1, result.q2)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    callAPI([])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function callAPI(msgs: Message[]) {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs
            .filter(m => !m.isSynthesis)
            .map(m => ({ role: m.role, content: m.content })),
          result,
          characterName: character.name,
          characterDesc: character.desc,
        }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.text, isSynthesis: data.isSynthesis },
      ])
      if (data.isSynthesis) setDone(true)
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '连接失败，请稍后重试。' },
      ])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || done) return
    const newMsgs: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    await callAPI(newMsgs)
  }

  const resultUrl = `/result?q1=${result.q1}&q2=${result.q2}&q3=${result.q3}&q4=${result.q4}`
  const synthesis = messages.find(m => m.isSynthesis)

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 flex flex-col">
      {/* 顶部导航 */}
      <div className="py-8 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-neutral-400">底色 · {character.name}</p>
        <Link href={resultUrl} className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
          ← 返回结果
        </Link>
      </div>

      {/* 对话内容 */}
      <div className="flex-1 pb-28">
        <div className="flex flex-col gap-8">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {msg.role === 'assistant' ? (
                  msg.isSynthesis ? (
                    <div className="border border-neutral-900 p-6">
                      <p className="text-xs text-neutral-400 mb-4 tracking-widest">你的底层逻辑</p>
                      <p className="text-sm text-neutral-800 leading-loose">{msg.content}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-700 leading-loose">{msg.content}</p>
                  )
                ) : (
                  <div className="flex justify-end">
                    <p className="text-sm text-neutral-900 bg-neutral-50 px-4 py-3 leading-loose max-w-[80%]">
                      {msg.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {done && synthesis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3 pt-2"
            >
              <button
                onClick={() => navigator.clipboard.writeText(synthesis.content).then(() => alert('已复制'))}
                className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-3 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              >
                复制洞察
              </button>
              <Link
                href="/"
                className="w-full border border-neutral-900 bg-neutral-900 text-white text-xs tracking-widest py-3 text-center hover:bg-white hover:text-neutral-900 transition-colors block"
              >
                重新测试
              </Link>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 输入框 */}
      {!done && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100">
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto px-6 py-4 flex gap-4 items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="说说你的想法……"
              disabled={loading}
              className="flex-1 text-sm border-b border-neutral-200 py-2 outline-none placeholder-neutral-300 focus:border-neutral-900 transition-colors bg-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-30 flex-shrink-0"
            >
              发送
            </button>
          </form>
        </div>
      )}
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
