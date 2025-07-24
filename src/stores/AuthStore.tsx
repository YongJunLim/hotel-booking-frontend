import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { type UserDetails } from '../types/user'

interface AuthStore {
  isLoggedIn: boolean
  userDetails: UserDetails
  toast: string
  accessToken: string | null
  login: (userDetails: UserDetails, token: string) => void
  logout: () => void
  clearToast: () => void
  setToast: (toastMsg: string) => void
  checkAuthStatus: () => void
  isTokenValid: () => boolean
}

interface JWTPayload {
  exp: number
  [key: string]: unknown
}

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        isLoggedIn: false,
        userDetails: {
          email: '',
          firstName: '',
        },
        toast: '',
        accessToken: null,

        login: (userDetails: UserDetails, token: string) => {
          // sessionStorage.setItem("accessToken", token);
          // sessionStorage.setItem("userDetails", JSON.stringify(userDetails));
          set({
            isLoggedIn: true,
            userDetails,
            accessToken: token,
          })
        },

        logout: () => {
          // Clear all auth data
          // sessionStorage.removeItem("accessToken");
          // sessionStorage.removeItem("userDetails");
          // sessionStorage.removeItem("toast");

          set({
            isLoggedIn: false,
            userDetails: { email: '', firstName: '' },
            accessToken: null,
            toast: 'You have been signed out.',
          })

          // Auto-clear logout toast
          setTimeout(() => get().clearToast(), 3000)
        },

        clearToast: () => {
          set({ toast: '' })
        },

        setToast: (toastMsg: string) => {
          set({ toast: toastMsg })

          setTimeout(() => get().clearToast(), 3000)
        },

        checkAuthStatus: () => {
          const token = get().accessToken
          const userDetails = get().userDetails

          if (token && userDetails && get().isTokenValid()) {
            try {
              // const userDetails = JSON.parse(userDetailsStr) as UserDetails;
              set({
                isLoggedIn: true,
                userDetails,
                accessToken: token,
              })
            }
            catch (error) {
              console.error('Failed to parse user details:', error)
              get().logout()
            }
          }
          else {
            get().logout()
          }
        },

        isTokenValid: () => {
          const token = get().accessToken
          if (!token) return false

          try {
            // JWT expiry check (no signature verification)
            const parts = token.split('.')
            if (parts.length !== 3) {
              console.error('Invalid JWT format')
              return false
            }
            const payload = JSON.parse(atob(parts[1])) as JWTPayload
            const currentTime = Date.now() / 1000
            if (typeof payload.exp !== 'number') {
              console.error('Invalid token: missing or invalid exp claim')
              return false
            }

            return payload.exp > currentTime
          }
          catch (error) {
            console.error('Invalid token format:', error)
            return false
          }
        },
      }),
      // {
      //   name: "userLoginStatus",
      //   storage: createJSONStorage(() => sessionStorage),
      // },
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist essential data
        partialize: state => ({
          isLoggedIn: state.isLoggedIn,
          userDetails: state.userDetails,
          accessToken: state.accessToken,
        }),
      },
    ),
    {
      name: 'AuthStore', // Name that appears in Redux DevTools
      enabled: process.env.NODE_ENV === 'development', // Only enable in development
    },
  ),
)

export default useAuthStore
