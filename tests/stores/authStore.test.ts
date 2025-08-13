import { describe, expect, vi, beforeEach, afterEach } from 'vitest'
import useAuthStore from '../../src/stores/AuthStore'
import { renderHook, act } from '@testing-library/react'
import { userService } from '../../src/utils/userService'
import { UpdateUserRequest } from '../../src/types/user'
const mocktoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OTAyNTQ0OWM0Mjg4N2JkMDlkNjllNSIsImV4cCI6MTc1NDQ4Njk0M30.SsUFhg-PsRIScNP_4WAVofRjDzq12jzOteBwbr3aJpg'
// Mock the dependencies
vi.mock('../../src/utils/userService')

// Type the mocked functions
const mockedUserService = vi.mocked(userService)

describe('AuthStore Unit Test', () => {
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

  describe('login', () => {
    it('login should set auth details', () => {
      const { result } = renderHook(() => useAuthStore())
      const userDetail = { email: 'demo@test.com', firstName: 'demo', isAdmin: false }
      const token = 'my-token'
      act(() => {
        result.current.login(userDetail, token)
      })

      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.userDetails.email).toBe('demo@test.com')
      expect(result.current.userDetails.firstName).toBe('demo')
      expect(result.current.accessToken).toBe('my-token')
    })
  })

  describe('logout', () => {
    it('logout should clear', () => {
      const { result } = renderHook(() => useAuthStore())
      const userDetail = { email: 'demo@test.com', firstName: 'demo', isAdmin: false }
      const token = 'my-token'
      act(() => {
        result.current.login(userDetail, token)
      })

      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.userDetails.email).toBe('demo@test.com')
      expect(result.current.userDetails.firstName).toBe('demo')
      expect(result.current.accessToken).toBe('my-token')

      act(() => {
        result.current.logout()
      })

      expect(result.current.isLoggedIn).toBe(false)
      expect(result.current.userDetails.email).toBe('')
      expect(result.current.userDetails.firstName).toBe('')
      expect(result.current.accessToken).toBeNull()
    })
  })

  describe('Set Redirect URL', () => {
    it('setRedirectUrl should set Url', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setRedirectUrl('/users')
      })
      expect(result.current.redirectUrl).toBe('/users')
    })

    it('setRedirectUrl should be able to override previous Url', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setRedirectUrl('/signup')
      })

      expect(result.current.redirectUrl).toBe('/signup')

      act(() => {
        result.current.setRedirectUrl('/users')
      })
      expect(result.current.redirectUrl).toBe('/users')
    })
  })

  describe('clear Redirect URL', () => {
    it('clearRedirectUrl should clear Url', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.clearRedirectUrl()
      })
      expect(result.current.redirectUrl).toBeNull()
    })

    it('clearRedirectUrl should clear Url when previously set', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setRedirectUrl('/users')
      })

      expect(result.current.redirectUrl).toBe('/users')

      act(() => {
        result.current.clearRedirectUrl()
      })
      expect(result.current.redirectUrl).toBeNull()
    })
  })

  describe('checkAuthStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('checkAuthStatus if token and user details are not valid', () => {
      const { result } = renderHook(() => useAuthStore())
      vi.setSystemTime(new Date('2025-08-01T00:00:00Z'))
      // First set some values
      act(() => {
        result.current.login({ email: 'test@test.com', firstName: 'test', isAdmin: false }, 'invalid-token')
        result.current.setRedirectUrl('/protected')
      })

      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.redirectUrl).toBe('/protected')
      expect(result.current.userDetails.firstName).toBe('test')
      expect(result.current.userDetails.email).toBe('test@test.com')

      // Then check auth status
      act(() => {
        result.current.checkAuthStatus()
      })
      // Verify they were cleared
      expect(result.current.isLoggedIn).toBe(false)
      expect(result.current.userDetails.email).toBe('')
      expect(result.current.userDetails.firstName).toBe('')
      expect(result.current.accessToken).toBeNull()
      expect(result.current.redirectUrl).toBe('/protected')
      // Note: checkAuthStatus doesn't clear redirectUrl
    })

    it('checkAuthStatus if token and user details are valid', () => {
      const { result } = renderHook(() => useAuthStore())
      vi.setSystemTime(new Date('2025-08-01T00:00:00Z'))
      const userDetail = { email: 'demo1@test.com', firstName: 'demo1' }

      act(() => {
        result.current.isLoggedIn = true
        result.current.userDetails.email = userDetail.email
        result.current.userDetails.firstName = userDetail.firstName
        result.current.accessToken = mocktoken
        result.current.checkAuthStatus()
      })
      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.userDetails.email).toBe('demo1@test.com')
      expect(result.current.userDetails.firstName).toBe('demo1')
      expect(result.current.accessToken).toBe(mocktoken)
    })
  })

  describe('is token valid', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should fail when token is not valid', () => {
      const { result } = renderHook(() => useAuthStore())
      const token = 'my-token-is-fake'
      vi.setSystemTime(new Date('2025-08-01T00:00:00Z'))

      act(() => {
        result.current.accessToken = token
      })
      expect(result.current.isTokenValid()).toBe(false)
    })

    it('should pass when token is valid', () => {
      const { result } = renderHook(() => useAuthStore())
      vi.setSystemTime(new Date('2025-08-01T00:00:00Z'))

      act(() => {
        result.current.accessToken = mocktoken
      })
      expect(result.current.isTokenValid()).toBe(true)
    })

    it('should fail when token is expired', () => {
      const { result } = renderHook(() => useAuthStore())
      vi.setSystemTime(new Date('2026-08-01T00:00:00Z'))

      act(() => {
        result.current.accessToken = mocktoken
      })

      expect(result.current.isTokenValid()).toBe(false)
    })
  })
})

describe('AuthStore Integration Test', () => {
  const mockedDefaultProfile = {
    email: 'default@test.com',
    firstName: 'Default',
    isAdmin: false,
  }

  const mockedFullProfile = {
    email: 'demo1@test.com',
    firstName: 'demo1',
    lastName: 'UpdatedUser',
    phoneNumber: '12345678',
    isAdmin: false,
    salutation: 'Mr',
  }

  const editRequestBody: UpdateUserRequest = {
    firstName: 'UpdatedFirstName',
    lastName: 'UpdatedLastName',
    phoneNumber: '9876543210',
    password: '123456',
  }

  const updatedProfile = {
    ...mockedDefaultProfile,
    ...editRequestBody,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset AuthStore to a known state
    useAuthStore.setState({
      isLoggedIn: true,
      userDetails: mockedDefaultProfile,
      accessToken: mocktoken,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('get Profile', () => {
    it('should successfully retrieve and update user profile', async () => {
      // Arrange
      mockedUserService.getProfile.mockResolvedValueOnce({
        success: true,
        data: mockedFullProfile,
        message: 'Profile retrieved successfully',
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.userDetails).toEqual(mockedDefaultProfile)
      expect(result.current.userDetails.email).toBe('default@test.com')
      expect(result.current.userDetails.firstName).toBe('Default')
      expect(result.current.userDetails.lastName).toBeUndefined()
      expect(result.current.userDetails.isAdmin).toBe(false)
      expect(result.current.userDetails.salutation).toBeUndefined()
      expect(result.current.userDetails.phoneNumber).toBeUndefined()

      // Act
      let getProfileResult
      await act(async () => {
        getProfileResult = await result.current.getProfile()
      })

      // Assert
      expect(mockedUserService.getProfile).toHaveBeenCalledWith(mocktoken)
      expect(mockedUserService.getProfile).toHaveBeenCalledTimes(1)
      expect(result.current.userDetails).toEqual(mockedFullProfile)
      expect(result.current.userDetails.email).toBe('demo1@test.com')
      expect(result.current.userDetails.firstName).toBe('demo1')
      expect(result.current.userDetails.lastName).toBe('UpdatedUser')
      expect(result.current.userDetails.isAdmin).toBe(false)
      expect(result.current.userDetails.salutation).toBe('Mr')
      expect(result.current.userDetails.phoneNumber).toBe('12345678')
      expect(getProfileResult).toBe(true)
    })

    it('getProfile should be able to retrieve user details', async () => {
      useAuthStore.setState({
        isLoggedIn: true,
        userDetails: undefined,
        accessToken: mocktoken,
      })

      mockedUserService.getProfile.mockResolvedValueOnce({
        success: true,
        data: mockedDefaultProfile,
        message: 'successful',
      })

      const { result } = renderHook(() => useAuthStore())
      let getProfileResult
      await act(async () => {
        getProfileResult = await result.current.getProfile()
      })

      expect(result.current.userDetails).toEqual(mockedDefaultProfile)
      expect(result.current.userDetails.email).toBe('default@test.com')
      expect(result.current.userDetails.firstName).toBe('Default')
      expect(result.current.userDetails.isAdmin).toBe(false)
      expect(getProfileResult).toBe(true)
    })

    it('should not get updated profile if fails', async () => {
      useAuthStore.setState({
        isLoggedIn: true,
        userDetails: mockedDefaultProfile,
        accessToken: mocktoken,
      })

      mockedUserService.getProfile.mockResolvedValueOnce({
        success: false,
        data: mockedFullProfile,
        message: 'unsuccessful',
      })

      const { result } = renderHook(() => useAuthStore())

      let getProfileResult
      await act(async () => {
        getProfileResult = await result.current.getProfile()
      })

      expect(result.current.userDetails).toEqual(mockedDefaultProfile)
      expect(result.current.userDetails.email).toBe('default@test.com')
      expect(result.current.userDetails.firstName).toBe('Default')
      expect(result.current.userDetails.isAdmin).toBe(false)
      expect(getProfileResult).toBe(false)
    })
  })

  describe('Edit Profile', () => {
    it('should return API response without modifying state', async () => {
      // Arrange
      const successResponse = {
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
      }
      mockedUserService.editProfile.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useAuthStore())

      // Act
      let apiResponse
      await act(async () => {
        apiResponse = await result.current.editProfile(editRequestBody)
      })

      // Assert
      expect(mockedUserService.editProfile).toHaveBeenCalledWith(mocktoken, editRequestBody)
      expect(apiResponse).toEqual(successResponse)
      // State should NOT be updated by editProfile
      expect(result.current.userDetails).toEqual(mockedDefaultProfile)
    })

    it('should handle edit profile API failure', async () => {
      // Arrange
      const errorResponse = {
        success: false,
        message: 'Invalid password',
      }
      mockedUserService.editProfile.mockResolvedValueOnce(errorResponse)

      const { result } = renderHook(() => useAuthStore())

      // Act
      let apiResponse
      await act(async () => {
        apiResponse = await result.current.editProfile(editRequestBody)
      })

      // Assert
      expect(apiResponse).toEqual(errorResponse)
      expect(result.current.userDetails).toEqual(mockedDefaultProfile)
    })
  })

  describe('getProfile and editProfile Integration Flow', () => {
    it('should use getProfile to update state after successful edit', async () => {
    // Arrange
      const editResponse = {
        success: true,
        message: 'Profile updated',
      }
      const updatedProfileResponse = {
        success: true,
        data: { ...mockedFullProfile, firstName: 'EditedName' },
        message: 'Profile fetched',
      }

      mockedUserService.editProfile.mockResolvedValueOnce(editResponse)
      mockedUserService.getProfile.mockResolvedValueOnce(updatedProfileResponse)

      const { result } = renderHook(() => useAuthStore())

      // Act - Edit profile (returns response but doesn't update state)
      let editResult
      await act(async () => {
        editResult = await result.current.editProfile({
          firstName: 'EditedName',
          password: 'correctpassword',
        })
      })
      expect(editResult).toEqual(editResponse)
      expect(result.current.userDetails).toEqual(mockedDefaultProfile) // Not updated yet

      // Act - Get profile to update state
      await act(async () => {
        await result.current.getProfile()
      })

      // Assert
      expect(result.current.userDetails.firstName).toBe('EditedName')
    })

    it('should not update state if getProfile fails after edit', async () => {
    // Arrange
      const editResponse = {
        success: true,
        message: 'Profile updated',
      }
      const failedGetResponse = {
        success: false,
        message: 'Failed to fetch profile',
      }

      mockedUserService.editProfile.mockResolvedValueOnce(editResponse)
      mockedUserService.getProfile.mockResolvedValueOnce(failedGetResponse)

      const { result } = renderHook(() => useAuthStore())

      // Act - Edit profile
      await act(async () => {
        await result.current.editProfile(editRequestBody)
      })

      // Act - Get profile (fails)
      await act(async () => {
        await result.current.getProfile()
      })

      // Assert
      expect(result.current.userDetails).toEqual(mockedDefaultProfile) // Should remain unchanged
    })

    it('should handle getProfile success followed by editProfile failure', async () => {
      // Arrange
      mockedUserService.getProfile.mockResolvedValueOnce({
        success: true,
        data: mockedFullProfile,
        message: 'Profile fetched',
      })

      mockedUserService.editProfile.mockResolvedValueOnce({
        success: false,
        message: 'Validation error: Invalid password',
      })

      const { result } = renderHook(() => useAuthStore())

      // Act - Get profile first (success)
      await act(async () => {
        await result.current.getProfile()
      })

      const profileAfterGet = { ...result.current.userDetails }

      // Act - Edit profile (failure)
      await act(async () => {
        await result.current.editProfile({ phoneNumber: '87654321', password: 'incorrectpassword' })
      })

      // Assert
      expect(result.current.userDetails).toEqual(profileAfterGet) // Should remain unchanged after failed edit
    })
  })
})
