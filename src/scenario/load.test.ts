import { loadScenario } from './load'

test('pirate scenario loads and validates', () => {
  const s = loadScenario()
  expect(s.id).toBe('pirates')
})

test('finaleCode equals the in-order map digits', () => {
  const s = loadScenario()
  const digits = s.steps
    .map((st) => st.mapDigit)
    .filter((d): d is string => Boolean(d))
    .join('')
  expect(digits).toBe(s.finaleCode)
})
