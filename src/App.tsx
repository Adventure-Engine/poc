import { Routes, Route } from 'react-router-dom'
import StartScreen from './ui/screens/StartScreen'
import PlayScreen from './ui/screens/PlayScreen'
import AuthorScreen from './author/AuthorScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/play" element={<PlayScreen />} />
      <Route path="/author" element={<AuthorScreen />} />
    </Routes>
  )
}
