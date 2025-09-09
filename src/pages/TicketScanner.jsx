import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const TicketScanner = () => {
  const [status, setStatus] = useState(null);

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime); // beep frequency
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2); // 200ms beep
  };

  const handleScan = async (resultText) => {
    if (!resultText) return;

    try {
      const ticketRef = doc(db, "tickets", resultText);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setStatus({ type: "error", msg: "❌ Invalid Ticket" });
        playBeep();
        return;
      }

      const ticket = ticketSnap.data();

      if (ticket.used) {
        setStatus({ type: "warning", msg: "⚠️ Ticket already used!" });
        playBeep();
        return;
      }

      // Mark as used
      await updateDoc(ticketRef, { used: true });
      setStatus({ type: "success", msg: `✅ Ticket Valid: ${resultText}` });
      playBeep();
    } catch (err) {
      console.error("Verification error:", err);
      setStatus({ type: "error", msg: "Server error, try again." });
      playBeep();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">🎟 Ticket Scanner</h2>

      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (!!result) {
            handleScan(result?.text);
          }
          // Ignore constant decode errors
        }}
        style={{ width: "300px" }}
        videoStyle={{ width: "100%" }}
      />

      {status && (
        <p
          className={`font-semibold transition-colors duration-300 ${
            status.type === "success"
              ? "text-green-600"
              : status.type === "warning"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
};

export default TicketScanner;
