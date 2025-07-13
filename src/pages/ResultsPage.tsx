import { useParams, Link } from "wouter";
import { useSearchParams } from "../hooks/useSearchParams";
import { BookingDetails } from "../components/ui/BookingDetails";
import { HotelCard } from "../components/ui/ResultsCard";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export const ResultsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const destinationId = params.destination_id;
  const checkin = searchParams.checkin ?? undefined;
  const checkout = searchParams.checkout ?? undefined;
  const guests = searchParams.guests ?? undefined;

  const priceAPI = `http://localhost:9000/api/v1/hotels/prices?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  const hotelAPI = `http://localhost:9000/api/v1/hotels?destination_id=${destinationId}`;

  const {
    data: pricedata,
    error: priceerror,
    isLoading: priceloading,
  } = useSWR(priceAPI, fetcher, {
    refreshInterval: (data) => {
      // Revalidate every 5 seconds if search is not completed
      return data?.completed === true ? 0 : 5000;
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const {
    data: hoteldata,
    error: hotelerror,
    isLoading: hotelloading,
  } = useSWR(hotelAPI, fetcher, {
    refreshInterval: (data) => {
      return data?.completed === true ? 0 : 5000;
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
  const stichedata =
    hoteldata && pricedata?.hotels
      ? hoteldata
          .map((hotel: any) => {
            const priceinfo = pricedata.hotels.find(
              (price: any) => price.id === hotel.id
            );
            return {
              ...hotel,
              price: priceinfo?.price,
              searchRank: priceinfo?.searchRank,
            };
          })
          .filter((hotel: any) => hotel.price !== undefined)
          .sort((a: any, b: any) => a.price - b.price)
      : [];

  const isloading =
    priceloading || hotelloading || pricedata?.completed !== true;

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">
        Search Results for {destinationId}
      </h1>

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
          <div className="hotel alert-error">
            <span>
              Error loading hotel data:
              {hotelerror.message}
            </span>
          </div>
        )}

        {priceerror && (
          <div className="price alert-error">
            <span>
              Error loading price data:
              {priceerror.message}
            </span>
          </div>
        )}
      </div>

      {priceloading || hotelloading ? (
        <div className={priceloading && hotelloading ? "mt-16" : "mt-8"}>
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
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            {stichedata.completed && (
              <span className="text-lg text-base-content/70">
                Last updated: {new Date().toLocaleString()}
              </span>
            )}
          </div>
        </>
      )}

      <div className="p-4">
        {stichedata.length > 0 ? (
          stichedata.map((hotel: any) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              hotelprice={hotel.price}
              checkin={checkin}
              checkout={checkout}
              guests={guests}
            />
          ))
        ) : (
          <p>No hotels found.</p>
        )}
      </div>

      <Link
        href="/hotels/detail/atH8?destination_id=WD0M&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
        className="btn btn-secondary mr-4"
      >
        View Hotel Details
      </Link>
      <Link href="/" className="btn btn-outline">
        Back to Home
      </Link>
    </>
  );
};
