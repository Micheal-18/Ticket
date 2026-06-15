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
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  const buyerEmail = currentUser?.email || guestEmail;
  const buyerName = currentUser?.fullName || currentUser?.name || currentUser?.displayName || guestName;

  const totalAmount = Number(ticket.amount || 0) * Number(ticket.num || 0);
  const isFreeTicket = totalAmount === 0;

  const payWithPaystack = async () => {
    if (!buyerEmail || !buyerName) {
      alert("Please login or fill guest details.");
      return;
    }

    if (!ticket?.num || ticket.num <= 0) {
      alert("Please select ticket quantity");
      return;
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
          userId: currentUser?.uid || null
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
  if (!reference || !buyerEmail) return;

  const standardizedEmail = buyerEmail.toLowerCase().trim();

  // We query the collection, forcing the engine to evaluate the email field
  const q = query(
    collection(db, "tickets"),
    where("reference", "==", reference),
    where("userId", "==", currentUser.uid)
  );

  const unsub = onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      setTicketData(docData);
      setSuccess(true);
      setLoading(false);
    }
  }, (error) => {
    console.error("❌ Live-sync validation error dropped:", error);

  });

  return () => unsub();
}, [reference, buyerEmail]);

  if (success && ticketData) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-6 text-center border border-green-500/20 rounded-2xl bg-green-500/5 mt-2 transition-all duration-300">
        <FaCheckCircle className="text-green-500 text-4xl mb-2" />
        <h1 className="font-bold  text-xl mb-1">
          {isFreeTicket ? "Registration Successful 🎉" : "Transaction Successful 🎉"}
        </h1>
        <p className="text-sm text-gray-500">
          Thank you for processing access to <b>{events.name}</b>,{" "}
          {buyerName?.split(" ")[0] || "Guest"}!
        </p>
        <p className="text-xs text-orange-500 mt-1 font-medium">
          Your QR entrance pass has been sent to <b>{buyerEmail}</b>
        </p>

        {/* QR preview frame rendering config */}
        {ticketData.qr && (
          <div className="mt-4 p-2  rounded-xl shadow-sm flex flex-col items-center">
            <img
              src={`data:image/png;base64,${ticketData.qr}`}
              alt="Ticket QR"
              className="w-40 h-40 object-contain"
            />
            <span className="text-[10px] font-mono  mt-2 block">
              REF: {reference?.substring(0, 12)}
            </span>
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