import { useExamStore } from './store/examStore'
import InfoScreen from './screens/InfoScreen'
import TutorialScreen from './screens/TutorialScreen'
import ExamScreen from './screens/ExamScreen'
import ResultScreen from './screens/ResultScreen'

export default function App() {
  const screen = useExamStore(s => s.screen)

  switch (screen) {
    case 'info':     return <InfoScreen />
    case 'tutorial': return <TutorialScreen />
    case 'exam':     return <ExamScreen />
    case 'result':   return <ResultScreen />
  }
}
