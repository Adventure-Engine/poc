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
