import { BACKEND_URL } from '../config/api'
import type { bookingResponse } from '../types/booking'
import type { EditUserRequestBody, GetUserResponse } from '../types/user'

export const userService = {
  getProfile: async (token: string | null): Promise<GetUserResponse> => {
    if (!token) {
      return { success: false, message: 'Invalid token' }
    }

    const res = await fetch(`${BACKEND_URL}/users/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    return await res.json() as GetUserResponse
  },

  editProfile: async (token: string | null, reqBody: EditUserRequestBody): Promise<GetUserResponse> => {
    if (!token) {
      return { success: false, message: 'Invalid token' }
    }
    console.log('service ', reqBody)
    const res = await fetch(`${BACKEND_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(reqBody),
    })

    return await res.json() as GetUserResponse
  },

  getBooking: async (token: string | null): Promise<bookingResponse> => {
    console.log(token)
    if (!token) {
      return { success: false, message: 'Invalid token' }
    }
    // const res = await fetch(`${BACKEND_URL}/bookings`, {
    const res = await fetch('http://localhost:9000/api/v1/bookings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      } })
    return await res.json() as bookingResponse
  },

}
