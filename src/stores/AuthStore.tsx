import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { type UserDetails } from '../types/user'

interface AuthStore {
  isLoggedIn: boolean
  //userDetails: UserDetailswithAdmin
  userDetails: UserDetails
  toast: string
  toastType: 'success' | 'error' | 'info'
  accessToken: string | null
  redirectUrl: string | null
  //login: (userDetails: UserDetailswithAdmin, token: string) => void
  login: (userDetails: UserDetails, token: string) => void
  logout: () => void
  silentLogout: () => void
  clearToast: () => void
  setToast: (toastMsg: string, toasttype: 'success' | 'error' | 'info') => void
  checkAuthStatus: () => void
  isTokenValid: () => boolean
  setRedirectUrl: (url: string) => void
  clearRedirectUrl: () => void
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
        toastType: 'info',
        toast: '',
        accessToken: null,
        redirectUrl: '/',

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

          // no longer needed as always tracking redirectUrl regardless of login status
          // get().clearRedirectUrl()

          // Auto-clear logout toast
          setTimeout(() => get().clearToast(), 3000)
        },

        silentLogout: () => {
          // Clear auth data without showing toast
          set({
            isLoggedIn: false,
            userDetails: { email: '', firstName: '' },
            accessToken: null,
            toast: '', // Don't set a toast message
          })
        },

        clearToast: () => {
          set({ toast: '', toastType: 'info' })
        },

        setToast: (
          toastMsg: string,
          type: 'success' | 'error' | 'info' = 'info'
        ) => {
          set({ toast: toastMsg, toastType: type })
          setTimeout(() => get().clearToast(), 3000)
        },

        setRedirectUrl: (url: string) => {
          set({ redirectUrl: url })
        },

        clearRedirectUrl: () => {
          set({ redirectUrl: null })
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
              get().silentLogout()
            }
          }
          else {
            get().silentLogout()
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
          redirectUrl: state.redirectUrl,
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
