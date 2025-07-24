import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RoomDetails {
  key: string
  roomNormalizedDescription: string
}

interface RoomBookingStore {
  hotelId: string | null
  roomDetails: RoomDetails | null
  checkin: string | null
  checkout: string | null
  guests: string | null
  setRoomBookingData: (data: {
    hotelId: string
    roomDetails: RoomDetails
    checkin: string
    checkout: string
    guests: string
  }) => void
  clearRoomBookingData: () => void
}

const useRoomBookingStore = create<RoomBookingStore>()(
  devtools(
    set => ({
      hotelId: null,
      roomDetails: null,
      checkin: null,
      checkout: null,
      guests: null,
      setRoomBookingData: data => set(data),
      clearRoomBookingData: () =>
        set({
          hotelId: null,
          roomDetails: null,
          checkin: null,
          checkout: null,
          guests: null,
        }),
    }),
    {
      name: 'RoomBookingStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

export default useRoomBookingStore
