import type { Hotel } from '../../types/params'
import { useLocation } from 'wouter'

interface Results {
  hotel: Hotel
  hotelprice?: number
  checkin?: string
  checkout?: string
  guests?: string
  destinationId?: string
}

export const HotelCard = ({
  hotel,
  hotelprice,
  checkin,
  checkout,
  guests,
  destinationId,
}: Results) => {
  const [, navigate] = useLocation()

  return (
    <div className="card card-side bg-base-100 shadow-sm">
      <figure className="p-4">
        <img
          src={`${hotel.image_details.prefix}0${hotel.image_details.suffix}`}
          alt={hotel.name}
          className="w-50 h-50 object-cover rounded"
        />
      </figure>
      <div className="card-body">
        <h2 className="text-xl font-semibold">{hotel.name}</h2>
        <p>{hotel.address}</p>
        <p>
          {hotel.rating}
          {' '}
          stars
        </p>
        <div>
          <p className="text-green-600 font-semibold text-xl flex justify-end">
            $
            {hotelprice}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="btn btn-primary mt-2"
            onClick={() => {
              navigate(
                `/hotels/detail/${hotel.id}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}`,
              )
            }}
          >
            View Rooms
          </button>
        </div>
      </div>
    </div>
  )
}
