import React from "react";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

const PaystackPayment = ({ events, ticket, currentUser }) => {

  
  const payWithPaystack = () => {
    if (!currentUser || !currentUser.email) {
      alert("Please login before making a payment.");
      return;
    }

    console.log({
      email: currentUser?.email,
      amount: ticket?.amount * 100,
      currency: "NGN",
    });

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: currentUser?.email,
      amount: ticket?.amount * 100,

      callback:(response) =>  {
        (async () => {
        try {
          axios.post("https://tick-backend-2.onrender.com/api/purchase", {
            reference: response.reference,
            eventId: events.id,
            email: currentUser.email,
            ticketType: ticket.label,
            ticketAmount: ticket.amount
          });

      //     await addDoc(collection(db, "transactions"), {
      //       eventId: events.id,
      //       eventName: events.name,
      //       ticketType: ticket.label,
      //       amount: ticket.amount,
      //       currency: ticket.currency,
      //       userEmail: currentUser.email,
      //       paymentRef: response.reference,
      //       timestamp: new Date(),
      // })
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
      Pay for {ticket.label} - {ticket.currency}{Number(ticket.amount).toLocaleString()}

    </button>
  );
};

export default PaystackPayment;
