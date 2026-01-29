// src/pages/Verify.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const Verify = ({ email }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });

  // ⏳ Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // 🔄 Auto-redirect if already verified
  useEffect(() => {
    const checkVerified = async () => {
      const user = auth.currentUser;
      if (!user) return;

      await user.reload();
      if (user.emailVerified) {
        navigate("/");
      }
    };

    checkVerified();
  }, [navigate]);

  // 📩 Resend verification email
  const resendVerificationEmail = async () => {
    if (cooldown > 0) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      setLoading(true);
      await sendEmailVerification(user);

      setStatus({
        type: "success",
        message: "📩 Verification email sent. Check your inbox.",
      });
      setCooldown(30);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "❌ Failed to resend verification email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-2xl shadow-lg p-8 text-center">
      {/* Progress */}
      <div className="flex mb-6">
        <div className="flex-1 h-2 bg-green-500 rounded-l-full" />
        <div className="flex-1 h-2 bg-green-500" />
        <div className="flex-1 h-2 bg-gray-300 rounded-r-full" />
      </div>

      <h2 className="text-2xl font-bold text-green-600 mb-4">
        Verify your email
      </h2>

      <p className="mb-6 text-sm">
        We sent a verification link to <br />
        <span className="font-semibold">{email}</span>
        <br />
        Check your inbox or spam folder.
      </p>

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

      <div className="flex flex-col gap-2">
        <button
          onClick={resendVerificationEmail}
          disabled={cooldown > 0 || loading}
          className={`w-full py-2 rounded-xl transition ${
            cooldown > 0 || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {cooldown > 0 ? `Wait ${cooldown}s ⏳` : "📩 Resend email"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="underline text-sm font-bold mt-2"
        >
          Go to login
        </button>
      </div>
    </div>
  );
};

export default Verify;
