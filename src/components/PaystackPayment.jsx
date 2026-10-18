import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, onSnapshot, query, where, limit, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCheckCircle } from "react-icons/fa";

const PaystackPayment = ({
  event,
  events,
  ticket,
  currentUser,
  guestEmail,
  guestName,
  guestNumber,
  attendees = [],
  ticketItems = [],
}) => {
  const eventData = event || events;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [showAttendees, setShowAttendees] = useState(false);

  const buyerEmail = currentUser?.email || guestEmail;
  const buyerName = currentUser?.fullName || currentUser?.name || currentUser?.displayName || guestName;

  const orderItems = ticketItems.length
    ? ticketItems
    : [{
        ...ticket,
        ticketId: ticket.id,
        ticketName: ticket.name,
        ticketType: ticket.type,
        ticketCurrency: ticket.currency,
        ticketPrice: ticket.price,
        quantity: Number(ticket.num || 0),
        availableQuantity: ticket.quantity,
        attendees: attendees.slice(0, Number(ticket.num || 0)),
      }];
  const totalQuantity = orderItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );
  const totalAmount = orderItems.reduce(
    (total, item) =>
      total + Number(item.ticketPrice ?? item.price ?? 0) * Number(item.quantity || 0),
    0
  );
  const isFreeTicket = totalAmount === 0;

const purchaserTicket = Array.isArray(ticketData)
  ? ticketData.find(t => t.isBuyer)
  : ticketData;

const attendeeTickets = Array.isArray(ticketData)
  ? ticketData.filter(t => !t.isBuyer)
  : [];

  const currencySymbols = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
};

const currency = orderItems[0]?.ticketCurrency || orderItems[0]?.currency || ticket.currency;
const symbol = currencySymbols[currency] || currency || "₦";

  const payWithPaystack = async () => {
    if (!buyerEmail || !buyerName) {
      alert("Please login or fill guest details.");
      return;
    }

    if (!totalQuantity || orderItems.some(item => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) {
      alert("Please select ticket quantity");
      return;
    }

    const itemCurrencies = orderItems.map(item => item.ticketCurrency || item.currency);
    if (itemCurrencies.some(itemCurrency => itemCurrency !== itemCurrencies[0])) {
      alert("Tickets with different currencies must be purchased separately.");
      return;
    }

    if (totalAmount > 0 && orderItems.some(item => Number(item.ticketPrice ?? item.price ?? 0) <= 0)) {
      alert("Free and paid tickets must be purchased separately.");
      return;
    }

    const attendeesPayload = [];
    for (const item of orderItems) {
      const quantity = Number(item.quantity);
      const itemAttendees = (item.attendees || []).slice(0, quantity);

      if (itemAttendees.length !== quantity) {
        alert(`Please enter details for all ${quantity} ${item.ticketName || item.name} attendee(s).`);
        return;
      }

      if (quantity > 10) {
        alert(`Maximum 10 ${item.ticketName || item.name} ticket(s) per purchase.`);
        return;
      }

      const remaining = item.availableQuantity == null
        ? Infinity
        : Number(item.availableQuantity)
        - Number(item.sold || 0);
      if (Number.isFinite(remaining) && (remaining <= 0 || quantity > remaining)) {
        alert(remaining <= 0 ? `${item.ticketName || item.name} is sold out.` : `Only ${remaining} ${item.ticketName || item.name} ticket(s) remaining.`);
        return;
      }

      const validItemAttendees = itemAttendees.every(
        attendee =>
          attendee?.name?.trim() &&
          attendee?.email?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email.trim())
      );
      if (!validItemAttendees) {
        alert(`Please enter a valid name and email for every ${item.ticketName || item.name} attendee.`);
        return;
      }

      attendeesPayload.push(...itemAttendees.map(attendee => ({
        name: attendee.name.trim(),
        email: attendee.email.trim(),
        ticketId: item.ticketId || item.id,
        isBuyer: attendee.isBuyer === true,
      })));
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/init-payment`,
        {
          email: buyerEmail,
          name: buyerName,
          eventId: eventData.id,
          ticketId: orderItems[0].ticketId || orderItems[0].id,
          ticketName: orderItems[0].ticketName || orderItems[0].name,
          ticketCurrency: itemCurrencies[0],
          ticketType: orderItems[0].ticketType || orderItems[0].type,
          ticketQuantity: totalQuantity,
          ticketPrice: orderItems[0].ticketPrice ?? orderItems[0].price,
          ticketItems: orderItems.map(item => ({
            ticketId: item.ticketId || item.id,
            quantity: Number(item.quantity),
            attendees: (item.attendees || []).slice(0, Number(item.quantity)),
          })),
          userId: currentUser?.uid || null,
          attendees: attendeesPayload
        }
      );

      setReference(res.data.reference);

      if (res.data.isFree || isFreeTicket) {
        console.log("Free pass registered. Waiting for live confirmation sync...");
      } else if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error("Payment initialization did not return a valid checkout URL.");
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
const constraints = [
  where("reference", "==", reference),
];

if (currentUser?.uid) {
  constraints.push(
    where("userId", "==", currentUser.uid)
  );
}

const q = query(
  collection(db, "tickets"),
  ...constraints
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
  const isMultiple = attendeeTickets.length > 0 || !purchaserTicket;

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 text-center border border-(--success)/30 rounded-2xl bg-(--success)/5 mt-2 transition-all duration-300 text-(--text-color)">
      <FaCheckCircle className="text-(--success) text-4xl mb-2" />

      <h1 className="font-bold text-xl mb-1">
        {isFreeTicket
          ? "Registration Successful 🎉"
          : "Payment Successful 🎉"}
      </h1>

      <p className="text-sm text-(--text-secondary)">
        Thank you for registering for <b>{eventData.name}</b>
      </p>

      <p className="text-xs text-(--primary) mt-1 font-medium">
        {isMultiple ? (
          <>
            <b>{ticketData.length}</b> attendee ticket(s) have been generated
            and emailed to their holders.
          </>
        ) : (
          <>
            Your entrance pass has been sent to <b>{buyerEmail}</b>
          </>
        )}
      </p>

      {purchaserTicket && (
        <div className="mt-6 w-full">
          <h3 className="font-semibold mb-3 text-lg">Your Ticket</h3>

          <div className="p-4 rounded-xl shadow-sm flex flex-col items-center bg-(--surface) border border-(--border) text-(--text-color)">
            <p className="text-(--primary) font-semibold mb-2">
              {purchaserTicket.buyerName}
            </p>

            {purchaserTicket.qr && (
              <img
                src={`data:image/png;base64,${purchaserTicket.qr}`}
                alt="Your Ticket"
                className="w-40 h-40 object-contain"
              />
            )}

            <span className="text-[11px] font-mono mt-2 text-(--text-muted) break-all">
              {purchaserTicket.id}
            </span>
          </div>
        </div>
      )}

      {attendeeTickets.length > 0 && (
        <div className="w-full mt-6">
          <h3 className="font-semibold mb-3 text-lg">
            {purchaserTicket ? "Attendee Tickets" : "Tickets for your attendees"}
          </h3>
          <p className="text-sm text-(--text-secondary)">
            {attendeeTickets.length} attendee ticket{attendeeTickets.length === 1 ? " has" : "s have"} been generated and emailed.
          </p>

          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="mt-4 bg-(--primary) hover:bg-(--primary-hover) transition text-white px-5 py-2 rounded-lg font-semibold"
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
                  className="p-4 rounded-xl shadow-sm flex flex-col items-center bg-(--surface) border border-(--border) text-(--text-color)"
                >
                  <p className="text-(--primary) font-semibold">
                    Attendee #{index + 1}
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

                  <span className="text-[11px] font-mono mt-2 text-(--text-muted) break-all">
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
      className="bg-(--primary) w-full p-3 rounded-xl text-white font-medium tracking-wide active:scale-95 hover:bg-(--primary-hover) disabled:opacity-60 transition"
    >
      {loading
        ? "Processing..."
        : isFreeTicket
        ? `Claim ${totalQuantity} Free Ticket${totalQuantity === 1 ? "" : "s"}`
        : `Pay for ${totalQuantity} ticket${totalQuantity === 1 ? "" : "s"} – ${symbol}${Number(totalAmount).toLocaleString()}`}
    </button>
  );
};

export default PaystackPayment;