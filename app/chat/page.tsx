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

const quickReplies: Record<string, string[]> = {
  '隐光者': ['做了很多，没说给人听', '被看见时反而想消失', '掌声落下来，我已经不在场了'],
  '独行者': ['宁愿一个人扛着', '开口求助比撑着更难受', '孤独但可控，解释不值得'],
  '潜行者': ['认定值得，不管有没有人看', '偶尔不确定这条路走对了没有', '不被关注反而更自在'],
  '建造者': ['别人说好，我还在想差哪里', '被夸了反而有点不自在', '做出来就是答案，不太解释'],
  '镜中人': ['消息不回，开始复盘是不是我的问题', '感知停不下来', '需要确认，但知道这很累'],
  '拉锯者': ['靠近了又想保持距离', '真心让我觉得有点危险', '一边想要，一边留着退路'],
  '燃尽者': ['一旦认定，会全给出去', '给完了怕对方没那么当回事', '付出是一种表态，不只是行动'],
  '证明者': ['做得很好，但很难真的安心', '"够好"的标准总在自动升高', '停下来，怕有什么东西就散了'],
  '舞台人': ['在不同人面前是不同版本', '掌声是一种确认', '里面那个完整的自己，不常出现'],
  '设局者': ['我知道自己在设计自己的形象', '大多数人不自知，我自知', '没场景要设计时，不知道剩下什么'],
  '叙事者': ['下意识给每段经历找主题', '没有主题的日子让我不耐', '困境会变成故事里的转折点'],
  '策展人': ['结果好，呈现方式也要好', '包装不对，内容会被低估', '在意做得好，也在意怎么被看见'],
  '向阳者': ['不需要认可也能走，但得到了会高兴', '被看见是加分项，不是必需品', '想被看见时会直接说'],
  '远行者': ['走得远，因为知道有地方可回', '自由不是逃，是真的想去某处', '不需要关系贴着，但需要它在'],
  '深耕者': ['不快，但不会停', '相信积累本身会说话', '偶尔不确定是在稳还是在原地'],
  '攀登者': ['知道要去哪，也知道怎么走', '一步一步，节奏稳', '爬了这么久，这座山选对了吗'],
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
  const chips = quickReplies[character.name] ?? []

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const showChips = messages.length === 1 && !loading && !done

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

  async function handleChip(text: string) {
    if (loading || done) return
    const newMsgs: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
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
      <div className="flex-1 pb-36">
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

      {/* 底部区域：快捷回复 + 输入框 */}
      {!done && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100">
          <div className="max-w-lg mx-auto px-6">
            {/* 快捷回复 chips */}
            <AnimatePresence>
              {showChips && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-wrap gap-2 pt-4 pb-2"
                >
                  {chips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleChip(chip)}
                      className="text-xs text-neutral-500 border border-neutral-200 px-3 py-1.5 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 输入框 */}
            <form
              onSubmit={handleSubmit}
              className="py-4 flex gap-3 items-center"
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
                className="text-xs bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-600 transition-colors disabled:opacity-25 flex-shrink-0"
              >
                发送
              </button>
            </form>
          </div>
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
