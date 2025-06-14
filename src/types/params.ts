export interface SearchParams {
  destination_id: string | null
  checkin: string | null
  checkout: string | null
  lang: string | null
  currency: string | null
  country_code: string | null
  guests: string | null
}

export interface RouteParams {
  destination_id?: string
  hotel_id?: string
}
