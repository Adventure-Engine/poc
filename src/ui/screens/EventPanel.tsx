import { useState } from 'react'
import type { Step } from '../../scenario/types'
import { useGameStore } from '../../store/gameStore'
import { normalizeAnswer } from '../../engine/reducer'
import { logEvent } from '../../telemetry/log'

export default function EventPanel({ step }: { step: Step }) {
  const dispatch = useGameStore((s) => s.dispatch)
  const inventory = useGameStore((s) => s.inventory)
  const mapDigits = useGameStore((s) => s.mapDigits)
  const finaleCodeLength = useGameStore((s) => s.scenario.finaleCode.length)
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [revealed, setRevealed] = useState(false)

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
        <input
          aria-label="Ответ"
          value={answer}
          onChange={(ev) => setAnswer(ev.target.value)}
        />
        {wrong > 0 && <p>Мимо! Попробуй ещё.</p>}
        <button
          onClick={() => {
            if (normalizeAnswer(answer) === normalizeAnswer(e.answer)) {
              dispatch({ type: 'SUBMIT_ANSWER', value: answer }, Date.now())
            } else {
              setWrong((w) => w + 1)
              setAnswer('')
            }
          }}
        >
          Ответить
        </button>
        {e.hint && !showHint && (
          <button
            onClick={() => {
              setShowHint(true)
              logEvent('hint_used', Date.now(), { stepId: step.id })
            }}
          >
            Подсказка
          </button>
        )}
        {showHint && <p>{e.hint}</p>}
        {wrong >= 2 && !revealed && (
          <button
            onClick={() => {
              setAnswer(e.answer)
              setRevealed(true)
              logEvent('answer_revealed', Date.now(), { stepId: step.id })
            }}
          >
            Показать ответ
          </button>
        )}
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
