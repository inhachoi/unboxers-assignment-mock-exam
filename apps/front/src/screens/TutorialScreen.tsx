import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useExam } from '../context/ExamContext'
import Header from '../components/Header'
import { getExam } from '../api/exam'

const TUTORIAL_STEPS = [
  {
    title: '모의고사 모드에 오신 것을 환영해요!',
    description: '실제 시험지 크기에 인쇄된 시험지에 문제를 풀고\n화면에 표시된 OMR카드에 답을 마킹해요',
  },
  {
    title: '시험을 선택해요',
    description: '모의고사 모드는 처음이시죠? 실전 모의고사는\n실전과 최대한 비슷한 환경으로 진행돼요',
  },
  {
    title: '객관식 답안을 마킹해요',
    description: '객관식 답안은 화면을 터치해서 마킹해요\n15번 문제에 3번으로 답안을 마킹해보세요',
  },
  {
    title: '마킹을 지울 수 있어요',
    description: '마킹한 곳을 한 번 더 터치하면 지울 수 있어요\n15번 문제에 3번 답안을 지워보세요',
  },
  {
    title: '복수 정답도 있어요',
    description: '2개 이상의 답안을 골라야 하는 문제에서는\n두 답안 모두 마킹하면 돼요',
  },
  {
    title: '주관식 답안을 입력해요',
    description: '주관식 답안을 입력하려면 입력할 곳을 터치해요\n4번 문제의 답안을 입력해볼까요?',
  },
  {
    title: '완료 버튼을 눌러요',
    description: '아무 숫자나 입력하고\n완료 버튼을 눌러서 답안을 작성해요',
  },
  {
    title: '답안을 수정할 수 있어요',
    description: '입력한 답안을 수정하려면\n해당 문제를 다시 한 번 터치해요',
  },
  {
    title: '시간이 지나면 자동 제출돼요',
    description: '시간이 모두 지나면 시험은 종료되고 OMR카드는 자동으로 제출돼요\n마킹하지 못한 답안은 모두 오답 처리되니 미리 마킹하세요',
  },
  {
    title: '준비됐나요?',
    description: '튜토리얼을 모두 완료했어요!\n이제 실제 시험을 시작할 준비가 됐어요',
  },
]

export default function TutorialScreen() {
  const { state, dispatch } = useExam()
  const [step, setStep] = useState(0)

  const { data: examInfo } = useQuery({
    queryKey: ['exam'],
    queryFn: getExam,
  })

  const current = TUTORIAL_STEPS[step]
  const isLast = step === TUTORIAL_STEPS.length - 1

  function handleNext() {
    if (isLast) {
      dispatch({ type: 'START_EXAM' })
    } else {
      setStep(s => s + 1)
    }
  }

  function handlePrev() {
    setStep(s => Math.max(0, s - 1))
  }

  function handleSkip() {
    dispatch({ type: 'START_EXAM' })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Header studentName={state.studentInfo?.name} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {examInfo && (
          <p className="text-sm text-gray-500 mb-6">
            {examInfo.title} · 총 {examInfo.totalQuestions}문항 · {examInfo.totalScore}점
          </p>
        )}

        {/* 진행 바 */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>튜토리얼</span>
            <span>{step + 1} / {TUTORIAL_STEPS.length}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gray-800 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-lg text-center">
          <p className="text-xs font-bold text-gray-400 mb-3">STEP {step + 1}</p>
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">{current.title}</h2>
          <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {current.description}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-8 w-full max-w-lg">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-4 rounded-xl border border-gray-300 font-bold text-gray-700 bg-white active:scale-95 transition-transform"
            >
              이전으로
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] active:scale-95 transition-transform"
          >
            {isLast ? '시험 화면으로 이동' : '다음으로'}
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="mt-4 text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
        >
          튜토리얼 건너뛰기
        </button>
      </div>
    </div>
  )
}
