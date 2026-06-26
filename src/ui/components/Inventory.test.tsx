import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import Inventory from './Inventory'
import { useGameStore } from '../../store/gameStore'

test('renders held items', () => {
  useGameStore.getState().reset()
  useGameStore.setState({ inventory: ['rusty_key', 'rope'] })
  render(<Inventory />)
  expect(screen.getByText(/rusty_key/)).toBeInTheDocument()
  expect(screen.getByText(/rope/)).toBeInTheDocument()
})
