import { useGameStore } from '../../store/gameStore'

const ITEM_LABELS: Record<string, { emoji: string; label: string }> = {
  map_piece_1: { emoji: '🗺️', label: 'Часть карты' },
  map_piece_2: { emoji: '🗺️', label: 'Часть карты' },
  map_piece_3: { emoji: '🗺️', label: 'Часть карты' },
  rusty_key: { emoji: '🔑', label: 'Ржавый ключ' },
  hook: { emoji: '⚓', label: 'Крюк' },
  rope: { emoji: '🪢', label: 'Верёвка' },
  grapnel: { emoji: '🪝', label: 'Кошка' },
}

export default function Inventory() {
  const inventory = useGameStore((s) => s.inventory)
  if (inventory.length === 0) return null
  return (
    <section aria-label="Инвентарь">
      <h3 className="inv-title">Инвентарь</h3>
      <ul className="chips">
        {inventory.map((id) => (
          <li key={id} className="chip">
            {ITEM_LABELS[id] ? `${ITEM_LABELS[id].emoji} ${ITEM_LABELS[id].label}` : id}
          </li>
        ))}
      </ul>
    </section>
  )
}
