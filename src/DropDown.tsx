import React, { useState } from 'react'

const incrementBy = (setFn: React.Dispatch<React.SetStateAction<number>>, amount: number) => {
  setFn((prev) => {
    if (prev < 10) {
      return prev + amount
    }
    else {
      return prev // no change
    }
  })
}

const decrementBy = (setFn: React.Dispatch<React.SetStateAction<number>>, amount: number) => {
  setFn((prev) => {
    if (prev > 0) {
      return prev - amount
    }
    else {
      return prev // no change
    }
  })
}

export default function DropdownWithButtons() {
  const [isOpen, setIsOpen] = useState(false)

  const [Adult, setAdult] = useState<number>(0)
  const [Child, setChild] = useState<number>(0)
  const [Room, setRoom] = useState<number>(0)

  const sum = Adult + Child

  function CheckAdultAndChildren() {
    let str: string
    if (sum > 1) {
      str = 'Guests'
    }
    else {
      str = 'Guest'
    }
    return str
  };

  function CheckRoom() {
    let str: string
    if (Room > 1) {
      str = 'Rooms'
    }
    else {
      str = 'Room'
    }
    return str
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {sum}
        {' '}
        <CheckAdultAndChildren></CheckAdultAndChildren>
        {' '}
        |
        {' '}
        {Room}
        {' '}
        <CheckRoom></CheckRoom>
        {' '}
        ▼
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: 150,
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p>Adults</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{ display: 'block', width: '100%', padding: '8px' }}
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
                style={{ display: 'block', width: '100%', padding: '8px' }}
                onClick={() => {
                  incrementBy(setAdult, 1)
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p>Children</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                style={{ display: 'block', width: '100%', padding: '8px' }}
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
                style={{ display: 'block', width: '100%', padding: '8px' }}
                onClick={() => {
                  incrementBy(setChild, 1)
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p>Rooms</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                style={{ display: 'block', width: '100%', padding: '8px' }}
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
                style={{ display: 'block', width: '100%', padding: '8px' }}
                onClick={() => {
                  incrementBy(setRoom, 1)
                }}
              >
                +
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
