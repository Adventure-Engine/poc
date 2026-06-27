import { useState } from 'react'
import { loadScenario } from '../scenario/load'
import { useGeolocation } from '../geo/useGeolocation'

export default function AuthorScreen() {
  const scenario = loadScenario()
  const { pos, accuracy } = useGeolocation()
  const [selected, setSelected] = useState(scenario.locations[0]?.id ?? '')
  const [captures, setCaptures] = useState<Record<string, { lat: number; lng: number }>>({})

  // Riddle edits: keyed by step id
  const riddleSteps = scenario.steps.filter((s) => s.event.type === 'riddle')
  type RiddleEdit = { question: string; answer: string; hint: string }
  const initialRiddleEdits = Object.fromEntries(
    riddleSteps.map((s) => {
      const e = s.event as { type: 'riddle'; question: string; answer: string; hint?: string }
      return [s.id, { question: e.question, answer: e.answer, hint: e.hint ?? '' }]
    })
  )
  const [riddleEdits, setRiddleEdits] = useState<Record<string, RiddleEdit>>(initialRiddleEdits)

  const capture = () => {
    if (pos && selected) setCaptures((c) => ({ ...c, [selected]: { lat: pos.lat, lng: pos.lng } }))
  }

  const setRiddleField = (stepId: string, field: keyof RiddleEdit, value: string) => {
    setRiddleEdits((prev) => ({ ...prev, [stepId]: { ...prev[stepId], [field]: value } }))
  }

  // Build full scenario preview
  const locById = Object.fromEntries(scenario.locations.map((l) => [l.id, l]))
  const preview = {
    ...scenario,
    locations: scenario.locations.map((l) => ({
      ...l,
      geo: { ...(captures[l.id] ?? { lat: l.geo.lat, lng: l.geo.lng }), radius: l.geo.radius },
    })),
    steps: scenario.steps.map((st) => {
      if (st.event.type !== 'riddle') return st
      const edit = riddleEdits[st.id]
      if (!edit) return st
      return {
        ...st,
        event: {
          ...st.event,
          question: edit.question,
          answer: edit.answer,
          ...(edit.hint ? { hint: edit.hint } : {}),
        },
      }
    }),
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Режим автора — запись GPS</h2>
      <p>Точность: {accuracy ? `${Math.round(accuracy)} м` : '—'} | Координаты:{' '}
        {pos ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` : '—'}</p>
      <label>
        Точка:{' '}
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {scenario.locations.map((l) => <option key={l.id} value={l.id}>{l.id} — {l.title}</option>)}
        </select>
      </label>{' '}
      <button onClick={capture} disabled={!pos}>Записать точку</button>

      <h3>Загадки</h3>
      {riddleSteps.map((st) => {
        const locTitle = st.locationId ? (locById[st.locationId]?.title ?? st.locationId) : st.id
        const edit = riddleEdits[st.id] ?? { question: '', answer: '', hint: '' }
        return (
          <div key={st.id}>
            <b>{locTitle} ({st.id})</b>
            <div>
              <label>
                Вопрос:{' '}
                <input
                  aria-label={`Вопрос: ${st.id}`}
                  value={edit.question}
                  onChange={(e) => setRiddleField(st.id, 'question', e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Ответ:{' '}
                <input
                  aria-label={`Ответ: ${st.id}`}
                  value={edit.answer}
                  onChange={(e) => setRiddleField(st.id, 'answer', e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Подсказка:{' '}
                <input
                  aria-label={`Подсказка: ${st.id}`}
                  value={edit.hint}
                  onChange={(e) => setRiddleField(st.id, 'hint', e.target.value)}
                />
              </label>
            </div>
          </div>
        )
      })}

      <h3>JSON-предпросмотр для pirates.json</h3>
      <pre>{JSON.stringify(preview, null, 2)}</pre>
    </main>
  )
}
