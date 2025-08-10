export const getBreakfastDisplay = (breakfastInfo: string) => {
  switch (breakfastInfo) {
    case 'hotel_detail_room_only':
      return 'Room Only'
    case 'hotel_detail_breakfast_included':
      return 'Breakfast Included'
    case 'hotel_detail_breakfast_for_1_included':
      return 'Breakfast for 1 Included'
    case 'hotel_detail_breakfast_for_2_included':
      return 'Breakfast for 2 Included'
    default:
      return breakfastInfo // fallback to original value
  }
}
