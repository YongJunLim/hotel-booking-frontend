import { useParams, Link } from 'wouter'
import { useSearchParams } from '../hooks/useSearchParams'
import { BookingDetails } from '../components/ui/BookingDetails'

export const ResultsPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const destinationId = params.destination_id

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Search Results for
        {' '}
        {destinationId}
      </h1>
      <BookingDetails searchParams={searchParams} destinationId={destinationId} />
      <Link
        href="/hotels/detail/atH8?destination_id=WD0M&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
        className="btn btn-secondary mr-4"
      >
        View Hotel Details
      </Link>
      <Link href="/" className="btn btn-outline">
        Back to Home
      </Link>
    </>
  )
}
