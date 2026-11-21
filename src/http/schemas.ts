import * as v from 'valibot'
import type { Booking } from '../domain/booking.ts'
import type { Room } from '../domain/room.ts'

const isoTimestamp = v.pipe(
  v.string(),
  v.isoTimestamp('Expected an ISO 8601 timestamp, e.g. 2026-12-01T18:00:00Z'),
)

// Inputs
export const roomParamsSchema = v.object({ roomId: v.pipe(v.string(), v.minLength(1)) })

export const bookingWindowParamsSchema = v.object({
  roomId: v.pipe(v.string(), v.minLength(1)),
  from: isoTimestamp,
  to: isoTimestamp,
})

export const bookRoomBodySchema = v.object({
  start: isoTimestamp,
  end: isoTimestamp,
})

// Outputs (DTOs): domain objects never leave the API as they are.
export const roomDtoSchema = v.object({
  id: v.string(),
  name: v.string(),
  capacity: v.number(),
})

export const bookingDtoSchema = v.object({
  id: v.string(),
  roomId: v.string(),
  memberId: v.string(),
  start: v.string(),
  end: v.string(),
})

export const errorDtoSchema = v.object({
  error: v.object({ code: v.string(), message: v.string() }),
})

export type RoomDto = v.InferOutput<typeof roomDtoSchema>
export type BookingDto = v.InferOutput<typeof bookingDtoSchema>

export const toRoomDto = ({ id, name, capacity }: Room): RoomDto => ({ id, name, capacity })

export const toBookingDto = (booking: Booking): BookingDto => ({
  id: booking.id,
  roomId: booking.roomId,
  memberId: booking.memberId,
  start: booking.slot.start.toISOString(),
  end: booking.slot.end.toISOString(),
})
