import { type bookingResponse } from "../types/booking"

export async function getBooking(token: string) {
  console.log(token)
  if (token) {
    // const res = await fetch(`${BACKEND_URL}/bookings`, {
    const res = await fetch('http://localhost:9000/api/v1/bookings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      } })
    const msg: bookingResponse = await res.json() as bookingResponse
    if (msg.success) {
      console.log(msg.bookings)
      return {
        success: true,
        data: msg.bookings,
        message: msg.message,
      }
    }
    else {
      return {
        success: false,
        message: msg.message,
      }
    }
  }
}
