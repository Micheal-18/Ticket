import React from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { auth, googleProvider } from '../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const GoogleAuth = ({ onAuthSuccess, className }) => {

  // Process core document payload writes to Firestore
  const handleUserSync = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    
    const userPayload = {
      name: user.displayName,
      email: user.email?.toLowerCase().trim(),
      accountType: 'user',
      photoURL: user.photoURL,
      provider: 'google',
      emailVerified: true,
      updatedAt: new Date().toISOString()
    };

    if (!existingSnap.exists()) {
      userPayload.createdAt = new Date().toISOString();
      userPayload.accountType = 'user'; 
      userPayload.isAdmin = false;
      userPayload.verified = true;
    }

    await setDoc(userRef, userPayload, { merge: true });
    const freshSnap = await getDoc(userRef);
    return freshSnap.data();
  };


  const signInWithGoogle = async () => {
    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const userData = await handleUserSync(result.user);

      // If a callback is passed (Login page), execute it. If not (Ticket Modal), do nothing.
      if (onAuthSuccess) {
        onAuthSuccess(userData);
      }

    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <button 
      onClick={signInWithGoogle} 
      type="button"
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow hover:shadow-lg transition-transform duration-200 ${className}`}
    >
      Continue with Google
    </button>
  );
};

export default GoogleAuth;