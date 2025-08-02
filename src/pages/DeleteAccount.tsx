import { useState, useEffect } from 'react'
// import useAuthStore from '../store'
import useAuthStore from '../stores/AuthStore'
import { useLocation } from 'wouter'
import { BACKEND_URL } from '../config/api'

interface DeleteAccountProps {
  open: boolean
  onClose: () => void
}

interface DeleteResponse {
  success: boolean
  message: string
}

function DeleteToast({ open, onClose }: DeleteAccountProps) {
  const [isActive, setIsActive] = useState(false)
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  // const { logout } = useAuthStore();
  const logout = useAuthStore(state => state.logout)
  const accessToken = useAuthStore(state => state.accessToken)
  // const curEmail = useAuthStore((state) => state.userdetails.email);
  const curEmail = useAuthStore(state => state.userDetails.email)
  const setToast = useAuthStore(state => state.setToast)
  const [msg, setMsg] = useState('')
  const [, nav] = useLocation()

  function closeClick() {
    setIsActive(false)
    onClose()
  }

  useEffect(() => {
    setIsActive(open)
  }, [open])

  async function DeleteUser(): Promise<void> {
    const pwd_del = document.getElementById('passwd_del') as HTMLInputElement
    // let token: string | null;
    if (isLoggedIn) {
      console.log('isloggedin', isLoggedIn)
      console.log('password: ', pwd_del.value)
      console.log('email: ', curEmail)
      // token = sessionStorage.getItem("accessToken");
      // if (token == null) {
      //   token = "";
      // }
      const res = await fetch(`${BACKEND_URL}/users/delete`, {
        method: 'POST',
        headers: {
          // Authorization: "Bearer " + token,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: curEmail,
          password: pwd_del.value,
        }),
      })

      const msg = (await res.json()) as DeleteResponse
      if (res.ok) {
        logout()
        // sessionStorage.setItem("toast", msg.message);
        setToast(msg.message)
        nav('/')
      }
      else {
        setMsg(msg.message || 'Account deletion failed.')
      }
    }
    else {
      setMsg('Please sign in first')
    }
  }

  return isActive
    ? (
      <>
        <div
          id="toast-interactive"
          className="mx-auto mt-8 w-full max-w-md p-4 text-gray-600 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-300"
          role="alert"
        >
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 text-red-500 bg-red-100 rounded-full dark:bg-red-700 dark:text-red-200">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
              </svg>
            </div>

            <div className="flex-1 space-y-2 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">
                Account Deletion
              </p>
              <p>This action cannot be undone.</p>
              <p>We will delete your name, email, and bookings permanently.</p>

              <div>
                <label htmlFor="passwd_del" className="font-medium text-white block mb-1">
                  Your Password
                </label>
                <input
                  type="password"
                  id="passwd_del"
                  name="passwd_del"
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded border text-sm bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-500"
                />
              </div>

              <button
                onClick={() => { void DeleteUser() }}
                className="w-full px-3 py-2 mt-3 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
              >
                Yes, delete my account
              </button>

              {msg && <p className="mt-2 text-xs text-red-400">{msg}</p>}
            </div>

            <button
              onClick={() => { void closeClick() }}
              className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 14 14"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>
      </>
    )
    : null
}

export default DeleteToast
