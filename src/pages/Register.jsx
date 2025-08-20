import React, { useState } from 'react'
import pictureBg from "../assets/download2.jpeg"
import { RiBriefcaseLine, RiCheckboxCircleLine, RiCircleLine, RiUserLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import countries from "../data/countries";

const Register = () => {
  const [step, setStep] = useState("select");
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,16}$)[A-Za-z\d!@#$%^&*]+$/;

    if (!passwordRegex.test(value)) {
      setPasswordError("Password must be 8-16 characters and include a number, lowercase, uppercase, and a special character.")
    } else if (confirmPassword && value !== setPassword) {
      setPasswordError("Passwords don't match. Please check.")
    } else {
      setPasswordError('')
    }
  }

  const handlePasswordConfrimChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)

    if (password && value !== password) {
      setConfirmPasswordError("Passwords don't match. Please check.")
    } else {
      setConfirmPasswordError('')
    }
  }

  const account = [
    {
      id: "personal",
      icon: <RiUserLine color='gray' className='text-5xl' />,
      header: "Personal",
      writeup: "Selling tickets as an individual? This is the account type for you",

    },
    {
      id: "organization",
      icon: <RiBriefcaseLine color='gray' className='text-5xl' />,
      header: "Organization",
      writeup: "Selling tickets as a registered business? This is the account type for you",
    },
  ]

  const handleContinue = () => {
    if (selected) {
      setStep("form"); // 👈 go to the right form
    }
  };

  return (
    <section className='relative w-full flex  justify-between h-screen '>
      <div className='flex flex-col flex-1  custom-scrollbar space-y-6 px-10 py-6 bg-[#eeeeee]'>
        <a className='text-black text-lg font-semibold '>Airways<span className='text-orange-500'>Events</span></a>
        {step === "select" &&
          (
            <>
              <div className='flex flex-col space-y-4'>
                <h1 className='font-bold md:text-5xl text-3xl'>Create an account</h1>
                <p className='md:text-lg text-sm'>it's free to create an account and get started with Airways!</p>
              </div>

              <div className='flex flex-col space-y-4 '>
                <h1 className='font-bold md:text-xl text-md'>Choose an account type</h1>
                <div className='flex lg:flex-row flex-col gap-10'>
                  {account.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelected(acc.id)}
                      className={`flex flex-col items-center space-y-6 py-6   w-[300px] h-[320px] rounded-lg border shadow-md cursor-pointer transition 
                  ${selected === acc.id ? "border-orange-500 bg-white" : "border-gray-200 "}`}
                    >
                      <div className='flex flex-col items-center justify-center space-y-6 px-2'>
                        {acc.icon}
                        <h1 className='text-2xl font-bold'>{acc.header}</h1>
                        <p className='text-center text-lg'>{acc.writeup}</p>
                      </div>

                      {/*Radio indicator */}
                      <div>
                        {selected === acc.id ? (
                          <RiCheckboxCircleLine className='text-2xl text-orange-500' />
                        ) : (
                          <RiCircleLine className='text-2xl text-gray-400' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex gap-4 mt-6'>
                  <button onClick={() => setSelected()} className='bg-orange-500/50  rounded-xl hover:scale-105 py-4 w-full text-white'>Cancel</button>
                  <button onClick={handleContinue} className={`rounded-xl hover:scale-105 py-4 w-full ${selected ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!selected}>Continue</button>
                </div>
              </div>
            </>
          )}

        {step === "form" && (<>
          <form className='flex flex-col space-y-4 mt-10'>
            <h1 className='font-bold text-3xl mb-4'>Tell us about yourself</h1>

            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              className='p-3 border rounded-lg'
              required
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              className='p-3 border rounded-lg'
              required
            />

            {/* Password */}
            <input onChange={handlePasswordChange}
              type="password"
              placeholder="Password"
              className='p-3 border rounded-lg'
              required
            />
            {passwordError && (<div className='h-5 md:h-10 text-white text-lg border border-2 bg-red-600 rounded-md border-red-500'>{passwordError}</div>)}

            {/* Confirm Password */}
            <input onChange={handlePasswordConfrimChange}
              type="password"
              placeholder="Confrim Password"
              className='p-3 border rounded-lg'
              required
            />
            {confirmPasswordError && (<div className='h-5 md:h-10 text-white text-lg border border-2 bg-red-600 rounded-md border-red-500'>{confirmPasswordError}</div>)}

            {/* Phone Number */}
            <input
              type="tel"
              placeholder="Phone Number"
              className='p-3 border rounded-lg'
            />

            {/* Country dropdown */}
            <select className='p-3 border rounded-lg' required>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Address */}
            <textarea
              placeholder="Address"
              className='p-3 border rounded-lg resize-none h-24'
            />

            {/* Organization-specific field */}
            {selected === "organization" && (
              <input
                type="text"
                placeholder="Organization Name"
                className='p-3 border rounded-lg'
                required
              />
            )}

            <button
              type="submit"
              className='bg-orange-500 text-white rounded-xl py-3 hover:scale-105'
            >
              Submit & Verify Email
            </button>
          </form>
          <button onClick={() => setStep("select")}
            className='w-full bg-orange-500 text-white rounded-xl py-3 hover:scale-105'
          >
            Go back 👈🏾
          </button>
        </>
        )}

      </div>

      {/* Right side - Background Image */}
      <div className='hidden md:block w-[40%] h-screen fixed right-0 top-0'>
        <img src={pictureBg} className='object-cover w-full h-full' />
      </div>
    </section>
  )
}

export default Register