import { ExamProvider, useExam } from './context/ExamContext'
import InfoScreen from './screens/InfoScreen'
import TutorialScreen from './screens/TutorialScreen'
import ExamScreen from './screens/ExamScreen'
import ResultScreen from './screens/ResultScreen'

function AppContent() {
  const { state } = useExam()

  switch (state.screen) {
    case 'info':     return <InfoScreen />
    case 'tutorial': return <TutorialScreen />
    case 'exam':     return <ExamScreen />
    case 'result':   return <ResultScreen />
  }
}

export default function App() {
  return (
    <ExamProvider>
      <AppContent />
    </ExamProvider>
  )
}
