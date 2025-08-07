import type { Room } from '../types/hotel'

export const groupRoomsByType = (
  rooms: Room[] = [],
): Record<string, Room[]> => {
  return rooms.reduce(
    (groups, room) => {
      const roomType = room.type
      if (!groups[roomType]) {
        groups[roomType] = []
      }
      groups[roomType].push(room)
      return groups
    },
    {} as Record<string, Room[]>,
  )
}

// Parse guests parameter to extract number of rooms
export const parseGuestsParam = (
  guestsParam: string | null,
): { people: number, rooms: number } => {
  // default on our website
  if (!guestsParam) return { people: 1, rooms: 1 }

  const parts = guestsParam.split('|')
  const rooms = parts.length
  // guests PER room
  const totalPeople = parts.reduce((sum, guests) => sum + parseInt(guests), 0)

  return { people: totalPeople, rooms }
}
