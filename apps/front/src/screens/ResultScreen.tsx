import { useState } from 'react'
import { useExam } from '../context/ExamContext'

type Tab = 'objective' | 'subjective'

const RESULT_STYLE = {
  correct:    { label: '정답', icon: '✓', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  wrong:      { label: '오답', icon: '✗', color: 'text-red-500',   bg: 'bg-red-50',   border: 'border-red-100' },
  unanswered: { label: '미응답', icon: '—', color: 'text-gray-400', bg: 'bg-gray-50',  border: 'border-gray-100' },
}

export default function ResultScreen() {
  const { state, dispatch } = useExam()
  const { examResult, studentInfo, answers } = state
  const [tab, setTab] = useState<Tab>('objective')

  if (!examResult || !studentInfo) return null

  const totalScore = 100
  const scorePercent = Math.round((examResult.score / totalScore) * 100)

  const objectiveResults = examResult.results.filter(r => r.answerType === 'objective')
  const subjectiveResults = examResult.results.filter(r => r.answerType === 'subjective')
  const currentResults = tab === 'objective' ? objectiveResults : subjectiveResults

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center py-12 px-6">
      {/* 제출 완료 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">제출 완료!</h1>
        <p className="text-gray-500">고생 많았어요. 결과를 확인해볼까요?</p>
      </div>

      {/* 학생 정보 + 점수 요약 카드 */}
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
          <span className="font-semibold text-gray-700">{studentInfo.name} 학생</span>
          <span>{studentInfo.school} · {studentInfo.grade}학년 · {studentInfo.studentNumber}번</span>
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 mb-2">{examResult.title}</p>
          <div className="text-7xl font-extrabold text-gray-900 leading-none">
            {examResult.score}
            <span className="text-3xl text-gray-300 font-bold">/{totalScore}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            정답률 {scorePercent}%
          </p>
        </div>

        {/* 정답/오답/미응답 통계 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-3xl font-extrabold text-green-600">{examResult.correctCount}</p>
            <p className="text-xs text-green-500 font-semibold mt-1">정답</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-3xl font-extrabold text-red-500">{examResult.wrongCount}</p>
            <p className="text-xs text-red-400 font-semibold mt-1">오답</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-3xl font-extrabold text-gray-400">{examResult.unansweredCount}</p>
            <p className="text-xs text-gray-400 font-semibold mt-1">미응답</p>
          </div>
        </div>
      </div>

      {/* 문항별 결과 */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg mb-6 overflow-hidden">
        {/* 탭 */}
        <div className="flex border-b border-gray-100">
          {(['objective', 'subjective'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${
                tab === t
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'objective' ? `객관식 (${objectiveResults.length}문항)` : `주관식 (${subjectiveResults.length}문항)`}
            </button>
          ))}
        </div>

        {/* 결과 목록 */}
        <div className="divide-y divide-gray-50">
          {currentResults.map(r => {
            const style = RESULT_STYLE[r.result]
            const myAnswer = r.answerType === 'objective'
              ? answers.objective[r.number]
              : answers.subjective[r.number]
            return (
              <div key={r.number} className={`flex items-center justify-between px-6 py-3 ${style.bg}`}>
                <span className="text-sm font-bold text-gray-700 w-12">{r.number}번</span>
                <span className="text-sm text-gray-500 flex-1">
                  내 답: <span className="font-semibold text-gray-700">{myAnswer ?? '—'}</span>
                </span>
                <span className={`text-sm font-extrabold ${style.color} flex items-center gap-1`}>
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 종료 버튼 */}
      <button
        onClick={() => dispatch({ type: 'RESET' })}
        className="w-full max-w-lg py-4 rounded-xl font-extrabold text-gray-700 border-2 border-gray-300 bg-white hover:bg-gray-50 active:scale-95 transition-transform"
      >
        종료하기
      </button>
    </div>
  )
}
