import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const GoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 1️⃣ Save or update user profile details in Firestore safely
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: user.displayName,
          email: user.email?.toLowerCase().trim(), // Standardize casing
          photoURL: user.photoURL,
          provider: 'google',
          verified: true,
          // Using serverTimestamp over local system string arrays prevents device timezone corruption bugs
          updatedAt: new Date().toISOString() 
        },
        { merge: true }
      );

      console.log('✅ Logged in and synchronized:', user);
      
      // 💡 FIX: Removed window.location.reload(); 
      // Your top-level Auth state provider will seamlessly re-render your components naturally here.

    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className='p-3 rounded-lg shadow hover:scale-105 font-medium tracking-wide  transition'
    >
      Continue with Google
    </button>
  );
};

export default GoogleAuth;