import { useEffect, useState } from 'react'
import { useParams } from 'wouter'
import { useLocation } from 'wouter'
import { useSearchParams } from '../hooks/useSearchParams'
import { loadStripe } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { NavBar } from '../components/layout/NavBar'
import useRoomBookingStore from '../stores/RoomBookingStore'
import { CheckoutSummary } from '../components/ui/CheckoutSummary'
import useAuthStore from '../stores/AuthStore'
import { BACKEND_URL } from '../config/api'

const stripePromise = loadStripe(
  'pk_test_51RkOjuPSc0OCzrEzBwXXxxQaYDDeAQf66TRqSPK8zi8AuZDKUPyQrG3MRjTDPNXXHph6vbnzG8GOwkqZllAx7GcJ00KEWTx5jG',
) // Stripe testing key

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [, setLocation] = useLocation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    billingAddress: '',
  })

  const roomBookingStore = useRoomBookingStore()
  console.log(typeof roomBookingStore.selectedRooms)
  console.log('Selected Rooms:', roomBookingStore.selectedRooms)
  console.log('Total Price:', roomBookingStore.getTotalPrice())
  console.log('Max Selected Rooms:', roomBookingStore.maxSelectedRooms)
  console.log('Hotel ID:', roomBookingStore.hotelId)
  console.log('Check-in:', roomBookingStore.checkin)
  console.log('Check-out:', roomBookingStore.checkout)
  console.log('Guests:', roomBookingStore.guests)

  const { accessToken, userDetails } = useAuthStore()
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({})

  // ========== Redirect if nothing in checkout ==========
  useEffect(() => {
    if (!roomBookingStore.hotelId || roomBookingStore.selectedRooms.length === 0) {
      setLocation('/')
    }
  }, [roomBookingStore.hotelId, roomBookingStore.selectedRooms, setLocation])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!accessToken) return

      try {
        const res = await fetch(`${BACKEND_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        console.log('Json response stringified:', JSON.stringify(data, null, 2))
        const user = data.data

        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
        }))
      } catch (err) {
        console.error(err)
      }
    }

    fetchUserProfile()
  }, [accessToken])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setErrorMessages((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })

    const newErrors: { [key: string]: string } = {}

    if (name === 'firstName' && !value.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (name === 'lastName' && !value.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      newErrors.email = 'Invalid email format'
    }
    if (name === 'phone' && !/^\d{8}$/.test(value)) {
      newErrors.phone = 'Phone must be 8 digits'
    }
    if (name === 'billingAddress' && !value.trim()) {
      newErrors.billingAddress = 'Billing address is required'
    }

    setErrorMessages(prev => ({ ...prev, ...newErrors }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validation
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 8 digits'
    }
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrorMessages(newErrors)
      return
    }

    //if (!stripe || !elements) return

    // ========== Update User Information ==========
    const profilePayload = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phone
    }

    /*
    const profileUpdateRes = await fetch(`${BACKEND_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profilePayload),
    })

    console.log('Profile update response status:', profileUpdateRes.status)
    console.log('Profile update response ok:', profileUpdateRes.ok)

    const profileResText = await profileUpdateRes.text()
    console.log('Profile update response body:', profileResText)

    if (!profileUpdateRes.ok) {
      alert('Failed to update profile')
      return
    }
    */

    // ========== Send Booking Request ==========
    const email = userDetails.email
    const roomTypes = roomBookingStore.selectedRooms.map(r => JSON.stringify(r))

    const adults = roomBookingStore.guests
    ? Number(roomBookingStore.guests.split('|')[0])
    : 1

    const bookingPayload = {
      email,
      startDate: roomBookingStore.checkin,
      endDate: roomBookingStore.checkout,
      adults,
      roomTypes,
      messageToHotel: formData.specialRequests,
    }

    console.log('Submitting booking with:', bookingPayload)

    const bookingRes = await fetch(`${BACKEND_URL}/bookingWrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bookingPayload),
    })

    console.log('Booking response status:', bookingRes.status)
    console.log('Booking response ok:', bookingRes.ok)

    const resData = await bookingRes.json()
    console.log('Booking response body:', resData)

    if (!bookingRes.ok) {
      alert('Failed to create bookings')
      return
    } else {
      roomBookingStore.clearRoomBookingData()
      setLocation(`/confirmation?count=${resData.bookings.length}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Update Your Information</h2>

      <div className="flex gap-4">
        <div className="w-full">
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className="input input-bordered w-full"
          />
          {errorMessages.firstName && <p className="text-red-500 text-sm mt-1">{errorMessages.firstName}</p>}
        </div>

        <div className="w-full">
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className="input input-bordered w-full"
          />
          {errorMessages.lastName && <p className="text-red-500 text-sm mt-1">{errorMessages.lastName}</p>}
        </div>
      </div>

      <div>
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input input-bordered w-full"
        />
        {errorMessages.email && <p className="text-red-500 text-sm mt-1">{errorMessages.email}</p>}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input input-bordered w-full"
        />
        {errorMessages.phone && <p className="text-red-500 text-sm mt-1">{errorMessages.phone}</p>}
      </div>

      <h2 className="text-2xl font-bold">Booking Infomation</h2>
      <textarea
        name="specialRequests"
        placeholder="Special Requests"
        value={formData.specialRequests}
        onChange={handleChange}
        className="textarea textarea-bordered w-full"
      />

      <div>
        <input
          name="billingAddress"
          placeholder="Billing Address"
          value={formData.billingAddress}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input input-bordered w-full"
        />
        {errorMessages.billingAddress && <p className="text-red-500 text-sm mt-1">{errorMessages.billingAddress}</p>}
      </div>

      <h2 className="text-2xl font-bold mt-6">Payment Information</h2>
      <CardElement
        options={{ style: { base: { fontSize: '16px' } } }}
        className="p-2 border rounded-md"
      />

      <button type="submit" className="btn btn-primary mt-4 w-full">
        Submit Booking
      </button>
    </form>
  )
}

export const BookingPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Booking for hotel:', params.hotel_id)
  }, [searchParams])

  const pageTitle = `Complete Your Booking`

  return (
    <>
      <NavBar pageTitle={pageTitle} />
      <Elements stripe={stripePromise}>
        <div className="p-6">
          <p className="mb-6">
            Hotel ID:
            {' '}
            <strong>{params.hotel_id}</strong>
            <br />
            Destination ID:
            {' '}
            <strong>{searchParams.destination_id}</strong>
            <br />
            Check-in:
            {' '}
            <strong>{searchParams.checkin}</strong>
            <br />
            Check-out:
            {' '}
            <strong>{searchParams.checkout}</strong>
            <br />
          </p>

          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
            {/* Checkout Summary */}
            <div className="w-full lg:w-1/3">
              <br></br>
              <div className="max-w-xl mx-auto">
                <CheckoutSummary />
              </div>
            </div>

            {/* Checkout Form */}
            <div className="w-full lg:flex-1">
              <br></br>
              <div className="max-w-xl mx-auto">
                <CheckoutForm />
              </div>
            </div>
          </div>
        </div>
      </Elements>
    </>
  )
}

export default CheckoutForm
