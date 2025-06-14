import { useParams, Link } from 'wouter'
import { useSearchParams } from '../hooks/useSearchParams'
import { BookingDetails } from '../components/ui/BookingDetails'

export const HotelDetailPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const hotelId = params.hotel_id
  const destinationId = searchParams.destination_id

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Hotel Details for
        {' '}
        {hotelId}
        {' '}
        in
        {' '}
        {destinationId}
      </h1>
      <BookingDetails
        searchParams={searchParams}
        destinationId={destinationId || undefined}
        hotelId={hotelId}
      />
      <Link
        href="/results/WD0M?checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
        className="btn btn-secondary mr-4"
      >
        Back to Results
      </Link>
      <Link href="/" className="btn btn-outline">
        Back to Home
      </Link>
    </>
  )
}
