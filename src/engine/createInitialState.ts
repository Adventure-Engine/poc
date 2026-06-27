import type { Scenario } from '../scenario/types'
import type { GameState } from './types'

export function createInitialState(scenario: Scenario): GameState {
  return {
    scenario,
    currentStepIndex: 0,
    inventory: [],
    mapDigits: [],
    collectedDublons: [],
    atLocationId: null,
    finished: false,
    lastMessage: null,
  }
}
