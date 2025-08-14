import { NavBar } from '../components/layout/NavBar'
import DestinationSearch from '../components/ui/HotelSearch'
import { SustainabilityTips } from '../components/ui/SustainabilityTips'

export const HomePage = () => {
  return (
    <>
      <div>
        <img className="h-76 w-full object-cover" src="/travel.jpg" />
      </div>
      <p>
        Photo by
        {' '}
        <a href="https://unsplash.com/@lucabravo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Luca Bravo</a>
        {' '}
        on
        {' '}
        <a href="https://unsplash.com/photos/brown-wooden-boat-moving-towards-the-mountain-O453M2Liufs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      </p>
      <NavBar pageTitle="Hotel Booking" />
      <div>
        <p className="mb-4">Welcome to our hotel booking platform!</p>
      </div>
      <DestinationSearch />
      <div className="mt-4" data-testid="sustainability-tips">
        <SustainabilityTips />
      </div>
    </>
  )
}
