import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  addDoc,
  collection,
  serverTimestamp,
  deleteField // 📑 Added to clean up fields on unfollow
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useEffect, useState } from 'react'

const FollowButton = ({ currentUser, ownerId }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    setIsFollowing(currentUser.following?.includes(ownerId))
  }, [currentUser, ownerId])

  const toggleFollow = async () => {
    if (!currentUser || currentUser.uid === ownerId) return

    setLoading(true)

    const userRef = doc(db, 'users', currentUser.uid)
    const organizerRef = doc(db, 'users', ownerId)

    try {
      if (isFollowing) {
        // ❌ UNFOLLOWING LOGIC
        await updateDoc(userRef, {
          following: arrayRemove(ownerId),
          // Dynamic path safely removes the specific timestamp tracking key
          [`followingDates.${ownerId}`]: deleteField() 
        })
        await updateDoc(organizerRef, {
          followersCount: increment(-1)
        })
        setIsFollowing(false)
      } else {
        // 🎫 FOLLOWING LOGIC
        const now = new Date(); // Use local timestamp instance for quick layout mapping fallback compatibility

        await updateDoc(userRef, {
          following: arrayUnion(ownerId),
          // 🛠️ FIX: Track exactly when this user followed this specific organizer id
          [`followingDates.${ownerId}`]: now
        })
        await updateDoc(organizerRef, {
          followersCount: increment(1)
        })

        // 🔔 CREATE NOTIFICATION
        await addDoc(collection(db, 'notifications'), {
          type: 'new_follower',
          title: '👤 New Follower',
          message: `${currentUser.fullName || currentUser.displayName || 'Someone'} followed you`,
          userId: ownerId, // organizer receives it
          actorId: currentUser.uid, // who followed
          read: false,
          createdAt: serverTimestamp()
        })

        setIsFollowing(true)
      }
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      disabled={loading}
      onClick={toggleFollow}
      className={`px-4 py-2 rounded-lg font-semibold transition
        ${
          isFollowing
            ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
    >
      {isFollowing ? 'Following ✓' : 'Follow'}
    </button>
  )
}

export default FollowButton