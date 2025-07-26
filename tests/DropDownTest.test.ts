import { describe, it, vi, expect, test } from 'vitest'
import { incrementBy, decrementBy, CheckAdultAndChildren, CheckRoom} from '../src/components/ui/DropDown'
import { useState } from 'react';

export function createMockState<T>(initialValue: T) {
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

describe('incrementBy', () => {
  it('incrementBy should increase the value by the given amount', () => {
    const { setter, getValue } = createMockState(1);
    const incrementAmount = 2;
    const result = incrementBy(setter, incrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(3)
  });
});

describe('incrementBy', () => {
  it('incrementBy should not increase the value by the given amount if the result is more than 5', () => {
    const { setter, getValue } = createMockState(4);
    const incrementAmount = 2;
    const result = incrementBy(setter, incrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(4)
  });
});

describe('decrementBy', () => {
  it('decrementBy should decrease the value by the given amount', () => {
    const { setter, getValue } = createMockState(5);
    const decrementAmount = 2;
    const result = decrementBy(setter, decrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(3)
  });
});

describe('decrementBy', () => {
  it('decrementBy should not decrease the value by the given amount if the result is less than 0', () => {
    const { setter, getValue } = createMockState(5);
    const decrementAmount = 6;
    const result = decrementBy(setter, decrementAmount);
    expect(setter).toHaveBeenCalled();
    expect(getValue()).toBe(5)
  });
});

test('CheckAdultAndChildren should return Guests if input is more than 1', () => {
  const adults = 2;
  const children = 1;
  const result = CheckAdultAndChildren(adults + children);
  expect(result).toBe('Guests');
});

test('CheckAdultAndChildren should return Guest if input is less than equals to 1', () => {
  const adults = 0;
  const children = 1;
  const result = CheckAdultAndChildren(adults + children);
  expect(result).toBe('Guest');
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