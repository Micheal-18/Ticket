import React from 'react'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const GoogleAuth = ({ onAuthSuccess, className }) => {
  // Process core document payload writes to Firestore
  const handleUserSync = async user => {
    const userRef = doc(db, 'users', user.uid)

    const existingSnap = await getDoc(userRef)

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email?.toLowerCase().trim(),
        photoURL: user.photoURL,
        provider: 'google',
        emailVerified: true,
        accountType: 'user',
        verified: true,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } else {
      await setDoc(
        userRef,
        {
          name: user.displayName,
          email: user.email?.toLowerCase().trim(),
          photoURL: user.photoURL,
          emailVerified: true,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      )
    }

    const freshSnap = await getDoc(userRef)
    return freshSnap.data()
  }

  const signInWithGoogle = async () => {
    try {
      let result

      // ✅ BEST PRACTICE: Try popup first (works on most browsers including Safari sometimes)
      try {
        result = await signInWithPopup(auth, googleProvider)
      } catch (popupError) {
        console.warn('Popup failed, switching to redirect...', popupError)

        // 🔥 Safari / mobile fallback
        await signInWithRedirect(auth, googleProvider)
        return
      }

      const userData = await handleUserSync(result.user)

      if (onAuthSuccess) {
        onAuthSuccess(userData)
      }
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  return (
    <button
      onClick={signInWithGoogle}
      type='button'
      className={`flex items-center justify-center gap-2 px-4 py-2  shadow hover:shadow-xl transition-transform duration-200 ${className}`}
    >
      Continue with Google
    </button>
  )
}

export default GoogleAuth
