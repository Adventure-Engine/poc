import { Routes, Route } from 'react-router-dom'
import StartScreen from './ui/screens/StartScreen'
import PlayScreen from './ui/screens/PlayScreen'
import AuthorScreen from './author/AuthorScreen'
import FinaleScreen from './ui/screens/FinaleScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/play" element={<PlayScreen />} />
      <Route path="/author" element={<AuthorScreen />} />
      <Route path="/finale" element={<FinaleScreen />} />
    </Routes>
  )
}
