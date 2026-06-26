import type { Step } from '../scenario/types'
import type { GameState, GameEvent } from './types'

export function currentStep(state: GameState): Step | null {
  return state.scenario.steps[state.currentStepIndex] ?? null
}

function atRequiredLocation(state: GameState, step: Step): boolean {
  if (!step.locationId) return true
  return state.atLocationId === step.locationId
}

function hasAll(inventory: string[], required?: string[]): boolean {
  if (!required) return true
  return required.every((r) => inventory.includes(r))
}

export function canCompleteCurrent(state: GameState): boolean {
  const step = currentStep(state)
  if (!step) return false
  return atRequiredLocation(state, step) && hasAll(state.inventory, step.requires)
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// Advance past the current step, applying its reward, map digit, and resolution message.
function completeStep(state: GameState, step: Step, message: string): GameState {
  return {
    ...state,
    inventory: step.reward ? [...state.inventory, ...step.reward] : state.inventory,
    mapDigits: step.mapDigit ? [...state.mapDigits, step.mapDigit] : state.mapDigits,
    currentStepIndex: state.currentStepIndex + 1,
    lastMessage: message,
  }
}

export function reducer(state: GameState, event: GameEvent): GameState {
  if (event.type === 'ARRIVE') return { ...state, atLocationId: event.locationId }
  if (event.type === 'LEAVE') return { ...state, atLocationId: null }

  const step = currentStep(state)
  if (!step || state.finished) return state
  if (!atRequiredLocation(state, step) || !hasAll(state.inventory, step.requires)) return state

  switch (event.type) {
    case 'ADVANCE_DIALOG':
      if (step.event.type !== 'dialog') return state
      return completeStep(state, step, step.event.text)

    case 'SUBMIT_ANSWER': {
      if (step.event.type !== 'riddle') return state
      if (normalize(event.value) !== normalize(step.event.answer)) return state
      return completeStep(state, step, 'Верно!')
    }

    default:
      return state
  }
}
