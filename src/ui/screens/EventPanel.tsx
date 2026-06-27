import { useState } from 'react'
import type { Step } from '../../scenario/types'
import { useGameStore } from '../../store/gameStore'

export default function EventPanel({ step }: { step: Step }) {
  const dispatch = useGameStore((s) => s.dispatch)
  const inventory = useGameStore((s) => s.inventory)
  const mapDigits = useGameStore((s) => s.mapDigits)
  const finaleCodeLength = useGameStore((s) => s.scenario.finaleCode.length)
  const [answer, setAnswer] = useState('')

  const e = step.event
  if (e.type === 'dialog') {
    return (
      <section>
        <p><b>{e.speaker}:</b> {e.text}</p>
        <button onClick={() => dispatch({ type: 'ADVANCE_DIALOG' }, Date.now())}>Дальше</button>
      </section>
    )
  }
  if (e.type === 'riddle') {
    return (
      <section>
        <p>{e.question}</p>
        <input aria-label="Ответ" value={answer} onChange={(ev) => setAnswer(ev.target.value)} />
        <button onClick={() => { dispatch({ type: 'SUBMIT_ANSWER', value: answer }, Date.now()); setAnswer('') }}>
          Ответить
        </button>
      </section>
    )
  }
  if (e.type === 'use_item') {
    const has = inventory.includes(e.item)
    return (
      <section>
        <p>{step.arriveText}</p>
        <button disabled={!has} onClick={() => dispatch({ type: 'USE_ITEM', itemId: e.item }, Date.now())}>
          Использовать предмет
        </button>
      </section>
    )
  }
  if (e.type === 'craft') {
    return (
      <section>
        <p>{e.text}</p>
        <button onClick={() => dispatch({ type: 'CRAFT', recipeId: e.recipeId }, Date.now())}>Соединить</button>
      </section>
    )
  }
  // finale_lock
  return (
    <section>
      <p>{e.text}</p>
      <p aria-label="Карта">Цифры с собранной карты: {mapDigits.length ? mapDigits.join(' ') : '— — —'}</p>
      <input aria-label="Код" maxLength={finaleCodeLength} value={answer} onChange={(ev) => setAnswer(ev.target.value)} />
      <button onClick={() => dispatch({ type: 'SUBMIT_CODE', value: answer }, Date.now())}>Открыть замок</button>
    </section>
  )
}
