'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Discovery {
  experiencing: string
  protection: string
  afraid: string
  rule: string
}

function ExploreContent() {
  const params = useSearchParams()
  const router = useRouter()
  const initialEvent = params.get('event') || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [discovery, setDiscovery] = useState<Discovery | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasSentInitial = useRef(false)

  useEffect(() => {
    if (!initialEvent || hasSentInitial.current) return
    hasSentInitial.current = true
    const firstMsg: Message = { role: 'user', content: initialEvent }
    setMessages([firstMsg])

    const doInitialCall = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: initialEvent }],
            mode: 'explore',
            initialEvent,
          }),
        })
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: '连接失败，请稍后重试。' }])
      }
      setLoading(false)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }

    doInitialCall()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function callAPI(msgs: Message[]) {
    setLoading(true)
    const userCount = msgs.filter(m => m.role === 'user').length

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
          mode: 'explore',
          initialEvent,
        }),
      })
      const data = await res.json()

      if (data.isSynthesis && data.discoveryData) {
        setDiscovery(data.discoveryData)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '连接失败，请稍后重试。' }])
    }

    setLoading(false)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }, 100)
  }

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading || discovery) return
    const newMsgs: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMsgs)
    setInput('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    await callAPI(newMsgs)
  }

  if (!initialEvent) {
    router.replace('/')
    return null
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 flex flex-col bg-white">
      <div className="py-7 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-neutral-400 tracking-wide">底色 · 探索</p>
        <button
          onClick={() => router.push('/')}
          className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors"
        >
          ← 返回
        </button>
      </div>

      <div className="flex-1 pb-40">
        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' ? (
                  <p className="text-sm text-neutral-600 leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="flex justify-end">
                    <p className="text-sm text-neutral-800 bg-neutral-100 rounded-2xl rounded-tr-md px-4 py-3 leading-relaxed max-w-[82%]">
                      {msg.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-1.5 items-center py-1">
                {[0, 140, 280].map(delay => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {discovery && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4"
            >
              <p className="text-[10px] text-neutral-400 tracking-widest mb-5">本次发现</p>

              <div className="border border-neutral-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4">
                  <p className="text-[10px] text-neutral-400 mb-2">你在经历</p>
                  <p className="text-sm text-neutral-800 leading-relaxed">{discovery.experiencing}</p>
                </div>
                <div className="px-5 py-4 border-t border-neutral-100">
                  <p className="text-[10px] text-neutral-400 mb-2">你的保护方式</p>
                  <p className="text-sm text-neutral-800 leading-relaxed">{discovery.protection}</p>
                </div>
                <div className="px-5 py-4 border-t border-neutral-100">
                  <p className="text-[10px] text-neutral-400 mb-2">你可能真正害怕</p>
                  <p className="text-sm text-neutral-800 leading-relaxed">{discovery.afraid}</p>
                </div>
                <div className="px-5 py-5 border-t border-neutral-100 bg-neutral-50">
                  <p className="text-[10px] text-neutral-400 mb-2">一条隐形规则</p>
                  <p className="text-base text-neutral-700 leading-relaxed">{discovery.rule}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const text = `本次发现\n\n你在经历：${discovery.experiencing}\n你的保护方式：${discovery.protection}\n你可能真正害怕：${discovery.afraid}\n一条隐形规则：${discovery.rule}`
                    navigator.clipboard.writeText(text).then(() => alert('已复制'))
                  }}
                  className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-3 rounded-xl hover:border-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  复制发现
                </button>
                <button
                  onClick={() => router.push('/assessment')}
                  className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-3 rounded-xl hover:border-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  了解你的底色类型 →
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-neutral-900 text-white text-xs tracking-widest py-3 rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  再探索一件事
                </button>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {!discovery && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm pb-6 pt-3">
          <div className="max-w-lg mx-auto px-5">
            <div className="flex items-center gap-3 border border-neutral-200 rounded-full px-4 py-2.5 focus-within:border-neutral-400 transition-colors bg-white">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="说说你的想法……"
                disabled={loading}
                className="flex-1 text-sm outline-none bg-transparent placeholder-neutral-300 text-neutral-800"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="text-xs bg-neutral-900 text-white px-3.5 py-1.5 rounded-full hover:bg-neutral-700 transition-colors disabled:opacity-25 flex-shrink-0"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
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
