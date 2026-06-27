import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { currentStep } from '../../engine/reducer'
import { useGeolocation } from '../../geo/useGeolocation'
import { isInside, proximityHint } from '../../geo/geofence'
import { logEvent } from '../../telemetry/log'
import EventPanel from './EventPanel'
import Inventory from '../components/Inventory'

// The manual "Я на месте" fallback appears only after this many seconds at a
// point, so a player has to spend time walking there rather than skipping
// instantly. Real GPS arrival still fires immediately, regardless of this.
const FALLBACK_DELAY_SEC = 60

export default function PlayScreen() {
  const navigate = useNavigate()
  const state = useGameStore()
  const dispatch = state.dispatch
  const step = currentStep(state)
  const { pos } = useGeolocation()

  const location = step?.locationId
    ? state.scenario.locations.find((l) => l.id === step.locationId) ?? null
    : null

  const prevInsideRef = useRef(false)

  // Reset "was inside" state whenever the target location changes (new step).
  useEffect(() => { prevInsideRef.current = false }, [location?.id])

  // Gate the manual "Я на месте" fallback: it only appears after the delay, so
  // a player can't skip a point instantly. Resets on each new step.
  const [fallbackReady, setFallbackReady] = useState(false)
  useEffect(() => {
    setFallbackReady(false)
    const id = setTimeout(() => setFallbackReady(true), FALLBACK_DELAY_SEC * 1000)
    return () => clearTimeout(id)
  }, [step?.id])

  // Auto arrive/leave from GPS.
  useEffect(() => {
    if (!location || !pos) return
    const inside = isInside(location.geo, pos)
    if (inside && state.atLocationId !== location.id) {
      dispatch({ type: 'ARRIVE', locationId: location.id }, Date.now())
    } else if (!inside && prevInsideRef.current && state.atLocationId === location.id) {
      dispatch({ type: 'LEAVE' }, Date.now())
    }
    prevInsideRef.current = inside
  }, [pos, location, dispatch, state.atLocationId])

  useEffect(() => {
    if (state.finished) navigate('/finale')
  }, [state.finished, navigate])

  if (!step) return <main className="screen"><h2>Конец</h2></main>

  const atTarget = !location || state.atLocationId === location.id
  const hint = location && pos ? proximityHint(location.geo, pos) : 'cold'
  const proximityClass = hint === 'inside' ? 'hot' : hint

  const uncollectedDublon = atTarget && location
    ? state.scenario.dublons.find(
        (d) => d.locationId === location.id && !state.collectedDublons.includes(d.id)
      ) ?? null
    : null

  return (
    <main className="screen">
      {location && !atTarget && (
        <section className="panel">
          <p className="nav-target">Иди к точке: {location.title}</p>
          <p className={`proximity proximity--${proximityClass}`}>{hint === 'hot' ? 'Горячо!' : hint === 'warm' ? 'Теплее...' : 'Холодно'}</p>
          {fallbackReady ? (
            <button className="btn" onClick={() => {
              const at = Date.now()
              logEvent('fallback_used', at, { locationId: location.id })
              dispatch({ type: 'ARRIVE', locationId: location.id }, at)
            }}>
              Я на месте
            </button>
          ) : (
            <p className="screen-sub">Иди к точке — следи за подсказкой «Горячо / Холодно». Если не получится дойти, скоро появится кнопка.</p>
          )}
        </section>
      )}
      {atTarget && <EventPanel key={step.id} step={step} />}
      {uncollectedDublon && (
        <section className="panel" style={{ marginTop: 12 }}>
          <p>{uncollectedDublon.hint}</p>
          <button className="btn" onClick={() => dispatch({ type: 'COLLECT_DUBLON', dublonId: uncollectedDublon.id }, Date.now())}>
            Я нашёл дублон! 🪙
          </button>
        </section>
      )}
      <Inventory />
    </main>
  )
}
