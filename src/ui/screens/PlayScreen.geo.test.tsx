import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import PlayScreen from './PlayScreen'
import { useGameStore } from '../../store/gameStore'

// Mock useGeolocation to return a real GPS fix that is OUTSIDE the placeholder
// zone (lat:0, lng:0 with radius 50m). lat:10, lng:10 is ~1500km away — always outside.
vi.mock('../../geo/useGeolocation', () => ({
  useGeolocation: () => ({ pos: { lat: 10, lng: 10 }, accuracy: 5, error: null }),
}))

beforeEach(() => useGameStore.getState().reset())

test('manual "Я на месте" arrival sticks when GPS is persistently outside the geofence', async () => {
  // Advance to s_oak (first located step) so the navigation UI appears.
  useGameStore.getState().dispatch({ type: 'ADVANCE_DIALOG' }, 1)

  render(<HashRouter><PlayScreen /></HashRouter>)

  // The navigation section should be visible before clicking.
  expect(screen.getByRole('button', { name: /Я на месте/ })).toBeInTheDocument()

  // Click the fallback arrival button.
  await userEvent.click(screen.getByRole('button', { name: /Я на месте/ }))

  // The riddle should now be visible.
  expect(screen.getByText(/сколько дней в неделе/i)).toBeInTheDocument()

  // Wait a tick to verify the auto-LEAVE does NOT fire and revert the arrival.
  await waitFor(() => {
    expect(screen.getByText(/сколько дней в неделе/i)).toBeInTheDocument()
  })

  // Confirm the navigation button is gone (arrival stuck).
  expect(screen.queryByRole('button', { name: /Я на месте/ })).not.toBeInTheDocument()
})
