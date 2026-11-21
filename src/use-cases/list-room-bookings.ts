import type { Booking } from '../domain/booking.ts'
import { RoomNotFound } from '../domain/errors.ts'
import type { BookingRepository, RoomRepository } from '../domain/ports.ts'

export type ListRoomBookingsInput = {
  roomId: string
  from?: Date
  to?: Date
}

export class ListRoomBookings {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly bookings: BookingRepository,
  ) {}

  async execute({ roomId, from, to }: ListRoomBookingsInput): Promise<Booking[]> {
    if (!(await this.rooms.findById(roomId))) throw new RoomNotFound(roomId)
    const bookings = await this.bookings.forRoom(roomId)
    // Keep the bookings that touch the [from, to) window.
    return bookings
      .filter((b) => (!from || b.slot.end > from) && (!to || b.slot.start < to))
      .sort((a, b) => a.slot.start.getTime() - b.slot.start.getTime())
  }
}
