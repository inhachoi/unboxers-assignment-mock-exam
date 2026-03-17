import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useExamStore } from '../store/examStore'
import OMRCard from '../components/OMRCard'
import Timer from '../components/Timer'
import { submitExam, buildAnswerPayload } from '../api/exam'

export default function ExamScreen() {
  const { studentInfo, answers, setResult } = useExamStore(
    useShallow(s => ({ studentInfo: s.studentInfo, answers: s.answers, setResult: s.setResult }))
  )
  const reset = useExamStore(s => s.reset)
  const [examStarted, setExamStarted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showHomeConfirm, setShowHomeConfirm] = useState(false)

  const mutation = useMutation({
    mutationFn: submitExam,
    onSuccess: (data) => {
      setResult(data)
    },
    onError: () => {
      setShowConfirm(false)
      alert('답안 제출에 실패했습니다. 서버가 실행 중인지 확인하고 다시 시도해주세요.')
    },
  })

  const handleSubmit = useCallback(() => {
    if (!studentInfo || mutation.isPending) return
    const payload = {
      ...studentInfo,
      answers: buildAnswerPayload(answers),
    }
    mutation.mutate(payload)
  }, [studentInfo, answers, mutation])

  const handleExamEnd = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  const handleExamStart = useCallback(() => {
    setExamStarted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* 통합 네비게이션 바 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-8 py-3 grid grid-cols-3 items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHomeConfirm(true)}
            className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
          >
            ← 홈으로
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-bold text-gray-800">모의고사 모드</span>
          {studentInfo?.name && (
            <span className="text-sm text-gray-500">{studentInfo.name} 학생</span>
          )}
        </div>

        <div className="flex justify-center">
          <Timer onExamStart={handleExamStart} onExamEnd={handleExamEnd} />
        </div>

        <div className="flex justify-end">
          {examStarted && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={mutation.isPending}
              className="px-6 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] disabled:opacity-50 active:scale-95 transition-transform whitespace-nowrap"
            >
              답안 제출하기
            </button>
          )}
        </div>
      </div>

      {/* OMR 카드 */}
      <div className={`flex-1 flex items-start justify-center px-8 py-8 transition-opacity duration-500 ${
        examStarted ? 'opacity-100' : 'opacity-30 pointer-events-none'
      }`}>
        <OMRCard />
      </div>

      {!examStarted && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ top: '120px' }}>
          <p className="text-gray-400 text-sm font-semibold">시험 시작 후 답안을 입력할 수 있습니다</p>
        </div>
      )}

      {/* 홈으로 확인 모달 */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">홈으로 돌아갈까요?</h3>
            <p className="text-sm text-gray-500 mb-6">
              진행 중인 시험과 입력한 답안이 모두 사라집니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHomeConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 active:scale-95 transition-transform"
              >
                취소
              </button>
              <button
                onClick={() => reset()}
                className="flex-1 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] active:scale-95 transition-transform"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 제출 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">답안을 제출할까요?</h3>
            <p className="text-sm text-gray-500 mb-6">
              제출 후에는 답안을 수정할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 active:scale-95 transition-transform"
              >
                취소
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit() }}
                className="flex-1 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] active:scale-95 transition-transform"
              >
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채점 중 로딩 오버레이 */}
      {mutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <p className="font-bold text-gray-800 text-lg">채점 중...</p>
            <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </div>
  )
}
