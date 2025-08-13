import { create } from 'zustand'
import type { Booking } from '../types/booking.ts'
import { persist, devtools } from 'zustand/middleware'
import useAuthStore from './AuthStore.js'
import { userService } from '../utils/userService'
interface BookingStore {
  bookingStatus: boolean
  selectedBooking: Booking | null
  bookings: Booking[]
  fetchBooking: () => Promise<void>
  clearBooking: () => void
  setSelectedBooking: (Booking: Booking | null) => void
}

const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      set => ({
        bookings: [],
        selectedBooking: null,
        bookingStatus: false,
        fetchBooking: async () => {
          const accesstoken = useAuthStore.getState().accessToken
          try {
            const bookingResponse = await userService.getBooking(accesstoken)
            if (bookingResponse?.success) {
              set({ bookings: bookingResponse.bookings, bookingStatus: true })
            }
            else {
              set({
                bookingStatus: false,
                bookings: [],
              })
            }
          }
          catch {
            set({ bookings: [], bookingStatus: false }) // Fetch failed
          }
        },
        clearBooking: () => set({ bookings: [], bookingStatus: false, selectedBooking: null }),
        setSelectedBooking(Booking: Booking | null) {
          set({ selectedBooking: Booking })
        },
      }),
      {
        name: 'BookingStore',
        partialize: state => ({
          bookings: state.bookings,
          bookingstatus: state.bookingStatus,
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
