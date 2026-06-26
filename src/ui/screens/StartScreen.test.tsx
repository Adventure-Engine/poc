import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import StartScreen from './StartScreen'

test('shows the scenario title and a start button', () => {
  render(<HashRouter><StartScreen /></HashRouter>)
  expect(screen.getByText('Тайна капитана Моргана')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Начать/ })).toBeInTheDocument()
})
