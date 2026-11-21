import { Hono } from 'hono'
import { InMemoryBookings, InMemoryMembers, InMemoryRooms } from './adapters/in-memory.ts'
import { seedBookings, seedMembers, seedRooms } from './adapters/seed.ts'
import { SystemClock } from './adapters/system-clock.ts'
import type { Clock } from './domain/ports.ts'
import { fakeCaller, type AppEnv } from './http/caller.ts'
import { handleError, handleNotFound } from './http/errors.ts'
import { documentation } from './http/openapi.ts'
import { roomRoutes } from './http/room-routes.ts'
import { BookRoom } from './use-cases/book-room.ts'
import { ListRoomBookings } from './use-cases/list-room-bookings.ts'
import { ListRooms } from './use-cases/list-rooms.ts'

export type AppOptions = { clock?: Clock }

// Composition root: the only file that knows the concrete implementations.
// Everything is wired by hand, through constructors.
export function buildApp({ clock = new SystemClock() }: AppOptions = {}) {
  const rooms = new InMemoryRooms(seedRooms)
  const members = new InMemoryMembers(seedMembers)
  const bookings = new InMemoryBookings(seedBookings())

  const app = new Hono<AppEnv>()
  app.use('*', fakeCaller())

  roomRoutes(app, {
    listRooms: new ListRooms(rooms),
    listRoomBookings: new ListRoomBookings(rooms, bookings),
    bookRoom: new BookRoom(rooms, members, bookings, clock),
  })
  documentation(app)

  app.onError(handleError)
  app.notFound(handleNotFound)
  return app
}
