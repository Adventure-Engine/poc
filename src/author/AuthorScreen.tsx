import { useState } from 'react'
import { loadScenario } from '../scenario/load'
import { useGeolocation } from '../geo/useGeolocation'

export default function AuthorScreen() {
  const scenario = loadScenario()
  const { pos, accuracy } = useGeolocation()
  const [selected, setSelected] = useState(scenario.locations[0]?.id ?? '')
  const [captures, setCaptures] = useState<Record<string, { lat: number; lng: number }>>({})

  const capture = () => {
    if (pos && selected) setCaptures((c) => ({ ...c, [selected]: { lat: pos.lat, lng: pos.lng } }))
  }

  const preview = {
    locations: scenario.locations.map((l) => ({
      id: l.id,
      title: l.title,
      geo: { ...(captures[l.id] ?? { lat: l.geo.lat, lng: l.geo.lng }), radius: l.geo.radius },
    })),
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
      <h3>JSON-предпросмотр для pirates.json</h3>
      <pre>{JSON.stringify(preview, null, 2)}</pre>
    </main>
  )
}
