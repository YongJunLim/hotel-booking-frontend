import { useParams, Link } from 'wouter'
import { useSearchParams } from '../hooks/useSearchParams'
import { BookingDetails } from '../components/ui/BookingDetails'
import { HotelCard } from '../components/ui/ResultsCard'
import { NavBar } from '../components/layout/NavBar'
import { useMemo, useState } from 'react'
import type {
  StitchedHotel,
  PriceAPIResponse,
  Hotel,
  PriceInfo,
} from '../types/params'
import Sortdropdown from '../components/ui/SortDropDown'
// import FilterCheckBox from "../components/ui/FilterCheckBox";
import useSWR from 'swr'
import { BACKEND_URL } from '../config/api'
import { MapSelect } from '../components/ui/MapSelect'

const fetcher = (url: string) => fetch(url).then(response => response.json())

export const ResultsPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const destinationId = params.destination_id
  const checkin = searchParams.checkin ?? undefined
  const checkout = searchParams.checkout ?? undefined
  const guests = searchParams.guests ?? undefined

  const priceAPI = `${BACKEND_URL}/hotels/prices?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
  const hotelAPI = `${BACKEND_URL}/hotels?destination_id=${destinationId}`

  const {
    data: pricedata,
    error: priceerror,
    isLoading: priceloading,
  } = useSWR<PriceAPIResponse, Error>(priceAPI, fetcher, {
    refreshInterval: (data) => {
      // Revalidate every 5 seconds if search is not completed
      return data?.completed === true ? 0 : 5000
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const {
    data: hoteldata,
    error: hotelerror,
    isLoading: hotelloading,
  } = useSWR<Hotel[], Error>(hotelAPI, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const stichedata = useMemo(() => {
    if (hoteldata && pricedata?.hotels) {
      return hoteldata
        .map((hotel: Hotel) => {
          const priceinfo = pricedata.hotels.find(
            (price: PriceInfo) => price.id === hotel.id,
          )
          return {
            ...hotel,
            price: priceinfo?.price,
            searchRank: priceinfo?.searchRank,
          }
        })
        .filter((hotel: StitchedHotel) => hotel.price !== undefined)
        .sort((a: StitchedHotel, b: StitchedHotel) => a.price! - b.price!)
    }
    return []
  }, [hoteldata, pricedata])

  const isloading
    = priceloading || hotelloading || pricedata?.completed !== true

  // sort for dropdown
  const [sortby, setsortby] = useState('Price (Ascending)')
  const sortedlist: StitchedHotel[] = useMemo(() => {
    const datacopy = [...stichedata]
    if (sortby === 'Price (Ascending)') {
      datacopy.sort(
        (a: StitchedHotel, b: StitchedHotel) => a.price! - b.price!,
      )
    }
    else if (sortby === 'Price (Descending)') {
      datacopy.sort(
        (a: StitchedHotel, b: StitchedHotel) => b.price! - a.price!,
      )
    }
    else if (sortby === 'Rating (Ascending)') {
      datacopy.sort(
        (a: StitchedHotel, b: StitchedHotel) => a.rating - b.rating,
      )
    }
    else if (sortby === 'Rating (Descending)') {
      datacopy.sort(
        (a: StitchedHotel, b: StitchedHotel) => b.rating - a.rating,
      )
    }
    return datacopy
  }, [stichedata, sortby])

  // filter stars checkbox

  const pageTitle = `Search Results for ${destinationId}`
  return (
    <>
      <NavBar pageTitle={pageTitle} />

      <BookingDetails
        searchParams={searchParams}
        destinationId={destinationId}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Hotel Search Results</h2>
        {isloading && (
          <span>
            Please wait a moment as we fetch the best prices for you...
          </span>
        )}

        {hotelerror && (
          <div className="text-red-800 bg-yellow-400">
            <span>
              Error loading hotel data:
              {hotelerror.message}
            </span>
          </div>
        )}

        {priceerror && (
          <div className="text-red-800 bg-yellow-400">
            <span>
              Error loading price data:
              {priceerror.message}
            </span>
          </div>
        )}
      </div>

      {priceloading || hotelloading
        ? (
          <div className={priceloading && hotelloading ? 'mt-16' : 'mt-8'}>
            <div className="card card-side bg-base-100 shadow-sm">
              <figure className="p-10">
                <div className="skeleton h-48 w-48 shrink-0 rounded-xl"></div>
              </figure>
              <div className="card-body py-12">
                <div className="flex-1">
                  <div className="skeleton h-6 w-48"></div>
                  <div className="flex flex-wrap mt-4 gap-4">
                    <div className="skeleton h-6 w-20 rounded-full"></div>
                    <div className="skeleton h-6 w-20 rounded-full"></div>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <div className="skeleton h-12 w-20 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        )
        : (
          <>
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg text-base-content/70">
                Last updated:
                {' '}
                {new Date().toLocaleString()}
              </span>
              <div className="flex justify-end">
                <Sortdropdown selectedvalue={sortby} setvalue={setsortby} />
              </div>
            </div>

            <div className="p-5">
              {isloading
                ? null
                : stichedata.length > 0
                  ? (
                    <>
                      {sortedlist.map((hotel: StitchedHotel) => (
                        <HotelCard
                          key={hotel.id}
                          hotel={hotel}
                          hotelprice={hotel.price}
                          checkin={checkin}
                          checkout={checkout}
                          guests={guests}
                          destinationId={destinationId}
                        />
                      ))}
                    </>
                  )
                  : (
                    <p className="content-center text-yellow-700 bg-gray-700">
                      No matching hotels found. Please try a different criteria!
                    </p>
                  )}
            </div>
          </>
        )}

      <Link
        href="/hotels/detail/atH8?destination_id=WD0M&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
        className="btn btn-secondary mr-4"
      >
        View Hotel Details
      </Link>
      <Link href="/" className="btn btn-outline">
        Back to Home
      </Link>
      <div className='pt-8'>
        <MapSelect hotels={sortedlist} checkin={checkin} checkout={checkout} guests={guests} destinationId={destinationId} />
      </div>
    </>
  )
}
