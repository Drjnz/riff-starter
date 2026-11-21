import { InvalidSlot } from './errors.ts'

const HOUR = 60 * 60 * 1000
export const OPENING_HOUR = 10
export const CLOSING_HOUR = 23
export const MIN_HOURS = 1
export const MAX_HOURS = 4

// Value object: a Slot that exists always respects the opening rules.
// All hours are UTC. The interval is half-open [start, end).
export class Slot {
  readonly start: Date
  readonly end: Date

  constructor(start: Date, end: Date) {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidSlot('start and end must be valid dates')
    }
    if (start.getUTCMinutes() || start.getUTCSeconds() || start.getUTCMilliseconds()) {
      throw new InvalidSlot('A slot starts on a full hour')
    }
    const hours = (end.getTime() - start.getTime()) / HOUR
    if (!Number.isInteger(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
      throw new InvalidSlot(`A slot lasts a whole number of hours, from ${MIN_HOURS} to ${MAX_HOURS}`)
    }
    const startHour = start.getUTCHours()
    if (startHour < OPENING_HOUR || startHour + hours > CLOSING_HOUR) {
      throw new InvalidSlot(`The studio is open from ${OPENING_HOUR}:00 to ${CLOSING_HOUR}:00 UTC`)
    }
    this.start = new Date(start)
    this.end = new Date(end)
  }

  overlaps(other: Slot): boolean {
    // Adjacent slots (end == start) do not overlap.
    return this.start < other.end && other.start < this.end
  }
}
