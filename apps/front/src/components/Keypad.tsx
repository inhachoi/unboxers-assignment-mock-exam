interface KeypadProps {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  isActive: boolean
  activeNumber: number | null
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '/']

export default function Keypad({
  value,
  onChange,
  onConfirm,
  isActive,
  activeNumber,
}: KeypadProps) {
  function handleKey(key: string) {
    if (
      (key === '.' || key === '/') &&
      (value.includes('.') || value.includes('/'))
    )
      return
    onChange(value + key)
  }

  function handleMinus() {
    if (value.startsWith('-')) {
      onChange(value.slice(1))
    } else {
      onChange('-' + value)
    }
  }

  function handleBackspace() {
    onChange(value.slice(0, -1))
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-4 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}
    >
      {/* 헤더 */}
      <div className="text-center mb-3 pb-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 tracking-widest">주관식 키패드</p>
        <p className="text-sm font-extrabold text-gray-700 mt-0.5">
          {activeNumber !== null ? `${activeNumber}번 입력 중` : '—'}
        </p>
      </div>

      {/* 입력 표시 */}
      <div className="bg-gray-100 rounded-xl px-3 py-2 text-right text-2xl font-bold text-gray-900 mb-3 min-h-[48px] flex items-center justify-end">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-gray-400 text-sm font-normal">답 입력</span>
        )}
      </div>

      {/* 키 그리드 */}
      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            className="py-3 rounded-xl bg-gray-100 font-bold text-lg text-gray-800 active:bg-gray-300 transition-colors"
          >
            {key}
          </button>
        ))}
      </div>

      {/* 특수 키 행 */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={handleMinus}
          className="py-3 rounded-xl bg-gray-100 font-bold text-lg text-gray-800 active:bg-gray-300 transition-colors"
        >
          -
        </button>
        <button
          onClick={handleBackspace}
          className="py-3 rounded-xl bg-gray-100 font-bold text-gray-800 active:bg-gray-300 transition-colors"
        >
          ←
        </button>
        <button
          onClick={onConfirm}
          className="py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] active:scale-95 transition-transform"
        >
          완료
        </button>
      </div>
    </div>
  )
}
