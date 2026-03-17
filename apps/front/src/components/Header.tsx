interface HeaderProps {
  studentName?: string
  onHome?: () => void
}

export default function Header({ studentName, onHome }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <span className="text-lg font-bold text-gray-800">모의고사 모드</span>
      <div className="flex items-center gap-4">
        {studentName && (
          <span className="text-sm font-semibold text-gray-700">{studentName} 학생</span>
        )}
        {onHome && (
          <button
            onClick={onHome}
            className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            홈으로
          </button>
        )}
      </div>
    </header>
  )
}
