// src/pages/Verify.jsx
import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Verify = ({
  email,
  setStep: controlledSetStep,
  error: controlledError,
  setError: controlledSetError,
  resendMessage: controlledResendMessage,
  setResendMessage: controlledSetResendMessage,
}) => {
  // fallback local states if parent didn't pass them
  const [localError, setLocalError] = useState("");
  const [localResendMessage, setLocalResendMessage] = useState("");
  const navigate = useNavigate()

  const setStep = controlledSetStep ?? (() => {});
  const error = controlledError ?? localError;
  const setError = controlledSetError ?? setLocalError;
  const resendMessage = controlledResendMessage ?? localResendMessage;
  const setResendMessage = controlledSetResendMessage ?? setLocalResendMessage;

  const resendVerificationEmail = async () => {
    setResendMessage("");
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setResendMessage("Please log in first to resend the email.");
        setStep("login");
        return;
      }
      await sendEmailVerification(user, {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      });
      setResendMessage("📩 Verification email sent again!");
    } catch (error) {
      console.error("Resend error:", error);
      setResendMessage("❌ Failed to resend email. Try again later.");
    }
  };

  const iVerifiedAlready = async () => {
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Session expired. Please log in.");
       navigate("/Login");
        return;
      }
      await user.reload();
      if (user.emailVerified) {
        // mark Firestore
        try {
          await setDoc(doc(db, "users", user.uid), { verified: true }, { merge: true });
        } catch (e) {
          /* ignore */
        }
        navigate("/");
      } else {
        setError("Still not verified. Please click the link in your email.");
      }
    } catch (e) {
      console.error(e);
      setError("Could not check verification status. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Almost done 🎉</h2>
      <p className="text-gray-600 mb-6">
        We sent a verification link to <span className="font-semibold">{email}</span>.
        <br /> Please check your inbox to verify your account.
        <br /> “⚠️ If you don’t see the verification email, please check your Spam or Promotions folder.”
      </p>

      {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</div>}
      {resendMessage && <p className="text-sm text-green-600 mb-2">{resendMessage}</p>}

      <div className="flex flex-col gap-2">
        <button
          onClick={resendVerificationEmail}
          className="w-full bg-orange-500 text-white rounded-xl py-2 hover:scale-105 transition"
        >
          📩 Resend verification email
        </button>
        <button
          onClick={iVerifiedAlready}
          className="w-full bg-gray-100 rounded-xl py-2 hover:scale-105 transition"
        >
          I verified already ✅
        </button>
        <button onClick={() => navigate("/Login")} className="w-full cursor-pointer underline font-bold text-sm mt-2">
          Go to login
        </button>
      </div>
    </div>
  );
};

export default Verify;
