import { Link } from 'wouter'
import { useState, useEffect } from 'react'
import DeleteToast from './DeleteAccount'
import useAuthStore from '../stores/AuthStore'
import { type Booking } from '../types/booking'
import { RedirectToast } from '../components/ui/Redirect'
import useBookingStore from '../stores/BookingStore'

export const UserPage = () => {
  const [firstname, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [isClick, setIsClick] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  const userDetails = useAuthStore(state => state.userDetails)
  const accessToken = useAuthStore(state => state.accessToken)
  const fetchBooking = useBookingStore(state => state.fetchBooking)
  const bookings = useBookingStore(state => state.bookings)
  const [showRedirectToast, setShowRedirectToast] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      setShowRedirectToast(true)
    }
    else {
      setEmail(userDetails.email)
      setFirstName(userDetails.firstName)
      const loadBookings = async () => {
        if (accessToken) {
          await fetchBooking(accessToken)
        }
      }
      void loadBookings()
    }
  }, [isLoggedIn, userDetails.email, userDetails.firstName, fetchBooking, accessToken])

  useEffect(() => {
    console.log('Booking list updated', bookings)
  }, [bookings])

  function handleClick() {
    setIsClick(true)
  }

  function closeToast() {
    setIsClick(false)
  }

  return (
    <>
      {/* Account detail page */}
      {isLoggedIn && (
        <>
          <nav>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
              <h1 className="text-4xl font-bold mb-8">Account Page</h1>
              <Link
                href="/"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Home Page
              </Link>
            </div>
          </nav>
          <div
            id="detail"
            className={`${isClick ? 'opacity-50' : 'opacity-100'} items-center justify-between mx-auto w-full max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700`}
          >
            <form className="space-y-6" action="#">
              <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Details
              </h5>
              {/* Username */}
              <div className="grid grid-cols-3 items-center">
                <label className="text-m font-medium text-gray-900 dark:text-white">
                  Username:
                </label>
                <span className="col-span-2 text-m text-gray-900 dark:text-white">
                  {firstname}
                </span>
              </div>
              {/* Email */}
              <div className="grid grid-cols-3 items-center">
                <label className="text-m font-medium text-gray-900 dark:text-white">
                  Email:
                </label>
                <span className="col-span-2 text-m text-gray-900 dark:text-white">
                  {email}
                </span>
              </div>
              {/* Booking lists */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mr-4">
                    Booking list
                  </h2>
                  <button onClick={() => { if (accessToken) fetchBooking(accessToken) }}>Refresh</button>
                </div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Room Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Start Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          End Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Nights
                        </th>
                        <th scope="col" className="px-6 py-3">
                          More info
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(item => (
                        <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item.roomType}
                          </th>
                          <td className="px-6 py-4">
                            {' '}
                            {item.startDate}
                          </td>
                          <td className="px-6 py-4">
                            {' '}
                            {item.endDate}
                          </td>
                          <td className="px-6 py-4">
                            {' '}
                            {item.nights}
                          </td>
                          <td className="px-6 py-4">
                            <a href="#" onClick={() => { void setSelectedBooking(item) }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</a>
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>
              {selectedBooking && (
                <div>
                  <div className="flex">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mr-8">Viewed Information:</p>
                    <button onClick={() => { void setSelectedBooking(null) }} className="text-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">
                      Close
                    </button>
                  </div>
                  <div className="grid grid-col-6">
                    <p>
                      <strong>Room Type:</strong>
                      {' '}
                      {selectedBooking.roomType}
                    </p>
                    <p>
                      <strong>Nights:</strong>
                      {' '}
                      {selectedBooking.nights}
                    </p>
                    <p>
                      <strong>Start Date:</strong>
                      {' '}
                      {new Date(selectedBooking.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>
                      {' '}
                      {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Adults:</strong>
                      {' '}
                      {selectedBooking.adults}
                      {' '}
                      |
                      {' '}
                      <strong>Children:</strong>
                      {' '}
                      {selectedBooking.children}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      {' '}
                      {selectedBooking.status}
                    </p>
                    <p>
                      <strong>Message to Hotel:</strong>
                      {' '}
                      {selectedBooking.messageToHotel}
                    </p>
                    <p>
                      <strong>Created At:</strong>
                      {' '}
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Delete Account */}
              <div className="pt-1">
                <button
                  onClick={handleClick}
                  type="button"
                  id="deleteButton"
                  className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>

            </form>
          </div>
        </>
      )}
      {/* / Redirect to login or home */}
      {showRedirectToast && <RedirectToast />}

      {/* Delete Account Toast */}
      {isClick ? <DeleteToast open={isClick} onClose={closeToast} /> : null}
    </>
  )
}
