import { distanceMeters } from './haversine'
import { isInside, proximityHint } from './geofence'

const zone = { lat: 0, lng: 0, radius: 20 }

test('distance between identical points is zero', () => {
  expect(distanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0)
})

test('~111 meters per 0.001 latitude degree', () => {
  const d = distanceMeters({ lat: 0, lng: 0 }, { lat: 0.001, lng: 0 })
  expect(d).toBeGreaterThan(100)
  expect(d).toBeLessThan(120)
})

test('isInside true within radius, false outside', () => {
  expect(isInside(zone, { lat: 0.0001, lng: 0 })).toBe(true)   // ~11 m
  expect(isInside(zone, { lat: 0.001, lng: 0 })).toBe(false)   // ~111 m
})

test('proximityHint buckets by distance', () => {
  expect(proximityHint(zone, { lat: 0, lng: 0 })).toBe('inside')
  expect(proximityHint(zone, { lat: 0.0004, lng: 0 })).toBe('hot')   // ~44 m
  expect(proximityHint(zone, { lat: 0.0009, lng: 0 })).toBe('warm')  // ~100 m
  expect(proximityHint(zone, { lat: 0.01, lng: 0 })).toBe('cold')    // ~1.1 km
})
