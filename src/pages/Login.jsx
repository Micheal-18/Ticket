import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react'
import walkGif from "../assets/dog.gif"
import { auth, db } from '../firebase/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
import GoogleAuth from '../components/GoogleAuth';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [click, setClick] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);

  // Unified routing pipeline function used by both email and Google authentication
  const handleNavigationRedirect = (userData) => {
    let redirect = "/dashboard/users"; 
    if (userData.isAdmin) redirect = "/dashboard";
    else if (userData.accountType === "organization") redirect = "/dashboard/organization";

    navigate("/welcome", {
      state: {
        userData: userData,
        redirectTo: redirect,
      },
      replace: true,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoginLoading(true);
    setError("");

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setError("⚠️ Please verify your email before logging in.");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      handleNavigationRedirect(userSnap.data());

    } catch (error) {
      setError(error.code === "auth/user-not-found" ? "User not found." : error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <section data-aos="fade-out" className='flex-col w-full min-h-screen bg-(--bg-color) dark:bg-(--bg-color) flex justify-center items-center p-4'>
      {/* Passing the routing execution function down directly here */}
      <GoogleAuth 
        onAuthSuccess={handleNavigationRedirect} 
        className="mb-4 hover:scale-105 active:scale-90 shadow w-full max-w-lg "
      />
      
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full shadow p-4 items-center justify-center max-w-lg mx-6 lg:mx-0">
        <h1 className="font-bold text-5xl ">Login</h1>
        {error && <div className="bg-orange-100 text-red-600 p-2 rounded mb-4">{error}</div>}
        
        <input name="email" type="email" placeholder="Email Address" required className="border p-3 w-full " />
        
        <div className="relative w-full">
          <input name="password" type={click ? "text" : "password"} placeholder="Password" required className="border w-full p-3 " />
          {click ? (
            <FaEye onClick={handleClick} color="gray" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"/>
          ) : (
            <FaEyeSlash onClick={handleClick} color="gray" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"/>
          )}
        </div>
        
        <div className='relative flex gap-3 justify-start items-center w-full'>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <p>Remember me</p>
        </div>
        
        <button type="submit" className="w-full flex items-center justify-center bg-(--primary) text-white  py-3 active:scale-90 hover:bg-(--primary-hover) hover:scale-105">
          {loginLoading ? <><div className='loading'></div><p className='ml-2'>Logging In...</p></> : "Login"}
        </button>
        
        <p className="text-sm">
          Don’t have an account?{" "}
          <button type="button" onClick={() => navigate("/Register")} className="text-(--primary) cursor-pointer underline">
            Register
          </button>
        </p>
        
        <footer className='mt-2'>
          <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
        </footer>
      </form>
    </section>
  )
}

export default Login;