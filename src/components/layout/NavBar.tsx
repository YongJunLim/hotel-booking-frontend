import { useEffect } from 'react'
import { useLocation, useSearch } from 'wouter'
import { MyAccountDropdown } from '../ui/MyAccount'
// import useAuthStore from '../../store'
import useAuthStore from '../../stores/AuthStore'

interface NavBarProps {
  pageTitle: string
}

const getToastStyles = (type: string) => {
  switch (type) {
    case 'error':
      return 'alert-error'
    case 'success':
      return 'alert-success'
    case 'info':
    default:
      return 'alert-info'
  }
}

export const NavBar = ({ pageTitle }: NavBarProps) => {
  const toastMsg = useAuthStore(state => state.toast)
  const toastType = useAuthStore(state => state.toastType)
  const setRedirectUrl = useAuthStore(state => state.setRedirectUrl)
  const [location] = useLocation()
  const search = useSearch()

  // Save current URL whenever user navigates
  useEffect(() => {
    if (location !== '/login' && location !== '/signup') {
      const currentUrl = location + (search ? `?${search}` : '')
      setRedirectUrl(currentUrl)
    }
  }, [location, search, setRedirectUrl])

  return (
    <div className="navbar p-0 bg-base-100">
      <div className="flex-1">
        <h1 className="text-4xl font-bold">{pageTitle}</h1>
      </div>
      <div className="flex-none">
        {toastMsg != ''
          ? (
            <div
              className={`fixed top-4 right-4 alert ${getToastStyles(toastType)} text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300`}
            >
              {toastMsg}
            </div>
          )
          : null}
        <MyAccountDropdown />
      </div>
    </div>
  )
}
