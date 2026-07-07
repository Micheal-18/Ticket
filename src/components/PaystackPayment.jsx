import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, onSnapshot, query, where, limit, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCheckCircle } from "react-icons/fa";

const PaystackPayment = ({
  events,
  ticket,
  currentUser,
  guestEmail,
  guestName,
  guestNumber,
  attendees = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  const buyerEmail = currentUser?.email || guestEmail;
  const buyerName = currentUser?.fullName || currentUser?.name || currentUser?.displayName || guestName;

  const totalAmount = Number(ticket.amount || 0) * Number(ticket.num || 0);
  const isFreeTicket = totalAmount === 0;

  const [showAttendees, setShowAttendees] = useState(false);

const purchaserTicket = Array.isArray(ticketData)
  ? ticketData.find(t => t.isBuyer)
  : ticketData;

const attendeeTickets = Array.isArray(ticketData)
  ? ticketData.filter(t => !t.isBuyer)
  : [];

  const payWithPaystack = async () => {
    if (!buyerEmail || !buyerName) {
      alert("Please login or fill guest details.");
      return;
    }

    if (!ticket?.num || ticket.num <= 0) {
      alert("Please select ticket quantity");
      return;
    }

    // FIX HERE: Always initialize attendeesPayload with the buyer included
  let attendeesPayload = [
    {
      name: buyerName,
      email: buyerEmail,
      isBuyer: true,
    }
  ];


    // Validate attendee emails if multiple tickets
    if (ticket.num > 1) {

    if (attendees.length !== ticket.num - 1) {
        alert("Please complete all attendee details.");
        return;
    }

    const valid = attendees.every(
        attendee =>
            attendee.name?.trim() &&
            attendee.email?.trim()
    );

    if (!valid) {
        alert("Please complete all attendee details.");
        return;
    }

// Append additional entries safely
    attendeesPayload = [
      ...attendeesPayload,
      ...attendees.map(a => ({
        ...a,
        isBuyer: false,
      })),
    ];
  }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/init-payment`,
        {
          email: buyerEmail,
          name: buyerName,
          eventId: events.id,
          ticketLabel: ticket.label,
          ticketNumber: ticket.num,
          userId: currentUser?.uid || null,
          attendees: attendeesPayload // Send attendee list if multiple
        }
      );

      setReference(res.data.reference);

      if (res.data.isFree || isFreeTicket) {
        console.log("Free pass registered. Waiting for live confirmation sync...");
      } else if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error("Invalid backend routing execution parameter mapping layout.");
      }
    } catch (err) {
      console.error("Ticket registration failed:", err.response?.data || err);
      alert(err.response?.data?.error || "Unable to complete registration configuration.");
      setLoading(false);
    }
  };

// Listen for ticket creation in Firestore
useEffect(() => {
  if (!reference) return;

  // Query: find all tickets with this reference (one per attendee)
  const q = query(
    collection(db, "tickets"),
    where("reference", "==", reference),
    where("userId", "==", currentUser.uid)
  );

  const unsub = onSnapshot(q, (snap) => {
    if (!snap.empty) {
      // Collect ALL tickets (one per attendee)
      const allTickets = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTicketData(allTickets);
      setSuccess(true);
      setLoading(false);
    }
  }, (error) => {
    console.error("❌ Live-sync validation error:", error);
  });

  return () => unsub();
}, [reference]);

if (success && ticketData) {
  const isMultiple = attendeeTickets.length > 0;

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 text-center border border-green-500/20 rounded-2xl bg-green-500/5 mt-2 transition-all duration-300">
      <FaCheckCircle className="text-green-500 text-4xl mb-2" />

      <h1 className="font-bold text-xl mb-1">
        {isFreeTicket
          ? "Registration Successful 🎉"
          : "Payment Successful 🎉"}
      </h1>

      <p className="text-sm text-gray-500">
        Thank you for registering for <b>{events.name}</b>
      </p>

      <p className="text-xs text-orange-500 mt-1 font-medium">
        {isMultiple ? (
          <>
            Your ticket has been generated and{" "}
            <b>{attendeeTickets.length}</b>{" "}
            attendee ticket(s) have also been emailed.
          </>
        ) : (
          <>
            Your entrance pass has been sent to{" "}
            <b>{buyerEmail}</b>
          </>
        )}
      </p>

      {/* Purchaser Ticket */}
      <div className="mt-6 w-full">
        <h3 className="font-semibold mb-3 text-lg">
          Your Ticket
        </h3>

        {purchaserTicket && (
          <div className="p-4 rounded-xl shadow-sm flex flex-col items-center bg-gray-900/20 border border-gray-700/30">

            <p className="text-orange-400 font-semibold mb-2">
              {purchaserTicket.buyerName}
            </p>

            {purchaserTicket.qr && (
              <img
                src={`data:image/png;base64,${purchaserTicket.qr}`}
                alt="Your Ticket"
                className="w-40 h-40 object-contain"
              />
            )}

            <span className="text-[11px] font-mono mt-2 text-gray-400 break-all">
              {purchaserTicket.id}
            </span>
          </div>
        )}
      </div>

      {/* Attendee Tickets */}
      {attendeeTickets.length > 0 && (
        <div className="w-full mt-6">

          <p className="text-sm text-gray-400">
            {attendeeTickets.length} attendee ticket
            {attendeeTickets.length > 1 ? "s have" : " has"} also been
            generated and emailed.
          </p>

          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="mt-4 bg-orange-500 hover:bg-orange-600 transition text-white px-5 py-2 rounded-lg font-semibold"
          >
            {showAttendees
              ? "Hide Attendee Tickets"
              : `View ${attendeeTickets.length} Attendee Ticket${
                  attendeeTickets.length > 1 ? "s" : ""
                }`}
          </button>

          {showAttendees && (
            <div className="space-y-4 mt-5">

              {attendeeTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl shadow-sm flex flex-col items-center bg-gray-900/20 border border-gray-700/30"
                >
                  <p className="text-orange-400 font-semibold">
                    Attendee #{index + 2}
                  </p>

                  <p className="text-sm mb-2">
                    {ticket.buyerName}
                  </p>

                  {ticket.qr && (
                    <img
                      src={`data:image/png;base64,${ticket.qr}`}
                      alt={ticket.buyerName}
                      className="w-36 h-36 object-contain"
                    />
                  )}

                  <span className="text-[11px] font-mono mt-2 text-gray-400 break-all">
                    {ticket.id}
                  </span>
                </div>
              ))}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
  return (
    <button
      disabled={loading}
      onClick={payWithPaystack}
      className="bg-orange-500 p-2 rounded-lg text-white font-medium tracking-wide active:scale-90 hover:bg-orange-600 disabled:opacity-60 transition"
    >
      {loading
        ? "Processing..."
        : isFreeTicket
        ? `Claim Free Ticket (${ticket.num})`
        : `Pay for ${ticket.label} – ${ticket.currency || "₦"}${Number(totalAmount).toLocaleString()}`}
    </button>
  );
};

export default PaystackPayment;