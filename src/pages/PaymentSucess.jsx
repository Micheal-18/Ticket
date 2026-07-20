import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCheckCircle } from "react-icons/fa";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tickets"),
      where("reference", "==", reference)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setTicket({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      } else {
        setTicket(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reference]);

  if (!reference) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-color) px-4 text-center">
        <div className="max-w-sm w-full">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
            Invalid Reference
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            No active payment reference was located in this session.
          </p>
          <Link to="/" className="inline-block mt-6 bg-(--primary) text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-transform active:scale-95">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-color) px-5 text-center">
        <div className="max-w-md w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-(--primary) mx-auto"></div>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider mt-6">
            Confirming Payment
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            Please hold while we verify your transaction and map your asset matrix.
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-color) px-5 text-center">
        <div className="max-w-md w-full border border-(--border) bg-(--surface) rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-(--primary)">
            Payment Received
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-3 leading-relaxed">
            Your payment has been completed successfully. We are now generating your access keys and ticket profiles.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-4 font-medium animate-pulse">
            This workspace updates automatically. Do not refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-color) p-4 sm:p-6">
      <div className="max-w-md w-full bg-(--surface) border border-(--border) rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-md">
        
        <FaCheckCircle className="text-green-500 text-5xl sm:text-6xl mx-auto mb-4" />

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Payment Successful 🎉
        </h1>

        <div className="mt-4 space-y-1 text-sm sm:text-base">
          <p className="text-gray-500">
            Thank you, <strong className="text-(--text-color) font-bold">{ticket.name}</strong>
          </p>
          <p className="text-gray-500 leading-snug">
            Your ticket registration for <br className="hidden sm:inline" />
            <strong className="text-(--text-color) font-bold block mt-1 text-base sm:text-lg">{ticket.eventName}</strong>
          </p>
        </div>

        {ticket.qr && (
          <div className="mt-6 sm:mt-8 p-3 bg-white border border-zinc-100 rounded-2xl inline-block shadow-inner max-w-full">
            <img
              src={`data:image/png;base64,${ticket.qr}`}
              alt="Ticket Pass QR Code"
              className="w-44 h-44 sm:w-56 sm:h-56 mx-auto object-contain max-w-full"
            />
          </div>
        )}

        <div className="mt-6 border-t border-dashed border-(--border) pt-5 space-y-1 text-xs sm:text-sm min-w-0">
          <p className="text-gray-400 uppercase font-semibold tracking-wider">
            Transaction Reference
          </p>
          <p className="font-mono break-all text-gray-600 dark:text-zinc-400 select-all px-2 bg-(--bg-color) py-1.5 rounded-lg border border-(--border)">
            {reference}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-(--primary) font-medium mt-6">
          A secure backup pass copy has been sent to your email.
        </p>

        {/* <Link
          to="/my-tickets"
          className="block mt-6 sm:mt-8 bg-(--primary) text-white rounded-xl py-3 font-semibold text-sm sm:text-base hover:bg-orange-600 active:scale-98 transition-all shadow-xs"
        >
          View My Tickets
        </Link> */}
      </div>
    </div>
  );
};

export default PaymentSuccess;