import type { Scenario } from '../scenario/types'

export interface GameState {
  scenario: Scenario
  currentStepIndex: number      // index into scenario.steps; === steps.length when finished
  inventory: string[]           // item ids
  mapDigits: string[]           // collected digits, in step order
  collectedDublons: string[]    // dublon ids
  atLocationId: string | null   // location the player is currently inside (from geo)
  finished: boolean
  lastMessage: string | null    // text to surface in UI after an event resolves
}

export type GameEvent =
  | { type: 'ARRIVE'; locationId: string }
  | { type: 'LEAVE' }
  | { type: 'ADVANCE_DIALOG' }
  | { type: 'SUBMIT_ANSWER'; value: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'CRAFT'; recipeId: string }
  | { type: 'SUBMIT_CODE'; value: string }
  | { type: 'COLLECT_DUBLON'; dublonId: string }
