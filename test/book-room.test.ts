import { beforeEach, describe, expect, test } from 'vitest'
import { InMemoryBookings, InMemoryMembers, InMemoryRooms } from '../src/adapters/in-memory.ts'
import { seedBookings, seedMembers, seedRooms } from '../src/adapters/seed.ts'
import { FixedClock } from '../src/adapters/system-clock.ts'
import { InvalidSlot, RoomNotFound, SlotTaken, UnknownMember } from '../src/domain/errors.ts'
import { BookRoom } from '../src/use-cases/book-room.ts'

const at = (iso: string) => new Date(iso)

describe('BookRoom', () => {
  let bookings: InMemoryBookings
  let bookRoom: BookRoom

  beforeEach(() => {
    bookings = new InMemoryBookings(seedBookings())
    bookRoom = new BookRoom(
      new InMemoryRooms(seedRooms),
      new InMemoryMembers(seedMembers),
      bookings,
      new FixedClock(at('2026-11-01T08:00:00Z')),
    )
  })

  test('books a free slot right after an existing one', async () => {
    const booking = await bookRoom.execute({
      roomId: 'room-1',
      memberId: 'member-2',
      start: at('2026-11-03T20:00:00Z'),
      end: at('2026-11-03T22:00:00Z'),
    })
    expect(booking.id).toBe('booking-4')
    expect(await bookings.forRoom('room-1')).toHaveLength(2)
  })

  test('refuses an overlapping slot', async () => {
    const input = { roomId: 'room-1', memberId: 'member-2', start: at('2026-11-03T19:00:00Z'), end: at('2026-11-03T21:00:00Z') }
    await expect(bookRoom.execute(input)).rejects.toBeInstanceOf(SlotTaken)
  })

  test('refuses a slot in the past of the clock', async () => {
    const input = { roomId: 'room-4', memberId: 'member-2', start: at('2026-10-30T10:00:00Z'), end: at('2026-10-30T11:00:00Z') }
    await expect(bookRoom.execute(input)).rejects.toBeInstanceOf(InvalidSlot)
  })

  test('refuses an unknown room or member', async () => {
    const slot = { start: at('2026-12-01T10:00:00Z'), end: at('2026-12-01T11:00:00Z') }
    await expect(bookRoom.execute({ ...slot, roomId: 'room-9', memberId: 'member-1' })).rejects.toBeInstanceOf(RoomNotFound)
    await expect(bookRoom.execute({ ...slot, roomId: 'room-1', memberId: 'member-9' })).rejects.toBeInstanceOf(UnknownMember)
  })
})
