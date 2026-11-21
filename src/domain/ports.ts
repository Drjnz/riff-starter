import type { Booking } from './booking.ts'
import type { Member, Room } from './room.ts'

// Ports: what the domain and the use cases need.
// Implementations live in src/adapters/.
export interface RoomRepository {
  all(): Promise<Room[]>
  findById(id: string): Promise<Room | undefined>
}

export interface MemberRepository {
  findById(id: string): Promise<Member | undefined>
}

export interface BookingRepository {
  forRoom(roomId: string): Promise<Booking[]>
  nextId(): Promise<string>
  save(booking: Booking): Promise<void>
}

export interface Clock {
  now(): Date
}
