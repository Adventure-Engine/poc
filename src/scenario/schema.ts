import { z } from 'zod'
import type { Scenario } from './types'

const coord = z.object({ lat: z.number(), lng: z.number() })
const geoZone = coord.extend({ radius: z.number().positive() })
const location = z.object({ id: z.string().min(1), title: z.string().min(1), geo: geoZone })

const stepEvent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('dialog'), speaker: z.string(), text: z.string() }),
  z.object({ type: z.literal('riddle'), speaker: z.string().optional(), question: z.string(), answer: z.string() }),
  z.object({ type: z.literal('use_item'), item: z.string(), text: z.string() }),
  z.object({ type: z.literal('craft'), recipeId: z.string(), text: z.string() }),
  z.object({ type: z.literal('finale_lock'), text: z.string() }),
])

const step = z.object({
  id: z.string().min(1),
  locationId: z.string().optional(),
  requires: z.array(z.string()).optional(),
  reward: z.array(z.string()).optional(),
  mapDigit: z.string().optional(),
  arriveText: z.string().optional(),
  event: stepEvent,
})

const recipe = z.object({ id: z.string(), inputs: z.array(z.string()).min(1), output: z.string() })
const dublon = z.object({ id: z.string(), locationId: z.string(), hint: z.string() })

const scenario = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  ageRange: z.string(),
  finaleCode: z.string().min(1),
  locations: z.array(location).min(1),
  steps: z.array(step).min(1),
  recipes: z.array(recipe),
  dublons: z.array(dublon),
}).superRefine((s, ctx) => {
  const locIds = new Set(s.locations.map((l) => l.id))
  s.steps.forEach((st, i) => {
    if (st.locationId && !locIds.has(st.locationId)) {
      ctx.addIssue({ code: 'custom', path: ['steps', i, 'locationId'], message: `unknown locationId ${st.locationId}` })
    }
  })
  s.dublons.forEach((d, i) => {
    if (!locIds.has(d.locationId)) {
      ctx.addIssue({ code: 'custom', path: ['dublons', i, 'locationId'], message: `unknown locationId ${d.locationId}` })
    }
  })
})

export function validateScenario(data: unknown): Scenario {
  return scenario.parse(data) as Scenario
}
