import React, { useState, useRef } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const TicketScanner = () => {
  const [status, setStatus] = useState(null);
  const isProcessing = useRef(false); // prevent multiple triggers

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const handleScan = async (resultText) => {
    if (!resultText || isProcessing.current) return;

    isProcessing.current = true; // lock
    try {
      const ticketRef = doc(db, "tickets", resultText);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setStatus({ type: "error", msg: "❌ Invalid Ticket" });
        playBeep();
      } else {
        const ticket = ticketSnap.data();
        if (ticket.used) {
          setStatus({ type: "warning", msg: "⚠️ Ticket already used!" });
          playBeep();
        } else {
          await updateDoc(ticketRef, { used: true });
          setStatus({ type: "success", msg: `✅ Ticket Valid: ${resultText}` });
          playBeep();
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus({ type: "error", msg: "Server error, try again." });
      playBeep();
    } finally {
      // unlock after 2 seconds so message stays visible
      setTimeout(() => {
        isProcessing.current = false;
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 items-center">
      <h2 className="text-xl font-bold">🎟 Ticket Scanner</h2>

      {status && (
        <p
          className={`font-semibold text-lg transition-colors duration-300 ${status.type === "success"
              ? "text-green-600"
              : status.type === "warning"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
        >
          {status.msg}
        </p>
      )}

      <BarcodeScannerComponent
        width={400}
        height={400}
        onUpdate={(err, result) => {
          if (result?.text) {
            handleScan(result.text);
          }
        }}

      />

    </div>
  );
};

export default TicketScanner;
