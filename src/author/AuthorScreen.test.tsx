import { render, screen } from '@testing-library/react'
import AuthorScreen from './AuthorScreen'

test('lists scenario location ids to capture', () => {
  render(<AuthorScreen />)
  expect(screen.getByRole('option', { name: /loc_old_oak/ })).toBeInTheDocument()
  expect(screen.getByText(/locations/)).toBeInTheDocument() // JSON preview present
})
