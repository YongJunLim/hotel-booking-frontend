import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
import { type Country, type CombinedStore } from './types/forms'

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
        const detailsStorage: userDetails | null = stored
          ? (JSON.parse(stored) as userDetails)
          : null
        if (usersessionStorage && toaststorage && detailsStorage) {
          set({ isLoggedIn: true })
          set({
            userdetails: {
              email: detailsStorage.email,
              firstName: detailsStorage.firstName,
            },
          })
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

export const useFormStore = create<CombinedStore>()(
  devtools(
    persist(
      set => ({
        range: { from: undefined },
        setRange: range => set({ range }),

        Adult: 0,
        setAdult: val =>
          set(state => ({
            Adult: typeof val === 'function' ? val(state.Adult) : val,
          })),

        Children: 0,
        setChildren: val =>
          set(state => ({
            Children: typeof val === 'function' ? val(state.Children) : val,
          })),

        Room: 0,
        setRoom: val =>
          set(state => ({
            Room: typeof val === 'function' ? val(state.Room) : val,
          })),
      }),
      {
        name: 'form-storage',
        storage: createJSONStorage(() => sessionStorage),
        onRehydrateStorage: () => (state) => {
          if (state?.range) {
            // Convert string dates back to Date objects
            if (state.range.from && typeof state.range.from === 'string') {
              state.range.from = new Date(state.range.from)
            }
            if (state.range.to && typeof state.range.to === 'string') {
              state.range.to = new Date(state.range.to)
            }
          }
        },
      },
    ),
    {
      name: 'FormStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

interface CountryStore {
  country: Country
  setCountry: (uid: string, term: string, lat: number, lng: number) => void
}

export const useCountryStore = create<CountryStore>()(
  devtools(
    persist(
      set => ({
        country: { uid: '', term: '', lat: 0, lng: 0 },
        setCountry: (uid: string, term: string, lat: number, lng: number) =>
          set({ country: { uid, term, lat, lng } }),
      }),
      {
        name: 'country-storage',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: 'CountryStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

export default useAuthStore
