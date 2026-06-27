import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { loadScenario } from '../../scenario/load'
import { logEvent } from '../../telemetry/log'
import { loadProgress } from '../../persistence/db'

export default function StartScreen() {
  const navigate = useNavigate()
  const reset = useGameStore((s) => s.reset)
  const hydrate = useGameStore((s) => s.hydrate)
  const title = loadScenario().title
  const [canResume, setCanResume] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadProgress().then((saved) => {
      if (!cancelled && saved && !saved.finished && saved.currentStepIndex > 0) {
        setCanResume(true)
      }
    }).catch(() => {
      if (!cancelled) {
        setCanResume(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const startNew = () => {
    reset()
    logEvent('game_started', Date.now())
    navigate('/play')
  }

  const resume = async () => {
    await hydrate()
    navigate('/play')
  }

  return (
    <main className="screen screen--center">
      <div className="crest">☠️ ⚓ ☠️</div>
      <h1 className="screen-title">{title}</h1>
      <p className="screen-sub">Outdoor escape room. Возьми телефон и найди клад капитана Моргана!</p>
      <div className="btn-row">
        <button className="btn btn--gold" onClick={startNew}>Начать приключение</button>
        {canResume && <button className="btn btn--ghost" onClick={resume}>Продолжить</button>}
      </div>
    </main>
  )
}
