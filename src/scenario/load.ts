import raw from '../scenarios/pirates.json'
import { validateScenario } from './schema'
import type { Scenario } from './types'

let cached: Scenario | null = null

export function loadScenario(): Scenario {
  if (!cached) cached = validateScenario(raw)
  return cached
}
