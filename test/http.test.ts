import { describe, expect, test } from 'vitest'
import { FixedClock } from '../src/adapters/system-clock.ts'
import { buildApp } from '../src/build-app.ts'

const app = () => buildApp({ clock: new FixedClock(new Date('2026-11-01T08:00:00Z')) })

const book = (body: unknown, headers: Record<string, string> = { 'X-Fake-User-Id': 'member-3' }) =>
  app().request('/rooms/room-1/createBooking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

const errorCode = async (res: Response) => ((await res.json()) as { error: { code: string } }).error.code

describe('HTTP', () => {
  test('GET /rooms lists the 4 seeded rooms', async () => {
    const res = await app().request('/rooms')
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(4)
  })

  test('GET /rooms/:roomId/bookings lists every booking of the room', async () => {
    const res = await app().request('/rooms/room-1/bookings')
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })

  test('GET /rooms/:roomId/bookings/:from/:to filters by window', async () => {
    const res = await app().request('/rooms/room-1/bookings/2026-11-04T00:00:00Z/2026-11-05T00:00:00Z')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  test('GET /rooms/:roomId/bookings/:from/:to returns the booking inside the window', async () => {
    const res = await app().request('/rooms/room-1/bookings/2026-11-03T00:00:00Z/2026-11-04T00:00:00Z')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      { id: 'booking-1', roomId: 'room-1', memberId: 'member-1', start: '2026-11-03T18:00:00.000Z', end: '2026-11-03T20:00:00.000Z' },
    ])
  })

  test('GET /rooms/:roomId/bookings rejects an unknown room', async () => {
    const res = await app().request('/rooms/room-9/bookings')
    expect(res.status).toBe(404)
    expect(await errorCode(res)).toBe('ROOM_NOT_FOUND')
  })

  test('POST books for the caller', async () => {
    const res = await book({ start: '2026-11-03T20:00:00Z', end: '2026-11-03T21:00:00Z' })
    expect(res.status).toBe(200)
    const booking = (await res.json()) as { id: string; memberId: string }
    expect(booking.id).toBe('booking-4')
    expect(booking.memberId).toBe('member-3')
  })

  test('POST without the user header is refused', async () => {
    const res = await book({ start: '2026-11-04T18:00:00Z', end: '2026-11-04T19:00:00Z' }, {})
    expect(res.status).toBe(401)
    expect(await errorCode(res)).toBe('UNAUTHENTICATED')
  })

  test('POST on a taken slot returns 409 without leaking a stack trace', async () => {
    const res = await book({ start: '2026-11-03T18:00:00Z', end: '2026-11-03T19:00:00Z' })
    expect(res.status).toBe(409)
    const body = await res.text()
    expect(body).toContain('SLOT_TAKEN')
    expect(body).not.toContain('stack')
  })

  test('GET / redirects to the interactive docs', async () => {
    const res = await app().request('/')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/docs')
  })

  test('GET /openapi.json documents the public routes', async () => {
    const doc = (await (await app().request('/openapi.json')).json()) as { paths: Record<string, unknown> }
    expect(Object.keys(doc.paths)).toEqual([
      '/rooms',
      '/rooms/{roomId}/bookings',
      '/rooms/{roomId}/bookings/{from}/{to}',
      '/rooms/{roomId}/createBooking',
    ])
  })
})
