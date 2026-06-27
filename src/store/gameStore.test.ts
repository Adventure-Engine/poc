import 'fake-indexeddb/auto'
import { useGameStore } from './gameStore'
import { clearLog, getLog } from '../telemetry/log'

beforeEach(() => { clearLog(); useGameStore.getState().reset() })

test('dispatch advances state through the reducer', () => {
  useGameStore.getState().dispatch({ type: 'ADVANCE_DIALOG' }, 1000)
  expect(useGameStore.getState().currentStepIndex).toBe(1)
})

test('reaching a location logs point_reached', () => {
  useGameStore.getState().dispatch({ type: 'ARRIVE', locationId: 'loc_old_oak' }, 1000)
  expect(getLog().some((e) => e.name === 'point_reached')).toBe(true)
})
