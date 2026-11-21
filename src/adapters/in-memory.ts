import type { Booking } from '../domain/booking.ts'
import type { BookingRepository, MemberRepository, RoomRepository } from '../domain/ports.ts'
import type { Member, Room } from '../domain/room.ts'

// In-memory data: everything restarts from the seed on each boot.

export class InMemoryRooms implements RoomRepository {
  constructor(private readonly rooms: readonly Room[]) {}

  async all(): Promise<Room[]> {
    return [...this.rooms]
  }

  async findById(id: string): Promise<Room | undefined> {
    return this.rooms.find((room) => room.id === id)
  }
}

export class InMemoryMembers implements MemberRepository {
  constructor(private readonly members: readonly Member[]) {}

  async findById(id: string): Promise<Member | undefined> {
    return this.members.find((member) => member.id === id)
  }
}

export class InMemoryBookings implements BookingRepository {
  private readonly bookings: Booking[]
  private sequence: number

  constructor(seed: readonly Booking[] = []) {
    this.bookings = [...seed]
    this.sequence = seed.length
  }

  async forRoom(roomId: string): Promise<Booking[]> {
    return this.bookings.filter((booking) => booking.roomId === roomId)
  }

  async nextId(): Promise<string> {
    this.sequence += 1
    return `booking-${this.sequence}`
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.push(booking)
  }
}
