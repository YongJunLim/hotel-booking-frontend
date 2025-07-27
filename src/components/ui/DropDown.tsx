import { useFormStore } from '../../store'

export const incrementBy = (
  setFn: (val: number | ((prev: number) => number)) => void,
  amount: number,
) => {
  setFn((prev) => {
    if (prev + amount <= 5) {
      return prev + amount
    }
    else {
      return prev
    }
  })
}

export const decrementBy = (
  setFn: (val: number | ((prev: number) => number)) => void,
  amount: number,
) => {
  setFn((prev) => {
    if (prev - amount >= 0) {
      return prev - amount
    }
    else {
      return prev
    }
  })
}

export function CheckAdultAndChildren(sum: number) {
  let str: string
  if (sum > 1) {
    str = 'Guests'
  }
  else {
    str = 'Guest'
  }
  return str
}

export function CheckRoom(Room: number) {
  let str: string
  if (Room > 1) {
    str = 'Rooms'
  }
  else {
    str = 'Room'
  }
  return str
}

export default function DropdownWithButtons() {
  const Adult = useFormStore(s => s.Adult)
  const Child = useFormStore(s => s.Children)
  const Room = useFormStore(s => s.Room)
  const setAdult = useFormStore(s => s.setAdult)
  const setChild = useFormStore(s => s.setChildren)
  const setRoom = useFormStore(s => s.setRoom)

  const sum = Adult + Child
  const adultAndChildren = CheckAdultAndChildren(sum)
  const room = CheckRoom(Room)

  return (
    <div>
      <button
        popoverTarget="popover-1"
        style={{ anchorName: '--anchor-1' } as React.CSSProperties}
        className="relative border rounded-lg border-gray-300 flex min-w-48 h-fit items-center justify-center p-2 font-bold"
      >
        {sum}
        {' '}
        {adultAndChildren}
        {' '}
        |
        {' '}
        {Room}
        {' '}
        {room}
        {' '}
        ▼
      </button>

      <div
        popover="auto"
        id="popover-1"
        className="dropdown mt-2 z-50 bg-base-100 border w-45"
        style={{ positionAnchor: '--anchor-1' } as React.CSSProperties}
      >
        <div className="flex gap-5 items-center justify-between px-2">
          <div className="flex gap-2 items-center">
            <strong>Adults</strong>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="block w-full p-2"
              onClick={() => {
                decrementBy(setAdult, 1)
              }}
            >
              -
            </button>
            <p>
              {' '}
              {Adult}
            </p>
            {' '}
            {}
            <button
              className="block w-full p-2"
              onClick={() => {
                incrementBy(setAdult, 1)
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-5 items-center justify-between px-2">
          <div className="flex gap-2 items-center">
            <strong>Children</strong>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              className="block w-full p-2"
              onClick={() => {
                decrementBy(setChild, 1)
              }}
            >
              -
            </button>
            <p>
              {' '}
              {Child}
            </p>
            {' '}
            {}
            <button
              className="block w-full p-2"
              onClick={() => {
                incrementBy(setChild, 1)
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-5 items-center justify-between px-2">
          <div className="flex gap-2 items-center">
            <strong>Rooms</strong>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              className="block w-full p-2"
              onClick={() => {
                decrementBy(setRoom, 1)
              }}
            >
              -
            </button>
            <p>
              {' '}
              {Room}
            </p>
            {' '}
            {}
            <button
              className="block w-full p-2"
              onClick={() => {
                incrementBy(setRoom, 1)
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
