import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { currentStep } from '../../engine/reducer'
import { useGeolocation } from '../../geo/useGeolocation'
import { isInside, proximityHint } from '../../geo/geofence'
import { logEvent } from '../../telemetry/log'
import EventPanel from './EventPanel'
import Inventory from '../components/Inventory'

export default function PlayScreen() {
  const navigate = useNavigate()
  const state = useGameStore()
  const dispatch = state.dispatch
  const step = currentStep(state)
  const { pos } = useGeolocation()

  const location = step?.locationId
    ? state.scenario.locations.find((l) => l.id === step.locationId) ?? null
    : null

  // Auto arrive/leave from GPS.
  useEffect(() => {
    if (!location || !pos) return
    if (isInside(location.geo, pos) && state.atLocationId !== location.id)
      dispatch({ type: 'ARRIVE', locationId: location.id }, Date.now())
    else if (!isInside(location.geo, pos) && state.atLocationId === location.id)
      dispatch({ type: 'LEAVE' }, Date.now())
  }, [pos, location, dispatch, state.atLocationId])

  useEffect(() => {
    if (state.finished) navigate('/finale')
  }, [state.finished, navigate])

  if (!step) return <main style={{ padding: 24 }}><h2>Конец</h2></main>

  const atTarget = !location || state.atLocationId === location.id
  const hint = location && pos ? proximityHint(location.geo, pos) : 'cold'

  const uncollectedDublon = atTarget && location
    ? state.scenario.dublons.find(
        (d) => d.locationId === location.id && !state.collectedDublons.includes(d.id)
      ) ?? null
    : null

  return (
    <main style={{ padding: 24 }}>
      {location && !atTarget && (
        <section>
          <h2>Иди к точке: {location.title}</h2>
          <p>{hint === 'hot' ? 'Горячо!' : hint === 'warm' ? 'Теплее...' : 'Холодно'}</p>
          <button onClick={() => {
            const at = Date.now()
            logEvent('fallback_used', at, { locationId: location.id })
            dispatch({ type: 'ARRIVE', locationId: location.id }, at)
          }}>
            Я на месте
          </button>
        </section>
      )}
      {atTarget && <EventPanel step={step} />}
      {uncollectedDublon && (
        <section style={{ marginTop: 12 }}>
          <p>{uncollectedDublon.hint}</p>
          <button onClick={() => dispatch({ type: 'COLLECT_DUBLON', dublonId: uncollectedDublon.id }, Date.now())}>
            Я нашёл дублон! 🪙
          </button>
        </section>
      )}
      <Inventory />
    </main>
  )
}
