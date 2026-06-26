import { useGameStore } from '../../store/gameStore'

export default function Inventory() {
  const inventory = useGameStore((s) => s.inventory)
  if (inventory.length === 0) return null
  return (
    <section aria-label="Инвентарь" style={{ marginTop: 16 }}>
      <h3>Инвентарь</h3>
      <ul>{inventory.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  )
}
