// Every business error extends DomainError.
// The HTTP layer (src/http/errors.ts) maps them to status codes.
export abstract class DomainError extends Error {
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class InvalidSlot extends DomainError {
  readonly code = 'INVALID_SLOT'
}

export class SlotTaken extends DomainError {
  readonly code = 'SLOT_TAKEN'

  constructor(roomId: string) {
    super(`Room ${roomId} is already booked on this slot`)
  }
}

export class RoomNotFound extends DomainError {
  readonly code = 'ROOM_NOT_FOUND'

  constructor(roomId: string) {
    super(`Room ${roomId} does not exist`)
  }
}

export class UnknownMember extends DomainError {
  readonly code = 'UNKNOWN_MEMBER'

  constructor(memberId: string) {
    super(`Member ${memberId} does not exist`)
  }
}
