import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

export async function saveResult(data: {
  q1: string
  q2: string
  q3: string
  q4: string
  answers: Record<number, string>
}) {
  if (!supabase) return
  await supabase.from('results').insert({
    q1: data.q1,
    q2: data.q2,
    q3: data.q3,
    q4: data.q4,
    answers: data.answers,
    created_at: new Date().toISOString(),
  })
}
