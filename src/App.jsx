// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase/firebase";
import Event from "./pages/Event";
import LoadingScreen from "./components/LoadingScreen";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Layout from "./layout/Layout";
import CreateEvent from "./pages/CreateEvent";

const App = () => {
  const [step, setStep] = useState("select");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        //reload to keep emailVerified fresh
        await user.reload();

        // ref to Firestore doc
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let userData = { ...user };

        if (docSnap.exists()) {
          userData = { ...user, ...docSnap.data() }; // merge Firestore data
        }
        
        // sync Firestore verified field
        if (currentUser) {
          await setDoc(
            doc(db, "users", user.uid),
            { verified: true },
            { merge: true }
          );
          userData.verified = true
        }
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setIsLoaded(true)} />;
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
            
              <Layout currentUser={currentUser}>
              <Home />
              </Layout>
            
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
                setStep={() => { }}
                error={""}
                setError={() => { }}
                resendMessage={""}
                setResendMessage={() => { }}
              />
            )
          ) : (
            <Navigate to="/Login" replace />
          )
        }
      />

      <Route path="/event" element={
        <Layout currentUser={currentUser}>
         <Event />
        </Layout>} />

        <Route path="/create" element={
          <Layout currentUser={currentUser}>
            <CreateEvent />
          </Layout>
        } />
    </Routes>
  );
};

export default App;
