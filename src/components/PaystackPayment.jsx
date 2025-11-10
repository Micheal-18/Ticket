import React, { useState } from "react";
import axios from "axios";
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCheckCircle } from "react-icons/fa";

const PaystackPayment = ({ events, ticket, currentUser, guestEmail, guestName, guestNumber }) => {

  const [success, setSuccess] = useState(false)

  const buyerEmail = currentUser?.email || guestEmail;
  const buyerName = currentUser?.fullName || guestName;
  const buyerNumber = currentUser?.phone || guestNumber;
  // const transactionId = `${Date.now()}_${user.uid}`;
  // const transactionRef = doc(db, "transactions", transactionId);

  const totalAmount = ticket.amount * ticket.num; // ✅ reflect quantity
  const finalAmount = totalAmount + ((1.5 / 100) * totalAmount + 100 * (ticket.num || 0)); // ✅ include fees
  const payWithPaystack = () => {

    if (!buyerEmail || !buyerName || !buyerNumber) {
      alert("Please login before making a payment.");
      return;
    }

    console.log({
      email: buyerEmail,
      amount: finalAmount * 100,
      currency: "NGN",
    });

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: buyerEmail,
      amount: finalAmount * 100,

      callback: (response) => {
        (async () => {
          try {
            await axios.post("https://tick-backend-2.onrender.com/api/purchase", {
              reference: response.reference,
              eventId: events.id,
              email: buyerEmail,
              ticketType: ticket.label,
              ticketAmount: ticket.amount,
              ticketNumber: ticket.num,
            });

            await addDoc(collection(db, "transactions"), {
              eventId: events.id,
              eventName: events.name,
              ticketType: ticket.label,
              amount: totalAmount,
              number: ticket.num,
              currency: ticket.currency,
              userEmail: buyerEmail,
              userName: buyerName,
              userNumber: buyerNumber,
              paymentRef: response.reference,
              timestamp: serverTimestamp(),
              status: "success",
            })

            const eventRef = doc(db, "events", events.id);
            await updateDoc(eventRef, {
              ticketSold: increment(ticket.num),
              revenue: increment(totalAmount),
            });
            setSuccess(true);
            console.log("Transaction saved to Firestore ✅");
          } catch (error) {
            console.error("Error recording transaction: ", error);
          }
        })();
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });
    handler.openIframe();
  };


  return (
    <>
      {!success ? (
        <button
          onClick={payWithPaystack}
          className="bg-orange-500 p-2 rounded-lg text-white active:scale-90 hover:bg-orange-600"
        >
          Pay for {ticket.label} – {ticket.currency}
          {Number(finalAmount).toLocaleString()}
        </button>
      ) : (
        <div className="flex flex-col items-center justify-center w-full min-h-screen text-center px-4">
          <FaCheckCircle className="text-green-500 text-6xl mb-4" />
          <h1 className="font-semibold text-gray-700 text-2xl mb-2">
            Transaction Successful 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for purchasing <b>{events.name}</b>,{" "}
            {buyerName?.split(" ")[1]}!
          </p>
          <p className="text-gray-500 mt-2">
            A QR ticket has been sent to your email <b>{buyerEmail}</b>.
          </p>
        </div>
      )}
    </>
  );
};

export default PaystackPayment;
