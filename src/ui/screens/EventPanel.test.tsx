import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import PlayScreen from './PlayScreen'
import { useGameStore } from '../../store/gameStore'

beforeEach(() => useGameStore.getState().reset())

test('hint button appears and shows hint text on riddle step', async () => {
  const store = useGameStore.getState()
  // Advance to s_oak (riddle step)
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1)
  store.dispatch({ type: 'ARRIVE', locationId: 'loc_old_oak' }, 2)
  render(<HashRouter><PlayScreen /></HashRouter>)
  // "Подсказка" button should be visible (s_oak has a hint)
  expect(screen.getByRole('button', { name: /Подсказка/ })).toBeInTheDocument()
  // Click it
  await userEvent.click(screen.getByRole('button', { name: /Подсказка/ }))
  // Hint text should now be visible
  expect(screen.getByText(/Понедельник/)).toBeInTheDocument()
})

test('after two wrong answers "Показать ответ" appears and fills the input so riddle can be solved', async () => {
  const store = useGameStore.getState()
  store.dispatch({ type: 'ADVANCE_DIALOG' }, 1)
  store.dispatch({ type: 'ARRIVE', locationId: 'loc_old_oak' }, 2)
  render(<HashRouter><PlayScreen /></HashRouter>)

  const input = screen.getByRole('textbox', { name: /Ответ/ })
  const submitBtn = screen.getByRole('button', { name: /Ответить/ })

  // Wrong answer 1
  await userEvent.type(input, 'wrong1')
  await userEvent.click(submitBtn)
  // Wrong answer 2
  await userEvent.type(input, 'wrong2')
  await userEvent.click(submitBtn)

  // "Показать ответ" should now appear
  expect(screen.getByRole('button', { name: /Показать ответ/ })).toBeInTheDocument()

  // Click it — fills the input with the real answer
  await userEvent.click(screen.getByRole('button', { name: /Показать ответ/ }))
  expect((screen.getByRole('textbox', { name: /Ответ/ }) as HTMLInputElement).value).toBe('7')

  // Now press Ответить — riddle should be solved, step advances
  await userEvent.click(screen.getByRole('button', { name: /Ответить/ }))
  // s_oak is done, next step is s_stones — location "Три камня" shown
  expect(screen.getByText(/Три камня/)).toBeInTheDocument()
})
