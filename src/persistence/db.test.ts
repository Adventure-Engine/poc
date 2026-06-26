import 'fake-indexeddb/auto'
import { saveProgress, loadProgress, clearProgress } from './db'
import { createInitialState } from '../engine/createInitialState'
import { loadScenario } from '../scenario/load'

test('save then load returns the persisted slice without the scenario', async () => {
  const state = { ...createInitialState(loadScenario()), inventory: ['map_piece_1'] }
  await saveProgress(state)
  const loaded = await loadProgress()
  expect(loaded?.inventory).toEqual(['map_piece_1'])
  expect((loaded as Record<string, unknown>).scenario).toBeUndefined()
})

test('clear removes saved progress', async () => {
  await saveProgress(createInitialState(loadScenario()))
  await clearProgress()
  expect(await loadProgress()).toBeNull()
})
