const flyTo = vi.fn();
const mapRef = { current: { flyTo } };
vi.spyOn(require('react'), 'useRef').mockImplementation(() => mapRef);

import { MapSelect, handleMapClick, loadMarkerImage } from "../src/components/ui/MapSelect";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { StitchedHotel, HotelCategories, HotelAmenities, ImageDetails } from "../src/types/params";
import marker from "../src/assets/marker.png";

let lastOnMouseMove: any = null;
let lastOnClick: any = null;



vi.mock('react-map-gl/maplibre', () => ({
  Map: (props: any) => {
    if (props.ref) {
      props.ref.current = { flyTo };
    }
    lastOnMouseMove = props.onMouseMove;
    lastOnClick = props.onClick;
    return <div data-testid="map">{props.children}</div>;
  },
  Source: (props: any) => <div>{props.children}</div>,
  Layer: () => <div />,
  Popup: (props: any) => <div data-testid="popup">{props.children}</div>,
}));

const mockNavigate = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
}));

const mockHotelCategories: HotelCategories = ["Luxury", "Business"] as unknown as HotelCategories;
const mockHotelAmenities: HotelAmenities = {
  "Free WiFi": true,
  "Pool": true,
  "Spa": false
};
const mockImageDetails: ImageDetails = {
  suffix: "jpg",
  count: 1,
  prefix: "hotel-image"
};
const mockHotel: StitchedHotel = {
    id: "1",
    name: "Hotel California",
    latitude: 34.0522,
    longitude: -118.2437,
    address: "123 Main St, California",
    price: 200,
    rating: 4.5,
    categories: mockHotelCategories,
    amenities: mockHotelAmenities,
    image_details: mockImageDetails,
    description: "A lovely hotel in California."
};

describe("MapSelect", () => {
  it("renders correctly", () => {
    render(<MapSelect 
      hotels={[mockHotel]}
      destinationId="A6Dz"
      checkin="2025-10-01"
      checkout="2025-10-05"
      guests="2"
    />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
    afterEach(() => { vi.clearAllMocks(); });
  });

  it("calls setSelectedFeature with the correct hotel on map click", () => {
    const setSelectedFeature = vi.fn();
    handleMapClick(
        { features: [{ properties: mockHotel }] } as any,
        setSelectedFeature
    );
    expect(setSelectedFeature).toHaveBeenCalledWith(mockHotel);
    afterEach(() => { vi.clearAllMocks(); });
  });

  it("loads marker image", async () => {
    const map = { loadImage: vi.fn().mockResolvedValue({ data: marker }), hasImage: vi.fn(), addImage: vi.fn() };
    await loadMarkerImage(map as any);
    expect(map.loadImage).toHaveBeenCalledWith(expect.any(String));
    expect(map.hasImage).toHaveBeenCalledWith("marker");
    expect(map.addImage).toHaveBeenCalledWith("marker", marker);
    afterEach(() => { vi.clearAllMocks(); });
  });

  it("handles error loading marker image", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const map = { loadImage: vi.fn().mockRejectedValue(new Error("Load error")), hasImage: vi.fn(), addImage: vi.fn() };
    
    await loadMarkerImage(map as any);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading marker image:', expect.any(Error));
    consoleErrorSpy.mockRestore();
    afterEach(() => { vi.clearAllMocks(); });
  });

  it("shows popup on mouse move over a feature", async () => {
    render(
      <MapSelect
        hotels={[mockHotel]}
        destinationId="A6Dz"
        checkin="2025-10-01"
        checkout="2025-10-05"
        guests="2"
      />
    );

    const mapDiv = screen.getByTestId("map");

    await act(async () => {
      lastOnMouseMove &&
        lastOnMouseMove({
          features: [{
            properties: mockHotel
          }],
          lngLat: { lng: -118.2437, lat: 34.0522 }
        });
    });

    await waitFor(() => {
      expect(screen.getByTestId("popup")).toHaveTextContent("Hotel California");
      expect(screen.getByTestId("popup")).toHaveTextContent("123 Main St, California");
    });
    afterEach(() => { vi.clearAllMocks(); });
  });

  it("simulates click on map layer and triggers navigation", async () => {
    const destinationId = "A6Dz";
    const checkin = "2025-10-01";
    const checkout = "2025-10-05";
    const guests = "2";

    render(
      <MapSelect
        hotels={[mockHotel]}
        destinationId={destinationId}
        checkin={checkin}
        checkout={checkout}
        guests={guests}
      />
    );

    await act(async () => {
      lastOnClick &&
        lastOnClick({
          features: [{
            properties: mockHotel
          }]
        });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(`/hotels/detail/${mockHotel.id}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}`)
      );
    });
    afterEach(() => { vi.clearAllMocks(); });
  });

  it('calls flyTo on mapRef when hotels prop changes', async () => {
    
    const initialHotels = [{
      id: "1",
      name: "Hotel California",
      latitude: 34.0522,
      longitude: -118.2437,
      address: "123 Main St, California",
      price: 200,
      rating: 4.5,
      categories: mockHotelCategories,
      amenities: mockHotelAmenities,
      image_details: mockImageDetails,
      description: "A lovely hotel in California.",
      icon: "marker",
    }];

    const newHotels = [{
      id: "2",
      name: "Hotel New",
      latitude: 40.7128,
      longitude: -74.0060,
      address: "456 New St, New York",
      price: 300,
      rating: 5.0,
      categories: mockHotelCategories,
      amenities: mockHotelAmenities,
      image_details: mockImageDetails,
      description: "A brand new hotel in New York.",
      icon: "marker",
    }];

    const { rerender } = render(
      <MapSelect
        hotels={initialHotels}
        destinationId="A6Dz"
        checkin="2025-10-01"
        checkout="2025-10-05"
        guests="2"
      />
    );
    
    act(() => {
      rerender(
        <MapSelect
          hotels={newHotels}
          destinationId="A6Dz"
          checkin="2025-10-01"
          checkout="2025-10-05"
          guests="2"
        />
      );
    });

    console.log("flyto:", flyTo.mock.calls);

    await waitFor(() => {
      expect(flyTo).toHaveBeenCalledWith({
        center: [newHotels[0].longitude, newHotels[0].latitude],
        zoom: 11,
        speed: 1.0,
      });
    });
    afterEach(() => { vi.clearAllMocks(); });
  });
});