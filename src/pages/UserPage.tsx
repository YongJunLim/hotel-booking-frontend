import { Link } from 'wouter'
import { useState, useEffect, useCallback } from 'react'
import DeleteToast from './DeleteAccount'
import useAuthStore from '../stores/AuthStore'
import { RedirectToast } from '../components/ui/Redirect'
import useBookingStore from '../stores/BookingStore'
import type { UpdateUserRequest } from '../types/user'
import useToastStore from '../stores/ToastStore'

export const UserPage = () => {
  const [isClick, setIsClick] = useState(false)
  // AuthStore
  const { isLoggedIn, accessToken, getProfile, editProfile } = useAuthStore()
  // BookingStore
  const {
    fetchBooking,
    bookings,
    selectedBooking,
    setSelectedBooking,
    bookingStatus,
  } = useBookingStore()
  // Toast Store
  const setToast = useToastStore(state => state.setToast)
  const userDetails = useAuthStore(state => state.userDetails)
  const [message, setMessage] = useState('')
  const [msgClass, setMsgClass] = useState('')
  const [editButton, setEditButton] = useState(false)
  const [showRedirectToast, setShowRedirectToast] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const toggleDropdown = () => setIsOpen(!isOpen)

  const FetchBooking = useCallback(async () => {
    await fetchBooking()
    if (bookingStatus) {
      setToast('Booking list is updated', 'success')
    }
    else {
      setToast('Failed to fetch Booking list', 'error')
    }
  }, [fetchBooking, bookingStatus, accessToken, setToast])

  useEffect(() => {
    if (!isLoggedIn) {
      setShowRedirectToast(true)
    }
    else {
      const loadData = async () => {
        try {
          await FetchBooking()
          const result = await getProfile()
          if (!result) {
            setToast('Failed to retrieve user details', 'error')
          }
        }
        catch (error) {
          console.error('Failed to load data:', error)
        }
      }
      void loadData()
    }
  }, [isLoggedIn, getProfile, FetchBooking, setToast, accessToken])

  useEffect(() => {
    console.log('Booking list updated', bookings)
  }, [bookings])

  function handleClick() {
    setIsClick(true)
  }

  function closeToast() {
    setIsClick(false)
  }

  async function submitEditProfile() {
    const inputs = {
      firstName: (
        document.getElementById('first_name') as HTMLInputElement
      ).value.trim(),
      lastName: (
        document.getElementById('last_name') as HTMLInputElement
      ).value.trim(),
      salutation: (
        document.getElementById('salutation') as HTMLSelectElement
      ).value.trim(),
      phoneNumber: (
        document.getElementById('phone') as HTMLInputElement
      ).value.trim(),
      email: (
        document.getElementById('email') as HTMLInputElement
      ).value.trim(),
      password: (document.getElementById('passwd_edit') as HTMLInputElement)
        .value,
    }
    if (!inputs.password) {
      setMessage('Password is required')
      setMsgClass('text-red-800')
      return
    }
    else {
      const reqbody: UpdateUserRequest = {
        password: inputs.password,
      }
      if (inputs.email) reqbody.email = inputs.email
      if (inputs.firstName) reqbody.firstName = inputs.firstName
      if (inputs.lastName) reqbody.lastName = inputs.lastName
      if (inputs.salutation) reqbody.salutation = inputs.salutation
      if (inputs.phoneNumber) reqbody.phoneNumber = inputs.phoneNumber
      console.log(reqbody)
      try {
        const response = await editProfile(reqbody)
        console.log("res",response)
        setToast(response.message, response.updatedUser ? 'success' : 'error')
        // if (response.success) {
        if (response.updatedUser) {
          console.log('getting profile')
          await getProfile() // Refresh profile data
          setToast('Profile updated successfully', 'success')
        }
      }
      catch {
        setToast('Failed to update profile', 'error')
      }
    }
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
            data-testid="detail"
            className={`${isClick ? 'opacity-50' : 'opacity-100'} items-center justify-between mx-auto w-full max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700`}
          >
            <div className="relative flex justify-end px-4 pt-4">
              <button
                onClick={toggleDropdown}
                className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 3"
                >
                  <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[11rem] w-max bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600">
                  <div className="py-1">
                    <button
                      data-testid="open-edit"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      onClick={() => {
                        setEditButton(true)
                        setIsOpen(false)
                      }}
                    >
                      Edit Profile
                    </button>
                    <button
                      id="deleteButton"
                      data-testid="close-delete"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-400 dark:hover:text-white"
                      onClick={() => {
                        handleClick()
                        setIsOpen(false)
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
            <form className="space-y-6" action="#">
              <div className="space-y-4">
                <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                  Account Details
                </h5>

                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p
                      data-testid="username"
                      className="text-gray-900 dark:text-white"
                    >
                      {[
                        userDetails.salutation,
                        userDetails.firstName,
                        userDetails.lastName,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  </div>
                  {/* Email */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p id="displayemail" className="text-gray-900 dark:text-white">
                      {userDetails.email}
                    </p>
                  </div>

                  {/* Phone */}
                  {userDetails.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p id="displayphoneNumber" className="text-gray-900 dark:text-white">
                        {userDetails.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Booking lists */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mr-4">
                    Booking list
                  </h2>
                  <button
                    onClick={() => {
                      const submitFetch = async () => {
                        try {
                          await FetchBooking()
                        }
                        catch (error) {
                          console.error('Fetch booking failed:', error)
                        }
                      }
                      void submitFetch()
                    }}
                  >
                    Refresh
                  </button>
                </div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th id="typeheader" scope="col" className="px-6 py-3">
                          Room Type
                        </th>
                        <th id="startheader" scope="col" className="px-6 py-3">
                          Start Date
                        </th>
                        <th id="endheader" scope="col" className="px-6 py-3">
                          End Date
                        </th>
                        <th id="nightheader" scope="col" className="px-6 py-3">
                          Nights
                        </th>
                        <th id="infoheader" scope="col" className="px-6 py-3">
                          More info
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((item, index) => (
                        <tr
                          key={item._id}
                          className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                        >
                          <th
                            data-testid={`roomtype-${index}`}
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {item.roomType}
                          </th>
                          <td
                            data-testid={`startdate-${index}`}
                            className="px-6 py-4"
                          >
                            {' '}
                            {item.startDate}
                          </td>
                          <td
                            data-testid={`enddate-${index}`}
                            className="px-6 py-4"
                          >
                            {' '}
                            {item.endDate}
                          </td>
                          <td
                            data-testid={`nights-${index}`}
                            className="px-6 py-4"
                          >
                            {' '}
                            {item.nights}
                          </td>
                          <td
                            data-testid={`info-${index}`}
                            className="px-6 py-4"
                          >
                            <a
                              href="#"
                              onClick={() => {
                                void setSelectedBooking(item)
                              }}
                              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!bookingStatus && bookings.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No bookings found or failed to load bookings.</p>
                      <p>Try again</p>
                    </div>
                  )}
                </div>
              </div>
              {selectedBooking && (
                <div>
                  <div className="flex">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mr-8">
                      Viewed Information:
                    </p>
                    <button
                      onClick={() => {
                        void setSelectedBooking(null)
                      }}
                      className="text-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                    >
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
                      {selectedBooking.startDate}
                    </p>
                    <p>
                      <strong>End Date:</strong>
                      {' '}
                      {selectedBooking.endDate}
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
            </form>
          </div>
        </>
      )}
      {/* / Redirect to login or home */}
      {showRedirectToast && <RedirectToast />}

      {/* Delete Account Toast */}
      {isClick ? <DeleteToast open={isClick} onClose={closeToast} /> : null}

      {/* Edit Profile Toast */}
      {editButton && (
        <div
          id="toast-interactive"
          className="mx-auto mt-8 w-full max-w-md p-4 text-gray-600 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-300"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update any details below. All fields are optional.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Name Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>

                {/* Contact Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salutation
                  </label>
                  <select
                    id="salutation"
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option>Mr</option>
                    <option>Mrs</option>
                    <option>Ms</option>
                    <option>Miss</option>
                    <option>Dr</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
              {/* Password - Keep this required */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Required to confirm changes
                </p>
                <input
                  type="password"
                  id="passwd_edit"
                  className="w-full p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                data-testid="submit-edit"
                onClick={() => {
                  const submit = async () => {
                    try {
                      await submitEditProfile()
                    }
                    catch (error) {
                      console.error('Edit profile failed:', error)
                    }
                  }
                  void submit()
                }}
                className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>

            {/* Close Button */}
            <button
              className="p-1 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close"
              onClick={() => setEditButton(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <p className={`${msgClass}`}>{message}</p>
          </div>
        </div>
      )}
    </>
  )
}
