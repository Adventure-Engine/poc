import { loadScenario } from '../scenario/load'
import { createInitialState } from './createInitialState'

test('initial state starts at step 0, empty inventory, not finished', () => {
  const s = createInitialState(loadScenario())
  expect(s.currentStepIndex).toBe(0)
  expect(s.inventory).toEqual([])
  expect(s.mapDigits).toEqual([])
  expect(s.finished).toBe(false)
  expect(s.atLocationId).toBeNull()
})
