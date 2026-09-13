import React, { useState } from 'react'
import {
  RiBriefcaseLine,
  RiCheckboxCircleLine,
  RiCircleLine,
  RiUserLine
} from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import countries from '../data/countries'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { SiEagle } from 'react-icons/si'
import Verify from './Verify'

const Register = ({ step, setStep }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const account = [
    {
      id: 'personal',
      icon: <RiUserLine className='text-5xl text-[var(--login-brand)]' />,
      header: 'User',
      writeup: 'Create an account for personal bookings, saved tickets, and event updates.'
    },
    {
      id: 'organization',
      icon: <RiBriefcaseLine className='text-5xl text-[var(--login-brand)]' />,
      header: 'Organization',
      writeup: 'Launch and manage events, ticket sales, and attendee access as a business.'
    }
  ]

  const handlePasswordChange = e => {
    const value = e.target.value
    setPassword(value)

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,?_-])[A-Za-z\d!@#$%^&*.,?_-]{8,24}$/

    if (!passwordRegex.test(value)) {
      setPasswordError(
        'Password must be 8-24 characters and include a number, lowercase, uppercase, and a special character.'
      )
    } else {
      setPasswordError('')
    }
  }

  const handlePasswordConfrimChange = e => {
    const value = e.target.value
    setConfirmPassword(value)

    if (password && value !== password) {
      setConfirmPasswordError("Passwords don't match. Please check.")
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleContinue = () => {
    if (selected) {
      setStep('form')
    }
  }

  const getErrorMessage = code => {
    switch (code) {
      case 'auth/invalid-email':
        return '⚠️ That email doesn’t look right. Please enter a valid one.'
      case 'auth/email-already-in-use':
        return '⚠️ This email is already registered. Try logging in instead.'
      case 'auth/weak-password':
        return '⚠️ Password should be at least 6 characters.'
      case 'auth/wrong-password':
        return '⚠️ Incorrect password.'
      case 'auth/user-not-found':
        return '⚠️ No account found with this email.'
      default:
        return '⚠️ Something went wrong. Please try again.'
    }
  }

  const handleSubmitForm = async e => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const formData = new FormData(e.target)
    const fullName = formData.get('fullName')
    const emailValue = formData.get('email')
    const passwordValue = formData.get('password')
    const address = formData.get('address')
    const country = formData.get('country')
    const phone = formData.get('phone')
    const orgName = formData.get('organization')

    setRegisterLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      )
      const user = userCredential.user

      setEmail(emailValue)

      await setDoc(doc(db, 'users', user.uid), {
        accountType: selected,
        fullName,
        email: emailValue,
        address,
        country,
        phone,
        orgName: selected === 'organization' ? orgName : null,
        followersCount: 0,
        following: [],
        verified: false,
        createdAt: new Date().toISOString()
      }).catch(error => {
        console.error('profile write failed:', error)
      })

      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: false
      }

      await sendEmailVerification(user, actionCodeSettings)
      setStep('verify')
    } catch (error) {
      setError(getErrorMessage(error.code))
    } finally {
      setRegisterLoading(false)
    }
  }

  const steps = ['select', 'form', 'verify']
  const currentStep = steps.indexOf(step)

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--login-page-bg)] px-4 py-10 text-[var(--login-text)]">
      <div className="auth-bg-grid absolute inset-0 opacity-60" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--login-panel-border)] bg-[var(--login-panel-bg)] shadow-[0_30px_80px_var(--login-panel-shadow)] backdrop-blur-xl">
        <div className="hidden items-center justify-center bg-[var(--login-side-bg)] p-8 lg:flex lg:w-[420px] lg:flex-col">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15  shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
            <SiEagle className="text-3xl" />
          </div>

          <div className="max-w-sm text-center ">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-[var(--login-side-caption)]">Create your access</p>
            <h2 className="text-4xl font-black leading-tight">
              Join <span className="text-[var(--login-brand-soft)]">Airticks</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--login-side-copy)]">
              Build your profile, organize events, and unlock a better ticketing experience.
            </p>
          </div>

          <div className="mt-10 w-full max-w-xs rounded-2xl border border-[var(--login-side-card-border)] bg-[var(--login-side-card)] p-4 text-left backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--login-side-caption)]">Quick stats</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--login-side-copy)]">Verified hosts</span>
                <span className="text-lg font-bold ">2.4k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--login-side-copy)]">Events live</span>
                <span className="text-lg font-bold ">860+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[var(--login-form-bg)] p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--login-brand)]">Setup portal</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--login-title)]">Create account</h1>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--login-brand-soft)] text-[var(--login-brand)] shadow-sm">
                <SiEagle className="text-xl" />
              </div>
            </div>

            <div className="mb-8 flex gap-2">
              {steps.map((s, idx) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${idx <= currentStep ? 'bg-[var(--login-brand)]' : 'bg-[var(--login-divider)]'}`}
                />
              ))}
            </div>

            {step === 'select' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--login-title)]">Choose account type</h2>
                  <p className="text-sm text-[var(--login-subtitle)]">
                    It’s free to create an account and get started with Airticks.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {account.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelected(acc.id)}
                      className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                        selected === acc.id
                          ? 'border-[var(--login-brand)]  shadow-[0_12px_30px_rgba(245,158,11,0.12)]'
                          : 'border-[var(--login-input-border)]  hover:border-[var(--login-brand)]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="mb-5">{acc.icon}</div>
                        {selected === acc.id ? (
                          <RiCheckboxCircleLine className="text-2xl text-[var(--login-brand)]" />
                        ) : (
                          <RiCircleLine className="text-2xl text-[var(--login-muted)]" />
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-[var(--login-title)]">{acc.header}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--login-subtitle)]">{acc.writeup}</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 font-semibold text-[var(--login-title)] transition hover:border-[var(--login-brand)] hover:text-[var(--login-brand)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selected}
                    className={`w-full rounded-2xl px-4 py-3.5 font-semibold  transition ${
                      selected
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] shadow-[0_18px_30px_rgba(245,158,11,0.35)]'
                        : 'cursor-not-allowed bg-[var(--login-divider)] text-[var(--login-muted)]'
                    }`}
                  >
                    Continue
                  </button>
                </div>

                <p className="pt-2 text-center text-sm text-[var(--login-subtitle)]">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('/Login')} className="font-semibold text-[var(--login-brand)] underline-offset-4 transition hover:text-[var(--primary-hover)]">
                    Login
                  </button>
                </p>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[var(--login-title)]">Tell us about yourself</h2>
                  <p className="text-sm text-[var(--login-subtitle)]">Fill in your details to create your Airticks profile.</p>
                </div>

                {error && (
                  <div className="rounded-xl border border-[var(--login-error-border)] bg-[var(--login-error-bg)] px-4 py-3 text-sm font-medium text-[var(--login-error-text)]">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Full name</span>
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Full Name"
                      className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]"
                      required
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Email address</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]"
                      required
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 transition focus-within:border-[var(--login-brand)] focus-within:shadow-[0_0_0_4px_var(--login-input-focus)]">
                      <input
                        onChange={handlePasswordChange}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        required
                        className="w-full border-0 bg-transparent py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--login-muted)] transition hover:bg-[var(--login-ghost-bg)] hover:text-[var(--login-text)]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </label>

                  {passwordError && (
                    <div className="md:col-span-2 rounded-xl border border-[var(--login-error-border)] bg-[var(--login-error-bg)] px-4 py-3 text-sm text-[var(--login-error-text)]">
                      {passwordError}
                    </div>
                  )}

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Confirm password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 transition focus-within:border-[var(--login-brand)] focus-within:shadow-[0_0_0_4px_var(--login-input-focus)]">
                      <input
                        onChange={handlePasswordConfrimChange}
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        className="w-full border-0 bg-transparent py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--login-muted)] transition hover:bg-[var(--login-ghost-bg)] hover:text-[var(--login-text)]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </label>

                  {confirmPasswordError && (
                    <div className="md:col-span-2 rounded-xl border border-[var(--login-error-border)] bg-[var(--login-error-bg)] px-4 py-3 text-sm text-[var(--login-error-text)]">
                      {confirmPasswordError}
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Country</span>
                    <select name="country" className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]" required>
                      <option value="">Select Country</option>
                      {countries.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Address</span>
                    <textarea
                      name="address"
                      placeholder="Address"
                      className="h-24 w-full resize-none rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]"
                    />
                  </label>

                  {selected === 'organization' && (
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Organization name</span>
                      <input
                        name="organization"
                        type="text"
                        placeholder="Organization Name"
                        className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none transition focus:border-[var(--login-brand)] focus:shadow-[0_0_0_4px_var(--login-input-focus)]"
                        required
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 font-semibold text-[var(--login-title)] transition hover:border-[var(--login-brand)] hover:text-[var(--login-brand)]"
                  >
                    Go back
                  </button>
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] px-4 py-3.5 font-semibold  shadow-[0_18px_30px_rgba(245,158,11,0.35)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_35px_rgba(245,158,11,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    {registerLoading ? (
                      <>
                        <span className="loading"></span>
                        <span>Creating account...</span>
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>

                <p className="pt-2 text-center text-sm text-[var(--login-subtitle)]">
                  Already created an account?{' '}
                  <button type="button" onClick={() => navigate('/Login')} className="font-semibold text-[var(--login-brand)] underline-offset-4 transition hover:text-[var(--primary-hover)]">
                    Login
                  </button>
                </p>
              </form>
            )}

            {step === 'verify' && <Verify email={email} step={step} setStep={setStep} />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Register
