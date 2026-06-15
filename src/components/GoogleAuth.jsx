import React from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { auth, googleProvider } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const GoogleAuth = () => {

  // Handle redirect result (VERY IMPORTANT)
  React.useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;

        const user = result.user;

        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email?.toLowerCase().trim(),
          photoURL: user.photoURL,
          provider: 'google',
          verified: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });

      } catch (error) {
        console.error("Redirect login error:", error);
      }
    };

    handleRedirect();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email?.toLowerCase().trim(),
        photoURL: user.photoURL,
        provider: 'google',
        verified: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('✅ Logged in:', user);

    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <button onClick={signInWithGoogle}>
      Continue with Google
    </button>
  );
};

export default GoogleAuth;