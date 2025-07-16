import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

export default useAuthStore
