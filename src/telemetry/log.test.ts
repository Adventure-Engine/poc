import { logEvent, getLog, exportLog, clearLog } from './log'

beforeEach(() => clearLog())

test('appends events in order with provided timestamps', () => {
  logEvent('game_started', 1000)
  logEvent('point_reached', 2000, { locationId: 'loc_old_oak' })
  const log = getLog()
  expect(log.map((e) => e.name)).toEqual(['game_started', 'point_reached'])
  expect(log[1].data).toEqual({ locationId: 'loc_old_oak' })
})

test('exportLog returns parseable JSON', () => {
  logEvent('game_finished', 5000)
  expect(JSON.parse(exportLog())[0].name).toBe('game_finished')
})
