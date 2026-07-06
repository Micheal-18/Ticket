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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setTicket(snapshot.docs[0].data());
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [reference]);

  if (!reference) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Invalid Payment Reference
          </h2>
          <p className="text-gray-500 mt-2">
            No payment reference was found.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-5">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>

          <h2 className="text-xl font-semibold mt-6">
            Confirming Payment...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait while we verify your payment and generate your ticket.
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen px-5">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold">
            Payment Received
          </h2>

          <p className="text-gray-500 mt-3">
            Your payment has been received.
            We're still generating your ticket.
          </p>

          <p className="text-sm text-orange-500 mt-4">
            This page updates automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-5">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />

        <h1 className="text-3xl font-bold">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-500 mt-3">
          Thank you{" "}
          <strong>{ticket.name}</strong>
        </p>

        <p className="mt-2">
          Your ticket for
          <br />
          <strong>{ticket.eventName}</strong>
        </p>

        {ticket.qr && (
          <div className="mt-8">
            <img
              src={`data:image/png;base64,${ticket.qr}`}
              alt="QR Code"
              className="w-56 h-56 mx-auto"
            />
          </div>
        )}

        <div className="mt-6 space-y-2 text-sm">
          <p>
            <strong>Reference</strong>
          </p>

          <p className="font-mono break-all">
            {reference}
          </p>
        </div>

        <p className="text-sm text-orange-500 mt-6">
          A copy has also been sent to your email.
        </p>

        <Link
          to="/my-tickets"
          className="block mt-8 bg-orange-500 text-white rounded-lg py-3 font-semibold hover:bg-orange-600 transition"
        >
          View My Tickets
        </Link>

      </div>
    </div>
  );
};

export default PaymentSuccess;