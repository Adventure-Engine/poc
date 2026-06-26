export type TelemetryEvent = { name: string; at: number; data?: Record<string, unknown> }

const KEY = 'adventure-engine:telemetry'

export function getLog(): TelemetryEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as TelemetryEvent[]
  } catch {
    return []
  }
}

export function logEvent(name: string, at: number, data?: Record<string, unknown>): void {
  const log = getLog()
  log.push({ name, at, ...(data ? { data } : {}) })
  localStorage.setItem(KEY, JSON.stringify(log))
}

export function exportLog(): string {
  return JSON.stringify(getLog(), null, 2)
}

export function clearLog(): void {
  localStorage.removeItem(KEY)
}
