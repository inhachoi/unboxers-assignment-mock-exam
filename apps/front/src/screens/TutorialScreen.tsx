import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useExamStore } from '../store/examStore'
import Keypad from '../components/Keypad'
import { getExam } from '../api/exam'

const CHOICES = [1, 2, 3, 4, 5]
const OBJ_COUNT = 14
const SUBJ_COUNT = 11

type Visual = 'exam-paper' | 'exam-and-omr' | 'omr-objective' | 'omr-subjective' | 'timer'

interface StepDef {
  title: string
  description: string
  visual: Visual
  highlight?: number
  requireAction?: boolean
  checkDone?: (obj: Record<number, number[]>, subj: Record<number, string>) => boolean
}

const STEPS: StepDef[] = [
  {
    title: '모의고사는 처음이세요?',
    description: '실전 모의고사는\n실전과 최대한 비슷한 환경으로 진행돼요',
    visual: 'exam-paper',
  },
  {
    title: '실제 시험지와 함께 진행해요',
    description: '실제 시험지 크기에 인쇄된 시험지에 문제를 풀고\n화면에 표시된 OMR카드에 답을 마킹해요',
    visual: 'exam-and-omr',
  },
  {
    title: '객관식 답안을 마킹해요',
    description: '객관식 답안은 화면에서 터치해서 마킹해요\n13번 문제에 3번으로 답안을 마킹해보세요',
    visual: 'omr-objective',
    highlight: 13,
    requireAction: true,
    checkDone: (obj) => (obj[13] ?? []).includes(3),
  },
  {
    title: '마킹을 지울 수 있어요',
    description: '마킹한 곳을 한 번 더 터치하면 지울 수 있어요\n13번 문제에 3번 답안을 지워보세요',
    visual: 'omr-objective',
    highlight: 13,
    requireAction: true,
    checkDone: (obj) => !(obj[13] ?? []).includes(3),
  },
  {
    title: '복수 정답도 있어요',
    description: '2개 이상의 답안을 골라야 하는 문제에서는\n두 답안 모두 마킹하면 돼요',
    visual: 'omr-objective',
    highlight: 14,
    requireAction: true,
    checkDone: (obj) => (obj[14] ?? []).length >= 2,
  },
  {
    title: '주관식 답안을 입력해요',
    description: '주관식 답안을 입력하려면 입력할 곳을 터치해요\n4번 문제에 답안을 입력해볼까요?',
    visual: 'omr-subjective',
    highlight: 4,
    requireAction: true,
  },
  {
    title: '완료 버튼을 눌러요',
    description: '아무 숫자나 입력하고\n완료 버튼을 눌러서 답안을 작성해요',
    visual: 'omr-subjective',
    highlight: 4,
    requireAction: true,
    checkDone: (_, subj) => !!subj[4],
  },
  {
    title: '답안을 수정할 수 있어요',
    description: '입력한 답안을 수정하려면\n해당 문제를 다시 한 번 터치해요',
    visual: 'omr-subjective',
    highlight: 4,
    requireAction: true,
  },
  {
    title: '시간이 지나면 자동 제출돼요',
    description: '시간이 모두 지나면 시험은 종료되고 OMR카드는 자동으로 제출돼요\n마킹하지 못한 답안은 모두 오답 처리되니 미리 마킹하세요',
    visual: 'timer',
  },
  {
    title: '준비됐나요?',
    description: '튜토리얼을 모두 완료했어요!\n이제 실제 시험을 시작할 준비가 됐어요',
    visual: 'exam-paper',
  },
]

// ── Visual components ──────────────────────────────────────────────────────────

function ExamPaperVisual() {
  return (
    <div className="flex justify-center items-center h-full py-4">
      <img
        src="/step1.png"
        alt="시험지"
        className="max-h-full w-auto rounded-2xl shadow-md object-contain"
      />
    </div>
  )
}

function MiniOMRPreview() {
  return (
    <div
      className="rounded-xl border border-gray-100 shadow-sm bg-white shrink-0 pointer-events-none overflow-hidden"
      style={{ zoom: 0.58 }}
    >
      <div className="p-4">
        <p className="text-xs font-extrabold text-center tracking-[0.2em] text-gray-500 mb-3">객관식</p>
        <div className="flex flex-col gap-1">
          {Array.from({ length: OBJ_COUNT }, (_, i) => i + 1).map(q => (
            <div key={q} className="flex items-center gap-1.5 px-1">
              <span className="text-xs text-gray-400 w-5 text-right shrink-0">{q}</span>
              <div className="flex gap-1">
                {CHOICES.map(c => (
                  <div key={c} className="w-7 h-7 rounded-full border-2 border-gray-200 bg-white" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExamAndOMRVisual() {
  return (
    <div className="flex justify-center items-center gap-6 h-full py-4">
      <img
        src="/step1.png"
        alt="시험지"
        className="max-h-56 w-auto rounded-xl shadow-md object-contain"
      />
      <div className="text-gray-300 text-xl font-bold">+</div>
      <MiniOMRPreview />
    </div>
  )
}

function ObjQuestion({
  q,
  selected,
  isHighlighted,
  onMark,
}: {
  q: number
  selected: number[]
  isHighlighted: boolean
  onMark: (q: number, choice: number) => void
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
        isHighlighted ? 'bg-blue-50 ring-1 ring-blue-200' : ''
      }`}
    >
      <span className={`text-xs font-bold w-5 text-right shrink-0 ${isHighlighted ? 'text-blue-500' : 'text-gray-400'}`}>
        {q}
      </span>
      <div className="flex gap-1">
        {CHOICES.map(c => (
          <button
            key={c}
            onClick={() => onMark(q, c)}
            className={`w-7 h-7 rounded-full text-xs font-bold border-2 transition-all active:scale-90 ${
              selected.includes(c)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

function ObjectiveOMRVisual({
  answers,
  highlight,
  onMark,
}: {
  answers: Record<number, number[]>
  highlight?: number
  onMark: (q: number, choice: number) => void
}) {
  const half = Math.ceil(OBJ_COUNT / 2)
  const leftCol = Array.from({ length: half }, (_, i) => i + 1)
  const rightCol = Array.from({ length: OBJ_COUNT - half }, (_, i) => i + half + 1)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-2xl mx-auto">
      <h3 className="text-xs font-extrabold text-center tracking-[0.2em] text-gray-500 mb-4">객관식</h3>
      <div className="grid grid-cols-2 gap-x-6">
        <div className="flex flex-col gap-1">
          {leftCol.map(q => (
            <ObjQuestion key={q} q={q} selected={answers[q] ?? []} isHighlighted={q === highlight} onMark={onMark} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {rightCol.map(q => (
            <ObjQuestion key={q} q={q} selected={answers[q] ?? []} isHighlighted={q === highlight} onMark={onMark} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectiveOMRVisual({
  answers,
  highlight,
  activeSubj,
  keypadValue,
  onOpen,
  onKeypadChange,
  onConfirm,
}: {
  answers: Record<number, string>
  highlight?: number
  activeSubj: number | null
  keypadValue: string
  onOpen: (q: number) => void
  onKeypadChange: (v: string) => void
  onConfirm: () => void
}) {
  return (
    <div className="flex gap-4 max-w-2xl mx-auto items-start">
      <div className="bg-white rounded-2xl shadow-md p-6 flex-1">
        <h3 className="text-xs font-extrabold text-center tracking-[0.2em] text-gray-500 mb-4">주관식</h3>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(q => {
            const isHighlighted = q === highlight
            const answer = answers[q]
            const isActive = activeSubj === q
            return (
              <div
                key={q}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isHighlighted ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
              >
                <span className={`text-xs font-bold w-6 text-right shrink-0 ${isHighlighted ? 'text-blue-500' : 'text-gray-400'}`}>
                  {q}
                </span>
                <button
                  onClick={() => onOpen(q)}
                  className={`flex-1 py-1.5 px-3 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 text-left ${
                    isActive
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : answer
                      ? 'border-gray-300 bg-gray-50 text-gray-800'
                      : 'border-gray-200 bg-white text-gray-300'
                  }`}
                >
                  {isActive ? (keypadValue || '입력 중...') : (answer ?? '—')}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-44 shrink-0 sticky top-20">
        <Keypad
          value={keypadValue}
          onChange={onKeypadChange}
          onConfirm={onConfirm}
          isActive={activeSubj !== null}
          activeNumber={activeSubj}
        />
      </div>
    </div>
  )
}

function TimerVisual() {
  return (
    <div className="flex justify-center py-8">
      <div className="bg-white rounded-2xl shadow-md p-8 w-80">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">시험 종료까지</p>
            <p className="text-5xl font-extrabold text-red-500 tabular-nums leading-none mt-1">5초</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] opacity-40 cursor-default">
            답안 제출하기
          </button>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed text-center">
          시간이 종료되면<br />
          <span className="font-bold text-red-500">OMR카드가 자동 제출</span>됩니다
        </p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TutorialScreen() {
  const { studentInfo, startExam, reset } = useExamStore(
    useShallow(s => ({ studentInfo: s.studentInfo, startExam: s.startExam, reset: s.reset }))
  )

  const [step, setStep] = useState(0)
  const [objAnswers, setObjAnswers] = useState<Record<number, number[]>>({})
  const [subjAnswers, setSubjAnswers] = useState<Record<number, string>>({})
  const [activeSubj, setActiveSubj] = useState<number | null>(null)
  const [keypadValue, setKeypadValue] = useState('')
  const [actionDone, setActionDone] = useState(false)

  const { data: examInfo } = useQuery({ queryKey: ['exam'], queryFn: getExam })

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const canProceed = !current.requireAction || actionDone

  function goToStep(nextIdx: number) {
    const next = STEPS[nextIdx]
    // Keep keypad open when transitioning from "open" step to "confirm" step
    const keepKeypad = step === 5 && nextIdx === 6
    if (!keepKeypad) setActiveSubj(null)

    const initialDone = next.checkDone
      ? next.checkDone(objAnswers, subjAnswers)
      : !next.requireAction

    setStep(nextIdx)
    setActionDone(initialDone)
  }

  function handleNext() {
    if (!canProceed) return
    if (isLast) startExam()
    else goToStep(step + 1)
  }

  function handlePrev() {
    if (step > 0) goToStep(step - 1)
  }

  function handleObjClick(q: number, choice: number) {
    const prev = objAnswers[q] ?? []
    const updated = prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]
    const newObj = { ...objAnswers, [q]: updated }
    setObjAnswers(newObj)
    const checkFn = STEPS[step].checkDone
    if (checkFn) setActionDone(checkFn(newObj, subjAnswers))
  }

  function handleSubjOpen(q: number) {
    setActiveSubj(q)
    setKeypadValue(subjAnswers[q] ?? '')
    // Step 5: action = tap Q4
    if (step === 5 && q === 4) setActionDone(true)
    // Step 7: action = re-tap Q4 (which already has an answer)
    if (step === 7 && q === 4 && !!subjAnswers[4]) setActionDone(true)
  }

  function handleKeypadConfirm() {
    if (activeSubj !== null && keypadValue) {
      const newSubj = { ...subjAnswers, [activeSubj]: keypadValue }
      setSubjAnswers(newSubj)
      const checkFn = STEPS[step].checkDone
      if (checkFn) setActionDone(checkFn(objAnswers, newSubj))
    }
    setActiveSubj(null)
    setKeypadValue('')
  }

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col overflow-hidden">
      {/* Nav */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-8 py-3 flex items-center gap-4">
        <button
          onClick={reset}
          className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← 홈으로
        </button>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-bold text-gray-800">모의고사 모드</span>
        {studentInfo?.name && (
          <span className="text-sm text-gray-500">{studentInfo.name} 학생</span>
        )}
      </div>

      {/* Visual area */}
      <div className="flex-1 px-8 py-4 overflow-auto min-h-0">
        {current.visual === 'exam-paper' && <ExamPaperVisual />}
        {current.visual === 'exam-and-omr' && <ExamAndOMRVisual />}
        {current.visual === 'omr-objective' && (
          <ObjectiveOMRVisual
            answers={objAnswers}
            highlight={current.highlight}
            onMark={handleObjClick}
          />
        )}
        {current.visual === 'omr-subjective' && (
          <SubjectiveOMRVisual
            answers={subjAnswers}
            highlight={current.highlight}
            activeSubj={activeSubj}
            keypadValue={keypadValue}
            onOpen={handleSubjOpen}
            onKeypadChange={setKeypadValue}
            onConfirm={handleKeypadConfirm}
          />
        )}
        {current.visual === 'timer' && <TimerVisual />}
      </div>

      {/* Bottom: progress + info card + buttons */}
      <div className="px-8 pb-8 flex-shrink-0 max-w-lg mx-auto w-full">
        {examInfo && (
          <p className="text-xs text-gray-400 text-center mb-3">
            {examInfo.title} · {examInfo.totalQuestions}문항 · {examInfo.totalScore}점
          </p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>튜토리얼</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gray-800 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 text-center mb-5">
          <p className="text-xs font-bold text-gray-400 mb-1">STEP {step + 1}</p>
          <h2 className="text-lg font-extrabold text-gray-900 mb-2">{current.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{current.description}</p>
          {current.requireAction && (
            <p className="text-xs text-blue-500 font-semibold mt-3 animate-pulse">↑ 위에서 직접 해보세요</p>
          )}
        </div>

        <div className="flex gap-3">
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
            disabled={!canProceed}
            className="flex-1 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isLast ? '시험 화면으로 이동' : '다음으로'}
          </button>
        </div>

        <button
          onClick={() => startExam()}
          className="mt-4 w-full text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
        >
          튜토리얼 건너뛰기
        </button>
      </div>
    </div>
  )
}
