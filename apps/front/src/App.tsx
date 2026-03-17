import { useEffect, useState } from 'react'
import { ExamScreen, InfoScreen, ResultScreen, TutorialScreen } from '@/screens'
import { useExamStore } from '@/store'

type Screen = 'info' | 'tutorial' | 'exam' | 'result'

function ScreenComponent({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'info':
      return <InfoScreen />
    case 'tutorial':
      return <TutorialScreen />
    case 'exam':
      return <ExamScreen />
    case 'result':
      return <ResultScreen />
  }
}

export default function App() {
  const screen = useExamStore((s) => s.screen)
  const [displayed, setDisplayed] = useState<Screen>(screen)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (screen === displayed) return
    setFading(true)
    const t = setTimeout(() => {
      setDisplayed(screen)
      setFading(false)
    }, 150)
    return () => clearTimeout(t)
  }, [screen])

  return (
    <div
      className={`transition-opacity duration-150 ${fading ? 'opacity-0' : ''}`}
    >
      <div key={displayed} className="screen-slide-up">
        <ScreenComponent screen={displayed} />
      </div>
    </div>
  )
}
