import ky from 'ky'
import type { ApiErrorResponse } from '../types/api'

const api = ky.create({
  timeout: 10000,
  hooks: {
    beforeError: [
      async (error) => {
        try {
          const errorData: ApiErrorResponse = await error.response?.json()
          // Check if it is Zod error response
          if (errorData && 'success' in errorData && !errorData.success) {
            error.message = errorData.message
          }
          return error
        }
        catch {
          // If cannot parse the error response, return the original error
          return error
        }
      },
    ],
  },
})

export const fetcher = <T>(url: string): Promise<T> => api.get(url).json<T>()
