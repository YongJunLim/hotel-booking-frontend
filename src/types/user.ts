// user details
export interface UserDetails {
  email: string
  firstName: string
  isAdmin: boolean
  lastName?: string
  salutation?: string
  phoneNumber?: string
}

// User creation requires password
export interface CreateUserRequest extends Omit<UserDetails, 'isAdmin'> {
  password: string
}

// User update allows partial fields but requires password
export interface UpdateUserRequest extends Partial<UserDetails> {
  password: string
}

export interface userResponse {
  success: boolean
  updatedUser?: UserDetails // temp for editProfile()
  data?: UserDetails
  error?: { message?: string }
  message: string
}
export interface AuthResponse {
  success: boolean
  data?: UserDetails & { token: string }
  error?: { message?: string }
  message: string
}
export interface DeleteResponse {
  success: boolean
  message: string
}
