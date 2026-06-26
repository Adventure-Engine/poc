import { useEffect, useState } from 'react'
import type { Coord } from '../scenario/types'

export function useGeolocation() {
  const [pos, setPos] = useState<Coord | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Геолокация недоступна на этом устройстве.')
      return
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude })
        setAccuracy(p.coords.accuracy)
        setError(null)
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return { pos, accuracy, error }
}
