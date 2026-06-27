import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import App from './App'

test('renders scenario title on root route', () => {
  render(<HashRouter><App /></HashRouter>)
  expect(screen.getByText('Тайна капитана Моргана')).toBeInTheDocument()
})
