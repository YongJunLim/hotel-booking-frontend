import { vi } from 'vitest'
import { StateCreator } from 'zustand'

export const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

export const mockPersistMethods = {
  clearStorage: vi.fn(),
  rehydrate: vi.fn(),
  hasHydrated: vi.fn(() => true),
  onHydrate: vi.fn(),
  onFinishHydration: vi.fn(),
}

vi.mock('zustand/middleware', () => {
  return {
    persist: vi.fn(
      <T>(
        config: StateCreator<T, [], [], T>,
        options: { name: string, [key: string]: unknown },
      ) =>
        (set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void, get: () => T, api: { setState: typeof set, getState: typeof get, destroy: () => void, getInitialState: () => T, subscribe: (listener: (state: T, prevState: T) => void) => () => void }) => {
          const originalSet = set
          const wrappedSet = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
            const result = originalSet(partial, replace)

            const state = get()
            const persistData = {
              state,
              version: 0,
            }
            mockStorage.setItem(options.name, JSON.stringify(persistData))

            return result
          }

          // Create a complete StoreApi object
          const completeApi = {
            setState: wrappedSet,
            getState: get,
            destroy: api.destroy,
            getInitialState: api.getInitialState,
            subscribe: api.subscribe,
          }

          return config(wrappedSet, get, completeApi)
        }),
    devtools: vi.fn(<T>(config: StateCreator<T, [], [], T>) => config),
    createJSONStorage: vi.fn(() => mockStorage),
  }
})
