import { create } from 'zustand'
import type { GameState, GameEvent } from '../engine/types'
import { reducer } from '../engine/reducer'
import { createInitialState } from '../engine/createInitialState'
import { loadScenario } from '../scenario/load'
import { saveProgress, loadProgress, clearProgress } from '../persistence/db'
import { logEvent } from '../telemetry/log'

interface GameStore extends GameState {
  dispatch: (event: GameEvent, at: number) => void
  hydrate: () => Promise<void>
  reset: () => void
}

function telemetryFor(event: GameEvent, before: GameState, after: GameState, at: number) {
  if (event.type === 'ARRIVE') logEvent('point_reached', at, { locationId: event.locationId })
  if (after.currentStepIndex > before.currentStepIndex) {
    const step = before.scenario.steps[before.currentStepIndex]
    logEvent('step_completed', at, { stepId: step?.id })
  }
  if (!before.finished && after.finished) logEvent('game_finished', at)
  if (event.type === 'COLLECT_DUBLON' && after.collectedDublons.length > before.collectedDublons.length)
    logEvent('collection_item_found', at, { dublonId: event.dublonId })
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(loadScenario()),

  dispatch: (event, at) => {
    // Extract pure GameState — exclude store actions so the reducer's {...state} spreads
    // never copy functions into `after`, which would break IndexedDB structured-clone.
    const { dispatch: _d, hydrate: _h, reset: _r, ...before } = get()
    const after = reducer(before, event)
    telemetryFor(event, before, after, at)
    set(after)
    void saveProgress(after)
  },

  hydrate: async () => {
    const saved = await loadProgress()
    if (saved) set({ ...saved, scenario: loadScenario() })
  },

  reset: () => {
    void clearProgress()
    set(createInitialState(loadScenario()))
  },
}))
