export const onRequestPost = async (context: any) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    const apiKey: string = context.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ text: '服务未配置，请稍后再试。', isSynthesis: false }), { status: 500, headers: cors })
    }

    const { messages, result, characterName, characterDesc, mode, initialEvent, userCount: clientUserCount } = await context.request.json()
    const userCount: number = clientUserCount ?? messages.filter((m: any) => m.role === 'user').length

    if (mode === 'explore') {
      const isSynthesis = userCount >= 5

      const layerGuide = [
        '感受层：情绪是什么？在身体哪里？是什么颜色或质地？',
        '反应层：当时做了什么，或没做什么？那个动作/沉默是什么意思？',
        '需要层：那一刻真正需要的是什么？',
        '防御层：用什么方式保护自己？这个保护以前也出现过吗？',
        '规则层：如果有一条隐形规则在背后运作，它会是什么？',
      ]

      const currentLayerHint = layerGuide[Math.min(userCount - 1, layerGuide.length - 1)] ?? layerGuide[layerGuide.length - 1]

      const systemPrompt = isSynthesis
        ? `你是底色产品的模式发现者。根据以下对话生成"本次发现"卡片。

只返回 JSON，不加任何其他内容：
{
  "experiencing": "用第二人称，20字以内，描述用户正在经历的表层状态",
  "protection": "20字以内，描述他如何保护自己或防御",
  "afraid": "20字以内，描述他可能真正害怕的或深层需要",
  "rule": "一句话，写出那条隐形规则，用「」括起来，如：「做完了才算值得」"
}

要求：完全基于用户说的真实内容，不泛化，不套路，每条都让用户认出自己。`
        : `你是一个模式探索伙伴。用户分享了一件放不下的事，通过对话帮他们看见背后的模式。

当前进度：用户已说了 ${userCount} 条。当前探索重心：${currentLayerHint}

回应格式（严格按顺序）：
1. 先用一句话映射你听到的——不是复述，而是说出你感受到的重量或核心。不加任何铺垫，直接说。
2. 然后问一个问题，聚焦在当前探索层上。

提问规则：
- 每次只问一个问题
- 问题从用户刚说的话里来，不来自你的预判
- 不用"你是不是""有没有""会不会"开头
- 问感受、问细节、问那一刻："那是什么感觉？""你当时脑子里在转什么？""那一刻你需要的是什么？"
- 他没说的不替他说
- 不给建议，不总结，不给标签
- 语气：好奇，简洁，不评判
- 中文，直接输出，不加任何额外铺垫`

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: isSynthesis ? 400 : 160,
          temperature: isSynthesis ? 0.7 : 0.85,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      })

      const data: any = await resp.json()
      const text: string = data.choices?.[0]?.message?.content ?? '出了点问题，请重试。'

      if (isSynthesis) {
        try {
          let jsonText = text.trim()
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          }
          const discoveryData = JSON.parse(jsonText)
          return new Response(JSON.stringify({ text, isSynthesis: true, discoveryData }), { headers: cors })
        } catch {
          return new Response(JSON.stringify({ text, isSynthesis: false }), { headers: cors })
        }
      }

      return new Response(JSON.stringify({ text, isSynthesis: false }), { headers: cors })
    }

    // 人格测评对话模式（原有逻辑）
    const isSynthesis = userCount >= 3

    const systemPrompt = isSynthesis
      ? `你是"底色"产品的对话伙伴。

用户测评结果：${characterName}（${result.q1} / ${result.q2} / ${result.q3} / ${result.q4}）
角色描述：${characterDesc}

用户刚回答了3个问题。现在基于对话内容，生成一段"你的底层逻辑"：
- 120-160字，用"你"，第二人称
- 必须基于用户在对话中说的真实内容，不只重复测评描述
- 说出用户自己可能没有清楚意识到的东西
- 不给建议，不喊口号，只是精准描述
- 最后一句指向一个值得留意的地方
- 直接输出内容，不要加标题`
      : `你是一个真正在听的人。

你的任务不是引导用户确认某个结论，而是帮他们说出自己还没说清楚的东西。

提问原则：
- 每次只问一个问题
- 问题来自用户刚说的话，不来自你对他们"类型"的预判
- 不问引导性问题——不要用"你是不是……""有没有……""会不会……"开头
- 问感受、问当时那一刻、问具体的细节："那是什么感觉？""那一刻你脑子里在想什么？""那对你来说意味着什么？"
- 不要帮用户填空——他们没说的东西不要替他们说出来
- 不要引用类型标签，不要说"作为某某类型的人"
- 不给建议，不总结，只是真的想听
- 语气：好奇，不评判，直接，简洁
- 中文，直接输出问题，不加铺垫`

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
