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
      : `你是"底色"产品的对话伙伴。

用户测评结果：${characterName}（${result.q1} / ${result.q2} / ${result.q3} / ${result.q4}）
角色描述：${characterDesc}

通过对话帮用户看清自己的底层模式。规则：
- 每次只问一个问题，等用户回答后再继续
- 问题具体，指向真实经历（不问"你幸福吗"这类空泛问题）
- 根据用户回答自然追问，不要跳跃话题
- 语气温暖直接，像真正懂你的朋友
- 中文，简洁，不废话
- 不给建议，不重复用户说的话
- 直接输出问题，不要加解释或铺垫
- 用户看到了一段针对他们角色的开场白后开始了对话，自然承接他们说的内容`

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

