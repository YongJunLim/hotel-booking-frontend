// import useAuthStore from "../store";
import { NavBar } from '../components/layout/NavBar'
// import { MyAccountDropdown } from "../components/ui/MyAccount";
import DestinationSearch from '../components/ui/DestinationSearch'

export const HomePage = () => {
  // const toastmsg = useAuthStore(state => state.toast)
  // const { timeout } = useAuthStore()

  // useEffect(() => {
  //   if (toastmsg != '') {
  //     const timer = setTimeout(() => timeout(), 3000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [toastmsg, timeout])

  return (
    <>
      <div>
        <img className="h-96 w-full object-cover" src="/travel.jpg" />
      </div>
      {/* <div className="flex py-4 items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold mb-4">Hotel Booking</h1>
        </div> */}
      {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}> */}
      {/* <div className="flex items-center gap-2">
          {toastmsg != "" ? (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
              {toastmsg}
            </div>
          ) : null}
          <MyAccountDropdown />
        </div>
      </div> */}
      <NavBar pageTitle="Hotel Booking" />
      <div>
        <p className="mb-4">Welcome to our hotel booking platform!</p>
      </div>
      <DestinationSearch />
    </>
  )
}
