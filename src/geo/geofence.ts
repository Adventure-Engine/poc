import type { Coord, GeoZone } from '../scenario/types'
import { distanceMeters } from './haversine'

export function isInside(zone: GeoZone, pos: Coord): boolean {
  return distanceMeters(zone, pos) <= zone.radius
}

export function proximityHint(zone: GeoZone, pos: Coord): 'inside' | 'hot' | 'warm' | 'cold' {
  const d = distanceMeters(zone, pos)
  if (d <= zone.radius) return 'inside'
  if (d <= 50) return 'hot'
  if (d <= 150) return 'warm'
  return 'cold'
}
