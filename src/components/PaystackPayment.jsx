import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
  const buyerName = currentUser?.fullName || guestName;
  const buyerNumber = currentUser?.phone || guestNumber;

  const totalAmount = ticket.amount * ticket.num;

  const payWithPaystack = async () => {
    if (!buyerEmail || !buyerName || !buyerNumber) {
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
        }
      );
      console.log(events.id);
      console.log(events);
      
      

      setReference(res.data.reference);

      // Redirect to Paystack
      window.location.href = res.data.authorization_url;
    } catch (err) {
      console.error("Payment init failed:", err.response?.data || err);
      alert("Unable to start payment");
      setLoading(false);
    }
  };

  // Listen for ticket creation in Firestore
  useEffect(() => {
    if (!reference) return;

    const q = query(
      collection(db, "tickets"),
      where("reference", "==", reference)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setTicketData(docData);
        setSuccess(true);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [reference]);

  if (success && ticketData) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen text-center px-4">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="font-semibold text-gray-600 text-2xl mb-2">
          Transaction Successful 🎉
        </h1>
        <p className="text-gray-600 text-lg">
          Thank you for purchasing <b>{events.name}</b>,{" "}
          {buyerName?.split(" ")[1] || buyerName}!
        </p>
        <p className="text-gray-500 mt-2">
          Your QR ticket has been sent to <b>{buyerEmail}</b>
        </p>

        {/* Optional QR preview */}
        {ticketData.qr && (
          <img
            src={`data:image/png;base64,${ticketData.qr}`}
            alt="Ticket QR"
            className="w-48 h-48 mt-4 rounded-xl shadow-md"
          />
        )}
      </div>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={payWithPaystack}
      className="bg-orange-500 p-2 rounded-lg text-white active:scale-90 hover:bg-orange-600 disabled:opacity-60"
    >
      {loading
        ? "Processing payment..."
        : `Pay for ${ticket.label} – ${ticket.currency}${Number(totalAmount).toLocaleString()}`}
    </button>
  );
};

export default PaystackPayment;
