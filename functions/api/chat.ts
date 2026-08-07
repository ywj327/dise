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

    // ── 底色浮现 第一层 ──────────────────────────────────────────
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

    // ── 本次发现 + 底色浮现 第二层 ──────────────────────────────────
    if (mode === 'discovery') {
      const { event, emotion, behavior, need, defense } = body
      const systemPrompt = `你是底色产品的模式发现者。用户完成了一次自我探索。

探索数据：
- 事件：${event}
- 感受：${emotion}
- 行为反应：${behavior}
- 真正需要：${need}
- 保护方式：${defense}

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
        // fallback
        return new Response(JSON.stringify({
          emergence2: '有没有一种可能，这不只是这件事本身的问题。它只是这次刚好让你注意到了，一直在那里的东西。',
          discovery: {
            experiencing: `你正在经历来自「${emotion}」的压力，同时用「${behavior}」来应对它`,
            pattern: `当${emotion}出现时，你倾向于${behavior}`,
            protecting: `你可能在保护自己，不去面对「${need}」得不到满足的感受`,
            rule: `「只有先${defense}，才能维持稳定」`,
            helpedBefore: `这种方式曾经帮你避免了更多的冲突，让关系维持在一个可控的状态`,
            costNow: `但它也让你习惯性地先压缩自己，再去顾及别人的需要`,
            newQuestion: `下一次这种感觉出现时，可以先停一下：我真正需要的是什么？它值得被说出来吗？`,
          },
        }), { headers: cors })
      }
    }

    // ── 结构化探索对话（原有 explore 模式）───────────────────────────
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

    // ── 人格测评对话（chat 模式）────────────────────────────────────
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
