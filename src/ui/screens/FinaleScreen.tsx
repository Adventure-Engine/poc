import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import CollectionBar from '../components/CollectionBar'
import { exportLog } from '../../telemetry/log'

export default function FinaleScreen() {
  const navigate = useNavigate()
  const reset = useGameStore((s) => s.reset)
  const allDublons = useGameStore((s) => s.collectedDublons.length === s.scenario.dublons.length)

  const download = () => {
    const blob = new Blob([exportLog()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'telemetry.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="screen screen--center">
      <div className="finale-emoji">🏴‍☠️ 💰</div>
      <h1 className="screen-title">Сокровище найдено! 🏴‍☠️</h1>
      <p>Капитан Морган принимает тебя в команду, юнга!</p>
      {allDublons && <p className="secret">Ты собрал ВСЕ дублоны — секрет открыт!</p>}
      <CollectionBar />
      <div className="btn-row">
        <button className="btn btn--ghost" onClick={download}>Скачать метрики</button>
        <button className="btn btn--gold" onClick={() => { reset(); navigate('/') }}>Заново</button>
      </div>
    </main>
  )
}
