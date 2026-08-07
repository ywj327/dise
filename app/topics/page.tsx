'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const TOPICS = [
  {
    q: '为什么我总害怕别人失望？',
    tags: ['认可', '完美主义', '讨好'],
    event: '我想搞清楚：为什么我总是很害怕让别人失望？这个感觉困扰了我很久。',
  },
  {
    q: '为什么别人一冷淡，我就控制不住地想很多？',
    tags: ['安全感', '关系焦虑'],
    event: '我想探索一下：为什么对方一旦冷淡下来，我就会开始想很多，停不下来。',
  },
  {
    q: '为什么有人越靠近，我越想逃？',
    tags: ['亲密', '自主', '回避'],
    event: '我想理解：为什么每当一段关系开始变得亲密，我就会不自觉地想要退开。',
  },
  {
    q: '我是真的想要现在的人生吗？',
    tags: ['意义', '身份', '选择'],
    event: '我最近一直在想：我现在过的生活，真的是我想要的吗？还是我只是顺着走过来的。',
  },
  {
    q: '为什么我总觉得自己落后了？',
    tags: ['比较', '焦虑', '时间感'],
    event: '我想搞清楚：为什么我总有一种感觉，觉得自己落后于同龄人，停不下来地焦虑。',
  },
  {
    q: '如果我不再优秀，我还有什么值得被喜欢？',
    tags: ['自我价值', '认可', '优秀感'],
    event: '我想探索：我的价值是不是和"优秀"绑得太紧了？如果我不够优秀，我还值得被爱吗？',
  },
]

export default function TopicsPage() {
  const router = useRouter()

  function startTopic(event: string) {
    router.push(`/explore?event=${encodeURIComponent(event)}`)
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 pt-12 pb-32">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-[10px] text-neutral-400 tracking-widest mb-4">探索专题</p>
        <p className="text-sm text-neutral-400 leading-relaxed mb-14">
          选一个你真实会问自己的问题。
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {TOPICS.map((topic, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => startTopic(topic.event)}
            className="text-left border border-neutral-200 px-5 py-5 hover:border-neutral-700 transition-all group"
          >
            <p className="text-sm text-neutral-800 leading-relaxed mb-3 group-hover:text-neutral-900">
              {topic.q}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {topic.tags.map(tag => (
                <span key={tag} className="text-[10px] text-neutral-400 border border-neutral-200 px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-14 pt-8 border-t border-neutral-100"
      >
        <p className="text-xs text-neutral-400 mb-3">或者，从你自己的困扰开始</p>
        <Link
          href="/"
          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          说一件最近放不下的事 →
        </Link>
      </motion.div>
    </main>
  )
}
