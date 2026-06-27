import 'fake-indexeddb/auto'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import PlayScreen from './PlayScreen'
import { useGameStore } from '../../store/gameStore'
import { clearLog, getLog } from '../../telemetry/log'

beforeEach(() => useGameStore.getState().reset())

test('intro dialog renders and advances on tap', async () => {
  render(<HashRouter><PlayScreen /></HashRouter>)
  expect(screen.getByText(/Я капитан Морган/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Дальше/ }))
  expect(screen.getByText(/Старый дуб/)).toBeInTheDocument() // next step targets this location
})

test('"Я на месте" fallback marks arrival and shows the riddle', async () => {
  vi.useFakeTimers()
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1) // move to s_oak
  render(<HashRouter><PlayScreen /></HashRouter>)
  await act(async () => { await vi.advanceTimersByTimeAsync(60000) }) // fallback gate elapses
  fireEvent.click(screen.getByRole('button', { name: /Я на месте/ }))
  expect(screen.getByText(/сколько дней в неделе/i)).toBeInTheDocument()
  vi.useRealTimers()
})

test('"Я на месте" fallback is hidden until the delay elapses', () => {
  vi.useFakeTimers()
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1) // move to s_oak (located step)
  render(<HashRouter><PlayScreen /></HashRouter>)
  expect(screen.queryByRole('button', { name: /Я на месте/ })).toBeNull()
  act(() => { vi.advanceTimersByTime(60000) })
  expect(screen.getByRole('button', { name: /Я на месте/ })).toBeInTheDocument()
  vi.useRealTimers()
})

test('dublon hint button appears at loc_old_oak and collects dub_oak', async () => {
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1) // step 0 -> step 1 (s_oak at loc_old_oak)
  store.dispatch({ type: 'ARRIVE', locationId: 'loc_old_oak' }, 2)
  render(<HashRouter><PlayScreen /></HashRouter>)
  // dublon hint should appear
  expect(screen.getByText(/Загляни в дупло дуба/)).toBeInTheDocument()
  // click collect button
  await userEvent.click(screen.getByRole('button', { name: /Я нашёл дублон/ }))
  // store should have collected dub_oak
  expect(useGameStore.getState().collectedDublons).toContain('dub_oak')
})

test('fallback_used telemetry is logged when "Я на месте" button is pressed', async () => {
  vi.useFakeTimers()
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1) // move to s_oak at loc_old_oak
  clearLog()
  render(<HashRouter><PlayScreen /></HashRouter>)
  await act(async () => { await vi.advanceTimersByTimeAsync(60000) })
  fireEvent.click(screen.getByRole('button', { name: /Я на месте/ }))
  const log = getLog()
  const fallbackEvent = log.find(e => e.name === 'fallback_used')
  expect(fallbackEvent).toBeDefined()
  expect(fallbackEvent?.data?.locationId).toBe('loc_old_oak')
  vi.useRealTimers()
})
