import useRoomBookingStore from '../../stores/RoomBookingStore'

export const CheckoutSummary = () => {
  const { selectedRooms, getTotalPrice } = useRoomBookingStore()

  return (
    <div className="p-4 border rounded-md shadow-md bg-base-200 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4">Your Booking Summary</h2>
      <ul className="space-y-4">
        {selectedRooms.map((room, idx) => (
          <li key={`${room.key}-${idx}`} className="border-b pb-2">
            <div className="font-medium">{room.roomNormalizedDescription}</div>
            <div className="text-sm text-gray-600">{room.breakfast_display}</div>
            <div className="text-sm text-gray-600">
              {room.free_cancellation ? 'Free Cancellation' : 'Non-Refundable'}
            </div>
            <div className="font-semibold mt-1">
              $
              {room.price.toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t mt-4 pt-2 font-bold text-lg flex gap-2">
        <div>Total:</div>
        <div className="text-green-600">
          $
          {getTotalPrice().toFixed(2)}
        </div>
      </div>
    </div>
  )
}
