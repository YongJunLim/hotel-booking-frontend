import type { Room } from '../../types/hotel'
import { useLocation } from 'wouter'
import useAuthStore from '../../stores/AuthStore'
import useRoomBookingStore from '../../stores/RoomBookingStore'

interface RoomCardProps {
  room: Room
  currency?: string
  hotelId?: string
  destinationId?: string
  checkin?: string
  checkout?: string
  guests?: string
}

export const RoomCard = ({
  room,
  currency,
  hotelId,
  destinationId,
  checkin,
  checkout,
  guests,
}: RoomCardProps) => {
  const heroImage = room.images?.[0]
  const [, navigate] = useLocation()
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  const setRoomBookingData = useRoomBookingStore(
    state => state.setRoomBookingData,
  )

  const handleBookNow = () => {
    if (isLoggedIn) {
      // Store room booking data
      if (hotelId && checkin && checkout && guests) {
        setRoomBookingData({
          hotelId,
          roomDetails: {
            key: room.key,
            roomNormalizedDescription: room.roomNormalizedDescription,
          },
          checkin,
          checkout,
          guests,
        })
      }
      navigate(
        `/booking/${hotelId}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}`,
      )
    }
  }

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
          <button
            className={`btn btn-lg ${isLoggedIn ? 'btn-primary' : 'btn-primary btn-disabled'}`}
            onClick={handleBookNow}
            disabled={!isLoggedIn}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}
