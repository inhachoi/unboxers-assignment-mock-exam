export interface ExamInfo {
  title: string
  description: string
  supervisorName: string
  totalQuestions: number
  totalScore: number
}

export interface SubmitAnswer {
  answerType: 'objective' | 'subjective'
  number: number
  answer: number
}

export interface SubmitPayload {
  name: string
  school: string
  grade: number
  studentNumber: number
  seatNumber: number
  answers: SubmitAnswer[]
}

export interface ExamResult {
  title: string
  score: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  results: Array<{
    answerType: 'objective' | 'subjective'
    number: number
    result: 'correct' | 'wrong' | 'unanswered'
  }>
}

export async function getExam(): Promise<ExamInfo> {
  const res = await fetch('/api/exams')
  if (!res.ok) throw new Error('시험 정보를 불러오지 못했습니다.')
  const json = await res.json()
  return json.data
}

export async function submitExam(payload: SubmitPayload): Promise<ExamResult> {
  const res = await fetch('/api/exams/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('답안 제출에 실패했습니다.')
  const json = await res.json()
  return json.data
}

// 주관식 답안 문자열을 정수로 파싱 (예: "-3/2" → -2, "21" → 21)
// 파싱 불가 시 null 반환
export function parseSubjectiveAnswer(raw: string): number | null {
  if (!raw.trim()) return null
  try {
    if (!/^-?[\d.]+(\/-?[\d.]+)?$/.test(raw.trim())) return null
    const parts = raw.split('/')
    if (parts.length === 1) {
      const n = parseFloat(parts[0])
      return isNaN(n) ? null : Math.round(n)
    }
    if (parts.length === 2) {
      const num = parseFloat(parts[0])
      const den = parseFloat(parts[1])
      if (isNaN(num) || isNaN(den) || den === 0) return null
      return Math.round(num / den)
    }
    return null
  } catch {
    return null
  }
}

// ExamState.answers를 SubmitAnswer[] 로 변환
export function buildAnswerPayload(answers: {
  objective: Record<number, number>
  subjective: Record<number, string>
}): SubmitAnswer[] {
  const result: SubmitAnswer[] = []

  for (const [num, ans] of Object.entries(answers.objective)) {
    result.push({ answerType: 'objective', number: Number(num), answer: ans })
  }

  for (const [num, raw] of Object.entries(answers.subjective)) {
    const parsed = parseSubjectiveAnswer(raw)
    if (parsed !== null) {
      result.push({ answerType: 'subjective', number: Number(num), answer: parsed })
    }
  }

  return result
}
