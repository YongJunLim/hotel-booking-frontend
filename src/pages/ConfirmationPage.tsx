import { useLocation } from 'wouter'
import { useSearchParams } from '../hooks/useSearchParams'
import { NavBar } from '../components/layout/NavBar'

export const ConfirmationPage = () => {
  const [, setLocation] = useLocation()
  const searchParams = useSearchParams()
  const count = searchParams['count'] || 0

  const goHome = () => setLocation('/')

  const pageTitle = `Booking Confirmation`

  return (
    <>
        <NavBar pageTitle={pageTitle} />
        <div className="p-6 text-center">
        <h1 className="text-3xl font-bold mb-10">Booking Successful!</h1>
        <p className="mb-1">Your {count} room booking(s) are created.</p>
        <p className="mb-10">You may view your bookings in your profile page.</p>
        <button onClick={goHome} className="btn btn-primary">Home</button>
        </div>
    </>
  )
}
