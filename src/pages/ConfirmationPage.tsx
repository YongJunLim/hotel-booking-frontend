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
        <h1 className="text-3xl font-bold mb-4">Booking Successful!</h1>
        <p className="mb-6">Your {count} room booking(s) are created.</p>
        <button onClick={goHome} className="btn btn-primary">Home</button>
        </div>
    </>
  )
}
