import type { Room } from '../../types/hotel'

interface RoomCardProps {
  room: Room
  currency?: string
}

export const RoomCard = ({ room, currency }: RoomCardProps) => {
  const heroImage = room.images?.[0]

  return (
    <div className="card card-side bg-base-100 shadow-sm">
      <figure className="p-4">
        <img
          src={heroImage.url}
          alt={room.roomNormalizedDescription}
          className="h-48 rounded-xl aspect-square"
        />
      </figure>
      <div className="card-body">
        <div className="flex-1">
          {room.roomAdditionalInfo?.breakfastInfo && (
            <h1 className="text-lg font-bold">
              {room.roomAdditionalInfo.breakfastInfo}
            </h1>
          )}
          <div className="flex flex-wrap mt-4 gap-4 text-lg">
            <div className="badge badge-outline">
              {currency}
              {' '}
              {room.price}
            </div>
            {room.free_cancellation && (
              <div className="badge badge-success badge-outline">
                Free Cancellation
              </div>
            )}
          </div>
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-lg">Book</button>
        </div>
      </div>
    </div>
  )
}
