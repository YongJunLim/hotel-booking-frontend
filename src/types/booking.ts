export interface bookingResponse {
  success: boolean
  bookings?: Booking[]
  message: string
}

export interface Booking {
  guestId: string
  nights: number
  startDate: string
  endDate: string
  adults: number
  children: number
  status: string
  createdAt: string
  updatedAt: string
  _id: string
  messageToHotel: string
  roomType: string
}
