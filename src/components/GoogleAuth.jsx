import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const GoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)

      const user = result.user

      // Save user in Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: 'google',
          verified: true, // Google emails are already verified
          createdAt: new Date().toISOString()
        },
        { merge: true }
      )
      window.location.reload();

      console.log('✅ Logged in:', user)
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  return (
    <button
      onClick={signInWithGoogle}
      className=' p-3 rounded-lg shadow hover:scale-105'
    >
      Continue with Google
    </button>
  )
}

export default GoogleAuth
