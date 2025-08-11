import DOMPurify from 'dompurify'
import { RoomCard } from './RoomCard'
import type { Room } from '../../types/hotel'

interface RoomSectionProps {
  roomType: string
  rooms: Room[]
  currency?: string
}

export const RoomSection = ({
  roomType,
  rooms,
  currency,
}: RoomSectionProps) => {
  return (
    <div key={roomType}>
      <h3 className="text-lg font-semibold mb-4">
        {rooms[0]?.roomNormalizedDescription || `Room Type ${roomType}`}
      </h3>
      <div className="flex flex-col gap-4">
        {rooms[0]?.long_description && (
          <div
            tabIndex={0}
            className="collapse collapse-plus bg-base-100 border-base-300 border mb-4"
          >
            <div className="collapse-title font-semibold">
              View Room Details
            </div>
            <div
              className="collapse-content text-sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(rooms[0].long_description),
              }}
            />
          </div>
        )}
        {rooms?.map(room => (
          <RoomCard key={room.key} room={room} currency={currency} />
        ))}
      </div>
    </div>
  )
}
