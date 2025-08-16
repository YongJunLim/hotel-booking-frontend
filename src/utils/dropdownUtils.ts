export const incrementBy = (setFn: (val: number | ((prev: number) => number)) => void, amount: number) => {
  if (typeof setFn !== 'function') {
    throw new Error('Input must be a function')
  }
  setFn((prev) => {
    if (prev + amount <= 4) {
      return prev + amount
    }
    else {
      return prev
    }
  })
}

export const decrementBy = (setFn: (val: number | ((prev: number) => number)) => void, amount: number, initial_amount: number) => {
  if (typeof setFn !== 'function') {
    throw new Error('Input must be a function')
  }
  setFn((prev) => {
    if (prev - amount >= initial_amount) {
      return prev - amount
    }
    else {
      return prev
    }
  })
}

export function CheckAdultAndChildren(sum: number) {
  if (typeof sum !== 'number' || sum <= 0) {
    throw new Error('Input must be a positive number')
  }
  let str: string
  if (sum > 1) {
    str = 'Guests per room'
  }
  else {
    str = 'Guest per room'
  }
  return str
}

export function CheckRoom(Room: number) {
  if (typeof Room !== 'number' || Room <= 0) {
    throw new Error('Input must be a positive number')
  }
  let str: string
  if (Room > 1) {
    str = 'Rooms'
  }
  else {
    str = 'Room'
  }
  return str
}
