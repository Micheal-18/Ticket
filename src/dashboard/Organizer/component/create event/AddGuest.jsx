import React, { useState } from "react";
import { FiPlus, FiTrash2, FiUser } from "react-icons/fi";

// Fixed: Defined the missing guest roles array to prevent application crashes
const guestRoles = ["DJ", "Speaker", "Host", "Performer", "Special Guest", "Panelist", "Other"];

const revealOptions = [
  { label: "Show Immediately", value: "now" },
  { label: "2 Days Before Event", value: "2days" },
  { label: "24 Hours Before", value: "24hours" },
  { label: "2 Hours Before", value: "2hours" },
];

const GuestsSection = ({ guests, setGuests }) => {
  const addGuest = () => {
    setGuests([
      ...guests,
      {
        id: crypto.randomUUID(),
        name: "",
        role: "",
        customRole: "",
        bio: "",
        instagram: "",
        photo: null,
        reveal: "now",
      }
    ]);
  };

  const updateGuest = (id, field, value) => {
    setGuests(
      guests.map(guest =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    );
  };

  const removeGuest = id => {
    setGuests(guests.filter(guest => guest.id !== id));
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Who To Expect</h2>
          <p className="text-xs font-light opacity-70">DJs, Speakers, Hosts, Guests, Performers...</p>
        </div>
        <button
          type="button"
          onClick={addGuest}
          className="bg-(--primary) text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:opacity-90"
        >
          <FiPlus /> Add Guest
        </button>
      </div>

      {guests.map(guest => (
        <div key={guest.id} className="rounded-3xl border p-6 space-y-5 bg-white dark:bg-zinc-900/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {guest.photo ? (
                <img 
                  src={URL.createObjectURL(guest.photo)} 
                  alt="Preview" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500"><FiUser /></div>
              )}
              <h3 className="font-semibold text-sm">{guest.name || "New Guest"}</h3>
            </div>
            <button
              type="button"
              onClick={() => removeGuest(guest.id)}
              className="text-red-500 hover:text-red-700"
            >
              <FiTrash2 size={18} />
            </button>
          </div>

          <input
            placeholder="Name"
            value={guest.name}
            onChange={(e) => updateGuest(guest.id, "name", e.target.value)}
            className="w-full rounded-xl border p-4 focus:outline-(--primary)"
          />

          <div>
            <label className="font-medium text-sm">Guest Role</label>
            <select
              value={guest.role}
              onChange={(e) => updateGuest(guest.id, "role", e.target.value)}
              className="mt-2 w-full rounded-xl border p-4 focus:outline-(--primary)"
            >
              <option value="">Select Role</option>
              {guestRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {guest.role === "Other" && (
            <div>
              <label className="font-medium text-sm">Custom Role</label>
              <input
                placeholder="e.g., Fashion Designer"
                value={guest.customRole || ""}
                onChange={(e) => updateGuest(guest.id, "customRole", e.target.value)}
                className="mt-2 w-full rounded-xl border p-4 focus:outline-(--primary)"
              />
            </div>
          )}

          <div>
            <label className="font-medium text-sm">Short Bio</label>
            <textarea
              rows={2}
              placeholder="Tell attendees about this guest..."
              value={guest.bio}
              onChange={(e) => updateGuest(guest.id, "bio", e.target.value)}
              className="mt-2 w-full rounded-xl border p-4 focus:outline-(--primary)"
            />
          </div>

          <div>
            <label className="font-medium text-sm">Social Handle</label>
            <input
              placeholder="@handle"
              value={guest.instagram}
              onChange={(e) => updateGuest(guest.id, "instagram", e.target.value)}
              className="mt-2 w-full rounded-xl border p-4 focus:outline-(--primary)"
            />
          </div>

          <div>
            <label className="font-medium text-sm block mb-2">Guest Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateGuest(guest.id, "photo", e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-(--primary) hover:file:bg-orange-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="font-medium text-sm">Reveal Guest</label>
            <select
              value={guest.reveal}
              onChange={(e) => updateGuest(guest.id, "reveal", e.target.value)}
              className="mt-2 w-full rounded-xl border p-4 focus:outline-(--primary)"
            >
              {revealOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </section>
  );
};

export default GuestsSection;