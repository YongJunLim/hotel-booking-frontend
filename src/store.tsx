import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type Country, type CombinedStore} from './types/forms';

interface AuthStore {
  isLoggedIn: boolean
  email: string
  login: () => void
  logout: () => void
}
const useAuthStore = create(
  persist<AuthStore>(
    set => ({
      isLoggedIn: false,
      email: '',
      login: () => {
        const usersessionStorage = sessionStorage.getItem('accessToken')
        const useremail = sessionStorage.getItem('email')
        if (usersessionStorage && useremail) {
          set({ isLoggedIn: true })
          set({ email: useremail })
        }
      },
      logout: () => {
        set({ isLoggedIn: false })
        set({ email: '' })
        sessionStorage.clear()
      },
    }),
    {
      name: 'userLoginStatus',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export const useFormStore = create<CombinedStore>()((set) => ({
  range: { from: undefined },
  setRange: (range) => set({ range }),

  Adult: 0,
  setAdult: (val) =>
    set((state) => ({
      Adult: typeof val === "function" ? val(state.Adult) : val,
    })),

  Children: 0,
  setChildren: (val) =>
    set((state) => ({
      Children: typeof val === "function" ? val(state.Children) : val,
    })),

  Room: 0,
  setRoom: (val) =>
    set((state) => ({
      Room: typeof val === "function" ? val(state.Room) : val,
    })),
}));

interface CountryStore {
  country: Country;
  setCountry: (uid: string, term: string, lat: number, lng: number) => void;
}

export const useCountryStore = create<CountryStore>((set) => ({
  country: { uid: "", term: "", lat: 0, lng: 0 },
  setCountry: (uid : string, term: string, lat: number, lng: number) => set({ country: {uid, term, lat, lng} }),
}));

export default useAuthStore
