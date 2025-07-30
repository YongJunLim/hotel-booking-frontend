import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect, test, Mock } from 'vitest'
import { incrementBy, decrementBy, CheckAdultAndChildren, CheckRoom} from '../src/components/ui/DropDown'
import DropDownWithButtons from '../src/components/ui/DropDown';
import { useFormStore } from '../src/store';

function createMockState<T>(initialValue: T) {
  let value = initialValue;

  const setter = vi.fn((update: T | ((prev: T) => T)) => {
    value =
      typeof update === 'function'
        ? (update as (prev: T) => T)(value)
        : update;
  });

  const getValue = () => value;

  return { setter, getValue };
}

describe('incrementBy Unit Test', () => {
  it('incrementBy should increase the value by the given amount', () => {
    const { setter, getValue } = createMockState(1);
    const incrementAmount = 2;
    const result = incrementBy(setter, incrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(3)
  });
});

describe('incrementBy Unit Test', () => {
  it('incrementBy should not increase the value by the given amount if the result is more than 5', () => {
    const { setter, getValue } = createMockState(4);
    const incrementAmount = 2;
    const result = incrementBy(setter, incrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(4)
  });
});

describe('decrementBy Unit Test', () => {
  it('decrementBy should decrease the value by the given amount', () => {
    const { setter, getValue } = createMockState(5);
    const decrementAmount = 2;
    const result = decrementBy(setter, decrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(3)
  });
});

describe('decrementBy Unit Test', () => {
  it('decrementBy should not decrease the value by the given amount if the result is less than 0', () => {
    const { setter, getValue } = createMockState(5);
    const decrementAmount = 6;
    const result = decrementBy(setter, decrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(5)
  });
});

test('CheckAdultAndChildren should return Guests per room if input is more than 1', () => {
  const adults = 2;
  const children = 1;
  const result = CheckAdultAndChildren(adults + children);
  expect(result).toBe('Guests per room');
});

test('CheckAdultAndChildren should return Guest per room if input is less than equals to 1', () => {
  const adults = 0;
  const children = 1;
  const result = CheckAdultAndChildren(adults + children);
  expect(result).toBe('Guest per room');
});

test('CheckRoom should return Rooms if input is more than 1', () => {
  const rooms = 3;
  const result = CheckRoom(rooms);
  expect(result).toBe('Rooms');
});

test('CheckRoom should return Room if input is less than equals to 1', () => {
  const rooms = 0;
  const result = CheckRoom(rooms);
  expect(result).toBe('Room');
});

vi.mock('../src/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store')>();
  return {
    useFormStore: vi.fn(),
  };
});

describe("Integration Test for DropDownWithButtons", () => {
  let mockStoreState = {
    Adult: 1,
    Children: 0,
    Room: 1,
    setAdult: vi.fn(), // Vitest's mock function
    setChildren: vi.fn(),
    setRoom: vi.fn(),
  };
  beforeEach(() => {
    (useFormStore as any).mockImplementation((selector: any) => selector(mockStoreState));

    // Reset mock calls for the setters
    mockStoreState.setAdult.mockClear();
    mockStoreState.setChildren.mockClear();
    mockStoreState.setRoom.mockClear();

    // Reset mockStoreState to its initial values for each test
    mockStoreState = {
      Adult: 1,
      Children: 0,
      Room: 1,
      setAdult: vi.fn(),
      setChildren: vi.fn(),
      setRoom: vi.fn(),
    };
  });

  
  it('renders the main dropdown button with initial values', () => {
    render(<DropDownWithButtons />);

    const mainButton = screen.getByTestId('main-dropdown-button');
    expect(mainButton).toBeInTheDocument();
    expect(mainButton).toHaveTextContent('1 Guest per room | 1 Room ▼');
  });

  it('opens the popover when the main button is clicked', async () => {
    render(<DropDownWithButtons />);

    const mainButton = screen.getByTestId('main-dropdown-button');
    await fireEvent.click(mainButton); // Use await for user interactions if the DOM updates asynchronously

    // The popover HTML uses `popover="auto"` which automatically sets `role="dialog"` in some browsers.
    // If not, you might need to query by ID or another attribute.
    // `expect(popover).toBeVisible()` ensures it's shown.
    const popover = screen.getByRole('dropdown', { hidden: false });
    expect(popover).toBeVisible();
  });

  it('increments adult count when "+" button is clicked', async () => {
    render(<DropDownWithButtons />);

    // Open the popover first
    await fireEvent.click(screen.getByTestId('main-dropdown-button'));

    const incrementAdultsButton = screen.getByTestId('adult-increment-button');
    await fireEvent.click(incrementAdultsButton);

    // Verify that the setA function was called
    expect(mockStoreState.setAdult).toHaveBeenCalledTimes(1);
    // You can inspect the argument if setA takes a specific value:
    // For a setter that receives a function (like `set((prev) => prev + 1)`):
    const setterFn = mockStoreState.setAdult.mock.calls[0][0]; // Get the first argument of the first call
    // Manually call the setter function with the current state to simulate the update
    const newValue = setterFn(mockStoreState.Adult);
    expect(newValue).toBe(2); // Initial 'a' was 1, so 1 + 1 = 2
  });

  it('decrements adult count when "-" button is clicked (and does not go below zero)', async () => {
    // Set initial adult count to something that can be decremented
    mockStoreState.Adult = 1;
    render(<DropDownWithButtons />);

    await fireEvent.click(screen.getByTestId('main-dropdown-button'));

    const decrementAdultsButton = screen.getByTestId('adult-decrement-button');
    await fireEvent.click(decrementAdultsButton);

    expect(mockStoreState.setAdult).toHaveBeenCalledTimes(1);
    const setterFn = mockStoreState.setAdult.mock.calls[0][0];
    const newValue = setterFn(mockStoreState.Adult);
    expect(newValue).toBe(0); // 1 - 1 = 0

    // Test going below zero
    mockStoreState.Adult = 0; // Set a to 0 for the next click
    mockStoreState.setAdult.mockClear(); // Clear previous call
    await fireEvent.click(decrementAdultsButton);
    expect(mockStoreState.setAdult).toHaveBeenCalledTimes(1);
    const setterFn2 = mockStoreState.setAdult.mock.calls[0][0];
    const newValue2 = setterFn2(mockStoreState.Adult);
    expect(newValue2).toBe(0); // Should stay at 0 due to Math.max(0, ...)
  });

  // Add similar tests for Children and Rooms buttons
  it('increments children count when "+" button is clicked', async () => {
    render(<DropDownWithButtons />);
    await fireEvent.click(screen.getByTestId('main-dropdown-button')); // Open popover
    const incrementChildrenButton = screen.getByTestId('child-increment-button');
    await fireEvent.click(incrementChildrenButton);
    expect(mockStoreState.setChildren).toHaveBeenCalledTimes(1);
    const setterFn = mockStoreState.setChildren.mock.calls[0][0];
    const newValue = setterFn(mockStoreState.Children);
    expect(newValue).toBe(1); // Initial 'c' was 0, so 0 + 1 = 1
  });

  it('decrements children count when "-" button is clicked (and does not go below zero)', async () => {
    // Set initial adult count to something that can be decremented
    mockStoreState.Children = 1;
    render(<DropDownWithButtons />);

    await fireEvent.click(screen.getByTestId('main-dropdown-button'));

    const decrementChildrenButton = screen.getByTestId('child-decrement-button');
    await fireEvent.click(decrementChildrenButton);

    expect(mockStoreState.setChildren).toHaveBeenCalledTimes(1);
    const setterFn = mockStoreState.setChildren.mock.calls[0][0];
    const newValue = setterFn(mockStoreState.Children);
    expect(newValue).toBe(0); // 1 - 1 = 0

    // Test going below zero
    mockStoreState.Children = 0; // Set a to 0 for the next click
    mockStoreState.setChildren.mockClear(); // Clear previous call
    await fireEvent.click(decrementChildrenButton);
    expect(mockStoreState.setChildren).toHaveBeenCalledTimes(1);
    const setterFn2 = mockStoreState.setChildren.mock.calls[0][0];
    const newValue2 = setterFn2(mockStoreState.Children);
    expect(newValue2).toBe(0); // Should stay at 0 due to Math.max(0, ...)
  });

  it('increments rooms count when "+" button is clicked', async () => {
    render(<DropDownWithButtons />);
    await fireEvent.click(screen.getByTestId('main-dropdown-button'))
    const incrementRoomsButton = screen.getByTestId('room-increment-button');
    await fireEvent.click(incrementRoomsButton);
    expect(mockStoreState.setRoom).toHaveBeenCalledTimes(1);
    const setterFn = mockStoreState.setRoom.mock.calls[0][0];
    const newValue = setterFn(mockStoreState.Room);
    expect(newValue).toBe(2)
  });

  it('decrements room count when "-" button is clicked (and does not go below zero)', async () => {
    // Set initial room count to something that can be decremented
    mockStoreState.Room = 1;
    render(<DropDownWithButtons />);

    await fireEvent.click(screen.getByTestId('main-dropdown-button'));

    const decrementRoomsButton = screen.getByTestId('room-decrement-button');
    await fireEvent.click(decrementRoomsButton);

    expect(mockStoreState.setRoom).toHaveBeenCalledTimes(1);
    const setterFn = mockStoreState.setRoom.mock.calls[0][0];
    const newValue = setterFn(mockStoreState.Room);
    expect(newValue).toBe(0); // 1 - 1 = 0

    // Test going below zero
    mockStoreState.Room = 0; // Set a to 0 for the next click
    mockStoreState.setRoom.mockClear(); // Clear previous call
    await fireEvent.click(decrementRoomsButton);
    expect(mockStoreState.setRoom).toHaveBeenCalledTimes(1);
    const setterFn2 = mockStoreState.setRoom.mock.calls[0][0];
    const newValue2 = setterFn2(mockStoreState.Room);
    expect(newValue2).toBe(0); // Should stay at 0 due to Math.max(0, ...)
  });
});