export interface UserDetails {
  email: string
  firstName: string
}

export interface UserDetailswithAdmin {
  email: string
  firstName: string
  isAdmin: boolean
  lastName?: string
  salutation?: string
  phoneNumber?: string
}

export interface CreateUserRequestBody {
  firstName: string
  email: string
  password: string
  lastName?: string
  salutation?: string
  phoneNumber?: string
}

export interface EditUserRequestBody {
  firstName?: string
  email?: string
  password: string
  lastName?: string
  salutation?: string
  phoneNumber?: string
}

export interface GetUserResponse {
  success: boolean
  data?: {
    firstName: string
    email: string
    isAdmin: boolean
    lastName?: string
    salutation?: string
    phoneNumber?: string
  }
  error?: { message?: string }
  message: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    firstName: string
    email: string
    isAdmin: boolean
    token: string
  }
  error?: { message?: string }
  message: string
}
