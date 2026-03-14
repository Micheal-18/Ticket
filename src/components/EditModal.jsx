import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { FiX } from "react-icons/fi";
import { db } from "../firebase/firebase";
import { useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const EditModal = ({ currentUser, editEvent, setEditEvent, setIsEditing, events, setEvents,}) => {
  if (!editEvent) return null;
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false);
  const currencies = ["₦", "$", "€", "£"];
const [price, setPrice] = useState(
  editEvent.price || [{ id: 1, label: "", amount: "", currency: "₦" }]
);
  const fileInputRef = useRef(null);
  

  // --- Helpers -----------------------------------------------------------------
  const isTimeOnly = (v) => typeof v === "string" && /^\d{2}:\d{2}$/.test(v);
    const handlePhotoUpload = (e) => setPhoto(e.target.files[0]);
    const handleAddInput = () => setPrice([...price, { id: Date.now(), label: "", amount: "", currency: "₦" }]);
    const handlePriceChange = (id, field, value) => setPrice(price.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    const handleRemoveInput = (id) => setPrice(price.filter((p) => p.id !== id))

  // Accepts ISO/date/time/time-only and returns YYYY-MM-DD or "".
  const formatDate = (value) => {
    if (!value) return "";
    // If it's already YYYY-MM-DD (from input), keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // If it's a Date object
    if (value instanceof Date && !isNaN(value.getTime()))
      return value.toISOString().split("T")[0];

    // If it's an ISO string with date
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

    return "";
  };

      useEffect(() => {
      if (editEvent?.price) {
        setPrice(editEvent.price);
      }
    }, [editEvent]);

  // Accepts ISO/date/time/time-only and returns HH:MM or "".
  const formatTime = (value) => {
    if (!value) return "";
    if (value instanceof Date && !isNaN(value.getTime()))
      return value.toTimeString().slice(0, 5);
    if (isTimeOnly(value)) return value;
    // If it's a full ISO datetime string -> extract time portion
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().substring(11, 16);
    return "";
  };

  // Build ISO datetime from date (YYYY-MM-DD) and time (HH:MM) preserving local tz.
  // Returns ISO string or null if invalid.
  const buildISOFromDateAndTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    // If time is empty, return date at midnight local time
    const timePart = timeStr || "00:00";
    if (!/^\d{2}:\d{2}$/.test(timePart)) return null;
    // Construct local datetime: "YYYY-MM-DDTHH:MM:SS"
    const local = new Date(`${dateStr}T${timePart}:00`);
    if (isNaN(local.getTime())) return null;
    return local.toISOString();
  };

  // Build ISO from a value that might already be ISO or time-only or Date
  const normalizeToISO = (dateInput, timeInputOrIso) => {
    // If timeInputOrIso is already a full ISO datetime -> try parse
    if (typeof timeInputOrIso === "string" && /^\d{4}-\d{2}-\d{2}T/.test(timeInputOrIso)) {
      const parsed = new Date(timeInputOrIso);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }

    // If timeInputOrIso is time-only (HH:MM), combine with dateInput
    if (isTimeOnly(timeInputOrIso)) {
      return buildISOFromDateAndTime(dateInput, timeInputOrIso);
    }

    // If timeInputOrIso is a Date object
    if (timeInputOrIso instanceof Date && !isNaN(timeInputOrIso.getTime())) {
      return timeInputOrIso.toISOString();
    }

    // If timeInputOrIso is empty but dateInput provided -> return date at midnight
    if (!timeInputOrIso && dateInput) {
      return buildISOFromDateAndTime(dateInput, "00:00");
    }

    // As a last attempt, try parse the value directly
    const parsed = new Date(timeInputOrIso);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();

    return null;
  };

  // --- Save handler -----------------------------------------------------------
  const saveEdit = async () => {
    if (!editEvent || !editEvent.id) {
      alert("❌ No event selected for editing!");
      return;
    }

    // Determine date value in YYYY-MM-DD (from input)
    const dateInput = formatDate(editEvent.date);
    if (!dateInput) {
      alert("Please provide a valid date (YYYY-MM-DD).");
      return;
    }

    // Determine startTime and endTime inputs (may be HH:MM or ISO)
    const startInput = editEvent.startTime;
    const endInput = editEvent.endTime;

    // Build ISO strings for Firestore
    const startISO = normalizeToISO(dateInput, startInput);
    const endISO = normalizeToISO(dateInput, endInput);

    // Validate the conversions
    if (!startISO || !endISO) {
      alert("❌ Invalid start or end time. Use HH:MM format (e.g. 18:00) or a full ISO datetime.");
      return;
    }
    setLoading(true);

    try {
      const eventRef = doc(db, "events", editEvent.id);

      let finalPhotoURL = editEvent.photoURL || "";
      if (photo) finalPhotoURL = await uploadToCloudinary(photo);

      await updateDoc(eventRef, {
        name: editEvent.name,
        price: price,
        photoURL: finalPhotoURL,
        // store date as  ISO (midnight local)
        date: buildISOFromDateAndTime(dateInput, "00:00"),
        startTime: startISO,
        endTime: endISO,
        location: editEvent.location,
        category: editEvent.category,
        description: editEvent.description,
      });

      alert("✅ Event updated successfully!");
      setIsEditing(false);
      setLoading(false);

      // Refresh event list
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("❌ Failed to update event. See console for details.");
    }
  };

  // --- JSX --------------------------------------------------------------------
  return (
    <div className="fixed left-0 lg:left-20 lg:top-8 top-0 mb-10  w-full h-full bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div
        className="relative flex flex-col bg-[#eeeeee] text-[#333333] space-y-4 p-6 rounded-lg shadow-lg w-[70%] md:w-[50%] max-h-[70vh] custom-scrollbar overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-700 hover:scale-105"
          onClick={() => setIsEditing(false)}
        >
          <FiX />
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Edit Event</h2>

        
        <label className="font-semibold">Event Name</label>
        <input
          type="text"
          value={editEvent.name || ""}
          onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Photo</label>
        <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border rounded-lg w-full p-2' />

        {/* Image Preview */}
{(photo || editEvent.photoURL) && (
  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-200 mb-2">
    <img 
      src={photo ? URL.createObjectURL(photo) : editEvent.photoURL} 
      className="w-full h-full object-cover" 
      alt="Preview" 
    />
    {photo && (
      <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-widest shadow-lg">
        New Upload
      </div>
    )}
  </div>
)}

        <label className="font-semibold">Price</label>
        <div className="flex flex-col space-y-2">
          {price.map((p) => (
            <div key={p.id} className="flex flex-wrap space-y-2 items-center p-2 w-full space-x-4 border-b">
              <input type="text" placeholder="Ticket Type" value={p.label} onChange={(e) => handlePriceChange(p.id, "label", e.target.value)} className="p-2 border rounded-lg"/>
              <select value={p.currency} onChange={(e) => handlePriceChange(p.id, "currency", e.target.value)} className="p-2 border  rounded-lg">
                {currencies.map((cur, idx) => <option key={idx} value={cur}>{cur}</option>)}
              </select>
              <input type="number" placeholder="0.00" value={p.amount} onChange={(e) => handlePriceChange(p.id, "amount", e.target.value)} className="p-2 border rounded-lg w-40"/>
              {price.length > 1 && <button type="button" onClick={() => handleRemoveInput(p.id)} className="text-red-500 hover:text-red-700 font-bold"><FiX /></button>}
            </div>
          ))}
          <button type="button" onClick={handleAddInput} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-2"><FaPlus /> Add another ticket type</button>
        </div>


        <label className="font-semibold">Date</label>
        <input
          type="date"
          value={formatDate(editEvent.date)}
          onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
          className="border p-2 rounded-lg w-full"
        />

        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="font-semibold">Start Time</label>
            <input
              type="time"
              value={formatTime(editEvent.startTime)}
              onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="font-semibold">End Time</label>
            <input
              type="time"
              value={formatTime(editEvent.endTime)}
              onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
              className="border p-2 rounded-lg w-full"
            />
          </div>
        </div>

        <label className="font-semibold">Location</label>
        <input
          type="text"
          value={editEvent.location || ""}
          onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Category</label>
        <input
          type="text"
          value={editEvent.category || ""}
          onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
          className="border p-2 rounded-lg w-full"
        />

        <label className="font-semibold">Description</label>
        <textarea
          value={editEvent.description || ""}
          onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
          placeholder="Describe your event..."
          className="border p-2 rounded-lg w-full min-h-[120px] resize-y"
        />

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button onClick={saveEdit} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105">
           {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
