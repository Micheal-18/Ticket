import { auth } from "../firebase/firebase";

export const sendNotification = async (notificationData) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Passes the middleware
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error("Failed to trigger notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error dispatching notification:", error);
  }
};