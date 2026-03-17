interface KeypadProps {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '/']

export default function Keypad({ value, onChange, onConfirm, onClose }: KeypadProps) {
  function handleKey(key: string) {
    if ((key === '.' || key === '/') && (value.includes('.') || value.includes('/'))) return
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
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-sm p-4"
        onClick={e => e.stopPropagation()}
      >
        {/* 입력 표시 */}
        <div className="bg-gray-100 rounded-xl px-4 py-3 text-right text-2xl font-bold text-gray-900 mb-4 min-h-[56px] flex items-center justify-end">
          {value
            ? <span>{value}</span>
            : <span className="text-gray-400 text-base font-normal">입력할 곳을 터치해주세요</span>
          }
        </div>

        {/* 키 그리드 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {KEYS.map(key => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="py-4 rounded-xl bg-gray-100 font-bold text-xl text-gray-800 active:bg-gray-300 transition-colors"
            >
              {key}
            </button>
          ))}
        </div>

        {/* 특수 키 행 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={handleMinus}
            className="py-4 rounded-xl bg-gray-100 font-bold text-xl text-gray-800 active:bg-gray-300 transition-colors"
          >
            -
          </button>
          <button
            onClick={handleBackspace}
            className="py-4 rounded-xl bg-gray-100 font-bold text-gray-800 active:bg-gray-300 transition-colors text-lg"
          >
            ←
          </button>
          <button
            onClick={onConfirm}
            className="py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-[#333] to-[#585858] active:scale-95 transition-transform"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  )
}
