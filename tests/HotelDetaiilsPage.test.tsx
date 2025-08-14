/* eslint-disable */
import { describe, it, expect, vi, Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { HotelDetailPage } from "../src/pages/HotelDetailPage";
import useAuthStore from "../src/stores/AuthStore";
import useRoomBookingStore from "../src/stores/RoomBookingStore";
import UseSWR from "swr";
import userEvent from "@testing-library/user-event";

const mockRooms = [
  {
    key: "room1",
    type: "Deluxe",
    roomNormalizedDescription: "Deluxe Room",
    free_cancellation: true,
    description: "desc",
    long_description: "long desc",
    images: [],
    amenities: [],
    price: 100,
    market_rates: [],
    roomAdditionalInfo: {
      breakfastInfo: "Breakfast included",
      displayFields: {
        special_check_in_instructions: "",
        check_in_instructions: "",
        know_before_you_go: "",
        fees_optional: "",
        fees_mandatory: null,
        kaligo_service_fee: 0,
        hotel_fees: [],
        surcharges: [],
      },
    },
    breakfast_display: "hotel_detail_breakfast_included",
  },
  {
    key: "room2",
    type: "Deluxe",
    roomNormalizedDescription: "Deluxe Room",
    free_cancellation: false,
    description: "desc2",
    long_description: "long desc2",
    images: [],
    amenities: [],
    price: 120,
    market_rates: [],
    roomAdditionalInfo: {
      breakfastInfo: "hotel_detail_room_only",
      displayFields: {
        special_check_in_instructions: "",
        check_in_instructions: "",
        know_before_you_go: "",
        fees_optional: "",
        fees_mandatory: null,
        kaligo_service_fee: 0,
        hotel_fees: [],
        surcharges: [],
      },
    },
    breakfast_display: "hotel_detail_room_only",
  },
];

vi.mock("swr", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock SWR
const mockedUseSWR = UseSWR as Mock;

// Mock useSearchParams to control query params
vi.mock("../../hooks/useSearchParams", () => ({
  useSearchParams: () => ({
    destination_id: "dest1",
    checkin: "2024-06-01",
    checkout: "2024-06-02",
    lang: "en_US",
    currency: "SGD",
    country_code: "SG",
    guests: "2|2",
  }),
}));

describe("HotelDetailPage", () => {
  describe("Loading", () => {
    it("shows skeleton loader and continues polling every 5000ms when loading", () => {
      // Simulate SWR loading state (data not ready, isLoading true)
      mockedUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
      });

      render(<HotelDetailPage />);

      // Skeleton loader should be present
      expect(document.querySelector(".skeleton")).toBeTruthy();
      const config = mockedUseSWR.mock.calls[0][2];
      expect(config.refreshInterval!({ completed: false })).toBe(5000);
      expect(config.refreshInterval!({ completed: true })).toBe(0);
    });
  });
  describe("API failure", () => {
    it("shows error if rooms field is empty after API returns and stops polling", () => {
      mockedUseSWR.mockReturnValue({
        data: { completed: true, rooms: [] },
        error: undefined,
        isLoading: false,
      });

      render(<HotelDetailPage />);

      // Should show "No available rooms were found."
      expect(
        screen.getByText(/No available rooms were found/i),
      ).toBeInTheDocument();
      // Polling should stop
      const config = mockedUseSWR.mock.calls[0][2];
      expect(config.refreshInterval!({ completed: true })).toBe(0);
    });

    it("shows error message if API fails (500) and stops polling", () => {
      mockedUseSWR.mockReturnValue({
        data: undefined,
        error: { message: "Internal Server Error" },
        isLoading: false,
      });

      render(<HotelDetailPage />);

      // Should show error message
      expect(screen.getByText(/Error loading price data/i)).toBeInTheDocument();
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
      // Polling should stop
      const config = mockedUseSWR.mock.calls[0][2];
      expect(config.refreshInterval!({ completed: true })).toBe(0);
    });
  });
  describe("Successful Room Display", () => {
    it("groups and displays rooms, shows details and Add Room button, stops polling", () => {
      mockedUseSWR.mockReturnValue({
        data: { completed: true, rooms: mockRooms },
        error: undefined,
        isLoading: false,
      });

      render(<HotelDetailPage />);

      // Rooms grouped by type, so "Deluxe Room" header should appear once
      expect(screen.getByText(/Deluxe Room/)).toBeInTheDocument();

      // Each room's details should be present
      expect(screen.getByText(/Breakfast included/)).toBeInTheDocument();
      expect(screen.getByText(/Room Only/)).toBeInTheDocument();

      // Each room should have an Add Room button
      const addButtons = screen.getAllByRole("button", { name: /Add Room/i });
      expect(addButtons.length).toBe(2);

      // Polling should stop
      expect(
        mockedUseSWR.mock.calls[0][2].refreshInterval({ completed: true }),
      ).toBe(0);
    });
  });
  describe("Room Selection", () => {
    it("disables room selection if user is not logged in", () => {
      mockedUseSWR.mockReturnValue({
        data: { completed: true, rooms: mockRooms },
        error: undefined,
        isLoading: false,
      });

      // By default, zustand mock store returns isLoggedIn: false

      render(<HotelDetailPage />);

      // The Add Room button should be disabled
      const addBtns = screen.getAllByRole("button", { name: /Add Room/i });
      addBtns.forEach((btn) => {
        expect(btn).toBeDisabled();
        expect(btn).toHaveClass("btn", "btn-primary", "btn-disabled");
      });
    });
    it('shows "Remove" button after selecting a room when logged in', async () => {
      mockedUseSWR.mockReturnValue({
        data: { completed: true, rooms: mockRooms },
        error: undefined,
        isLoading: false,
      });

      // Set isLoggedIn to true in zustand store
      act(() => {
        useAuthStore.setState({ isLoggedIn: true });
        useRoomBookingStore.setState({ selectedRooms: [] });
      });

      render(<HotelDetailPage />);

      // Click the first "Add Room" button
      const addBtns = screen.getAllByRole("button", { name: /Add Room/i });
      await userEvent.click(addBtns[0]);

      // Now, the button should say "Remove"
      expect(
        screen.getByRole("button", { name: /Remove/i }),
      ).toBeInTheDocument();
    });
    it("disables further room selection after reaching the max rooms limit", () => {
      // guests: '2|2' means maxRooms = 2
      mockedUseSWR.mockReturnValue({
        data: { completed: true, rooms: mockRooms },
        error: undefined,
        isLoading: false,
      });

      act(() => {
        useAuthStore.setState({ isLoggedIn: true });
        // selectedRooms.length === maxRooms (2)
        useRoomBookingStore.setState({
          selectedRooms: [mockRooms[0], mockRooms[1]],
        });
      });

      render(<HotelDetailPage />);

      const addBtns = screen.getAllByRole("button", { name: /Add Another/i });
      addBtns.forEach((btn) => {
        expect(btn).toBeDisabled();
        expect(btn).toHaveClass("btn", "btn-primary", "btn-disabled");
      });
    });
  });
});
