import { validateScenario } from './schema'

const valid = {
  id: 'demo', title: 'Demo', ageRange: '9-12', finaleCode: '3',
  locations: [{ id: 'l1', title: 'L1', geo: { lat: 1, lng: 2, radius: 20 } }],
  steps: [{ id: 's1', locationId: 'l1', event: { type: 'dialog', speaker: 'Cap', text: 'hi' } }],
  recipes: [],
  dublons: [],
}

test('accepts a valid scenario', () => {
  expect(validateScenario(valid).id).toBe('demo')
})

test('rejects a step referencing an unknown locationId', () => {
  const bad = { ...valid, steps: [{ id: 's1', locationId: 'nope', event: { type: 'dialog', speaker: 'c', text: 't' } }] }
  expect(() => validateScenario(bad)).toThrow()
})

test('rejects a recipe-less craft step', () => {
  const bad = { ...valid, steps: [{ id: 's1', event: { type: 'craft', text: 't' } }] }
  expect(() => validateScenario(bad)).toThrow()
})
