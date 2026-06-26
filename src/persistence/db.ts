import { openDB } from 'idb'
import type { GameState } from '../engine/types'

export type PersistedProgress = Omit<GameState, 'scenario'>

const DB_NAME = 'adventure-engine'
const STORE = 'progress'
const KEY = 'current'

function db() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE)
    },
  })
}

export async function saveProgress(state: GameState): Promise<void> {
  const { scenario, ...rest } = state
  void scenario
  await (await db()).put(STORE, rest, KEY)
}

export async function loadProgress(): Promise<PersistedProgress | null> {
  const value = await (await db()).get(STORE, KEY)
  return (value as PersistedProgress) ?? null
}

export async function clearProgress(): Promise<void> {
  await (await db()).delete(STORE, KEY)
}
