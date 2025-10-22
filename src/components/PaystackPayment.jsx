import React from "react";
import axios from "axios";
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const PaystackPayment = ({ events, ticket, currentUser, guestEmail }) => {

  const buyerEmail = currentUser?.email || guestEmail;
  // const transactionId = `${Date.now()}_${user.uid}`;
  // const transactionRef = doc(db, "transactions", transactionId);

  const totalAmount = ticket.amount * ticket.num; // ✅ reflect quantity
  const payWithPaystack = () => {
    if (!buyerEmail) {
      alert("Please login before making a payment.");
      return;
    }


    console.log({
      email: buyerEmail,
      amount: totalAmount * 100,
      currency: "NGN",
    });

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: buyerEmail,
      amount: totalAmount * 100,

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
                  amount: ticket.amount * ticket.num,
                  number: ticket.num,
                  currency: ticket.currency,
                  userEmail: buyerEmail,
                  paymentRef: response.reference,
                  timestamp: serverTimestamp(),
            })

            const eventRef = doc(db, "events", events.id);
            await updateDoc(eventRef, {
              ticketSold: increment(ticket.num),
              revenue: increment(ticket.amount * ticket.num),
            });

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
    <button
      onClick={payWithPaystack}
      className="bg-orange-500 p-2 rounded-lg text-white active:scale-90 hover:bg-orange-600"
    >
      Pay for {ticket.label} - {ticket.currency}{Number(ticket.amount * (ticket.num || 1)).toLocaleString()}

    </button>
  );
};

export default PaystackPayment;
