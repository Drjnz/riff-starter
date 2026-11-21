import type { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import * as v from 'valibot'
import type { BookRoom } from '../use-cases/book-room.ts'
import type { ListRoomBookings } from '../use-cases/list-room-bookings.ts'
import type { ListRooms } from '../use-cases/list-rooms.ts'
import { requireUserId, type AppEnv } from './caller.ts'
import { errors, fakeCallerHeaders, json, validate } from './openapi.ts'
import {
  bookingDtoSchema,
  bookingWindowParamsSchema,
  bookRoomBodySchema,
  roomDtoSchema,
  roomParamsSchema,
  toBookingDto,
  toRoomDto,
} from './schemas.ts'

export type RoomUseCases = {
  listRooms: ListRooms
  listRoomBookings: ListRoomBookings
  bookRoom: BookRoom
}

// Thin handlers: validate, call the use case, present the DTO.
export function roomRoutes(app: Hono<AppEnv>, useCases: RoomUseCases) {
  app.get(
    '/rooms',
    describeRoute({
      operationId: 'listRooms',
      tags: ['Rooms'],
      summary: 'List rehearsal rooms',
      parameters: fakeCallerHeaders,
      responses: { 200: json(v.array(roomDtoSchema), 'All rooms') },
    }),
    async (c) => {
      const rooms = await useCases.listRooms.execute()
      return c.json(rooms.map(toRoomDto), 200)
    },
  )

  app.get(
    '/rooms/:roomId/bookings',
    describeRoute({
      tags: ['Bookings'],
      operationId: 'listRoomBookings',
      summary: 'List every booking of a room',
      parameters: fakeCallerHeaders,
      responses: { 200: json(v.array(bookingDtoSchema), 'Bookings sorted by start'), ...errors(400) },
    }),
    validate('param', roomParamsSchema),
    async (c) => {
      const { roomId } = c.req.valid('param')
      const bookings = await useCases.listRoomBookings.execute({ roomId })
      return c.json(bookings.map(toBookingDto), 200)
    },
  )

  app.get(
    '/rooms/:roomId/bookings/:from/:to',
    describeRoute({
      tags: ['Bookings'],
      operationId: 'listRoomBookingsBetween',
      summary: 'List the bookings of a room within [from, to)',
      parameters: fakeCallerHeaders,
      responses: { 200: json(v.array(bookingDtoSchema), 'Bookings sorted by start'), ...errors(400) },
    }),
    validate('param', bookingWindowParamsSchema),
    async (c) => {
      const { roomId, from, to } = c.req.valid('param')
      const bookings = await useCases.listRoomBookings.execute({ roomId, from: new Date(from), to: new Date(to) })
      return c.json(bookings.map(toBookingDto), 200)
    },
  )

  app.post(
    '/rooms/:roomId/createBooking',
    describeRoute({
      tags: ['Bookings'],
      operationId: 'bookRoom',
      summary: 'Book a room for the calling member',
      description: 'Slot of 1 to 4 hours, starting on a full hour, within 10:00-23:00 UTC. The member is the caller.',
      parameters: fakeCallerHeaders,
      responses: { 200: json(bookingDtoSchema, 'Booking created'), ...errors(400, 403, 409) },
    }),
    validate('param', roomParamsSchema),
    validate('json', bookRoomBodySchema),
    async (c) => {
      const memberId = requireUserId(c.get('caller'))
      const { roomId } = c.req.valid('param')
      const { start, end } = c.req.valid('json')
      const booking = await useCases.bookRoom.execute({
        roomId,
        memberId,
        start: new Date(start),
        end: new Date(end),
      })
      return c.json(toBookingDto(booking), 200)
    },
  )
}
