// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import Event from "./pages/Event";
import LoadingScreen from "./components/LoadingScreen";

const App = () => {
  const [step, setStep] = useState("select");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // reload to keep emailVerified fresh
        await user.reload();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Home route — redirect unverified users to /verify */}
      <Route
        path="/"
        element={
          currentUser && !currentUser.emailVerified ? (
            <Navigate to="/verify" replace />
          ) : (
            <>
              <Navbar currentUser={currentUser} />
              <Home />
              <Footer />
            </>
          )
        }
      />

      {/* Login route */}
      <Route
        path="/Login"
        element={currentUser ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Register route */}
      <Route
        path="/register"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <Register step={step} setStep={setStep} />
          )
        }
      />

      {/* Verify route — force unverified users here */}
      <Route
        path="/verify"
        element={
          currentUser ? (
            currentUser.emailVerified ? (
              <Navigate to="/" replace />
            ) : (
              <Verify
                email={currentUser.email}
                step="verify"
                setStep={() => {}}
                error={""}
                setError={() => {}}
                resendMessage={""}
                setResendMessage={() => {}}
              />
            )
          ) : (
            <Navigate to="/Login" replace />
          )
        }
      />

      <Route path="/event" element={<Event />}/>
    </Routes>
  );
};

export default App;
