import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FiX } from "react-icons/fi";
import PaystackPayment from "../components/PaystackPayment";
import { formatEventStatus } from "../utils/formatEventRange";
import OptimizedImage from "../components/OptimizedImage";
import FollowButton from "../components/FolllowButton";

const TicketModal = ({ currentUser }) => {
  const { slug } = useParams();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState();
  const [loading, setLoading] = useState(true);

  // 🧭 Fetch event data
  const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          limit(1)
        );
        console.log("Slug from URL:", slug);

        const querySnapshot = await getDocs(eventQuery);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setSelectedEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("❌ Event not found!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // 🕓 Safe date formatting
  const formatDate = (date) => {
    try {
      if (!date) return "Date not set";

      const formattedDate = date.seconds
        ? new Date(date.seconds * 1000)
        : new Date(date);

      if (isNaN(formattedDate)) return "Invalid date";

      return formattedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) return <div className="text-center p-10">Loading event...</div>;
  if (!selectedEvent) return <div className="text-center p-10">Event not found</div>;



  return (
    <div className="fixed left-0 top-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-[9999] custom-scrollbar">
      <div className="relative w-full flex justify-center items-center">
        <div className="flex flex-col  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) space-y-4 p-6 rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Close Button */}
          <div
            className="text-2xl absolute top-4 right-12 cursor-pointer hover:scale-105"
            onClick={() => window.history.back()}
          >
            <FiX />
          </div>

          {/* Event Image */}
          <div className="flex justify-center mb-4">
            <OptimizedImage
              src={selectedEvent.photoURL}
              alt={selectedEvent.name}
              className="object-contain w-1/2 hover:scale-105 duration-500 rounded-2xl"
            />
          </div>

          {/* Event Details */}
          <h2 className="text-2xl text-center uppercase font-bold mb-4">
            {selectedEvent.name}
          </h2>

          <div className="space-y-4">
            {/* Description */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Description</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.description}</p>
            </div>


            {/* Category */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Category</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.category}</p>
            </div>

            {/* Location */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Location</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.location}</p>
            </div>

            {/* Oranganizes */}

            <div className="flex justify-between items-center border-b space-y-2 border-gray-300 w-full">
              <div>
                <h1 className="uppercase font-semibold text-xl">Organized by</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.organizer}</p>
              </div>
              {currentUser?.uid !== selectedEvent?.ownerId && (
                <FollowButton
                  currentUser={currentUser}
                  currentUserId={selectedEvent?.currentUserId}
                  ownerId={selectedEvent?.ownerId}
                />
              )}
            </div>

            {/* Date & Time */}
            <div>
              <h1 className="uppercase font-semibold text-xl">Date & Time</h1>
              <p className="text-gray-400">
                {formatDate(selectedEvent.date)} |{" "}
                {formatEventStatus(selectedEvent.startTime)} →{" "}
                {formatEventStatus(selectedEvent.endTime)}
              </p>
            </div>

            {/* Ticket List */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Tickets</h1>

              {Array.isArray(selectedEvent.price) && selectedEvent.price.length > 0 ? (
                selectedEvent.price.map((ticket, index) => (
                  <div key={index} className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={ticket.num || 0}
                        onChange={(e) => {
                          const newNum = Number(e.target.value);
                          const updatedPrices = selectedEvent.price.map((t, i) =>
                            i === index ? { ...t, num: newNum } : t
                          );
                          setSelectedEvent({ ...selectedEvent, price: updatedPrices });
                        }}
                        className="p-2 border rounded-lg"
                      >
                        {number.map((number, num) => (
                          <option key={num + 1} value={num}>
                            {number}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex-1 flex lg:flex-row flex-col space-x-4 text-left p-2 border rounded-lg  active:scale-95 transition"
                      >
                        <span>
                          {ticket.label}: {ticket.currency}
                        {ticket.amount} × {ticket.num || 0} ={" "}
                        <strong>
                          {ticket.currency}
                          {ticket.amount * (ticket.num || 0) + ((1.5 / 100) * ticket.amount * (ticket.num || 0) + 100 * (ticket.num || 0))}
                        </strong>
                        </span>

                        <p>
                          includes fee of 1.5% + 100 Paystack fee = {ticket.currency}{((1.5 / 100) * ticket.amount * (ticket.num || 0) + 100 * (ticket.num || 0))}
                        </p>
                      </button>


                    </div>

                    {!currentUser && (
                      <>
                        <div className="flex space-x-2 items-center">
                          <label className="font-bold text-gray-400">Name:</label>
                          <input
                            placeholder="Name"
                            type="text"
                            className="border-2 border-gray-200 lg:w-1/2 w-full rounded-md p-3"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                          />

                        </div>

                        {/* Email user */}
                        <div className="flex space-x-2 items-center">
                          <label className="font-bold text-gray-400">Email:</label>
                          <input
                            placeholder="Email"
                            type="email"
                            className="lg:w-1/2 w-full border-2 border-gray-200 rounded-md p-3"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                          />

                        </div>

                        <div className="flex space-x-2 items-center">
                          <label className="font-bold text-gray-400">Number:</label>
                          <input
                            placeholder="Phone"
                            type="number"
                            className="border-2 border-gray-200 lg:w-1/2 w-full rounded-md p-3"
                            value={guestNumber}
                            onChange={(e) => setGuestNumber(e.target.value.trim())}
                          />

                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No tickets available</p>
              )}

            </div>


          </div>
          {/* Paystack Payment */}
          {selectedTicket && (
            <PaystackPayment
              events={selectedEvent}
              ticket={selectedTicket}
              currentUser={currentUser}
              guestEmail={guestEmail}
              guestName={guestName}
              guestNumber={guestNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
