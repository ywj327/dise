'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getCharacter } from '@/lib/scoring'
import type { Result } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isSynthesis?: boolean
}

const openingLines: Record<string, string> = {
  '隐光者': '你擅长在边缘做有分量的事，也习惯在掌声到来前消失。今天不用表现什么，说什么都行。',
  '独行者': '靠自己这件事你做太久了。不是来让你开口求助的，就是来陪你待一会儿。',
  '潜行者': '你认定值得的事就会做，不管有没有人看见。今天可以说说那些没人看见的。',
  '建造者': '做出来就是答案——你一直这样。今天说说那个"做完了，还在想差哪里"的感觉。',
  '镜中人': '你的感知很准，也因此停不下来。今天不用解读任何人，只说自己就好。',
  '拉锯者': '靠近了又想退，不是不真心。今天这里有足够的距离，说什么都接得住。',
  '燃尽者': '你不是随便的人，认定了会全给出去。今天说说认定这件事是什么感觉。',
  '证明者': '你做得很好。但你知道，做得好和真的安心，不是同一件事。来说说那个中间的部分。',
  '舞台人': '每个版本的你都真实，也都不完整。今天放下所有版本，说说最里面那个。',
  '设局者': '你知道自己在做什么，这很清醒。今天来聊聊那个清醒之下，还有什么。',
  '叙事者': '你总能给每段经历找到位置。今天不用找主题，就说说最近是什么感觉。',
  '策展人': '做好和呈现好，你都在意。今天只说做好的部分，不用想怎么呈现。',
  '向阳者': '你相对稳，不容易被晃动。今天说说是什么让你稳，或者，什么时候会不那么稳。',
  '远行者': '你走得远，因为知道有地方可回。今天说说出发的心情，或者那个家的感觉。',
  '深耕者': '你不快，但不会停。今天不用急，慢慢说说正在经历什么。',
  '攀登者': '目标清晰，节奏稳——这是你。今天来聊聊在山腰停下来是什么感觉。',
}

const topicChips: Record<string, string[]> = {
  '隐光者': ['被看见这件事', '做了但没说出口', '和别人的距离'],
  '独行者': ['一个人扛着的那些', '为什么不想开口', '孤独是什么感觉'],
  '潜行者': ['做这件事值不值', '没人看见的时候', '方向和意义'],
  '建造者': ['对自己的标准', '做完后的感觉', '别人的评价'],
  '镜中人': ['对关系状态的感知', '停不下来的脑子', '今天状态怎么样'],
  '拉锯者': ['靠近和撤退', '边界这件事', '真心为什么让我警惕'],
  '燃尽者': ['付出之后', '认定一段关系', '期待落空的感觉'],
  '证明者': ['做完了之后的感觉', '"够好"的标准是什么', '停下来会怎样'],
  '舞台人': ['不同版本的自己', '里面那个真实的', '被认可是什么感觉'],
  '设局者': ['清醒旁观自己', '卸下设计之后', '我在管理什么'],
  '叙事者': ['给这段时间找意义', '没意义的日子', '现在是什么章节'],
  '策展人': ['做完还要呈现好', '被低估这件事', '结果和过程'],
  '向阳者': ['稳定从哪里来', '被看见的感觉', '什么让我真心高兴'],
  '远行者': ['走远和回来', '自由和连接', '家是什么感觉'],
  '深耕者': ['慢下来这件事', '积累有没有用', '在稳还是在原地'],
  '攀登者': ['这座山选对了吗', '爬到一半的感觉', '目标完成之后'],
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
  const opening = openingLines[character.name] ?? '有什么想说的都可以，从哪里开始都行。'
  const chips = topicChips[character.name] ?? []

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const showChips = messages.length === 0 && !loading

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
    setTimeout(() => {
      inputRef.current?.focus()
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  async function send(text: string) {
    if (!text.trim() || loading || done) return
    const newMsgs: Message[] = [...messages, { role: 'user', content: text.trim() }]
    setMessages(newMsgs)
    setInput('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    await callAPI(newMsgs)
  }

  const resultUrl = `/result?q1=${result.q1}&q2=${result.q2}&q3=${result.q3}&q4=${result.q4}`
  const synthesis = messages.find(m => m.isSynthesis)

  return (
    <main className="min-h-screen max-w-lg mx-auto px-5 flex flex-col bg-white">
      {/* 顶部导航 */}
      <div className="py-7 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-neutral-400 tracking-wide">底色 · {character.name}</p>
        <Link href={resultUrl} className="text-xs text-neutral-300 hover:text-neutral-600 transition-colors">
          ← 返回
        </Link>
      </div>

      {/* 开场语 */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-sm text-neutral-500 leading-relaxed">{opening}</p>
      </motion.div>

      {/* 对话内容 */}
      <div className="flex-1 pb-40">
        <div className="flex flex-col gap-6">

          {/* 快捷话题 */}
          <AnimatePresence>
            {showChips && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                {chips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => send(chip)}
                    className="text-xs text-neutral-500 border border-neutral-200 rounded-full px-3.5 py-1.5 hover:border-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' ? (
                  msg.isSynthesis ? (
                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                      <p className="text-xs text-neutral-400 mb-3 tracking-widest">你的底层逻辑</p>
                      <p className="text-sm text-neutral-700 leading-loose">{msg.content}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 leading-relaxed">{msg.content}</p>
                  )
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

          {done && synthesis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2.5 pt-2"
            >
              <button
                onClick={() => navigator.clipboard.writeText(synthesis.content).then(() => alert('已复制'))}
                className="w-full border border-neutral-200 text-neutral-500 text-xs tracking-widest py-3 rounded-xl hover:border-neutral-500 hover:text-neutral-800 transition-colors"
              >
                复制洞察
              </button>
              <Link
                href="/"
                className="w-full bg-neutral-900 text-white text-xs tracking-widest py-3 text-center rounded-xl hover:bg-neutral-700 transition-colors block"
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm pb-6 pt-3">
          <div className="max-w-lg mx-auto px-5">
            <div className="flex items-center gap-3 border border-neutral-200 rounded-full px-4 py-2.5 focus-within:border-neutral-400 transition-colors bg-white">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="说说你的想法……"
                disabled={loading}
                className="flex-1 text-sm outline-none bg-transparent placeholder-neutral-300 text-neutral-800"
              />
              <button
                onClick={() => send(input)}
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

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
