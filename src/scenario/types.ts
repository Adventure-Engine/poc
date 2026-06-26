export interface Coord { lat: number; lng: number }
export interface GeoZone extends Coord { radius: number }

export interface Location {
  id: string
  title: string
  geo: GeoZone
}

export type StepEvent =
  | { type: 'dialog'; speaker: string; text: string }
  | { type: 'riddle'; speaker?: string; question: string; answer: string; mapDigit?: string }
  | { type: 'use_item'; item: string; text: string }
  | { type: 'craft'; recipeId: string; text: string }
  | { type: 'finale_lock'; text: string }

export interface Step {
  id: string
  locationId?: string        // absent => no physical location (e.g. craft in inventory)
  requires?: string[]        // item ids that must be in inventory to complete
  reward?: string[]          // item ids granted on completion
  arriveText?: string        // optional mini-event shown on (re)arrival
  event: StepEvent
}

export interface Recipe { id: string; inputs: string[]; output: string }

export interface Dublon { id: string; locationId: string; hint: string } // optional collectible

export interface Scenario {
  id: string
  title: string
  ageRange: string
  finaleCode: string         // 3-digit code, must equal concatenated mapDigits in order
  locations: Location[]
  steps: Step[]
  recipes: Recipe[]
  dublons: Dublon[]
}
