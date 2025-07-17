import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthStore {
  isLoggedIn: boolean
  userdetails: {
    email: string
    firstName: string
  }
  toast: string
  login: () => void
  logout: () => void
  timeout: () => void
  setToast: (toastmsg: string) => void
}

interface userDetails {
  email: string
  firstName: string
}
const useAuthStore = create(
  persist<AuthStore>(
    set => ({
      isLoggedIn: false,
      email: '',
      toast: '',
      userdetails: {
        email: '',
        firstName: '',
      },
      login: () => {
        const usersessionStorage = sessionStorage.getItem('accessToken')
        const toaststorage = sessionStorage.getItem('toast')
        const stored = sessionStorage.getItem('details')
        const detailsStorage: userDetails | null = stored ? JSON.parse(stored) as userDetails : null
        if (usersessionStorage && toaststorage && detailsStorage) {
          set({ isLoggedIn: true })
          set({ userdetails: { email: detailsStorage.email, firstName: detailsStorage.firstName } })
          useAuthStore.getState().setToast(toaststorage)
        }
      },
      logout: () => {
        set({ isLoggedIn: false })
        set({ userdetails: { email: '', firstName: '' } })
        sessionStorage.clear()
        useAuthStore.getState().setToast('You have been signed out.')
      },
      timeout: () => {
        set({ toast: '' })
        sessionStorage.removeItem('toast')
      },
      setToast: (toastmsg: string) => {
        set({ toast: '' }) // force refresh
        setTimeout(() => {
          set({ toast: toastmsg })
          setTimeout(() => {
            set({ toast: '' }) // auto-clear after display
            sessionStorage.removeItem('toast')
          }, 2000)
        }, 10)
      },
    }),
    {
      name: 'userLoginStatus',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export default useAuthStore
