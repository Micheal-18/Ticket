import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner"; // ✅ named export
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const TicketScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (result) => {
    if (!result) return;

    setScanResult(result);

    try {
      const ticketRef = doc(db, "tickets", result);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setError("❌ Invalid Ticket");
        return;
      }

      const ticket = ticketSnap.data();

      if (ticket.used) {
        setError("⚠️ Ticket already used!");
        return;
      }

      await updateDoc(ticketRef, { used: true });
      setError(null);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Server error, try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">🎟 Ticket Scanner</h2>

      <Scanner
        onResult={(result, error) => {
          if (!!result) handleScan(result?.text);
          if (!!error) console.warn(error);
        }}
        constraints={{ facingMode: "environment" }}
        style={{ width: "300px" }}
      />

      {scanResult && !error && (
        <p className="text-green-600 font-semibold">
          ✅ Ticket Valid: {scanResult}
        </p>
      )}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
    </div>
  );
};

export default TicketScanner;

// import React from 'react'

// const TicketScanner = () => {
//   return (
//     <div>TicketScanner</div>
//   )
// }

// export default TicketScanner