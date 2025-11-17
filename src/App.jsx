// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import TicketScanner from "./pages/TicketScanner";
import Guide from "./pages/Guide";
import AOS from "aos";
import "aos/dist/aos.css";
import Tracking from "./components/Tracking";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import WriteBlog from "./pages/WriteBlog";
import BlogDetail from "./pages/BlogDetail";
import Trending from "./pages/Trending";
import TicketModal from "./pages/TicketModal";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardHome from "./dashboard/DashboardHome";
import Dashevents from "./pages/Dashevents";



const App = () => {
  const [step, setStep] = useState("select");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false)
  const [events, setEvents] = useState([]);
  const [blog, setBlog] = useState([]);

  useEffect(() => {
    AOS.init(
      {
        duration: 2000,
        easing: "ease",
        delay: 100,
        offset: 100,
      }
    );
    AOS.refresh();
  }, []);

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
        if (!user.verified) {
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
        element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
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

      <Route path="/verify" element={<Verify email={currentUser?.email} step="verify"
        setStep={() => { }}
        error={""}
        setError={() => { }}
        resendMessage={""}
        setResendMessage={() => { }} />}
      />
      {/* Verify route — force unverified users here */}
      {/* <Route
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
      /> */}

      <Route path="/event" element={
        <Layout currentUser={currentUser}>
          <Event events={events} setEvents={setEvents} currentUser={currentUser} />
        </Layout>}
      />

      <Route path="/event/:slug" element={
        <Layout currentUser={currentUser}>
          <TicketModal currentUser={currentUser} />
        </Layout>
      } />

      <Route path="/guide" element={
        <Layout currentUser={currentUser}>
          <Guide />
        </Layout>
      } />

      <Route path="/contact" element={
        <Layout currentUser={currentUser}>
          <Contact />
        </Layout>
      } />
      <Route path="/blogs" element={
        <Layout currentUser={currentUser}>
          <Blog blog={blog} setBlog={setBlog} currentUser={currentUser} />
        </Layout>
      } />
      <Route path="/Write" element={
        <Layout currentUser={currentUser}>
          <WriteBlog />
        </Layout>
      } />
      <Route path="/blogs/:id" element={
        <Layout currentUser={currentUser}>
          <BlogDetail />
        </Layout>
      } />
      <Route path="/trending" element={
        <Layout currentUser={currentUser}>
          <Trending />
        </Layout>
      } />

<Route
  path="/dashboard"
  element={
    currentUser === null
      ? <LoadingScreen />
      : currentUser.isAdmin
        ? <DashboardLayout currentUser={currentUser} />
        : <Navigate to="/" replace />
  }
>

        <Route index element={<DashboardHome currentUser={currentUser} />} />

        {/* Create Event */}
        <Route path="create" element={<CreateEvent currentUser={currentUser} />} />

        {/* Scanner */}
        <Route path="scanner" element={<TicketScanner currentUser={currentUser}/>} />

        {/* Analytics/Tracking */}
        <Route path="tracking" element={<Tracking currentUser={currentUser}/>} />

        {/*Event in dashboard */}
        <Route path="events" element={<Dashevents events={events} setEvents={setEvents} currentUser={currentUser}/>} />
      </Route>


    </Routes>
  );
};

export default App;
