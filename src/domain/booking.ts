import { SlotTaken } from './errors.ts'
import type { Slot } from './slot.ts'

export class Booking {
  constructor(
    readonly id: string,
    readonly roomId: string,
    readonly memberId: string,
    readonly slot: Slot,
  ) {}
}

// Invariant: two bookings of the same room never overlap.
export function ensureSlotIsFree(roomId: string, slot: Slot, existing: readonly Booking[]): void {
  if (existing.some((booking) => booking.roomId === roomId && booking.slot.overlaps(slot))) {
    throw new SlotTaken(roomId)
  }
}
