import { createContext, useContext, useReducer, type ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Screen = 'info' | 'tutorial' | 'exam' | 'result'

export interface StudentInfo {
  name: string
  school: string
  grade: number
  studentNumber: number
  seatNumber: number
}

export interface QuestionResult {
  answerType: 'objective' | 'subjective'
  number: number
  result: 'correct' | 'wrong' | 'unanswered'
}

export interface ExamResult {
  title: string
  score: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  results: QuestionResult[]
}

export interface ExamState {
  screen: Screen
  studentInfo: StudentInfo | null
  answers: {
    objective: Record<number, number>   // { 문항번호: 선택지(1~5) }
    subjective: Record<number, string>  // { 문항번호: 입력문자열 }
  }
  examResult: ExamResult | null
}

type Action =
  | { type: 'SET_STUDENT'; payload: StudentInfo }
  | { type: 'START_EXAM' }
  | { type: 'SET_OBJECTIVE_ANSWER'; number: number; answer: number }
  | { type: 'SET_SUBJECTIVE_ANSWER'; number: number; answer: string }
  | { type: 'SET_RESULT'; payload: ExamResult }
  | { type: 'RESET' }

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: ExamState = {
  screen: 'info',
  studentInfo: null,
  answers: { objective: {}, subjective: {} },
  examResult: null,
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function examReducer(state: ExamState, action: Action): ExamState {
  switch (action.type) {
    case 'SET_STUDENT':
      return { ...state, studentInfo: action.payload, screen: 'tutorial' }

    case 'START_EXAM':
      return { ...state, screen: 'exam' }

    case 'SET_OBJECTIVE_ANSWER': {
      const current = state.answers.objective[action.number]
      // 같은 선택지 다시 터치하면 해제 (토글)
      if (current === action.answer) {
        const next = { ...state.answers.objective }
        delete next[action.number]
        return { ...state, answers: { ...state.answers, objective: next } }
      }
      return {
        ...state,
        answers: {
          ...state.answers,
          objective: { ...state.answers.objective, [action.number]: action.answer },
        },
      }
    }

    case 'SET_SUBJECTIVE_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          subjective: { ...state.answers.subjective, [action.number]: action.answer },
        },
      }

    case 'SET_RESULT':
      return { ...state, examResult: action.payload, screen: 'result' }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ExamContext = createContext<{
  state: ExamState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(examReducer, initialState)
  return (
    <ExamContext.Provider value={{ state, dispatch }}>
      {children}
    </ExamContext.Provider>
  )
}

export function useExam() {
  const ctx = useContext(ExamContext)
  if (!ctx) throw new Error('useExam must be used within ExamProvider')
  return ctx
}
