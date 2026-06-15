import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { Link, useOutletContext } from "react-router-dom";
import { db } from "../../firebase/firebase";
import OptimizedImage from "../../components/OptimizedImage";
import { FaEllipsisV, FaCalendar, FaClock, FaLocationArrow } from "react-icons/fa";
import { RiStarFill } from "react-icons/ri";
import { formatEventStatus } from "../../utils/formatEventRange";

const TABS = ["approved", "pending", "rejected"];

const OrgEvent = () => {
  const { currentUser } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [selectedDropdown, setSelectedDropdown] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "events"),
          where("ownerId", "==", currentUser.uid),
          where("status", "==", status)
        );

        const snap = await getDocs(q);
        setEvents(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching organizational events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser, status]);

  // Safe Date string formatter helper function (Tailored from Component A)
  const displayEventDate = (dateField) => {
    if (!dateField) return "Date TBD";
    
    if (typeof dateField === 'string' && dateField.includes(' at ')) {
      const isoPart = dateField.split(' at ')[1];
      const parsed = new Date(isoPart);
      return isNaN(parsed.getTime()) 
        ? dateField.split(' at ')[0] 
        : parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
    
    const parsedDate = new Date(dateField);
    if (isNaN(parsedDate.getTime())) return "Invalid Date";
    
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Toggle Highlight feature logic (Tailored from Component A)
  const toggleHighlight = async (eventId, currentValue) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { highlighted: !currentValue });
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, highlighted: !currentValue } : ev
        )
      );
    } catch (error) {
      console.error("Error updating highlight:", error);
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar z-10">
      <div className="max-w-6xl mx-auto w-full px-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Events</h1>
          <Link
            to="/dashboard/organization/create"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Event
          </Link>
        </div>

        {/* STATUS TABS */}
        <div className="flex gap-3 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setSelectedDropdown(null); // Clear dropdown selections when switching categories
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                status === tab
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT VIEWPORT */}
        {loading ? (
          <p className="text-gray-500 font-medium animate-pulse">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 font-medium">No {status} events listed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 w-full">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedDropdown(
                    selectedDropdown === event.id ? null : event.id
                  );
                }}
                className="flex items-center justify-between gap-4 relative lg:px-8 px-4 w-full py-5 shadow rounded-3xl cursor-default transition-all hover:shadow-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
              >
                <span className="space-y-2 flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold uppercase text-xl lg:text-2xl truncate">
                      {event.name}
                    </h1>
                    {event.status === "pending" && (
                      <span className="text-[10px] px-2 py-0.5 font-bold text-yellow-500 bg-yellow-500/10 rounded-full uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                    {event.status === "rejected" && (
                      <span className="text-[10px] px-2 py-0.5 font-bold text-red-500 bg-red-500/10 rounded-full uppercase tracking-wider">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* CALENDAR METADATA CONTAINER */}
                  <p className="text-sm font-normal text-gray-400 flex gap-2 items-center">
                    <FaCalendar className="text-orange-500 shrink-0" />{" "}
                    <span className="truncate">{displayEventDate(event.date)}</span>
                  </p>
                  
                  {/* TIME CONSTRAINT CONTAINER */}
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <FaClock className="text-orange-500 shrink-0" />
                    <span className="truncate">
                      {formatEventStatus(event.startTime, event.endTime)}
                    </span>
                  </p>
                  
                  {/* POSITION ROUTE CONTAINER */}
                  <p className="text-sm font-normal text-gray-400 flex gap-2 items-center">
                    <FaLocationArrow className="text-orange-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </p>

                  {/* PRICING SCHEDULER MATRIX */}
                  <div className="pt-1">
                    {event.isFree ? (
                      <span className="text-green-500 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded-md">
                        Free Admission
                      </span>
                    ) : Array.isArray(event.price) ? (
                      event.price.map((priceOption, index) => (
                        <p key={index} className="text-sm font-semibold text-orange-500">
                          {priceOption.label || "Regular"}: {priceOption.currency || "₦"}{" "}
                          {Number(priceOption.amount || 0).toLocaleString()}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm font-semibold text-orange-500">
                        {event.currency || "₦"} {Number(event.price?.amount || 0).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* INTERACTIVE CONTROLS TRAY */}
                  {selectedDropdown === event.id && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2 items-center">
                      <Link
                        to={`/dashboard/organization/event/${event.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-orange-600 text-white hover:bg-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center shadow-sm"
                      >
                        Manage →
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleHighlight(event.id, event.highlighted);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          event.highlighted 
                            ? "text-yellow-400 bg-yellow-400/10" 
                            : "text-gray-500 bg-gray-100 dark:bg-zinc-800 hover:text-yellow-500"
                        }`}
                      >
                        <RiStarFill size={14} />
                      </button>
                    </div>
                  )}
                </span>

                {/* VISUAL COMPONENT PLACEMENT */}
                <OptimizedImage
                  src={event.photoURL}
                  alt={event.name}
                  className="object-cover w-28 h-28 lg:w-32 lg:h-32 shrink-0 rounded-2xl shadow-sm border border-gray-700/20 duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OrgEvent;