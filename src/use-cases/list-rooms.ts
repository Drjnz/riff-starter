import type { Room } from '../domain/room.ts'
import type { RoomRepository } from '../domain/ports.ts'

export class ListRooms {
  constructor(private readonly rooms: RoomRepository) {}

  execute(): Promise<Room[]> {
    return this.rooms.all()
  }
}
