import React, { useEffect, useState } from 'react'
import pictureBg from "../assets/download2.jpeg"
import { RiBriefcaseLine, RiCheckboxCircleLine, RiCircleLine, RiUserLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import countries from "../data/countries";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut }
  from "firebase/auth";
import { auth, db } from '../firebase/firebase'; // make sure firebase.js is set up
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import Verify from './Verify';
import walkGif from "../assets/dog.gif"

const Register = ({ step, setStep }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate()

  const [click, setClick] = useState(false);

  const handleClick = () => {
    setClick(!click)
  }

  const account = [
    {
      id: "personal",
      icon: <RiUserLine className="text-5xl text-orange-500" />,
      header: "User",
      writeup: "Creating an account for personal use? This is the account type for you",

    },
    {
      id: "organization",
      icon: <RiBriefcaseLine className="text-5xl text-orange-500" />,
      header: "Organization",
      writeup: "Selling tickets as a registered business? This is the account type for you",
    },
  ]

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,?_-])[A-Za-z\d!@#$%^&*.,?_-]{8,24}$/;

    if (!passwordRegex.test(value)) {
      setPasswordError("Password must be 8-24 characters and include a number, lowercase, uppercase, and a special character.")
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



  const handleContinue = () => {
    if (selected) {
      setStep("form"); // 👈 go to the right form
    }
  };

  // Auto-redirect to login after success
  // useEffect(() => {
  //   if (success) {
  //     const timer = setTimeout(() => {
  //       setStep("verify");
  //       setSuccess(false);
  //     }, 100000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [success]);

  // Firebase-friendly error messages
  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "⚠️ That email doesn’t look right. Please enter a valid one.";
      case "auth/email-already-in-use":
        return "⚠️ This email is already registered. Try logging in instead.";
      case "auth/weak-password":
        return "⚠️ Password should be at least 6 characters.";
      case "auth/wrong-password":
        return "⚠️ Incorrect password.";
      case "auth/user-not-found":
        return "⚠️ No account found with this email.";
      default:
        return "⚠️ Something went wrong. Please try again.";
    }
  };


  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setStep("verify")
    setRegisterLoading(true);


    // ✅ Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setRegisterLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    const fullName = formData.get("fullName");
    const emailValue = formData.get("email"); // use different name
    setEmail(emailValue); // update state
    const passwordValue = formData.get("password");
    const address = formData.get("address")
    const country = formData.get('country');
    const phone = formData.get("phone");
    const orgName = formData.get('organization');

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      const user = userCredential.user;


      setEmail(emailValue); // ✅ update state so success screen shows email
      setSuccessMessage("✅ Almost done! Please check your inbox for a verification link.");
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // 2) Fire off verification email (don’t block UI if Firestore later fails)
      // Optional: customize redirect URL
      const actionCodeSettings = {
        url: `${window.location.origin}/`, // change if you want a specific page
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);

      // 3) Move UI to "verify" screen immediately
      setStep("verify");

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        accountType: selected,
        fullName,
        email: emailValue,
        address,
        country,
        phone,
        orgName: selected === "organization" ? orgName : null,
        verified: step === "verify",
        createdAt: new Date().toISOString(),
      }).catch((error) => {
        console.error("profile write failed:", error);
      });

    } catch (error) {
      console.log(error);

      setError(getErrorMessage(error.code));
    } finally {
      setRegisterLoading(false);
    }

  };

  // Progress bar
  const steps = ["select", "form", "verify"];
  const currentStep = steps.indexOf(step);


  return (
    <section data-aos="fade-out" className='relative w-full grid grid-cols-1 md:grid-cols-2 h-screen '>
      <div className='flex flex-col flex-1  custom-scrollbar space-y-10 px-10 py-6 '>
        <a className='text-lg font-semibold '>Airticks<span className='text-orange-500'>.events</span></a>
        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {steps.map((s, idx) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded ${idx <= currentStep ? "bg-orange-500" : "bg-gray-300"}`}
            />
          ))}
        </div>



        {step === "select" &&
          (
            <>
              <div className='flex flex-col space-y-4'>
                <h1 className='font-bold md:text-5xl text-3xl'>Create an account</h1>
                <p className='md:text-lg text-sm'>it's free to create an account and get started with Airticks!</p>
              </div>

              <div className='flex flex-col space-y-4 '>
                <h1 className='font-bold md:text-xl text-md'>Choose an account type</h1>
                <div className='flex items-center lg:flex-row flex-col gap-10'>
                  {account.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelected(acc.id)}
                      className={`flex flex-1 flex-col items-center space-y-6 py-6 lg:px-0 px-5 shadow-lg   md:w-[300px] h-[320px] rounded-lg border cursor-pointer transition 
                  ${selected === acc.id ? "text-orange-500 border-orange-500 bg-white" : "border-gray-200 "}`}
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
                  <button onClick={() => navigate("/")} className='bg-orange-500/50  rounded-xl active:scale-90 hover:bg-orange-600 py-4 w-full text-white'>Cancel</button>
                  <button onClick={handleContinue} className={`rounded-xl active:scale-90 hover:bg-orange-600 py-4 w-full ${selected ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!selected}>Continue</button>
                </div>

                <div className='mt-2'>
                  <p> Already created an account?
                    <button className="text-orange-500 underline cursor-pointer" onClick={() => navigate("/Login")}> Login </button>
                  </p>
                </div>
              </div>
            </>
          )}

        {step === "form" && (<>
          <form onSubmit={handleSubmitForm} className='flex flex-col space-y-4 mt-10'>
            <h1 className='font-bold text-3xl mb-4'>Tell us about yourself</h1>

            {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</div>}

            {/* Full Name */}
            <input
              name='fullName'
              type="text"
              placeholder="Full Name"
              className='p-3 border rounded-lg'
              required
            />

            {/* Email */}
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className='p-3 border rounded-lg '
              required
            />

            {/* Password */}
            <div className="relative w-full">
              <input onChange={handlePasswordChange} name="password" type={click ? "text" : "password"} placeholder="Password" required className="border w-full p-3 rounded-lg" />

              {click ? (
                <FaEye
                  onClick={handleClick}
                  color="gray"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                />
              ) : (
                <FaEyeSlash
                  onClick={handleClick}
                  color="gray"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                />
              )}
            </div>
            {passwordError && (<div className='h-auto text-white text-lg  border-2 bg-orange-600 rounded-md border-orange-500'>{passwordError}</div>)}

            {/* Confirm Password */}

            <div className="relative w-full">
              <input onChange={handlePasswordConfrimChange}
                name='confirmPassword'
                type={click ? "text" : "password"}
                placeholder="Confirm Password"
                className='p-3 w-full border rounded-lg'
                required
              />

              {click ? (
                <FaEye
                  onClick={handleClick}
                  color="gray"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                />
              ) : (
                <FaEyeSlash
                  onClick={handleClick}
                  color="gray"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                />
              )}
            </div>

            {confirmPasswordError && (<div className='h-auto text-white text-lg  border-2 bg-orange-600 rounded-md border-orange-500'>{confirmPasswordError}</div>)}

            {/* Phone Number */}
            <input
              name='phone'
              type="tel"
              placeholder="Phone Number"
              className='p-3 border rounded-lg'
            />

            {/* Country dropdown */}
            <select name='country' className='p-3 border bg-[#333333] rounded-lg' required>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Address */}
            <textarea
              name='address'
              placeholder="Address"
              className='p-3 border rounded-lg resize-none h-24'
            />

            {/* Organization-specific field */}
            {selected === "organization" && (
              <input
                name='organization'
                type="text"
                placeholder="Organization Name"
                className='p-3 border rounded-lg'
                required
              />
            )}

            <div className='flex gap-3'>
              <button onClick={() => setStep("select")}
                className='w-full bg-orange-500/40 active:scale-90 hover:bg-orange-600 text-white rounded-xl py-3 '
              >
                Go back 👈🏾
              </button>
              <button
                type="submit"
                className='w-full flex items-center justify-center bg-orange-500 text-white rounded-xl py-3 active:scale-90 hover:bg-orange-600'
              >
                {registerLoading ? <><div className='loading'></div><p className='ml-2'> CreatingAccount...</p> </> : "Register"}
              </button>
            </div>

            <div className='mt-2'>
              <p> Already created an account?
                <button className="text-orange-500 underline cursor-pointer" onClick={() => navigate("/Login")}> Login </button>
              </p>
            </div>
          </form>

        </>
        )}

        {step === "verify" && (
          <Verify
            email={email}
            step={step}
            setStep={setStep}
          />
        )}
        <footer className='mt-2'>
          <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
        </footer>
      </div>

      {/* Right side - Background Image */}
      <div className='hidden md:block w-[40%] h-screen fixed right-0 top-0'>
        <img src={pictureBg} className='object-cover w-full h-full' />
      </div>

    </section>
  )
}

export default Register