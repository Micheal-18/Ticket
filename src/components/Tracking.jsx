import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { FaEllipsisV } from "react-icons/fa";
import { Link } from "react-router-dom";

const Tracking = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  // ✅ Sorting logic
  const filteredEvents = [...events].sort((a, b) => {
    if (filter === "revenue") return (b.revenue ?? 0) - (a.revenue ?? 0);
    if (filter === "tickets") return (b.ticketSold ?? 0) - (a.ticketSold ?? 0);
    return 0;
  });

  // ✅ ERASE revenue
  const eraseRevenue = async (id) => {
    const confirmErase = window.confirm(
      "Are you sure you want to erase revenue and ticket data?"
    );
    if (!confirmErase) return;

    try {
      await updateDoc(doc(db, "events", id), {
        revenue: 0,
        ticketSold: 0, // optional
      });

      // instant UI update
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === id ? { ...evt, revenue: 0, ticketsSold: 0 } : evt
        )
      );

      alert("Revenue erased successfully!");
    } catch (error) {
      console.error("Error erasing revenue:", error);
      alert("Failed to erase. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex justify-end w-full max-w-6xl px-4">
        <Link to="/dashboard/wallet" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">Wallet</Link>
      </div>
      <div className="flex flex-col items-center justify-center w-full lg:w-2/3 p-4   rounded-lg shadow">
        <h1 className="text-2xl  font-bold mb-6">
          📊 Event Analytics
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg active:scale-90 shadow ${
              filter === "all"
                ? "bg-blue-500 text-[#eeeeee]"
                : ""
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter("revenue")}
            className={`px-4 py-2 rounded-lg active:scale-90 shadow ${
              filter === "revenue"
                ? "bg-green-500 text-[#eeeeee]"
                : ""
            }`}
          >
            Top Revenue
          </button>
          <button
            onClick={() => setFilter("tickets")}
            className={`px-4 py-2 rounded-lg active:scale-90 shadow ${
              filter === "tickets"
                ? "bg-purple-500 text-[#eeeeee]"
                : ""
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
              className="h-[200px] relative flex flex-col items-center justify-center mb-6 rounded-lg  w-full p-4"
            >
              {/* ERASE Trigger */}
              <FaEllipsisV
                className="absolute top-2 right-2 cursor-pointer z-50  text-sm active:scale-90"
                onClick={() => eraseRevenue(event.id)}
                title="Erase Revenue"
              />

              <p className="md:text-xl text-lg uppercase  font-semibold mb-2">
                {event.name}
              </p>

              <p className="">
                Tickets:{" "}
                <span className="text-green-500 font-semibold">
                  {event.ticketSold ?? 0}
                </span>
              </p>

              <p className="">
                Revenue:{" "}
                <span className="text-blue-500 font-semibold">
                  ₦{event.revenue ?? 0}
                </span>
              </p>

              <p className="">
                Airticks:{" "}
                <span className="text-purple-500 font-semibold">
                  {event.currency}
                  {event.revenue ? event.revenue / 10 : 0}
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
