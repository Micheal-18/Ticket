import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { sendEmailVerification, applyActionCode } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const Verify = ({ email, currentUser }) => {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  // 1. Handle Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 2. Handle Email Link Logic (on mount)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      handleEmailLink(oobCode);
    }
  }, []);

const continueAuth = async () => {
  setLoading(true);
  setStatus({ type: "", message: "" }); // Clear previous errors

  try {
    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    // 1. Fetch fresh data from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // 2. Routing Logic
      if (userData.isAdmin === true) {
        navigate("/dashboard");
      } else if (userData.accountType === "organization") {
        navigate("/dashboard/organization");
      } else {
        navigate("/");
      }
    } else {
      // If doc doesn't exist yet, they might need to wait a second or re-login
      setStatus({ type: "error", message: "Profile not found. Try logging in again." });
    }
  } catch (e) {
    console.error("Redirect Error:", e);
    setStatus({ type: "error", message: "Error redirecting. Please try logging in." });
  } finally {
    setLoading(false);
  }
};

  const handleEmailLink = async (oobCode) => {
    setLoading(true);
    setStatus({ type: "", message: "Verifying your email..." });

    try {
      await applyActionCode(auth, oobCode);
      
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        await setDoc(doc(db, "users", user.uid), 
          { verified: true, verifiedAt: new Date().toISOString() }, 
          { merge: true }
        );
      }
      
      setVerified(true);
      setStatus({ type: "success", message: "✅ Email verified successfully!" });
    } catch (error) {
      setStatus({
        type: "error",
        message: "❌ Link expired or already used. Please request a new one.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend Email Logic
  const resendVerificationEmail = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setStatus({ type: "error", message: "Session expired. Please log in again." });
        return;
      }

      await sendEmailVerification(user, {
        url: window.location.href, // Returns user back to this exact page
      });

      setStatus({ type: "success", message: "📩 Verification email sent again!" });
      setCooldown(60); // standard 60s cooldown
    } catch (error) {
      setStatus({ type: "error", message: "❌ Failed to send email. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  // 4. Manual Check Logic
  const iVerifiedAlready = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const user = auth.currentUser;
      if (!user) {
        setStatus({ type: "error", message: "Please log in to check status." });
        return;
      }

      await user.reload();
      if (user.emailVerified) {
        await setDoc(doc(db, "users", user.uid),
          { verified: true, verifiedAt: new Date().toISOString() },
          { merge: true }
        );
        setVerified(true);
        setStatus({ type: "success", message: "✅ Email verified!" });
      } else {
        setStatus({ type: "error", message: "⚠️ Still not verified. Check your inbox." });
      }
    } catch (e) {
      setStatus({ type: "error", message: "❌ Could not check status. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 rounded-2xl shadow-lg p-8 text-center ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 h-2 bg-green-500 rounded-l-full"></div>
        <div className="flex-1 h-2 bg-green-500"></div>
        <div className="flex-1 h-2 bg-gray-300 rounded-r-full"></div>
      </div>

      <h2 className="text-2xl font-bold text-green-600 mb-4">
        {verified ? "All set! 🎉" : "Almost done 🎉"}
      </h2>
      
      <p className="adaptive-text mb-6">
        {verified 
          ? "Your account is verified. You can now continue to the app." 
          : <>We sent a verification link to <span className="font-semibold">{email || "your email"}</span>. Please check your inbox.</>
        }
      </p>

      {loading && <Spinner />}
      
      {status.message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${status.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          {status.message}
        </div>
      )}

      {verified ? (
        <button
          onClick={continueAuth}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition font-bold"
        >
          Continue →
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={resendVerificationEmail}
            disabled={cooldown > 0 || loading}
            className={`w-full rounded-xl py-3 transition font-semibold ${
              cooldown > 0 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {cooldown > 0 ? `Wait ${cooldown}s ⏳` : "📩 Resend email"}
          </button>

          <button
            onClick={iVerifiedAlready}
            disabled={loading}
            className="w-full rounded-xl py-3 hover:bg-green-600 transition font-semibold"
          >
            I verified already ✅
          </button>

          <button
            onClick={() => navigate("/Login")}
            className="text-sm underline text-gray-400 hover:text-orange-500"
          >
            Back to login
          </button>
        </div>
      )}
    </div>
  );
};

export default Verify;