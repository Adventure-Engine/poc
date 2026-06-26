import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import { vi, expect, test, beforeEach } from 'vitest'
import StartScreen from './StartScreen'
import { logEvent } from '../../telemetry/log'
import { loadProgress } from '../../persistence/db'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockReset = vi.fn()
const mockHydrate = vi.fn().mockResolvedValue(undefined)
vi.mock('../../store/gameStore', () => ({
  useGameStore: (selector: (s: { reset: () => void; hydrate: () => Promise<void> }) => unknown) =>
    selector({ reset: mockReset, hydrate: mockHydrate }),
}))

vi.mock('../../telemetry/log', () => ({ logEvent: vi.fn() }))
vi.mock('../../persistence/db', () => ({ loadProgress: vi.fn().mockResolvedValue(null) }))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(loadProgress).mockResolvedValue(null)
})

function renderStartScreen() {
  return render(<HashRouter><StartScreen /></HashRouter>)
}

test('shows the scenario title and a start button', () => {
  renderStartScreen()
  expect(screen.getByText('Тайна капитана Моргана')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Начать/ })).toBeInTheDocument()
})

test('clicking "Начать приключение" resets state, logs game_started, and navigates to /play', async () => {
  const user = userEvent.setup()
  renderStartScreen()
  await user.click(screen.getByRole('button', { name: /Начать/ }))
  expect(mockReset).toHaveBeenCalledOnce()
  expect(logEvent).toHaveBeenCalledWith('game_started', expect.any(Number))
  expect(mockNavigate).toHaveBeenCalledWith('/play')
})

test('shows "Продолжить" when loadProgress returns an in-progress save', async () => {
  vi.mocked(loadProgress).mockResolvedValue({
    currentStepIndex: 3,
    finished: false,
    inventory: [],
    mapDigits: [],
    collectedDublons: [],
    atLocationId: null,
    lastMessage: null,
  })
  renderStartScreen()
  const resumeBtn = await screen.findByRole('button', { name: /Продолжить/ })
  const user = userEvent.setup()
  await user.click(resumeBtn)
  expect(mockHydrate).toHaveBeenCalledOnce()
  expect(mockNavigate).toHaveBeenCalledWith('/play')
})

test('"Продолжить" is NOT shown when loadProgress resolves to null', async () => {
  renderStartScreen()
  await waitFor(() => {
    expect(screen.queryByRole('button', { name: /Продолжить/ })).not.toBeInTheDocument()
  })
})
