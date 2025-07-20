//import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { useRangeStore } from '../src/States';

export default function App() {
  const { range, setRange } = useRangeStore();
  return (
    <>
    <div className = "flex gap-10">
      <div className="flex-start">
        <button popoverTarget="rdp-popover" className="input input-border flex justify-center items-center" style={{ anchorName: "--rdp", height: '20px', width: '100px' } as React.CSSProperties}>
          {range?.from ? range.from.toLocaleDateString() : "Start Date"}
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p>
          -
        </p>
      </div>
      <div className="flex-end">
        <button popoverTarget="rdp-popover" className="input input-border flex justify-center items-center" style={{ anchorName: "--rdp1", height: '20px', width: '100px' } as React.CSSProperties}>
          {range?.to ? range.to.toLocaleDateString() : "End Date"}
        </button>
      </div>
        <div popover="auto" id="rdp-popover" className="dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
          <DayPicker className="react-day-picker" mode="range" required selected={range} onSelect={setRange} />
        </div>
    </div>
    </>
  );
}