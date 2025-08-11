import { useParams, Link, useLocation } from 'wouter'
import useSWR from 'swr'
import { useEffect } from 'react'
import { useSearchParams } from '../hooks/useSearchParams'
import type { PriceBaseResponse } from '../types/api'
import type { Room } from '../types/hotel'
import { BACKEND_URL } from '../config/api'
import { HotelInfo } from '../components/ui/HotelInfo'
import { RoomSection } from '../components/ui/RoomSection'
import { NavBar } from '../components/layout/NavBar'
import useRoomBookingStore from '../stores/RoomBookingStore'
import useAuthStore from '../stores/AuthStore'
import { fetcher } from '../utils/ApiUtils'
import { parseGuestsParam, groupRoomsByType } from '../utils/RoomUtils'

interface HotelPriceResponse extends PriceBaseResponse {
  rooms: Room[]
}

export const HotelDetailPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const [, navigate] = useLocation()
  const hotelId = params.hotel_id
  const destinationId = searchParams.destination_id
  const guests = searchParams.guests
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)

  // Room booking store
  const selectedRooms = useRoomBookingStore(state => state.selectedRooms)
  const setRoomBookingData = useRoomBookingStore(
    state => state.setRoomBookingData,
  )
  const setMaxSelectedRooms = useRoomBookingStore(
    state => state.setMaxSelectedRooms,
  )
  const getTotalPrice = useRoomBookingStore(state => state.getTotalPrice)

  // Parse guests parameter to extract number of rooms
  const { rooms: maxRooms } = parseGuestsParam(guests)

  // Set up room booking data when component mounts
  useEffect(() => {
    if (hotelId && searchParams.checkin && searchParams.checkout && guests) {
      setRoomBookingData({
        hotelId,
        checkin: searchParams.checkin,
        checkout: searchParams.checkout,
        guests,
      })
      setMaxSelectedRooms(maxRooms)
    }
  }, [
    hotelId,
    searchParams.checkin,
    searchParams.checkout,
    guests,
    maxRooms,
    setRoomBookingData,
    setMaxSelectedRooms,
  ])

  // API URL for fetching hotel prices
  const apiUrl = `${BACKEND_URL}/hotels/${hotelId}/price?destination_id=${destinationId}&checkin=${searchParams.checkin}&checkout=${searchParams.checkout}&lang=${searchParams.lang}&currency=${searchParams.currency}&country_code=${searchParams.country_code}&guests=${searchParams.guests}`

  const { data, error, isLoading } = useSWR<HotelPriceResponse, Error>(
    apiUrl,
    fetcher,
    {
      refreshInterval: (data) => {
        return data?.completed === true ? 0 : 5000
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  )

  // Group rooms by type
  const groupedRooms = groupRoomsByType(data?.rooms)

  const handleBookNow = () => {
    if (isLoggedIn && selectedRooms.length > 0) {
      navigate(
        `/booking/${hotelId}?destination_id=${destinationId}&checkin=${searchParams.checkin}&checkout=${searchParams.checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}`,
      )
    }
  }

  const pageTitle = `Hotel Details`

  return (
    <>
      <NavBar pageTitle={pageTitle} />
      {hotelId && <HotelInfo hotelId={hotelId} />}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Room Options (Select up to
          {' '}
          {maxRooms}
          {' '}
          room
          {maxRooms !== 1 ? 's' : ''}
          )
        </h2>

        {!isLoading && !data?.completed && !error && (
          <span>
            Please wait a moment as we fetch the best prices for you...
          </span>
        )}

        {error && (
          <div className="alert alert-error">
            <span>
              Error loading price data:
              {error.message}
            </span>
          </div>
        )}

        {data?.completed
          ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                {data.completed && (
                  <span className="text-lg text-base-content/70">
                    Last updated:
                    {' '}
                    {new Date().toLocaleString()}
                  </span>
                )}
              </div>

              {Object.keys(groupedRooms).length > 0
                ? (
                  <div className="space-y-4">
                    {Object.entries(groupedRooms).map(([roomType, rooms]) => (
                      <RoomSection
                        key={roomType}
                        roomType={roomType}
                        rooms={rooms}
                        currency={searchParams.currency || undefined}
                      />
                    ))}
                  </div>
                )
                : (
                  <p>No available rooms were found.</p>
                )}
            </>
          )
          : !error
            ? (
              <div className={isLoading ? 'mt-16' : 'mt-8'}>
                <div className="card card-side bg-base-100 shadow-sm dark:shadow-xl">
                  <figure className="p-10">
                    <div className="skeleton h-48 w-48 shrink-0 rounded-xl"></div>
                  </figure>
                  <div className="card-body py-12">
                    <div className="flex-1">
                      <div className="skeleton h-6 w-48"></div>
                      <div className="flex flex-wrap mt-4 gap-4">
                        <div className="skeleton h-6 w-20 rounded-full"></div>
                        <div className="skeleton h-6 w-20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="card-actions justify-end">
                      <div className="skeleton h-12 w-20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            )
            : null}
      </div>

      {/* Room Selection Summary */}
      {selectedRooms.length > 0 && (
        <div className="mb-6 p-4 bg-base-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Selected Rooms (
            {selectedRooms.length}
            /
            {maxRooms}
            )
          </h3>
          <div className="space-y-2">
            {selectedRooms.map((room, index) => (
              <div
                key={`${room.key}-${index}`}
                className="flex justify-between items-center"
              >
                <span>
                  {room.roomNormalizedDescription}
                  ,
                  {room.breakfast_display}
                  ,
                  {' '}
                  {room.free_cancellation
                    ? 'Free Cancellation'
                    : 'Non-Refundable'}
                  {' '}
                </span>
                <span className="font-semibold">
                  $
                  {room.price}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between items-center font-bold">
              <span>Total:</span>
              <span className="text-green-600">
                $
                {getTotalPrice()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleBookNow}
          className={`btn btn-primary ${
            !isLoggedIn || selectedRooms.length === 0 ? 'btn-disabled' : ''
          }`}
          disabled={!isLoggedIn || selectedRooms.length === 0}
        >
          Book Selected Rooms (
          {selectedRooms.length}
          )
        </button>

        <Link
          href={`/results/${destinationId}?checkin=${searchParams.checkin}&checkout=${searchParams.checkout}&lang=${searchParams.lang}&currency=${searchParams.currency}&country_code=${searchParams.country_code}&guests=${searchParams.guests}`}
          className="btn btn-secondary"
        >
          Back to Results
        </Link>

        <Link href="/" className="btn btn-outline">
          Back to Home
        </Link>
      </div>
    </>
  )
}
