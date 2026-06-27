import 'fake-indexeddb/auto'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import PlayScreen from './PlayScreen'
import { useGameStore } from '../../store/gameStore'

// Mock useGeolocation to return a real GPS fix that is OUTSIDE the placeholder
// zone (lat:0, lng:0 with radius 50m). lat:10, lng:10 is ~1500km away — always outside.
vi.mock('../../geo/useGeolocation', () => ({
  useGeolocation: () => ({ pos: { lat: 10, lng: 10 }, accuracy: 5, error: null }),
}))

beforeEach(() => useGameStore.getState().reset())

test('manual "Я на месте" arrival sticks when GPS is persistently outside the geofence', () => {
  vi.useFakeTimers()
  // Advance to s_oak (first located step) so the navigation UI appears.
  useGameStore.getState().dispatch({ type: 'ADVANCE_DIALOG' }, 1)

  render(<HashRouter><PlayScreen /></HashRouter>)

  // The fallback button is gated for 60s; elapse it.
  act(() => { vi.advanceTimersByTime(60000) })
  expect(screen.getByRole('button', { name: /Я на месте/ })).toBeInTheDocument()

  // Click the fallback arrival button.
  fireEvent.click(screen.getByRole('button', { name: /Я на месте/ }))

  // The riddle should now be visible (the geo effect re-ran on arrival).
  expect(screen.getByText(/сколько дней в неделе/i)).toBeInTheDocument()

  // Elapse more time to confirm auto-LEAVE does NOT fire and revert the arrival.
  act(() => { vi.advanceTimersByTime(5000) })
  expect(screen.getByText(/сколько дней в неделе/i)).toBeInTheDocument()

  // Confirm the navigation button is gone (arrival stuck).
  expect(screen.queryByRole('button', { name: /Я на месте/ })).not.toBeInTheDocument()
  vi.useRealTimers()
})
