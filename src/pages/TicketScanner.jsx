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

    isProcessing.current = true;
    try {
      // 1. Call your Backend instead of Firestore directly
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tickets/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Assuming you have the user's Firebase token
          "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ ticketId: resultText }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This handles "Already Used" or "Invalid" from your backend
        setStatus({ type: "error", msg: data.error || "❌ Verification Failed" });
        playBeep();
      } else {
        // Success!
        setStatus({ 
            type: "success", 
            msg: `✅ ${data.buyerName} Verified for ${data.eventName}` 
        });
        playBeep();
      }
    } catch (err) {
      console.error("Network error:", err);
      setStatus({ type: "error", msg: "Connection error, try again." });
      playBeep();
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 3000); // 3 seconds gives the operator time to read the name
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center">
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
