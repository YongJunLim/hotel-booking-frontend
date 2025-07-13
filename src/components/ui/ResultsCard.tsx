import type { SearchParams, Hotel, HotelPrice } from "../../types/params";

interface Results {
  hotel: Hotel;
  hotelprice: HotelPrice;
  checkin?: string;
  checkout?: string;
  guests?: string;
}

export const HotelCard = ({
  hotel,
  hotelprice,
  checkin,
  checkout,
  guests,
}: Results) => {
  return (
    <div className="card card-side shadow-md mb-4 p-4 bg-white">
      <img
        src={`https://example.com/${hotel.image_details.prefix}1${hotel.image_details.suffix}`}
        alt={hotel.name}
        className="w-32 h-32 object-cover rounded"
      />
      <div className="ml-4">
        <h2 className="text-xl font-semibold">{hotel.name}</h2>
        <p>{hotel.address}</p>
        <p>{hotel.rating} stars</p>
        <p className="text-green-600 font-semibold">${hotelprice.price}</p>
        <button
          className="btn btn-primary mt-2"
          onClick={() => {
            window.location.href = `/hotel/${hotel.id}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
          }}
        >
          View Rooms
        </button>
      </div>
    </div>
  );
};
