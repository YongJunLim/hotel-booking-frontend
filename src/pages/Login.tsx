import { Link } from "wouter"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import useAuthStore from "../store"
import { useState } from "react"


export const Login = () => {
  const [message,setMessage] = useState("")
  const [msgClass,setMsgClass] = useState("")
  const {login} = useAuthStore()
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  return (
    <>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex">Hotel Booking</h1>
        </div>
      
      <p className="mb-4 text-2xl font-bold flex">Login Form</p>
      {/* May be preferable to use wouter's navigate for the actual search component */}
      <div className="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
        <p>Email:</p>
        <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="john@company.com" required />
        <p>Password:</p>
        <input id="passwd" type="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
      </div>
      <p className="mb-4 p-0.5 ">Dont have an Account? 
        <Link className="ml-2 font-medium text-blue-600 dark:text-blue-500 hover:underline" href="/signup">Sign up now.</Link>
        </p>
      <button id="login" onClick={onSubmitClick} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">            
        Login
        </span>
      </button>
      <button onClick={homeClick} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
      Back</span>
      </button>
      <p className={`${msgClass}`}>
        {message}
      </p>
    </>
  )

  //Login button
  async function loginUser(): Promise<void>{
    var email_inp = document.getElementById("email") as HTMLInputElement
    var passwd_inp = document.getElementById("passwd") as HTMLInputElement
    //Login API call
    const response = await fetch("http://localhost:9000/api/v1/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email_inp.value,
            password: passwd_inp.value
        })
    });
    const msg = await response.json()
    //Handle login
    if(msg.success){
      sessionStorage.setItem("accessToken", msg.data.token)
      login()
      // console.log(msg.data.token)
      // console.log("logged in?",isLoggedIn)
      setMsgClass("text-green-800") 
    }
    else{
      setMsgClass("text-red-800")
    }  
    setMessage(msg.message)
  }

  function onSubmitClick(){
    loginUser()
  }

  function homeClick(){
    window.location.href = "/"
  }
  

}