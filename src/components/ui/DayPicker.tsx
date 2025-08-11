import { DayPicker } from 'react-day-picker'
import { useFormStore } from '../../stores/HotelSearch'
import { dateToLocal } from '../../utils/dateUtils'

export default function App() {
  const range = useFormStore(s => s.range)
  const setRange = useFormStore(s => s.setRange)
  return (
    <>
      <div className="relative">
        {/* <div className="relative py-2 rounded-lg border border-gray-300 w-[320px] min-w-[320px] flex flex-wrap justify-center items-center gap-12"> */}
        <div className="relative py-2 px-2 rounded-lg border border-gray-300 w-full max-w-[250px] flex flex-wrap justify-center items-center gap-6">
          <div className="flex justify-start">
            <button popoverTarget="rdp-popover" className="input input-border flex justify-center items-center" style={{ anchorName: '--rdp', height: '20px', width: '80px' } as React.CSSProperties} data-testid="start-date-button">
              {range?.from ? dateToLocal(range.from) : 'Start Date'}
            </button>
          </div>
          <div className="flex justify-center items-center">
            <p>
              -
            </p>
          </div>
          <div className="flex justify-end">
            <button popoverTarget="rdp-popover" className="input input-border flex justify-center items-center" style={{ anchorName: '--rdp1', height: '20px', width: '80px' } as React.CSSProperties} data-testid="end-date-button">
              {range?.to ? dateToLocal(range.to) : 'End Date'}
            </button>
          </div>
          <div popover="auto" id="rdp-popover" className="dropdown mt-2 z-50" style={{ positionAnchor: '--rdp', top: 'anchor(bottom)', left: 'anchor(left)', positionTry: 'flip-block, flip-inline' } as React.CSSProperties} role="calendar">
            <DayPicker className="react-day-picker" mode="range" required selected={range} onSelect={setRange} />
          </div>
        </div>
      </div>
    </>
  )
}
