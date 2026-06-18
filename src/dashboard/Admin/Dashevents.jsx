import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import OptimizedImage from '../../components/OptimizedImage';
import { FaEllipsisV, FaCalendar, FaClock, FaLocationArrow } from 'react-icons/fa';
import { RiStarFill } from 'react-icons/ri';
import { useAdmin } from '../../hooks/useAdmin';
import DeleteModal from '../../components/DeleteModal';
import EditModal from '../../components/EditModal';
import { formatEventStatus } from '../../utils/formatEventRange';
import { Link } from 'react-router-dom';

const Dashevents = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin();
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [approvingEventId, setApprovingEventId] = useState(null);

  // Fetch events
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
      }
    };
    fetchEvents();
  }, [setEvents]);

  // Safe Date string formatter helper function 
  const displayEventDate = (dateField) => {
    if (!dateField) return "Date TBD";
    
    // If it's our composite saved layout string, split and parse the raw ISO section
    if (typeof dateField === 'string' && dateField.includes(' at ')) {
      const isoPart = dateField.split(' at ')[1];
      const parsed = new Date(isoPart);
      return isNaN(parsed.getTime()) ? dateField.split(' at ')[0] : parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
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

  // Toggle Highlight
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

  // Admin approve event
  const handleApprove = async (event) => {
    setApprovingEventId(event.id);
    try {
      const eventRef = doc(db, "events", event.id);
      let subaccountCode = "";

      /* 🛠️ FREE EVENT BYPASS: Skip Paystack subaccount initialization 
         completely if the organizer set the ticket tier to Free */
      if (!event.isFree) {
        if (!event.accountNumber || !event.bankCode) {
          throw new Error("Payout banking details are missing from this paid event registration.");
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-subaccount`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_name: event.name,
            account_number: event.accountNumber,
            bank_code: event.bankCode,
            percentage_charge: 8,
            primary_contact_email: event.organizerEmail,
            organizerId: event.ownerId,
          }),
        });

        const subaccountData = await res.json();
        if (!res.ok || !subaccountData.subaccount_code) {
          throw new Error(subaccountData.error || "Failed to generate Paystack merchant split payout handle.");
        }
        subaccountCode = subaccountData.subaccount_code;
      }

      // Update Firestore: approve event & save subaccount code if applicable
      await updateDoc(eventRef, {
        status: "approved",
        ...(subaccountCode && { subaccountCode }),
      });

      await addDoc(collection(db, "notifications"), {
        type: "event_approved",
        title: "✅ Event Approved",
        message: `Event "${event.name}" has been approved!`,
        userId: event.ownerId,
        link: `/event/${event.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Update UI state securely
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id
            ? { ...ev, status: "approved", ...(subaccountCode && { subaccountCode }) }
            : ev
        )
      );

      alert(event.isFree ? "✅ Free event approved instantly!" : "✅ Paid event approved and subaccount linked successfully!");
    } catch (err) {
      console.error("Approval flow crash:", err);
      alert("❌ Failed to approve event: " + err.message);
    } compression: {
      setApprovingEventId(null);
    }
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setIsEditing(true);
  };
  
  const handleDelete = (event) => {
    setSelectedEvent(event);
    setIsDeleting(true);
  };

  return (
    <section data-aos="fade-up" className="relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar z-10">
      {/* Delete Modal */}
      {isDeleting && selectedEvent && (
        <DeleteModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setIsDeleting={setIsDeleting}
          setEvents={setEvents}
        />
      )}
      {/* Edit Modal */}
      {isEditing && editEvent && (
        <EditModal
          currentUser={currentUser}
          editEvent={editEvent}
          setEditEvent={setEditEvent}
          setIsEditing={setIsEditing}
          events={events}
          setEvents={setEvents}
        />
      )}

      {/* Event Grid */}
      <div className="max-w-6xl mx-auto w-full px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Events</h1>
          <Link
            to="/dashboard/create"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Event
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 w-full">
          {events.map((event) => (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedDropdown(
                  selectedDropdown === event.id ? null : event.id
                );
              }}
              key={event.id}
              className="flex items-center justify-between gap-4 relative lg:px-8 px-4 w-full py-5 shadow rounded-3xl cursor-default transition-all hover:shadow-lg"
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
                </div>

                {/* 🛠️ FIXED DATE PARSING FALLBACK CONTAINER */}
                <p className="text-sm font-normal text-gray-400 flex gap-2 items-center">
                  <FaCalendar className="text-orange-500 shrink-0" />{" "}
                  <span className="truncate">{displayEventDate(event.date)}</span>
                </p>
                
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <FaClock className="text-orange-500 shrink-0" />
                  <span className="truncate">
                    {formatEventStatus(event.startTime, event.endTime)}
                  </span>
                </p>
                
                <p className="text-sm font-normal text-gray-400 flex gap-2 items-center">
                  <FaLocationArrow className="text-orange-500 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>

                {/* Pricing Rules Wrapper */}
                <div className="pt-1">
                  {event.isFree ? (
                    <span className="text-green-500 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded-md">🆓 Free Admission</span>
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

                {selectedDropdown === event.id && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(event);
                      }}
                      className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Delete
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                      className="bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleHighlight(event.id, event.highlighted);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        event.highlighted ? "text-yellow-400 bg-yellow-400/10" : "text-gray-500 bg-gray-800"
                      }`}
                    >
                      <RiStarFill size={14} />
                    </button>

                    {isAdmin && event.status !== "approved" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApprove(event);
                        }}
                        disabled={approvingEventId === event.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        {approvingEventId === event.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                  </div>
                )}
              </span>

              <OptimizedImage
                src={event.photoURL}
                alt={event.name}
                className="object-cover w-28 h-28 lg:w-32 lg:h-32 shrink-0 rounded-2xl shadow-sm border border-gray-700/20"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashevents;