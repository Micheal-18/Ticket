import { doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";

const FollowButton = ({ currentUser, ownerId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setIsFollowing(currentUser.following?.includes(ownerId));
  }, [currentUser, ownerId]);

const toggleFollow = async () => {
  if (!currentUser || currentUser.uid === ownerId) return;

  setLoading(true);

  const userRef = doc(db, "users", currentUser.uid);
  const organizerRef = doc(db, "users", ownerId);

  try {
    if (isFollowing) {
      await updateDoc(userRef, {
        following: arrayRemove(ownerId),
      });
      await updateDoc(organizerRef, {
        followersCount: increment(-1),
      });
      setIsFollowing(false);
    } else {
      await updateDoc(userRef, {
        following: arrayUnion(ownerId),
      });
      await updateDoc(organizerRef, {
        followersCount: increment(1),
      });
      setIsFollowing(true);
    }
    console.log(
      isFollowing,
    );
    
  } catch (err) {
    console.error("Follow error:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <button
      disabled={loading}
      onClick={toggleFollow}
      
      className={`px-4 py-2 rounded-lg font-semibold transition
        ${isFollowing
          ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
          : "bg-orange-500 text-white hover:bg-orange-600"}`}
    >
      {isFollowing ? "Following ✓" : "Follow"}
    </button>
  );
};

export default FollowButton;
