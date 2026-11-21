import { Booking, ensureSlotIsFree } from '../domain/booking.ts'
import { InvalidSlot, RoomNotFound, UnknownMember } from '../domain/errors.ts'
import type { BookingRepository, Clock, MemberRepository, RoomRepository } from '../domain/ports.ts'
import { Slot } from '../domain/slot.ts'

export type BookRoomInput = {
  roomId: string
  memberId: string
  start: Date
  end: Date
}

export class BookRoom {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly members: MemberRepository,
    private readonly bookings: BookingRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: BookRoomInput): Promise<Booking> {
    if (!(await this.rooms.findById(input.roomId))) throw new RoomNotFound(input.roomId)
    if (!(await this.members.findById(input.memberId))) throw new UnknownMember(input.memberId)

    const slot = new Slot(input.start, input.end)
    if (slot.start <= this.clock.now()) throw new InvalidSlot('A slot must start in the future')

    ensureSlotIsFree(input.roomId, slot, await this.bookings.forRoom(input.roomId))

    const booking = new Booking(await this.bookings.nextId(), input.roomId, input.memberId, slot)
    await this.bookings.save(booking)
    return booking
  }
}
