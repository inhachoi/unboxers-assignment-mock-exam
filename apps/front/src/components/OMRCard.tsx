import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useExamStore } from '../store/examStore'
import Keypad from './Keypad'

const OBJECTIVE_COUNT = 14
const SUBJECTIVE_COUNT = 11
const CHOICES = [1, 2, 3, 4, 5]

export default function OMRCard() {
  const { answers, setObjectiveAnswer, setSubjectiveAnswer } = useExamStore(
    useShallow(s => ({ answers: s.answers, setObjectiveAnswer: s.setObjectiveAnswer, setSubjectiveAnswer: s.setSubjectiveAnswer }))
  )
  const [activeSubjective, setActiveSubjective] = useState<number | null>(null)
  const [keypadValue, setKeypadValue] = useState('')

  function handleObjectiveClick(questionNum: number, choice: number) {
    setObjectiveAnswer(questionNum, choice)
  }

  function openKeypad(questionNum: number) {
    setActiveSubjective(questionNum)
    setKeypadValue(answers.subjective[questionNum] ?? '')
  }

  function handleKeypadConfirm() {
    if (activeSubjective !== null) {
      setSubjectiveAnswer(activeSubjective, keypadValue)
    }
    setActiveSubjective(null)
    setKeypadValue('')
  }

  function handleKeypadClose() {
    setActiveSubjective(null)
    setKeypadValue('')
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl mx-auto">
        {/* OMR 카드 헤더 */}
        <div className="text-center mb-6 border-b border-gray-200 pb-4">
          <p className="text-xs text-gray-500 tracking-widest">학생답안 입력용</p>
          <h2 className="text-2xl font-extrabold tracking-[0.3em] text-gray-900">OMR 카드</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            객관식 답안은 터치해서 칠하고, 주관식 답안은 터치한 뒤 키패드로 입력해요.
          </p>
          <p className="text-xs text-red-500 mt-1 font-semibold">
            답안을 작성하지 않고 제출하면 별도의 경고 없이 오답으로 처리되니 주의하세요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* 객관식 */}
          <div>
            <h3 className="text-sm font-extrabold text-center tracking-[0.2em] text-gray-700 mb-4">
              객 관 식 답 안
            </h3>
            <div className="flex flex-col gap-2">
              {Array.from({ length: OBJECTIVE_COUNT }, (_, i) => i + 1).map(num => (
                <div key={num} className="flex items-center gap-2">
                  <span className="w-6 text-right text-sm font-bold text-gray-500 shrink-0">{num}</span>
                  <div className="flex gap-1.5">
                    {CHOICES.map(choice => {
                      const isSelected = answers.objective[num] === choice
                      return (
                        <button
                          key={choice}
                          onClick={() => handleObjectiveClick(num, choice)}
                          className={`w-9 h-9 rounded-full border-2 font-bold text-sm transition-all active:scale-90 ${
                            isSelected
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'border-gray-400 text-gray-600 hover:border-gray-700'
                          }`}
                        >
                          {choice}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-red-500 mt-3 text-center font-bold border-t border-gray-200 pt-2">
              선 아래부분은 절대 칠하지 말 것.
            </p>
          </div>

          {/* 주관식 */}
          <div>
            <h3 className="text-sm font-extrabold text-center tracking-[0.2em] text-gray-700 mb-4">
              주 관 식 답 안
            </h3>
            <p className="text-[10px] text-gray-500 mb-4 leading-relaxed bg-gray-50 p-2 rounded-lg">
              모든 주관식 답은 숫자와 소숫점, 슬래시(/), 마이너스(-) 기호로 이루어져 있습니다.
            </p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => i + 1).map(num => {
                const val = answers.subjective[num]
                return (
                  <div key={num} className="flex items-center gap-2">
                    <span className="w-6 text-right text-sm font-bold text-gray-500 shrink-0">{num}</span>
                    <button
                      onClick={() => openKeypad(num)}
                      className={`flex-1 h-9 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                        val
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {val || '입력'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 키패드 팝업 */}
      {activeSubjective !== null && (
        <Keypad
          value={keypadValue}
          onChange={setKeypadValue}
          onConfirm={handleKeypadConfirm}
          onClose={handleKeypadClose}
        />
      )}
    </>
  )
}
