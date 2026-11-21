import { Booking } from '../domain/booking.ts'
import type { Member, Room } from '../domain/room.ts'
import { Slot } from '../domain/slot.ts'

export const seedRooms: Room[] = [
  { id: 'room-1', name: 'Salle Hendrix', capacity: 5 },
  { id: 'room-2', name: 'Salle Simone', capacity: 4 },
  { id: 'room-3', name: 'Salle Bowie', capacity: 6 },
  { id: 'room-4', name: 'Salle Björk', capacity: 3 },
]

export const seedMembers: Member[] = [
  { id: 'member-1', name: 'Les Volts' },
  { id: 'member-2', name: 'Café Noir' },
  { id: 'member-3', name: 'Marée Basse' },
]

const slot = (start: string, end: string) => new Slot(new Date(start), new Date(end))

// A function rather than a constant, so each app gets its own objects.
export function seedBookings(): Booking[] {
  return [
    new Booking('booking-1', 'room-1', 'member-1', slot('2026-11-03T18:00:00Z', '2026-11-03T20:00:00Z')),
    new Booking('booking-2', 'room-3', 'member-1', slot('2026-11-10T14:00:00Z', '2026-11-10T17:00:00Z')),
    new Booking('booking-3', 'room-2', 'member-2', slot('2026-11-02T19:00:00Z', '2026-11-02T21:00:00Z')),
  ]
}
