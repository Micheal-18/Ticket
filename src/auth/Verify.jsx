import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { sendEmailVerification, applyActionCode } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { SiEagle } from "react-icons/si";

const Verify = ({ email, currentUser }) => {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      handleEmailLink(oobCode);
    }
  }, []);

  const continueAuth = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const user = auth.currentUser;
      if (!user) {
        if (verified) {
          navigate("/login", { replace: true });
          return;
        }
        setStatus({ type: "error", message: "Session expired. Please log in again." });
        return;
      }

      await user.reload();

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          verified: true,
          verifiedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.isAdmin === true) {
          navigate("/dashboard", { replace: true });
        } else if (userData.accountType === "organization") {
          navigate("/dashboard/organization", { replace: true });
        } else {
          navigate("/dashboard/users", { replace: true });
        }
      } else {
        setStatus({ type: "error", message: "Profile data not found. Try logging in again." });
      }
    } catch (e) {
      console.error("Redirect Error:", e);
      setStatus({ type: "error", message: "Error synchronizing session. Please try again." });
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
        await setDoc(
          doc(db, "users", user.uid),
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
        url: window.location.href,
      });

      setStatus({ type: "success", message: "📩 Verification email sent again!" });
      setCooldown(60);
    } catch (error) {
      setStatus({ type: "error", message: "❌ Failed to send email. Try again later." });
    } finally {
      setLoading(false);
    }
  };

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
        await setDoc(
          doc(db, "users", user.uid),
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
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--login-page-bg)] px-4 py-10 text-[var(--login-text)]">
      <div className="auth-bg-grid absolute inset-0 opacity-60" />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--login-panel-border)] bg-[var(--login-panel-bg)] shadow-[0_30px_80px_var(--login-panel-shadow)] backdrop-blur-xl">
        <div className="bg-[var(--login-side-bg)] p-8 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
            <SiEagle className="text-3xl" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--login-side-caption)]">Account protection</p>
          <h2 className="mt-3 text-3xl font-black leading-tight">
            {verified ? "All set!" : "Almost done"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--login-side-copy)]">
            {verified
              ? "Your email has been verified and your Airticks account is ready to continue."
              : "We sent a confirmation link to your inbox to secure your account and unlock access."}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-2">
            <div className="h-2 flex-1 rounded-full bg-[var(--login-brand)]" />
            <div className="h-2 flex-1 rounded-full bg-[var(--login-brand)]" />
            <div className="h-2 flex-1 rounded-full bg-[var(--login-divider)]" />
          </div>

          <p className="mb-6 text-center text-sm leading-6 text-[var(--login-subtitle)]">
            {verified
              ? "Your account is verified. You can now continue to the app."
              : <>A verification email was sent to <span className="font-semibold text-[var(--login-text)]">{email || "your email"}</span>. Check your inbox or spam folder.</>}
          </p>

          {loading && (
            <div className="mb-4 flex items-center justify-center gap-3 rounded-xl border border-[var(--login-divider)] bg-[var(--login-input-bg)] px-4 py-3 text-sm text-[var(--login-subtitle)]">
              <span className="loading"></span>
              <span>Processing...</span>
            </div>
          )}

          {status.message && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
                status.type === "error"
                  ? "border-[var(--login-error-border)] bg-[var(--login-error-bg)] text-[var(--login-error-text)]"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {status.message}
            </div>
          )}

          {verified ? (
            <button
              onClick={continueAuth}
              className="w-full rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_30px_rgba(245,158,11,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_35px_rgba(245,158,11,0.4)]"
            >
              Continue →
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={resendVerificationEmail}
                disabled={cooldown > 0 || loading}
                className={`w-full rounded-2xl px-4 py-3.5 text-base font-semibold transition ${
                  cooldown > 0 || loading
                    ? "cursor-not-allowed bg-[var(--login-divider)] text-[var(--login-muted)]"
                    : "bg-[var(--login-brand)] text-white shadow-[0_12px_25px_rgba(245,158,11,0.25)] hover:brightness-110"
                }`}
              >
                {cooldown > 0 ? `Wait ${cooldown}s ⏳` : "📩 Resend email"}
              </button>

              <button
                onClick={iVerifiedAlready}
                disabled={loading}
                className="w-full rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-base font-semibold text-[var(--login-text)] transition hover:border-[var(--login-brand)] hover:text-[var(--login-brand)]"
              >
                I verified already ✅
              </button>

              <button
                onClick={() => navigate("/Login")}
                className="text-sm font-medium text-[var(--login-muted)] underline-offset-4 transition hover:text-[var(--login-brand)]"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Verify;