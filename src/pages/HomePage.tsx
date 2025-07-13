import { Link } from 'wouter'
import useAuthStore from '../store'

export const HomePage = () => {
  const { logout } = useAuthStore()
  return (
    <>
      <nav className="">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <h1 className="text-4xl font-bold mb-8">Hotel Booking</h1>
          <Link href="/user" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
            My Account
          </Link>
        </div>
      </nav>

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
