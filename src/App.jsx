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
import DashboardLayout from "./dashboard/Admin/DashboardLayout";
import DashboardHome from "./dashboard/Admin/DashboardHome";
import Dashevents from "./dashboard/Admin/Dashevents";
import OrganizationLayout from "./dashboard/Organizer/OrganizationLayout";
import Organization from "./dashboard/Organizer/Organization";
import OrgCreate from "./dashboard/Organizer/OrgCreate";
import OrgWallet from "./dashboard/Organizer/OrgWallet";
import OrgEvent from "./dashboard/Organizer/OrgEvent";
import Dashblog from "./dashboard/Admin/Dashblog";
import AdminWallet from "./dashboard/Admin/AdminWallet";
import WelcomeBack from "./components/WelcomeBack";
import { Toaster } from "react-hot-toast";



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
    setLoading(true);
    if (user) {
      // Get the document, but DON'T try to fix/update it here
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCurrentUser({ ...user, ...docSnap.data() });
      } else {
        setCurrentUser(user);
      }
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

  return (<>
    <Toaster position="bottom-right" />
    <Routes>
      {/* Home route — redirect unverified users to /verify */}
      <Route
        path="/"
        element={
          currentUser && !currentUser.emailVerified ? (
            <Navigate to="/verify" replace />
          ) : (

            <Layout currentUser={currentUser}>
              <Home currentUser={currentUser} />
            </Layout>

          )
        }
      />

      {/* Login route */}
      <Route
        path="/Login"
        element={<Layout currentUser={currentUser}><Login /></Layout>}
      />

      <Route path="/welcome" element={<WelcomeBack />} />

      <Route
        path="/register"
        element={
          // If user is logged in
          currentUser && currentUser?.verified === true ? (
            // Organizer -> redirect to org dashboard
            currentUser.accountType === "organization" ? (
              <Navigate to="/dashboard/organization" replace />
            ) : (
              // Regular user -> redirect to homepage
              <Navigate to="/" replace />
            )
          ) : (
            // Not logged in -> show Register page
            <Layout currentUser={currentUser}>
              <Register step={step} setStep={setStep} />
            </Layout>
          )
        }
      />


      <Route path="/verify" element={<Layout currentUser={currentUser}><Verify email={currentUser?.email} currentUser={currentUser} step="verify"
        setStep={() => { }}
        error={""}
        setError={() => { }}
        resendMessage={""}
        setResendMessage={() => { }} /></Layout>}
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
      <Route path="/blogs/:log" element={
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

        <Route path="blog" element={<Dashblog currentUser={currentUser} />} />

        {/* Create Event */}
        <Route path="create" element={<CreateEvent currentUser={currentUser} />} />

        {/* Scanner */}
        <Route path="scanner" element={<TicketScanner currentUser={currentUser} />} />

        {/* Analytics/Tracking */}
        <Route path="tracking" element={<Tracking currentUser={currentUser} />} />

        <Route path="wallet" element={<AdminWallet currentUser={currentUser} />} />

        {/*Event in dashboard */}
        <Route path="events" element={<Dashevents events={events} setEvents={setEvents} currentUser={currentUser} />} />
      </Route>

      {/* Organization Dashboard */}
      <Route path="/dashboard/organization" element={<OrganizationLayout currentUser={currentUser} />}>

        <Route index element={<Organization currentUser={currentUser} />} />

        <Route path="create" element={<OrgCreate currentUser={currentUser} />} />
        <Route path="wallet" element={<OrgWallet currentUser={currentUser} />} />
        <Route path="scanner" element={<TicketScanner currentUser={currentUser} />} />
        <Route path="events" element={<OrgEvent currentUser={currentUser} />} />
        <Route path="event/:slug" element={<TicketModal currentUser={currentUser} />} />
        <Route path="blog" element={<WriteBlog />} />
      </Route>


    </Routes>
    </>
  );
};

export default App;
