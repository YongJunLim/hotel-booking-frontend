import { Link } from 'wouter'
// import useAuthStore from '../store'
import { useState } from 'react'
import DropdownWithButtons from '../DropDown'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { MyAccountDropdown } from './MyAccount'
import type { Destination } from '../types/destination'
import { TypeaheadSearch } from '../components/ui/TypeaheadSearch'

function ReactDatePicker() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)
  }
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date)
  }
  const handleSubmit = () => {
    if (startDate && endDate) {
      alert(
        `Selected range: ${startDate.toDateString()} - ${endDate.toDateString()}`,
      )
    }
  }
  const isBothSelected = startDate !== null && endDate !== null
  return (
    <div className="flex gap-4">
      <div className="flex justify-center">
        <DatePicker
          placeholderText="Start Date"
          selected={startDate}
          onChange={handleStartDateChange}
          dateFormat="dd/MM/yyyy"
          className="text-center"
          startDate={startDate}
          endDate={endDate}
          selectsStart
          popperPlacement="bottom-start"
        />
      </div>
      <p> - </p>
      <div className="flex justify-center">
        <DatePicker
          placeholderText="End Date"
          selected={endDate}
          onChange={handleEndDateChange}
          dateFormat="dd/MM/yyyy"
          className="text-center"
          startDate={startDate}
          endDate={endDate}
          selectsEnd
          popperPlacement="bottom-start"
        />
      </div>

      <button onClick={handleSubmit} disabled={!isBothSelected}>
        Apply
      </button>
    </div>
  )
}

export const HomePage = () => {
  // const { logout } = useAuthStore()
  const handleDestinationSelect = (destination: Destination) => {
    console.log('Selected destination:', destination)
  }
  return (
    <>
      <div>
        <img className="h-96 w-full object-cover" src="/travel.jpg" />
      </div>
      {/* <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      > */}
      <div className="flex py-4 items-center justify-between gap-8">
        {/* <div style={{ display: "flex", alignItems: "center", gap: "8px" }}> */}
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold mb-4">Hotel Booking</h1>
        </div>
        <div className="flex items-center gap-2">
          <MyAccountDropdown />
        </div>
      </div>
      <div>
        <p className="mb-4">Welcome to our hotel booking platform!</p>
      </div>
      <div>
        <DropdownWithButtons></DropdownWithButtons>
      </div>
      <div className="flex gap-8 py-4 width-100vw">
        {/* <div style={{ width: "50vw" }}>
          <MyComboBox>
            {dest.map((dest) => (
              <MyItem key={dest.term} id={dest.term}>
                {dest.term}
              </MyItem>
            ))}
          </MyComboBox>
        </div> */}
        <TypeaheadSearch
          onSelect={handleDestinationSelect}
          placeholder="Search destinations..."
          className="w-96"
          limit={5}
          threshold={0.3}
        />
        <div>
          <div style={{ border: '1px solid #ccc' }} className="p-2 rounded">
            <ReactDatePicker></ReactDatePicker>
          </div>
        </div>
      </div>
      <div>
        {/* May be preferable to use wouter's navigate for the actual search component */}
        <Link
          href="/results/WD0M?checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2|2"
          className="btn btn-primary"
        >
          Search Hotels in WD0M
        </Link>
      </div>
    </>
  )
}
