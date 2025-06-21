import { Link } from 'wouter'
import useAuthStore from '../store'

export const HomePage = () => {
  const { logout } = useAuthStore()
  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Hotel Booking</h1>
      <p className="mb-4">Welcome to our hotel booking platform!</p>
      {/* May be preferable to use wouter's navigate for the actual search component */}
      <Link
        href="/results/WD0M?checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
        className="btn btn-primary"
      >
        Search Hotels in WD0M
      </Link>
      <Link
        href="/Login"
        className="btn btn-primary m-4"
      >
        Login
      </Link>
      <button onClick={handleLogOut} className="btn btn-primary">Logout</button>
    </>
  )
  // Logout to clear the sessionStorage(remove logged in status)
  function handleLogOut() {
    console.log('logged out')
    logout()
  }
}
