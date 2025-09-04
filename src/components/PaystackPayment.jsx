/* src/components/PaystackPayment.jsx */
import React from "react";
import axios from "axios";
// import purchase from "../api/purchase";

const PaystackPayment = ({ events, currentUser }) => {
  const payWithPaystack = () => {
    if (!currentUser || !currentUser.email) {
      alert("Please login before making a payment.");
      return;
    }

     console.log({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: currentUser?.email,
          amount: Number(events.price) * 100,
          currency: "NGN",
        });

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: currentUser?.email,
      // method: "paystack",
      amount: Number(events.price) * 100,
      // currency: "NGN",
      
      callback: function (response) {
        axios.post("http://localhost:3000/api/purchase", {
          reference: response.reference,
          eventId: events.id,
          email: currentUser.email,
          ticketType: events.title,
        });
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
      className="bg-orange-500 p-2 rounded-lg text-white hover:scale-105"
    >
      Buy Ticket
    </button>
  );
};

export default PaystackPayment;
