import React from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

const DeleteModal = ({
  selectedEvent,
  setSelectedEvent,
  setIsDeleting,
  setEvents,
}) => {
  const deleteEvent = async (eventId) => {

    try {
      await deleteDoc(doc(db, "events", eventId));
      console.log()
      alert("✅ Event deleted successfully!");

      // Refresh event list after delete
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);

      // Close modal after delete
      setIsDeleting(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("❌ Failed to delete event.");
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-[9999] custom-scrollbar">
      {/* Overlay click to close */}
      <div
        className="absolute left-0 top-0 w-full h-full"
        onClick={() => setIsDeleting(false)}
      ></div>

      <div className="relative bg-[#eeeeee] text-[#333333] p-6 rounded-lg shadow-lg w-[90%] md:w-[60%] lg:w-[40%] space-y-6 z-50">
        <h1 className="text-xl font-bold text-center">
          Are you sure you want to delete this event?
        </h1>

        <p className="text-center text-gray-600 font-medium">
          {selectedEvent?.name}
        </p>

        <div className="flex justify-center gap-6">
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
            onClick={() => {
              setIsDeleting(false);
              setSelectedEvent(null);
            }}
          >
            No
          </button>

          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
            onClick={() => deleteEvent(selectedEvent?.id)}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
