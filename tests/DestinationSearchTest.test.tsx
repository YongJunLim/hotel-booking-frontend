import DestinationSearch from "../src/components/ui/DestinationSearch";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { useFormStore, useCountryStore } from "../src/store";
import { act } from "react";

vi.mock("../src/store", () => ({
  useFormStore: vi.fn(),
  useCountryStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [null, mockNavigate],
}));

let mockStoreState: {
  range: {
    from: Date | undefined;
    to: Date | undefined;
  };
  Adult: number;
  Children: number;
  Room: number;
  setRange: (...args: any[]) => void;
  setAdult: (...args: any[]) => void;
  setChildren: (...args: any[]) => void;
  setRoom: (...args: any[]) => void;
} = {
  range:{
    from: new Date("Thu Aug 4 2025 00:00:00 GMT+0800 (Singapore Standard Time)"),
    to: new Date("Fri Aug 5 2025 00:00:00 GMT+0800 (Singapore Standard Time)"),
  },
  Adult: 1,
  Children: 1,
  Room: 2,
  setRange: vi.fn(),
  setAdult: vi.fn(),
  setChildren: vi.fn(),
  setRoom: vi.fn(),
}

let mockCountryStoreState = {
  country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
  setCountry: vi.fn(),
};

(useFormStore as any).mockImplementation((selector: any) => 
  typeof selector === 'function' ? selector(mockStoreState) : mockStoreState
);
(useCountryStore as any).mockImplementation((selector: any) => 
  typeof selector === 'function' ? selector(mockCountryStoreState) : mockCountryStoreState
);

describe("DestinationSearch Integration Test", () => {
  it('shows error when start date and end date are empty', async () => {
    mockStoreState = {
      range: { from: undefined, to: undefined },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
      setCountry: vi.fn(),
    };

    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).not.toBeInTheDocument();

  });

  it('shows error when only country is empty', async () => {
    mockStoreState = {
      range:{
        from: new Date("Thu Aug 4 2025 00:00:00 GMT+0800 (Singapore Standard Time)"),
        to: new Date("Fri Aug 5 2025 00:00:00 GMT+0800 (Singapore Standard Time)"),
      },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "", term: "", lat: 0, lng: 0 },
      setCountry: vi.fn(),
    };
    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).toBeInTheDocument();
  });

  it('shows error when only start date is not at least 3 days after today', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 2);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    mockStoreState = {
      range: { from: startDate, to: endDate },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
      setCountry: vi.fn(),
    };

    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).not.toBeInTheDocument();

  });

  it('shows error when only end date is not at least 1 day after start date', async () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    startDate.setDate(today.getDate() + 3);
    endDate.setDate(startDate.getDate());
    mockStoreState = {
      range: { from: startDate, to: endDate },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
      setCountry: vi.fn(),
    };

    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).not.toBeInTheDocument();

  });

  it('shows error when start date is not at least 3 days after today, end date is not at least 1 day after start date', async () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    startDate.setDate(today.getDate() + 2);
    endDate.setDate(startDate.getDate());
    mockStoreState = {
      range: { from: startDate, to: endDate },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
      setCountry: vi.fn(),
    };

    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).not.toBeInTheDocument();

  });

  it('shows error when both dates and country are empty', async () => {
    mockStoreState = {
      range: { from: undefined, to: undefined },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "", term: "", lat: 0, lng: 0 },
      setCountry: vi.fn(),
    };
    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).toBeInTheDocument();
  });

  it('shows error when start date is not at least 3 days after today and country is empty', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 2);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    mockStoreState = {
      range:{
        from: startDate,
        to: endDate,
      },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "", term: "", lat: 0, lng: 0 },
      setCountry: vi.fn(),
    };
    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).toBeInTheDocument();
  });

  it('shows error when end date is not at least 1 day after start date and country is empty', async () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    startDate.setDate(today.getDate() + 3);
    endDate.setDate(startDate.getDate());
    mockStoreState = {
      range:{
        from: startDate,
        to: endDate,
      },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "", term: "", lat: 0, lng: 0 },
      setCountry: vi.fn(),
    };
    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).toBeInTheDocument();
  });

  it('shows error when start date is not at least 3 days after today, end date is not at least 1 day after start date, and country is empty', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 2);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate());
    mockStoreState = {
      range:{
        from: startDate,
        to: endDate,
      },
      Adult: 1,
      Children: 1, 
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    }
    mockCountryStoreState = {
      country: { uid: "", term: "", lat: 0, lng: 0 },
      setCountry: vi.fn(),
    };
    render(<DestinationSearch />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).toBeInTheDocument();

    expect(await screen.findByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).toBeInTheDocument();
  });

  it('navigates to results page on valid submit', async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 3);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    mockStoreState = {
      range: {
        from: startDate,
        to: endDate,
      },
      Adult: 1,
      Children: 1,
      Room: 2,
      setRange: vi.fn(),
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    };
    mockCountryStoreState = {
      country: { uid: "A6Dz", term: "Rome, Italy", lat: 41.895466, lng: 12.482324 },
      setCountry: vi.fn(),
    };

    const start = startDate.toLocaleDateString('sv-SE');
    const end = endDate.toLocaleDateString('sv-SE');

    console.log('start:', start, 'end:', end);

    render(<DestinationSearch />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('search-button'));
    });
    console.log('mockNavigate calls:', mockNavigate.mock.calls);
    console.log(
      Array.from(document.querySelectorAll('.text-red-500')).map(e => e.textContent)
    );

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please select a start date and an end date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('start date must be at least 3 days from today.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('end date must be at least 1 day after the start date.')
    )).not.toBeInTheDocument();

    expect(screen.queryByText((content) =>
      content.toLowerCase().includes('please enter a destination.')
    )).not.toBeInTheDocument();

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(`/results/A6Dz?checkin=${start}&checkout=${end}&lang=en_US&currency=SGD&country_code=SG&guests=2|2`)
    );
  });
});