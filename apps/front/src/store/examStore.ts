import { create } from 'zustand'
import { ExamResult } from '../api/exam'

// ─── Types ───────────────────────────────────────────────────────────────────

export type Screen = 'info' | 'tutorial' | 'exam' | 'result'

export interface StudentInfo {
  name: string
  school: string
  grade: number
  studentNumber: number
  seatNumber: number
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface ExamStore {
  screen: Screen
  studentInfo: StudentInfo | null
  answers: {
    objective: Record<number, number>
    subjective: Record<number, string>
  }
  examResult: ExamResult | null

  setStudent: (info: StudentInfo) => void
  startExam: () => void
  setObjectiveAnswer: (number: number, answer: number) => void
  setSubjectiveAnswer: (number: number, answer: string) => void
  setResult: (result: ExamResult) => void
  reset: () => void
}

export const useExamStore = create<ExamStore>()((set, get) => ({
  screen: 'info',
  studentInfo: null,
  answers: { objective: {}, subjective: {} },
  examResult: null,

  setStudent: (info) => set({ studentInfo: info, screen: 'tutorial' }),

  startExam: () => set({ screen: 'exam' }),

  setObjectiveAnswer: (number, answer) => {
    const { answers } = get()
    const nextObjective = { ...answers.objective }
    if (nextObjective[number] === answer) {
      delete nextObjective[number]
    } else {
      nextObjective[number] = answer
    }
    set({ answers: { ...answers, objective: nextObjective } })
  },

  setSubjectiveAnswer: (number, answer) => {
    const { answers } = get()
    set({
      answers: {
        ...answers,
        subjective: { ...answers.subjective, [number]: answer },
      },
    })
  },

  setResult: (result) => set({ examResult: result, screen: 'result' }),

  reset: () =>
    set({
      screen: 'info',
      studentInfo: null,
      answers: { objective: {}, subjective: {} },
      examResult: null,
    }),
}))
