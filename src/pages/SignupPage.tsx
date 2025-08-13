import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { BACKEND_URL } from '../config/api'
import useToastStore from '../stores/ToastStore'
import { CreateUserRequest, AuthResponse } from '../types/user'
import { getErrorMessage } from '../utils/ZodErrorMsg'

export const Signup = () => {
  const [message, setMessage] = useState('')
  const [msgClass, setMsgClass] = useState('')
  const [showPass, setShowPass] = useState({
    passwd: false,
    conf_passwd: false,
  })
  const setToast = useToastStore(state => state.setToast)
  const [, nav] = useLocation()

  interface SignUpResponse {
    success: boolean
    data: {
      firstName: string
      email: string
      isAdmin: boolean
      token: string
    }
    message: string
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">Hotel Booking</h1>
      <p className="mb-4 text-2xl font-bold flex">Sign-up Form</p>
      <div className="grid gap-4 mb-6 md:grid-cols-2 w-full">
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First name</label>
            <input type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John" required />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name (Optional)</label>
            <input type="text" id="last_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Doe" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Salutation</label>
            <select
              id="salutation"
              className="w-full p-2.5 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
              <option>Miss</option>
              <option>Dr</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone number (Optional)</label>
            <input type="tel" id="phone" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="12345678" pattern="[0-9]{8}" />
          </div>
        </div>

        {/* Email input field */}
        <div className="col-span-2 block items-center gap-2">
          <p>Email:</p>
          <input
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="john@company.com"
            required
          />
        </div>

        {/* Password input field */}
        <div className="col-span-2 block items-center gap-2">
          <p>Password:</p>
          <input
            id="passwd"
            type={showPass.passwd ? 'text' : 'password'}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>

        {/* Show password checkbox */}
        <div className="col-span-2 flex items-center gap-2">
          <input
            id="showpasswd"
            type="checkbox"
            onClick={() => { void showPassword('passwd') }}
            className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
          />
          <label htmlFor="showpasswd" className="text-sm font-medium text-gray-900 dark:text-gray-300">
            Show Password
          </label>
        </div>

        {/* Confirm Password input field */}
        <div className="col-span-2 block items-center gap-2">
          <p>Confirm Password:</p>
          <input
            id="conf_passwd"
            type={showPass.conf_passwd ? 'text' : 'password'}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>

        {/* Show password checkbox */}
        <div className="col-span-2 flex items-center gap-2">
          <input
            id="showconfpasswd"
            type="checkbox"
            onClick={() => { void showPassword('conf_passwd') }}
            className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
          />
          <label htmlFor="showconfpasswd" className="text-sm font-medium text-gray-900 dark:text-gray-300">
            Show Password
          </label>
        </div>
      </div>
      <button
        id="signup"
        onClick={() => {
          void onSubmitClick()
        }}
        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
          Sign Up
        </span>
      </button>
      <Link
        href="/"
        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 "
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
          Back to Home
        </span>
      </Link>
      <p className={`${msgClass}`}>{message}</p>
    </>
  )

  async function submitNewUser(): Promise<void> {
    const inputs = {
      firstName: (document.getElementById('first_name') as HTMLInputElement).value.trim(),
      lastName: (document.getElementById('last_name') as HTMLInputElement).value.trim(),
      salutation: (document.getElementById('salutation') as HTMLSelectElement).value.trim(),
      phoneNumber: (document.getElementById('phone') as HTMLInputElement).value.trim(),
      email: (document.getElementById('email') as HTMLInputElement).value.trim(),
      password: (document.getElementById('passwd') as HTMLInputElement).value,
      confirmPassword: (document.getElementById('conf_passwd') as HTMLInputElement).value,
    }
    console.log(inputs)

    if (validateInput(inputs.firstName, inputs.email, inputs.password, inputs.confirmPassword)) {
      const reqbody: CreateUserRequest = {
        firstName: inputs.firstName,
        email: inputs.email,
        password: inputs.password,
      }
      if (inputs.lastName) reqbody.lastName = inputs.lastName
      if (inputs.salutation) reqbody.salutation = inputs.salutation
      if (inputs.phoneNumber) reqbody.phoneNumber = inputs.phoneNumber
      // Sign up API call
      const res = await fetch(`${BACKEND_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqbody),
      })
      const msg = (await res.json()) as AuthResponse
      console.log(msg)
      setMessage(msg.message)
      setMsgClass(msg.success ? 'text-green-800' : 'text-red-800')
      // Response successful && User successfully created
      if (res.ok && msg.success) {
        setToast(msg.message, 'success')
        nav('/login')
      }
      else {
        const errorMessage = getErrorMessage(msg)
        setMessage(errorMessage)
      }
      setMsgClass('text-red-800')
    }
  }
  async function onSubmitClick() {
    await submitNewUser()
  }

  function showPassword(field: 'passwd' | 'conf_passwd') {
    if (field === 'passwd') {
      setShowPass(prev => ({ ...prev, passwd: !prev.passwd }))
    }
    else {
      setShowPass(prev => ({ ...prev, conf_passwd: !prev.conf_passwd }))
    }
  }
  function validateInput(name: string, email: string, password: string, confirmPassword: string) {
    if (!name) {
      setMessage('First name is required')
      setMsgClass('text-red-800')
      return false
    }

    if (!email) {
      setMessage('Email is required')
      setMsgClass('text-red-800')
      return false
    }

    if (!password) {
      setMessage('Password is required')
      setMsgClass('text-red-800')
      return false
    }
    if (password !== confirmPassword) {
      setMsgClass('text-red-800')
      setMessage('Passwords do not match.')
      return false
    }
    return true
  }
}
