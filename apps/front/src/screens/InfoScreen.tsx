import { useState } from 'react'
import { useExam } from '../context/ExamContext'

export default function InfoScreen() {
  const { dispatch } = useExam()
  const [form, setForm] = useState({
    name: '',
    school: '',
    grade: '',
    studentNumber: '',
    seatNumber: '',
  })

  const isValid =
    form.name.trim() &&
    form.school.trim() &&
    form.grade.trim() &&
    form.studentNumber.trim() &&
    form.seatNumber.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    dispatch({
      type: 'SET_STUDENT',
      payload: {
        name: form.name.trim(),
        school: form.school.trim(),
        grade: Number(form.grade),
        studentNumber: Number(form.studentNumber),
        seatNumber: Number(form.seatNumber),
      },
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const fields = [
    { label: '이름', name: 'name', type: 'text', placeholder: '홍길동' },
    { label: '학교', name: 'school', type: 'text', placeholder: '베이스고등학교' },
    { label: '학년', name: 'grade', type: 'number', placeholder: '2' },
    { label: '번호', name: 'studentNumber', type: 'number', placeholder: '15' },
    { label: '좌석 번호', name: 'seatNumber', type: 'number', placeholder: '3' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">모의고사 OMR</h1>
        <p className="text-sm text-gray-500 mb-8">시험을 시작하기 전에 학생 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map(field => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
                min={field.type === 'number' ? 1 : undefined}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={!isValid}
            className="mt-4 py-4 rounded-xl font-extrabold text-white text-lg bg-gradient-to-r from-[#333] to-[#585858] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  )
}
