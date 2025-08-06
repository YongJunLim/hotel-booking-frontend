import { create } from 'zustand'
import type { Booking } from '../types/booking'
import { persist, devtools } from 'zustand/middleware'
import {getBooking } from '../utils/GetBooking'
import useAuthStore from './AuthStore'
interface BookingStore {
  bookingstatus: boolean
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
        bookingstatus: false,
        fetchBooking: async () => {
          const accesstoken = useAuthStore.getState().accessToken
          try{
              const bookingResponse = await getBooking(accesstoken)
              if(bookingResponse?.success && bookingResponse.data) {
                set({ bookings: bookingResponse.data, bookingstatus: true })
              }
              else {
                set({
                  bookingstatus: false,
                  bookings: [],
                })
              }
          }
          catch (error) {
            set({ bookings: [], bookingstatus: false }) // Fetch failed
          }
          
        },
        clearBooking: () => set({ bookings: [], bookingstatus: false, selectedBooking: null }),
        setSelectedBooking(Booking: Booking | null) {
            set({selectedBooking: Booking})
        },
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
