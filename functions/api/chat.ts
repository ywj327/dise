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

    const { messages, result, characterName, characterDesc } = await context.request.json()
    const userCount: number = messages.filter((m: any) => m.role === 'user').length
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
- 问感受、问当时那一刻、问具体的细节：
  "那是什么感觉？""那一刻你脑子里在想什么？""那对你来说意味着什么？"
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

