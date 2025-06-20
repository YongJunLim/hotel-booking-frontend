import { create } from 'zustand';
import { persist,createJSONStorage } from 'zustand/middleware';

interface AuthStore {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}
const useAuthStore = create(
    persist<AuthStore>(
        (set) => ({
            isLoggedIn: false,
            login: () => {
                const usersessionStorage = sessionStorage.getItem('accessToken');
                if (usersessionStorage) {
                    set({ isLoggedIn: true });
                }
            },
            logout: () => {
                set({ isLoggedIn: false });
                sessionStorage.clear();
            },
        }),
        {
            name: 'userLoginStatus',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);


export default useAuthStore;