import { create } from 'zustand'
import type { Booking } from '../types/booking'
import { persist, devtools } from 'zustand/middleware'
import {getBooking } from '../utils/GetBooking'

interface BookingStore {
  bookingstatus: boolean
  bookings: Booking[]
  fetchBooking: (token: string) => Promise<void>
  clearBooking: () => void
}

const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      set => ({
        bookings: [],
        bookingstatus: false,
        fetchBooking: async (token: string) => {
          const bookingResponse = await getBooking(token)
          if (bookingResponse?.success) {
            set({
              bookingstatus: true,
              bookings: bookingResponse.data,
            })
          }
          else {
            set({
              bookingstatus: false,
              bookings: [],
            })
          }
        },
        clearBooking: () => set({ bookings: [], bookingstatus: false }),
      }),
      {
        name: 'BookingStore',
        partialize: state => ({
          bookings: state.bookings,
          bookingstatus: state.bookingstatus,
        }),
      },
    ),
    {
      name: 'BookingStore', // Name that appears in Redux DevTools
      enabled: process.env.NODE_ENV === 'development', // Only enable in development
    },
  ),
)

export default useBookingStore
