import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import PlayScreen from './PlayScreen'
import { useGameStore } from '../../store/gameStore'

beforeEach(() => useGameStore.getState().reset())

test('intro dialog renders and advances on tap', async () => {
  render(<HashRouter><PlayScreen /></HashRouter>)
  expect(screen.getByText(/Я капитан Морган/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Дальше/ }))
  expect(screen.getByText(/Старый дуб/)).toBeInTheDocument() // next step targets this location
})

test('"Я на месте" fallback marks arrival and shows the riddle', async () => {
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1) // move to s_oak
  render(<HashRouter><PlayScreen /></HashRouter>)
  await userEvent.click(screen.getByRole('button', { name: /Я на месте/ }))
  expect(screen.getByText(/Сколько больших ветвей/)).toBeInTheDocument()
})
