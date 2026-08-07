export const onRequestPost = async (context: any) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    const apiKey: string = context.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'no_key' }), { status: 500, headers: cors })
    }

    const body = await context.request.json()
    const { mode } = body

    // ── 动态探索（核心智能模式）──────────────────────────────────────────
    if (mode === 'dynamic_explore') {
      const { event, history = [], userProfile = null } = body
      const turnCount = (history as any[]).filter((h: any) => h.role === 'user').length

      const profileHint = userProfile && userProfile.caresAbout
        ? `用户已有底色档案：在意「${userProfile.caresAbout}」，保护方式「${userProfile.protection || '未知'}」。仅作参考，当前事件绝对优先。`
        : ''

      const historyLines = (history as Array<{ role: string; content: string; stage: string }>)
        .map(h => h.role === 'user' ? `[用户] ${h.content}` : `[AI] ${h.content}`)
        .join('\n')

      const firstTurnGuide = turnCount === 0 ? `
# 首次输入处理（turnCount===0）

必须先判断输入类型，然后按规则生成：

## A. abstract_pattern（长期模式，无具体事件）
特征："为什么我总是…""我总觉得…""我一直…"等
reflection: 映射这个困扰的本质（不重复原文）
question: "这种感觉，最近更容易发生在哪里？"
options: ["工作 / 学业", "家里", "亲密关系", "朋友", "我脑子里有一件具体的事"]
isDomainCheck: true
stage: understand_event

## B. concrete_event（有具体人物 + 事件）
特征：包含具体人物（老板/男友/妈妈…）+ 具体情境
reflection: 精确复述发生了什么（1句，不扩展不推断）
question: 直接问"那一刻/这件事最刺你的，更接近——"
options: 4个同层级选项，全是对该事件的具体担忧或感受
stage: locate_pain

## C. vague_feeling（信息严重不足）
特征：全句≤6字，完全没有具体内容
reflection: "你好像积累了一段时间了。"
question: "这种感觉最近更常和什么有关？"
options: ["一段关系", "工作 / 学业", "家里", "自己和未来", "说不上来"]
isDomainCheck: true
stage: understand_event

## D. decision_conflict（两难选择）
特征："想…但…""要不要…""一直不敢…"
reflection: 映射"真正让你停下来的，可能不是不知道答案"
question: "最让你不敢动的，更接近——"
options: 4个同层级阻力描述，针对具体事件
stage: locate_pain

## E. relationship_change（他人行为变化）
特征："越来越少…""最近没以前…""不怎么…"（描述他人减少或改变）
reflection: 映射"你注意到的不是一次，而是整体变化了"
question: "这种变化最容易让你想到——"
options: 4个同层级的解释/担忧，全部针对该关系
stage: locate_pain
` : ''

      const systemPrompt = `你是底色——帮助用户认识自己内在模式的探索伙伴。
${profileHint}
${firstTurnGuide}

# reflection 规则（最优先，覆盖其他所有规则）：

多数追问轮次 reflection 应返回 ""（空字符串），直接问下一个问题。
只在以下情况才填写，最多25字，不超过一行：
1. 连接用户前后两段信息中用户自己没说出来的联系
2. 提炼出用户没直接表达的共同点
3. 区分两个用户可能混淆的感受

禁止（必须返回 ""）：
- 用户选了清晰选项，reflection 只是换个说法复述 → 没新信息
- "你在意X" 而用户刚选了"我在意X" → 完全复述
- 连续两轮都填 reflection → 第二轮必须返回 ""

# 硬规则（任何轮次都必须遵守）：

1. reflection 见上方规则，大多数轮次为 ""。如填写，最多25字，不是心理学总结，不预判原因。
2. question 只问一件事，不超过25字。
3. options 必须全部属于同一层级——全是感受，或全是担忧，或全是行为，或全是领域。禁止混用。
4. 每个 option 必须与用户说的事件直接相关，不能是通用心理学选项。
5. 信息不足时 isDomainCheck: true，先问领域。
6. 禁止诊断。使用：好像/可能/有没有一种可能。
7. 上一轮用户否认的方向，下一轮不重复。
8. 不允许在前2轮直接跳到人格分析或规则推断。

# 阶段顺序（不跳跃）：
understand_event → locate_pain → behavior → pattern → need → rule

当前轮次：${turnCount}
事件：${event}

历史：
${historyLines || '（首次）'}

只返回合法JSON（无其他字符）：
{
  "reflection": "...",
  "question": "...",
  "options": ["...", "...", "..."],
  "stage": "understand_event|locate_pain|behavior|pattern|need|rule",
  "isDomainCheck": false,
  "insightCandidate": null,
  "readyForSynthesis": false,
  "synthesisContext": { "emotion": "", "behavior": "", "need": "", "defense": "" }
}

readyForSynthesis: true 仅当 turnCount>=5 且已到 need 或 rule 阶段时设置。
届时 synthesisContext 从历史提取用户实际说的内容。`

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 600,
          temperature: 0.75,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: '请根据当前对话状态生成下一步探索。' },
          ],
        }),
      })
      const data: any = await resp.json()
      const raw: string = data.choices?.[0]?.message?.content ?? ''

      try {
        let jsonText = raw.trim()
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
        }
        return new Response(JSON.stringify(JSON.parse(jsonText)), { headers: cors })
      } catch {
        return new Response(JSON.stringify({
          reflection: '我在听。',
          question: '这件事，最让你放不下的是哪里？',
          options: ['一种说不清的难受', '对关系或事情走向的担心', '对自己的某种怀疑', '失去了掌控感'],
          stage: 'locate_pain',
          isDomainCheck: false,
          insightCandidate: null,
          readyForSynthesis: false,
          synthesisContext: { emotion: '', behavior: '', need: '', defense: '' },
        }), { headers: cors })
      }
    }

    // ── 浮现 第一层 ──────────────────────────────────────────────────────
    if (mode === 'emergence') {
      const { event, emotion, behavior } = body
      const systemPrompt = `你是一个观察者，不是顾问。

用户分享了：
- 事件：${event}
- 当时感受：${emotion}
- 之后行为：${behavior}

给出一段40-80字的直觉式洞察。要求：
- 不用任何铺垫，直接说你看到的联系
- 用"好像""可能""有时候"等，不下结论
- 说的是模式，不是评判
- 第二人称
- 让人读了之后，停顿一下`

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 200,
          temperature: 0.8,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: '请给出洞察。' }],
        }),
      })
      const data: any = await resp.json()
      const text: string = data.choices?.[0]?.message?.content ?? ''
      return new Response(JSON.stringify({ text }), { headers: cors })
    }

    // ── 本次发现 ─────────────────────────────────────────────────────────
    if (mode === 'discovery') {
      const { event, emotion, behavior, need, defense } = body
      const systemPrompt = `你是底色产品的模式发现者。用户完成了一次自我探索。

探索数据：
- 事件：${event}
- 感受/痛点：${emotion || '（未明确）'}
- 行为反应：${behavior || '（未明确）'}
- 真正需要：${need || '（未明确）'}
- 保护方式：${defense || '（未明确）'}

只返回 JSON，不加任何其他内容：
{
  "emergence2": "40-80字，一条更深的洞察，聚焦于隐形规则或这种模式可能的来源。用'有时候，……'或'有没有一种可能，……'开头。让人读完觉得被看见了。",
  "experiencing": "第二人称，30字以内，描述用户此刻经历的困境，具体而不笼统",
  "pattern": "30字以内，说出你注意到的行为或情感模式，用'当……时，你……'结构",
  "protecting": "30字以内，用户可能在保护的东西，用'比起……，你更害怕……'或'你似乎更在意……'",
  "rule": "一条隐形规则，用「」括起来，10-18字，让人一读就心里咔哒一声",
  "helpedBefore": "40字以内，这条规则曾经如何帮助过用户，具体",
  "costNow": "40字以内，它现在可能让用户付出的代价，具体",
  "newQuestion": "一个值得思考的问题，不是建议，不是答案，只是一个让人想停下来想想的问题"
}

要求：基于用户说的真实内容，不泛化，不套路。`

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 800,
          temperature: 0.75,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: '请生成分析。' }],
        }),
      })
      const data: any = await resp.json()
      const raw: string = data.choices?.[0]?.message?.content ?? ''

      try {
        let jsonText = raw.trim()
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
        }
        const parsed = JSON.parse(jsonText)
        const { emergence2, ...discovery } = parsed
        return new Response(JSON.stringify({ emergence2, discovery }), { headers: cors })
      } catch {
        return new Response(JSON.stringify({
          emergence2: '有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。',
          discovery: {
            experiencing: `你正在经历来自「${emotion || '这件事'}」的压力，同时用「${behavior || '某种方式'}」来应对`,
            pattern: `当${emotion || '这种感受'}出现时，你倾向于${behavior || '某种反应'}`,
            protecting: `你可能在保护自己，不去面对「${need || '某种需要'}」得不到满足的感受`,
            rule: `「只有先${defense || '用某种方式保护自己'}，才能维持稳定」`,
            helpedBefore: `这种方式曾经帮你避免了更多的冲突，让事情维持在一个可控的状态`,
            costNow: `但它也让你习惯性地先压缩自己，再去顾及真正想要的`,
            newQuestion: `下一次这种感觉出现时，可以先停一下：我真正需要的是什么？`,
          },
        }), { headers: cors })
      }
    }

    // ── 结构化探索对话 ────────────────────────────────────────────────────
    if (mode === 'explore') {
      const { messages, initialEvent, userCount: clientUserCount } = body
      const userCount: number = clientUserCount ?? messages.filter((m: any) => m.role === 'user').length
      const isSynthesis = userCount >= 5

      const layerGuide = [
        '感受层：情绪是什么？在身体哪里？',
        '反应层：当时做了什么，或没做什么？',
        '需要层：那一刻真正需要的是什么？',
        '防御层：如何保护自己？',
        '规则层：如果有一条隐形规则在背后，它会是什么？',
      ]
      const currentLayerHint = layerGuide[Math.min(userCount - 1, layerGuide.length - 1)]

      const systemPrompt = isSynthesis
        ? `只返回JSON：{"experiencing":"","protection":"","afraid":"","rule":""}`
        : `你是模式探索伙伴。当前探索重心：${currentLayerHint}。
先用一句话映射你听到的，再问一个聚焦问题。每次只问一个。不用"你是不是""有没有"。中文，直接输出。`

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: isSynthesis ? 400 : 160,
          temperature: 0.85,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      })
      const data: any = await resp.json()
      const text: string = data.choices?.[0]?.message?.content ?? ''

      if (isSynthesis) {
        try {
          let j = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          const discoveryData = JSON.parse(j)
          return new Response(JSON.stringify({ text, isSynthesis: true, discoveryData }), { headers: cors })
        } catch {
          return new Response(JSON.stringify({ text, isSynthesis: false }), { headers: cors })
        }
      }
      return new Response(JSON.stringify({ text, isSynthesis: false }), { headers: cors })
    }

    // ── 人格测评对话 ─────────────────────────────────────────────────────
    const { messages, result, characterName, characterDesc } = body
    const userCount: number = messages.filter((m: any) => m.role === 'user').length
    const isSynthesis = userCount >= 3

    const systemPrompt = isSynthesis
      ? `你是底色产品的对话伙伴。用户：${characterName}（${result?.q1} / ${result?.q2} / ${result?.q3} / ${result?.q4}）。描述：${characterDesc}。
基于对话内容生成120-160字"你的底层逻辑"：第二人称，基于用户真实说的，说出他可能没意识到的，不建议不口号，最后一句指向值得留意的地方，直接输出不加标题。`
      : `你是真正在听的人。每次只问一个问题，来自用户刚说的话。不用"你是不是""有没有"。问感受问细节。不给建议不总结。语气好奇简洁。中文直接输出。`

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: isSynthesis ? 500 : 180,
        temperature: 0.85,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })
    const data: any = await resp.json()
    const text: string = data.choices?.[0]?.message?.content ?? '出了点问题，请重试。'
    return new Response(JSON.stringify({ text, isSynthesis }), { headers: cors })

  } catch {
    return new Response(JSON.stringify({ text: '连接失败，请稍后重试。', isSynthesis: false }), { headers: cors })
  }
}

export const onRequestOptions = async () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
