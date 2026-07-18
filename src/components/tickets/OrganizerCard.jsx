import React, { useEffect, useState } from 'react'
import {
  FiCheckCircle,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiUser
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import FollowButton from '../FolllowButton'
import OptimizedImage from '../OptimizedImage'
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const OrganizerSection = ({ organizer, owner, currentUser, currentUserId }) => {
 const [ownerData, setOwnerData] = useState(null);

useEffect(() => {
    if (!owner?.id) return;

    const unsubscribe = onSnapshot(
        doc(db, "users", owner.id),
        (docSnap) => {
            if (docSnap.exists()) {
                setOwnerData({
                    id: docSnap.id,
                    ...docSnap.data(),
                });
            }
        }
    );

    return unsubscribe;
}, [owner?.id]);

const [eventsCount, setEventsCount] = useState(0);

useEffect(() => {

    if (!owner?.id) return;

    const q = query(
        collection(db, "events"),
        where("ownerId", "==", owner.id)
    );

    return onSnapshot(q, (snapshot) => {
        setEventsCount(snapshot.size);
    });

}, [owner?.id]);

  return (
    <section className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold'>Meet the Organizer</h2>

        <p className='opacity-70'>
          Learn more about the team behind this event.
        </p>
      </div>

      <div className='rounded-3xl border bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) p-8'>
        <div className='flex flex-col lg:flex-row justify-between gap-8'>
          <div className='flex gap-5'>
            {owner?.photoURL ? (
              <OptimizedImage
                src={owner.photoURL}
                className='w-24 h-24 rounded-full'
              />
            ) : (
              <div className='w-24 h-24 rounded-full bg-zinc-300 flex items-center justify-center'>
                <FiUser size={32} />
              </div>
            )}

            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-2xl font-bold'>{organizer}</h3>

                {owner.isVerified && (
                  <FiCheckCircle className='text-blue-500' />
                )}
              </div>

              <p className='opacity-70 mt-2'>{owner.bio}</p>

              <div className='flex flex-wrap gap-5 mt-5 text-sm'>
                <div className='flex items-center gap-2'>
                  <FiCalendar />
                  {eventsCount} Events
                </div>

                <div className='flex items-center gap-2'>
                  <FiUsers />
                  {ownerData?.followersCount || 0} Followers
                </div>

                {owner.location && (
                  <div className='flex items-center gap-2'>
                    <FiMapPin />
                    {owner.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            {currentUser?.uid !== owner.id && (
              <FollowButton
                currentUser={currentUser}
                currentUserId={currentUserId}
                ownerId={owner.id}
              />
            )}

            <Link
              to={`/organizer/${owner.id}`}
              className='border border-(--border) rounded-xl px-6 py-3 flex items-center gap-2 justify-center hover:bg-(--primary) hover:text-white transition'
            >
              View Profile
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrganizerSection
