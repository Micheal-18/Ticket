import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

const Tracking = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // ✅ default filter

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ✅ Filtered events
  const filteredEvents = [...events].sort((a, b) => {
    if (filter === "revenue") return (b.revenue ?? 0) - (a.revenue ?? 0);
    if (filter === "tickets") return (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0);
    return 0; // "all"
  });

  return (
    <div className="flex items-center justify-center w-full mt-6">
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 p-4 border-2 border-gray-300 rounded-lg shadow-lg">
        <h1 className="text-2xl text-[#eeeeee] font-bold mb-6">📊 Event Tracking</h1>

        {/* Filter Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg active:scale-90 ${
              filter === "all" ? "bg-blue-500 text-[#eeeeee]" : "bg-gray-200 text-[#333333]"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("revenue")}
            className={`px-4 py-2 rounded-lg  active:scale-90 ${
              filter === "revenue" ? "bg-green-500 text-[#eeeeee]" : "bg-gray-200 text-[#333333]"
            }`}
          >
            Top Revenue
          </button>
          <button
            onClick={() => setFilter("tickets")}
            className={`px-4 py-2 rounded-lg  active:scale-90 ${
              filter === "tickets" ? "bg-purple-500 text-[#eeeeee]" : "bg-gray-200 text-[#333333]"
            }`}
          >
            Most Tickets Sold
          </button>
        </div>

        {/* Event Cards */}
        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="h-[200px] flex flex-col items-center justify-center mb-6 rounded-lg bg-gray-100 w-full p-4"
            >
              <p className="text-xl text-[#333333] font-semibold mb-2">{event.name}</p>
              <p className="text-gray-600">
                Status:{" "}
                <span className="text-green-500 font-semibold">
                  {event.ticketsSold ?? 0} tickets
                </span>
              </p>
              <p className="text-gray-600">
                Revenue:{" "}
                <span className="text-blue-500 font-semibold">
                  ₦{event.revenue ?? 0}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tracking;
