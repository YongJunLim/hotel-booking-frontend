import { Link, useLocation } from 'wouter'
import useAuthStore from '../stores/AuthStore'
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '../config/api'
import { getErrorMessage, type AuthResponse } from '../utils/ZodErrorMsg'

export const Login = () => {
  const [message, setMessage] = useState('')
  const [msgClass, setMsgClass] = useState('')
  const login = useAuthStore(state => state.login)
  const setToast = useAuthStore(state => state.setToast)
  const toast = useAuthStore(state => state.toast)
  const clearToast = useAuthStore(state => state.clearToast)
  const [, nav] = useLocation()


  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => clearToast(), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, clearToast])

  return (
    <>
      {toast !== '' ? (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
          {toast}
        </div>
      ) : null}
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex">Hotel Booking</h1>
      </div>

      <p className="mb-4 text-2xl font-bold flex">Login Form</p>
      <div className="grid gap-4 mb-6 md:grid-cols-2 w-1/2">
        {/* Email Input Field */}
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
        {/* Password Input Field */}
        <div className="col-span-2 block items-center gap-2">
          <p>Password:</p>
          <input
            id="passwd"
            type="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>

      </div>
      <p className="mb-4 p-0.5 ">
        Dont have an Account?
        <Link
          className="ml-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
          href="/signup"
        >
          Sign up now.
        </Link>
      </p>
      <button
        id="login"
        onClick={() => {
          void onSubmitClick()
        }}
        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
      >
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
          Login
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

  // Login button

  async function loginUser(): Promise<void> {
    const email_inp = document.getElementById('email') as HTMLInputElement
    const passwd_inp = document.getElementById('passwd') as HTMLInputElement

    // Login API call
    console.log('email,password', email_inp.value, passwd_inp.value)
    const response = await fetch(`${BACKEND_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email_inp.value,
        password: passwd_inp.value,
      }),
    })
    const msg = (await response.json()) as AuthResponse
    // Handle login
    const isSuccess = response.ok && msg.data?.token
    if (isSuccess) {
      login(
        {
          email: msg.data.email,
          firstName: msg.data.firstName,
        },
        msg.data.token,
      )
      setToast(msg.message)
      nav('/')
    }
    else {
      const zodmsg = getErrorMessage(msg)
      setMessage(zodmsg)
      setMsgClass('text-red-800')
    }
  }
  async function onSubmitClick(): Promise<void> {
    await loginUser()
  }
}
