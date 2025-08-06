import { describe, expect, vi, beforeEach, afterEach } from 'vitest'
import useAuthStore from '../src/stores/AuthStore'
import { renderHook, act } from '@testing-library/react'

describe('AuthStore', () => {

    beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialise with default values', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.accessToken).toBeNull()
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.userDetails.email).toBe('')
    expect(result.current.userDetails.firstName).toBe('')
    expect(result.current.redirectUrl).toBe('/')

  })

  it('login should set auth details', () => {
    const { result } = renderHook(() => useAuthStore())
    const userDetail =  {email: 'demo@test.com', firstName: 'demo'}
    const token = "my-token"
    act(() => {
      result.current.login(userDetail, token)
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.userDetails.email).toBe('demo@test.com')
    expect(result.current.userDetails.firstName).toBe('demo')
    expect(result.current.accessToken).toBe("my-token")
  })

  it('logout should clear', () => {
    const { result } = renderHook(() => useAuthStore())
    const userDetail =  {email: 'demo@test.com', firstName: 'demo'}
    const token = "my-token"
    act(() => {
      result.current.login(userDetail, token)
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.userDetails.email).toBe('demo@test.com')
    expect(result.current.userDetails.firstName).toBe('demo')
    expect(result.current.accessToken).toBe("my-token")

    act(() => {
        result.current.logout()
    })

    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.userDetails.email).toBe('')
    expect(result.current.userDetails.firstName).toBe('')
    expect(result.current.accessToken).toBeNull()
  })

  it('setRedirectUrl should set Url', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setRedirectUrl('/users')
    })
    expect(result.current.redirectUrl).toBe('/users')
  })

  it('clearRedirectUrl should clear Url', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.clearRedirectUrl()
    })
    expect(result.current.redirectUrl).toBeNull()
  })

//   it('checkAuthStatus if token and user details are not valid', () => {
//     const { result } = renderHook(() => useAuthStore())
    
//     const userDetail =  {email: 'demo@test.com', firstName: 'demo'}
//     const token = "my-toke"

//     act(() => {
//         result.current.checkAuthStatus()
//     })
//     expect(result.current.isLoggedIn).toBe(false)
//     expect(result.current.userDetails.email).toBe("")
//     expect(result.current.userDetails.firstName).toBe("")
//     expect(result.current.accessToken).toBeNull()
//   })


    it('checkAuthStatus if token and user details are not valid', () => {
        const { result } = renderHook(() => useAuthStore())
        
        // First set some values
        act(() => {
            result.current.login({email: 'test@test.com', firstName: 'test'}, 'invalid-token')
            result.current.setRedirectUrl('/protected')
        })

        // Then check auth status
        act(() => {
            result.current.checkAuthStatus()
        })
            // Verify they were cleared
        expect(result.current.isLoggedIn).toBe(false)
        expect(result.current.userDetails.email).toBe("")
        expect(result.current.userDetails.firstName).toBe("")
        expect(result.current.accessToken).toBeNull()
        expect(result.current.redirectUrl).toBe('/protected')
        // Note: checkAuthStatus doesn't clear redirectUrl
    })

    it('checkAuthStatus if token and user details are valid', () => {
        const { result } = renderHook(() => useAuthStore())
        
        const userDetail =  {email: 'demo1@test.com', firstName: 'demo1'}
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg"

        act(() => {
            result.current.userDetails.email = userDetail.email
            result.current.userDetails.firstName = userDetail.firstName
            result.current.accessToken = token
            result.current.checkAuthStatus()
        })
        expect(result.current.isLoggedIn).toBe(true)
        expect(result.current.userDetails.email).toBe("demo1@test.com")
        expect(result.current.userDetails.firstName).toBe("demo1")
        expect(result.current.accessToken).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg")
    })

    it('should fail when token is not valid', () => {
        const { result } = renderHook(() => useAuthStore())
        const token = "my-token-is-fake"

        act(() => {
            result.current.accessToken = token
        })
        expect(result.current.isTokenValid()).toBe(false)
    })

    it('should pass when token is valid', () => {
        const { result } = renderHook(() => useAuthStore())
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg"

        act(() => {
            result.current.accessToken = token
        })
        expect(result.current.isTokenValid()).toBe(true)
    })

    it('should fail when token is expired', () => {
        const { result } = renderHook(() => useAuthStore())
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg"

        act(() => {
            result.current.accessToken = token
        })
        
        const mockDate = vi.spyOn(Date, 'now').mockImplementation(() => 
            new Date('2030-01-01').getTime()
        )
        expect(result.current.isTokenValid()).toBe(false)
        mockDate.mockRestore()
    })
    
    
})