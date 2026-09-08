import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sendNotification } from "./createNotify";

/**
 * Dispatches a real-time system notification and email to all followers.
 */
export const notifyFollowersOfNewEvent = async (organizerDoc, eventDetails) => {
  const followerIds = organizerDoc?.followers || [];
  
  if (followerIds.length === 0) return;

  try {
    const notificationPromises = followerIds.map(async (followerId) => {
      // 1. Fetch the follower's profile to get their email for Brevo
      const followerSnap = await getDoc(doc(db, "users", followerId));
      if (!followerSnap.exists()) return;
      
      const followerEmail = followerSnap.data().email;
      if (!followerEmail) return;

      // 2. Dispatch via the backend route (Email + In-App Toast)
      return sendNotification({
        userId: followerId,
        userEmail: followerEmail,
        title: "New Event Alert! 📢",
        message: `${organizerDoc.fullName || "An organizer"} just published "${eventDetails.name}".`,
        link: `/event/${eventDetails.id || ""}`
      });
    });

    // 3. Fire all fetches and backend requests in parallel
    await Promise.all(notificationPromises);
    console.log(`Successfully dispatched alerts to ${followerIds.length} followers.`);
  } catch (error) {
    console.error("Error dispatching follower notifications:", error);
  }
};