import { useGameStore } from '../../store/gameStore'

export default function CollectionBar() {
  const collected = useGameStore((s) => s.collectedDublons.length)
  const total = useGameStore((s) => s.scenario.dublons.length)
  return <p className="collection">💰 Дублоны: {collected} / {total}</p>
}
