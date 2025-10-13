import React from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { FiX } from "react-icons/fi";
import { db } from "../firebase/firebase";

const EditModal = ({
  currentUser,
  editEvent,
  setEditEvent,
  setIsEditing,
  events,
  setEvents,
}) => {
  // Save edits to Firestore
  const saveEdit = async () => {
    if (!editEvent || !editEvent.id) {
      alert("❌ No event selected for editing!");
      return;
    }

    try {
      const eventRef = doc(db, "events", editEvent.id);
      await updateDoc(eventRef, {
        name: editEvent.name,
        date: editEvent.date,
        startTime: editEvent.startTime,
        endTime: editEvent.endTime,
        location: editEvent.location,
        category: editEvent.category,
        description: editEvent.description,
      });

      alert("✅ Event updated successfully!");
      setIsEditing(false);

      // Refresh event list
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("❌ Failed to update event.");
    }
  };

  if (!editEvent) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-sm bg-black/30 flex justify-center items-center z-[9999] custom-scrollbar">
      {/* Background click closes modal */}
      <div
        className="absolute inset-0"
        onClick={() => setIsEditing(false)}
      >

      <div className="relative flex flex-col bg-[#eeeeee] text-[#333333] space-y-4 p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] h-100vh z-10 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        {/* Close icon */}
        <div
          className="text-2xl absolute top-4 right-4 cursor-pointer hover:scale-105"
          onClick={() => setIsEditing(false)}
        >
          <FiX />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">Edit Event</h2>

        <label className="font-semibold">Event Name</label>
        <input
          type="text"
          value={editEvent.name || ""}
          onChange={(e) =>
            setEditEvent({ ...editEvent, name: e.target.value })
          }
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Date</label>
        <input
          type="date"
          value={editEvent.date || ""}
          onChange={(e) =>
            setEditEvent({ ...editEvent, date: e.target.value })
          }
          className="border p-2 rounded-lg w-full"
        />

        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="font-semibold">Start Time</label>
            <input
              type="time"
              value={editEvent.startTime || ""}
              onChange={(e) =>
                setEditEvent({ ...editEvent, startTime: e.target.value })
              }
              className="border p-2 rounded-lg w-full"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="font-semibold">End Time</label>
            <input
              type="time"
              value={editEvent.endTime || ""}
              onChange={(e) =>
                setEditEvent({ ...editEvent, endTime: e.target.value })
              }
              className="border p-2 rounded-lg w-full"
            />
          </div>
        </div>

        <label className="font-semibold">Location</label>
        <input
          type="text"
          value={editEvent.location || ""}
          onChange={(e) =>
            setEditEvent({ ...editEvent, location: e.target.value })
          }
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Category</label>
        <input
          type="text"
          value={editEvent.category || ""}
          onChange={(e) =>
            setEditEvent({ ...editEvent, category: e.target.value })
          }
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Description</label>
        <textarea
          value={editEvent.description || ""}
          onChange={(e) =>
            setEditEvent({ ...editEvent, description: e.target.value })
          }
          className="border p-2 rounded-lg w-full h-24"
        />

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EditModal;
