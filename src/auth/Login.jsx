import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase/firebase';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaTicketSimple } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
import GoogleAuth from './GoogleAuth';
import { SiEagle } from 'react-icons/si';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snapshot, setSnapshot] = useState({ count: 0, change: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        const ticketSnap = await getDocs(collection(db, 'tickets'));
        const tickets = ticketSnap.docs.map((doc) => doc.data());

        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

        let soldThisWeek = 0;
        tickets.forEach((ticket) => {
          const created = ticket.createdAt;
          const createdDate = created?.toDate ? created.toDate() : new Date(created || Date.now());
          if (!Number.isNaN(createdDate.getTime()) && now - createdDate.getTime() <= oneWeekMs) {
            soldThisWeek += 1;
          }
        });

        const totalCount = tickets.length || 0;
        const change = totalCount > 0 ? Math.min(99, Math.round((soldThisWeek / totalCount) * 100)) : 0;

        setSnapshot({
          count: soldThisWeek || totalCount || 0,
          change,
        });
      } catch (err) {
        console.error('Unable to load tickets snapshot:', err);
        setSnapshot({ count: 0, change: 0 });
      }
    };

    loadSnapshot();
  }, []);

  const handleNavigationRedirect = (userData) => {
    let redirect = "/dashboard/users";
    if (userData.isAdmin) redirect = "/dashboard";
    else if (userData.accountType === "organization") redirect = "/dashboard/organization";

    navigate("/welcome", {
      state: {
        userData: userData,
        redirectTo: redirect,
      },
      replace: true,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    setLoginLoading(true);
    setError("");

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setError("⚠️ Please verify your email before logging in.");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      handleNavigationRedirect(userSnap.data());
    } catch (error) {
      setError(error.code === "auth/user-not-found" ? "User not found." : error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--login-page-bg)] px-4 py-10 text-[var(--login-text)]">
      <div className="auth-bg-grid absolute inset-0 opacity-60" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--login-panel-border)] bg-[var(--login-panel-bg)] shadow-[0_30px_80px_var(--login-panel-shadow)] backdrop-blur-xl">
        <div className="hidden items-center justify-center bg-[var(--login-side-bg)] p-8 lg:flex lg:w-[440px] lg:flex-col">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15  shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
            <SiEagle className="text-3xl" />
          </div>

          <div className="max-w-sm text-center ">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-[var(--login-side-caption)]">Ticketing made easy</p>
            <h2 className="text-4xl font-black leading-tight">
              Welcome back to <span className="text-[var(--login-brand-soft)]">Airticks</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--login-side-copy)]">
              Discover live events, manage bookings, and stay connected with your community in one place.
            </p>
          </div>

          <div className="mt-10 w-full max-w-xs rounded-2xl border border-[var(--login-side-card-border)] bg-[var(--login-side-card)] p-4 text-left backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--login-side-caption)]">Live snapshot</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-black ">
                  {snapshot.count.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--login-side-copy)]">Tickets sold this week</p>
              </div>
              <div className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold">
                +{snapshot.change}%
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[var(--login-form-bg)] p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--login-brand)]">Access portal</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--login-title)]">Login</h1>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--login-brand-soft)] text-[var(--login-brand)] shadow-sm">
                <SiEagle className="text-xl" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-[var(--login-error-border)] bg-[var(--login-error-bg)] px-4 py-3 text-sm font-medium text-[var(--login-error-text)]">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Email address</span>
                <div className="group flex items-center gap-3 rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 transition-all duration-200 focus-within:border-[var(--login-brand)] focus-within:shadow-[0_0_0_4px_var(--login-input-focus)]">
                  <FaEnvelope className="text-sm text-[var(--login-muted)]" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    className="w-full border-0 bg-transparent py-3.5 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--login-label)]">Password</span>
                <div className="group flex items-center gap-3 rounded-2xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 transition-all duration-200 focus-within:border-[var(--login-brand)] focus-within:shadow-[0_0_0_4px_var(--login-input-focus)]">
                  <FaLock className="text-sm text-[var(--login-muted)]" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="w-full border-0 bg-transparent py-3.5 pr-2 text-base text-[var(--login-text)] placeholder:text-[var(--login-muted)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--login-muted)] transition hover:bg-[var(--login-ghost-bg)] hover:text-[var(--login-text)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-[var(--login-subtitle)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-[var(--login-brand)]"
                  />
                  Remember me
                </label>

                <button type="button" className="font-medium text-[var(--login-brand)] transition hover:text-[var(--login-primary-hover)]">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_30px_rgba(245,158,11,0.35)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_35px_rgba(245,158,11,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <span className="loading"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    Login
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--login-divider)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--login-ghost-bg)] px-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--login-muted)]">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleAuth
                onAuthSuccess={handleNavigationRedirect}
                className="w-full rounded-2xl border border-[var(--login-ghost-border)] bg-[var(--login-ghost-bg)] py-3.5 text-sm font-semibold text-[var(--login-text)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--login-border)] hover:shadow-md"
              />

              <p className="pt-2 text-center text-sm text-[var(--login-subtitle)]">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/Register")}
                  className="font-semibold text-[var(--login-brand)] underline-offset-4 transition hover:text-[var(--login-primary-hover)]"
                >
                  Register
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login;