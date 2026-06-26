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

// Helper: drive the game to just before a given step id by replaying correct events.
function driveTo(stepId: string): GameState {
  let s = start()
  const order: GameEvent[] = [
    { type: 'ADVANCE_DIALOG' },                                   // s_start -> s_oak
    { type: 'ARRIVE', locationId: 'loc_old_oak' }, { type: 'SUBMIT_ANSWER', value: '4' },
    { type: 'ARRIVE', locationId: 'loc_three_stones' }, { type: 'SUBMIT_ANSWER', value: '3' },
    { type: 'ARRIVE', locationId: 'loc_well' }, { type: 'SUBMIT_ANSWER', value: '7' },
    { type: 'ARRIVE', locationId: 'loc_three_stones' }, { type: 'USE_ITEM', itemId: 'rusty_key' },
    { type: 'ARRIVE', locationId: 'loc_ravine' }, { type: 'ADVANCE_DIALOG' },
    { type: 'ARRIVE', locationId: 'loc_old_pine' }, { type: 'SUBMIT_ANSWER', value: 'да' },
    { type: 'CRAFT', recipeId: 'grapnel' },
    { type: 'ARRIVE', locationId: 'loc_ravine' }, { type: 'USE_ITEM', itemId: 'grapnel' },
    { type: 'ARRIVE', locationId: 'loc_big_rock' },
  ]
  for (const e of order) {
    s = reducer(s, e)
    const step = currentStep(s)
    if (step?.id === stepId) {
      // Continue if we've reached the target step but aren't at its required location yet
      if (!step.locationId || s.atLocationId === step.locationId) break
    }
  }
  return s
}

test('use_item opens the chest, granting hook and the third map digit', () => {
  const s = driveTo('s_ravine')
  expect(s.inventory).toEqual(expect.arrayContaining(['hook', 'map_piece_3']))
  expect(s.mapDigits).toEqual(['7', '2', '4'])
})

test('craft consumes inputs and produces output', () => {
  let s = driveTo('s_craft')
  s = reducer(s, { type: 'CRAFT', recipeId: 'grapnel' })
  expect(s.inventory).toContain('grapnel')
  expect(s.inventory).not.toContain('rope')
  expect(s.inventory).not.toContain('hook')
})

test('finale: correct code wins, wrong code does not', () => {
  let s = driveTo('s_finale')
  const wrong = reducer(s, { type: 'SUBMIT_CODE', value: '111' })
  expect(wrong.finished).toBe(false)
  const right = reducer(s, { type: 'SUBMIT_CODE', value: '724' })
  expect(right.finished).toBe(true)
})

test('dublon collection is optional and idempotent', () => {
  let s = reducer(start(), { type: 'COLLECT_DUBLON', dublonId: 'dub_oak' })
  s = reducer(s, { type: 'COLLECT_DUBLON', dublonId: 'dub_oak' })
  expect(s.collectedDublons).toEqual(['dub_oak'])
  expect(currentStep(s)?.id).toBe('s_start') // collecting never advances the main quest
})
