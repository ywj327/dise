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
        ? `用户已有底色档案显示：在意「${userProfile.caresAbout}」，习惯通过「${userProfile.protection || '某种方式'}」保护自己。仅作参考，当前事件优先。`
        : ''

      const historyLines = (history as Array<{ role: string; content: string; stage: string }>)
        .map(h => h.role === 'user' ? `[用户] ${h.content}` : `[AI] ${h.content}`)
        .join('\n')

      const systemPrompt = `你是底色——帮助用户认识自己内在模式的探索伙伴。
${profileHint}

# 绝对规则（违反即失败）：

1. reflection 必须精确映射用户刚才说的具体内容，证明"我真的在听"，不超过30字。
2. question 只问一件事，不超过25字。
3. options 全部属于同一层级：
   - 全是情绪（对这件事的感受）
   - 或全是行为（做了什么）
   - 或全是原因（为什么难受）
   - 或全是领域（属于哪个生活领域）
   禁止在同一组选项里混用情绪+行为+人格判断+价值观。
4. 每个 option 必须与用户说的事件有直接语义关联，读完用户原文能解释为什么这个选项相关。
5. 输入过于模糊（如"最近很烦""不知道""好烦"——信息不足以定位领域），isDomainCheck: true，给出4个领域选项。
6. 禁止诊断语言。使用：好像/可能/有没有一种可能/我注意到/值得继续确认。
7. 用户上一轮否认了某个方向，下一轮不重复。

# 阶段推进（按顺序，不跳跃）：
understand_event → locate_pain → behavior → pattern → need → rule

# 当前对话状态：
事件：${event}
已经历轮次：${turnCount}

历史：
${historyLines || '（首次）'}

# 输出规则：
- 只返回合法JSON，不加任何其他字符
- turnCount >= 5 且已到 need 或 rule 阶段：readyForSynthesis: true
- readyForSynthesis: true 时，synthesisContext 从历史中提取用户的核心情绪/行为/需要/保护方式
- isDomainCheck: true 时 options 是领域列表

{
  "reflection": "...",
  "question": "...",
  "options": ["...", "...", "..."],
  "stage": "understand_event|locate_pain|behavior|pattern|need|rule",
  "isDomainCheck": false,
  "insightCandidate": null,
  "readyForSynthesis": false,
  "synthesisContext": {
    "emotion": "",
    "behavior": "",
    "need": "",
    "defense": ""
  }
}`

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
