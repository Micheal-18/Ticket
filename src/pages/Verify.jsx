// src/pages/Verify.jsx
import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { sendEmailVerification, applyActionCode } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Spinner = () => (
  <div className="flex justify-center items-center my-4">
    <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Verify = ({ email }) => {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false); // ✅ new state
  const navigate = useNavigate();

  // ✅ Prevent spamming resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // ✅ Handle direct verification link (from email)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");
    console.log("mode:", query.get("mode"));
console.log("oobCode:", query.get("oobCode"));

    if (mode === "verifyEmail" && oobCode) {
      setLoading(true);
      setStatus({ type: "", message: "Verifying your email..." });

      applyActionCode(auth, oobCode)
        .then(async () => {
          const user = auth.currentUser;
          if (user) {
            await user.reload();
            await setDoc(
              doc(db, "users", user.uid),
              { verified: true, verifiedAt: new Date().toISOString() },
              { merge: true }
            );
          }
          setVerified(true); // ✅ show success UI
          setStatus({ type: "success", message: "✅ Email verified successfully!" });
        })
        .catch((error) => {
          console.error(error);
          setStatus({
            type: "error",
            message: "❌ Verification failed. The link may be expired or invalid.",
          });
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // ✅ Auto-check if already verified
  useEffect(() => {
    const checkVerified = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setVerified(true);
        }
      }
    };
    checkVerified();
  }, []);

  const resendVerificationEmail = async () => {
    if (cooldown > 0) return;
    setStatus({ type: "", message: "" });

    try {
      const user = auth.currentUser;
      // if (!user) {
      //   setStatus({
      //     type: "error",
      //     message: "Please log in first to resend the email.",
      //   });
      //   navigate("/Login");
      //   return;
      // }

      await sendEmailVerification(user, {
        url: "http://localhost:5173/verify",
        handleCodeInApp: true,
      });

      setStatus({ type: "success", message: "📩 Verification email sent again!" });
      setCooldown(30);
    } catch (error) {
      console.error("Resend error:", error);
      setStatus({
        type: "error",
        message: "❌ Failed to resend email. Try again later.",
      });
    }
  };

  const iVerifiedAlready = async () => {
    setStatus({ type: "", message: "" });

    try {
      const user = auth.currentUser;
      // if (!user) {
      //   setStatus({ type: "error", message: "Session expired. Please log in." });
      //   navigate("/Login");
      //   return;
      // }

      await user.reload();

      if (user.emailVerified) {
        await setDoc(
          doc(db, "users", user.uid),
          { verified: true, verifiedAt: new Date().toISOString() },
          { merge: true }
        );
        setVerified(true); // ✅ show success UI
        setStatus({ type: "success", message: "✅ Email verified successfully!" });
      } else {
        setStatus({
          type: "error",
          message: "⚠️ Still not verified. Please click the link in your email.",
        });
      }
    } catch (e) {
      console.error(e);
      setStatus({
        type: "error",
        message: "❌ Could not check verification status. Try again.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 h-2 bg-green-500 rounded-l-full"></div>
        <div className="flex-1 h-2 bg-green-500"></div>
        <div className="flex-1 h-2 bg-gray-300 rounded-r-full"></div>
      </div>

      <h2 className="text-2xl font-bold text-green-600 mb-4">Almost done 🎉</h2>
      <p className="text-gray-600 mb-6">
        We sent a verification link to{" "}
        <span className="font-semibold">{email}</span>.<br />
        Please check your inbox to verify your account.<br />
        <span className="text-sm">
          ⚠️ If you don’t see it, check your Spam or Promotions folder.
        </span>
      </p>

      {/* Status + Spinner */}
      {loading && <Spinner />}
      {status.message && (
        <div
          className={`p-2 rounded mb-4 ${
            status.type === "error"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* ✅ Show Continue button if verified */}
      {verified && (
        <button
          onClick={() => navigate("/")}
          className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition"
        >
          Continue →
        </button>
      )}

      {/* Buttons (only if not yet verified) */}
      {!verified && (
        <div className="flex flex-col gap-2">
          <button
            onClick={resendVerificationEmail}
            disabled={cooldown > 0 || loading}
            className={`w-full rounded-xl py-2 active:scale-90 transition ${
              cooldown > 0 || loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
            }`}
          >
            {cooldown > 0 ? `Wait ${cooldown}s ⏳` : "📩 Resend verification email"}
          </button>

          <button
            onClick={iVerifiedAlready}
            disabled={loading}
            className="w-full bg-gray-100 rounded-xl py-2 active:scale-90 hover:bg-green-600 hover:text-white hover:scale-105 transition"
          >
            I verified already ✅
          </button>

          <button
            onClick={() => navigate("/Login")}
            className="w-full cursor-pointer underline font-bold text-sm mt-2"
          >
            Go to login
          </button>
        </div>
      )}
    </div>
  );
};

export default Verify;
