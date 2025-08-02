import { NavBar } from '../components/layout/NavBar'
import DestinationSearch from '../components/ui/DestinationSearch'

export const HomePage = () => {
  return (
    <>
      <div>
        <img className="h-96 w-full object-cover" src="/travel.jpg" />
      </div>
      <NavBar pageTitle="Hotel Booking" />
      <div>
        <p className="mb-4">Welcome to our hotel booking platform!</p>
      </div>
      <DestinationSearch />
    </>
  )
}
