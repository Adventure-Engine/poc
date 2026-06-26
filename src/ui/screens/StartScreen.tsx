import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { loadScenario } from '../../scenario/load'
import { logEvent } from '../../telemetry/log'

export default function StartScreen() {
  const navigate = useNavigate()
  const reset = useGameStore((s) => s.reset)
  const title = loadScenario().title

  const startNew = () => {
    reset()
    logEvent('game_started', Date.now())
    navigate('/play')
  }

  return (
    <main style={{ padding: 24, textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>Outdoor escape room. Возьми телефон и найди клад капитана Моргана!</p>
      <button onClick={startNew}>Начать приключение</button>
    </main>
  )
}
