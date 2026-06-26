import { loadScenario } from '../scenario/load'
import { createInitialState } from './createInitialState'
import { reducer, currentStep } from './reducer'
import type { GameState } from './types'

function start(): GameState { return createInitialState(loadScenario()) }

test('first step is the intro dialog and advances on ADVANCE_DIALOG', () => {
  let s = start()
  expect(currentStep(s)?.id).toBe('s_start')
  s = reducer(s, { type: 'ADVANCE_DIALOG' })
  expect(currentStep(s)?.id).toBe('s_oak')
})

test('riddle does not complete from the wrong location', () => {
  let s = reducer(start(), { type: 'ADVANCE_DIALOG' }) // now at s_oak (needs loc_old_oak)
  s = reducer(s, { type: 'SUBMIT_ANSWER', value: '4' })
  expect(currentStep(s)?.id).toBe('s_oak') // unchanged, not arrived
})

test('riddle completes at the right location, grants reward and map digit', () => {
  let s = reducer(start(), { type: 'ADVANCE_DIALOG' })
  s = reducer(s, { type: 'ARRIVE', locationId: 'loc_old_oak' })
  s = reducer(s, { type: 'SUBMIT_ANSWER', value: '  4 ' })
  expect(s.inventory).toContain('map_piece_1')
  expect(s.mapDigits).toEqual(['7'])
  expect(currentStep(s)?.id).toBe('s_stones')
})

test('wrong riddle answer does not advance', () => {
  let s = reducer(start(), { type: 'ADVANCE_DIALOG' })
  s = reducer(s, { type: 'ARRIVE', locationId: 'loc_old_oak' })
  s = reducer(s, { type: 'SUBMIT_ANSWER', value: '9' })
  expect(currentStep(s)?.id).toBe('s_oak')
})
