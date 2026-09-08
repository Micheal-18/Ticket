import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  serverTimestamp,
  deleteField,
  onSnapshot,
  getDoc // 📑 Added getDoc to fetch the organizer's email
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useEffect, useState } from 'react'// 📑 Import your new helper
import { sendNotification } from '../utils/createNotify'

const FollowButton = ({ currentUser, ownerId }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setIsFollowing(data.following?.includes(ownerId) || false);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid, ownerId]);

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
          [`followingDates.${ownerId}`]: deleteField() 
        })
        await updateDoc(organizerRef, {
          followersCount: increment(-1),
          followers: arrayRemove(currentUser.uid)
        })
        setIsFollowing(false)
      } else {
        // 🎫 FOLLOWING LOGIC
        const now = new Date(); 

        await updateDoc(userRef, {
          following: arrayUnion(ownerId),
          [`followingDates.${ownerId}`]: now
        })
        await updateDoc(organizerRef, {
          followersCount: increment(1),
          followers: arrayUnion(currentUser.uid) 
        })

        // 🔔 FETCH ORGANIZER EMAIL & TRIGGER BACKEND NOTIFICATION
        const organizerSnap = await getDoc(organizerRef);
        const organizerEmail = organizerSnap.data()?.email;

        if (organizerEmail) {
          await sendNotification({
            userId: ownerId,
            userEmail: organizerEmail,
            title: '👤 New Follower Alert',
            message: `${currentUser.fullName || currentUser.displayName || 'Someone'} just started following you!`,
            link: `/dashboard/organization/profile` // Or wherever you want them routed
          });
        }

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
      className={`px-4 py-2 rounded-sm font-semibold transition active:scale-95
        ${
          isFollowing
            ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            : 'bg-(--primary) text-white hover:bg-(--primary-hover)'
        }`}
    >
      {isFollowing ? 'Following ✓' : 'Follow'}
    </button>
  )
}

export default FollowButton