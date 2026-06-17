import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Dispatches a real-time system notification to all followers of an organizer.
 * @param {Object} organizerDoc - The currentUser/organizer profile document structure.
 * @param {Object} eventDetails - Basic payload information about the new event.
 */
export const notifyFollowersOfNewEvent = async (organizerDoc, eventDetails) => {
  // 1. Extract the followers array safely
  const followerIds = organizerDoc?.followers || [];
  
  if (followerIds.length === 0) return; // Nobody to notify

  try {
    // 2. Map through IDs and create a creation promise for each follower
    const notificationPromises = followerIds.map((followerId) => {
      const notificationPayload = {
        userId: followerId,                          // Targets the specific follower
        type: "event_submission",                     // Matches your iconMap configuration
        title: "New Event Alert! 📢",
        message: `${organizerDoc.fullName || "An organizer you follow"} just published "${eventDetails.name}".`,
        link: `/events/${eventDetails.id || ""}`,    // Link to go to when clicked
        read: false,
        status: "unread",
        createdAt: serverTimestamp(),                // For your timeline groups (Today/Yesterday)
      };

      return addDoc(collection(db, "notifications"), notificationPayload);
    });

    // 3. Fire all document creations in parallel
    await Promise.all(notificationPromises);
    console.log(`Successfully dispatched notification alerts to ${followerIds.length} followers.`);
  } catch (error) {
    console.error("Error dispatching follower notifications:", error);
  }
};