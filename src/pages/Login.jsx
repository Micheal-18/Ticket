import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react'
import walkGif from "../assets/dog.gif"
import { auth, db, googleProvider } from '../firebase/firebase';
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

    const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    // Save user in Firestore
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        verified: true, // Google emails are already verified
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("✅ Logged in:", user);

  } catch (error) {
    console.error("Google login error:", error);
  }
};



 const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoginLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

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

      

      const data = userSnap.data();

      let redirect = "/";
      if (data.isAdmin) redirect = "/dashboard";
      else if (data.accountType === "organization")
        redirect = "/dashboard/organization";

      // ✅ ONLY navigation that should happen
      navigate("/welcome", {
        state: {
          userData: data,
          redirectTo: redirect,
        },
        replace: true,
      });
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoginLoading(false);
    }
  };

    return (
        <section data-aos="fade-out" className='flex-col w-full min-h-screen bg-(--bg-color) dark:bg-(--bg-color) flex justify-center items-center'>
            <GoogleAuth />
            <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full max-w-lg mx-6 lg:mx-0">
                <h1 className="font-bold text-5xl ">Login</h1>
                {error && <div className="bg-orange-100 text-red-600 p-2 rounded mb-4">{error}</div>}
                <input name="email" type="email" placeholder="Email Address" required className="border p-3 rounded-lg" />
                <div className="relative w-full">
                    <input name="password" type={click ? "text" : "password"} placeholder="Password" required className="border w-full p-3 rounded-lg" />
                    {click ? (
                        <FaEye onClick={handleClick} color="gray" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"/>
                    ) : (
                        <FaEyeSlash onClick={handleClick} color="gray" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"/>
                    )}
                </div>
                <div className='flex gap-3'>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    <p>Remember Me</p>
                </div>
                <button type="submit" className="w-full flex items-center justify-center bg-orange-500 text-white rounded-xl py-3 active:scale-90 hover:bg-orange-600 hover:scale-105">
                    {loginLoading ? <><div className='loading'></div><p className='ml-2'>Logging In...</p></> : "Login"}
                </button>
                <p className="text-sm">
                    Don’t have an account?{" "}
                    <button type="button" onClick={() => navigate("/Register")} className="text-orange-500 cursor-pointer underline">
                        Register
                    </button>
                </p>
                
                <footer className='mt-10'>
                    <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
                </footer>
            </form>
        </section>
    )
}

export default Login;
