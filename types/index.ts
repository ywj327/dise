export type Q1Type = '回避型' | '焦虑型' | '表演型' | '安全型'
export type Q2Type = '认可驱动' | '自主驱动' | '意义驱动' | '成就驱动'
export type Q3Type = '方向未定型' | '执行卡壳型' | '身份过渡型' | '过载运转型'
export type Q4Type = '能力拓展型' | '生活方式型' | '影响力型' | '稳定感型'

export interface Result {
  q1: Q1Type
  q2: Q2Type
  q3: Q3Type
  q4: Q4Type
}

export interface Option {
  text: string
  type: string
}

export interface Question {
  id: number
  quadrant: 1 | 2 | 3 | 4
  text: string
  options: Option[]
}
