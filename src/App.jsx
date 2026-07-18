// src/App.jsx
import React, { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Home from './pages/Home'
import Register from './auth/Register'
import Login from './auth/Login'
import Verify from './auth/Verify'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase/firebase'
import Event from './pages/Event'
import LoadingScreen from './components/LoadingScreen'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Layout from './layout/Layout'
import TicketScanner from './pages/TicketScanner'
import Guide from './pages/Guide'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Tracking from './components/Tracking'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import WriteBlog from './pages/WriteBlog'
import BlogDetail from './pages/BlogDetail'
import Trending from './pages/Trending'
import TicketModal from './pages/TicketModal'
import DashboardLayout from './dashboard/Admin/DashboardLayout'
import DashboardHome from './dashboard/Admin/DashboardHome'
import Dashevents from './dashboard/Admin/Dashevents'
import OrganizationLayout from './dashboard/Organizer/OrganizationLayout'
import Organization from './dashboard/Organizer/Organization'
import OrgCreate from './dashboard/Organizer/OrgCreate'
import OrgWallet from './dashboard/Organizer/OrgWallet'
import OrgEvent from './dashboard/Organizer/OrgEvent'
import Dashblog from './dashboard/Admin/Dashblog'
import AdminWallet from './dashboard/Admin/AdminWallet'
import WelcomeBack from './components/WelcomeBack'
import Profile from './dashboard/Admin/component/Profile'
import { Toaster } from 'react-hot-toast'
import UserMain from './dashboard/Users/UserMain'
import UserLayout from './dashboard/Users/UserLayout'
import OrgProfile from './dashboard/Organizer/component/OrgProfile'
import UserEventsAndTickets from './dashboard/Users/UserEvent'
import UserProfile from './dashboard/Users/UserProfile'
import TransactionHistory from './dashboard/Users/Billing'
import CreateEvent from './dashboard/Admin/CreateEvent'
import TicketPage from './pages/TicketPage'
import PaymentSuccess from './pages/PaymentSucess'
import BecomeOrganizer from './auth/BecomeOrg'
import OrgEdit from './dashboard/Organizer/studio/OrgEdit'
import AttendeeDrawer from './dashboard/Organizer/studio/OrgAttendees'
import OrgBuyers from './dashboard/Organizer/studio/OrgBuyers'
import OrgStudio from './dashboard/Organizer/studio/OrgStudio'
import PublicOrganizerProfile from './pages/Profilepage'


const App = () => {
  const [step, setStep] = useState('select')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [events, setEvents] = useState([])
  const [blog, setBlog] = useState([])

  useEffect(() => {
    AOS.init({
      duration: 2000,
      easing: 'ease',
      delay: 100,
      offset: 100
    })
    AOS.refresh()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setLoading(true)
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        let docSnap = await getDoc(docRef)

        // 🚀 Automatically create a Firestore profile for new Google Sign-Ins
        if (!docSnap.exists()) {
          const fallbackUser = {
            uid: user.uid,
            displayName: user.displayName || user.fullName,
            name: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL || '',
            accountType: 'user', // Default tier parameter
            isAdmin: false,
            verified: user.emailVerified // Google defaults this to true
          }
          await setDoc(docRef, fallbackUser)
          docSnap = await getDoc(docRef) // Re-fetch clean document data
        }

        const data = docSnap.data()
        setCurrentUser({
          ...user,
          ...data,
          emailVerified: user.emailVerified,
          verified: data?.verified ?? user.emailVerified
        })
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <LoadingScreen onComplete={() => setIsLoaded(true)} />
  }

  return (
    <>
      <Toaster position='bottom-right' />
      <Routes>
        {/* Home route — Redirect logged-in users to their respective dashboards */}
        {/* Home route — Dynamically redirects verified users to their respective layouts */}
        <Route
          path='/'
          element={
            currentUser ? (
              !(currentUser.verified || currentUser.emailVerified) ? (
                <Navigate to='/verify' replace />
              ) : currentUser.isAdmin ? (
                <Navigate to='/dashboard' replace />
              ) : currentUser.accountType === 'organization' ? (
                <Navigate to='/dashboard/organization' replace />
              ) : (
                <Navigate to='/dashboard/users' replace />
              )
            ) : (
              <Layout currentUser={currentUser}>
                <Home currentUser={currentUser} />
              </Layout>
            )
          }
        />

        {/* Login route */}
        <Route
          path='/Login'
          element={
            <Layout currentUser={currentUser}>
              <Login />
            </Layout>
          }
        />

        <Route path='/welcome' element={<WelcomeBack />} />

        <Route
          path='/register'
          element={
            // If user is logged in
            currentUser && currentUser?.verified === true ? (
              // Organizer -> redirect to org dashboard
              currentUser.accountType === 'organization' ? (
                <Navigate to='/dashboard/organization' replace />
              ) : (
                // Regular user -> redirect to homepage
                <Navigate to='/dashboard/users' replace />
              )
            ) : (
              // Not logged in -> show Register page
              <Layout currentUser={currentUser}>
                <Register step={step} setStep={setStep} />
              </Layout>
            )
          }
        />

        <Route
          path='/verify'
          element={
            currentUser &&
            (currentUser.verified || currentUser.emailVerified) ? (
              <Navigate to='/' replace />
            ) : (
              <Layout currentUser={currentUser}>
                <Verify
                  email={currentUser?.email}
                  currentUser={currentUser}
                  step='verify'
                  setStep={() => {}}
                  error={''}
                  setError={() => {}}
                  resendMessage={''}
                  setResendMessage={() => {}}
                />
              </Layout>
            )
          }
        />

        <Route
          path="/become-organizer"
          element={
            currentUser ? (
              <BecomeOrganizer currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path='/event'
          element={
            currentUser ? (
              <Navigate
                to={
                  currentUser.isAdmin
                    ? '/dashboard'
                    : currentUser.accountType === 'organization'
                    ? '/dashboard/organization'
                    : '/dashboard/users'
                }
                replace
              />
            ) : (
              <Layout currentUser={currentUser}>
                <Event
                  events={events}
                  setEvents={setEvents}
                  currentUser={currentUser}
                />
              </Layout>
            )
          }
        />

        <Route
          path='/event/:slug'
          element={<TicketModal currentUser={currentUser} />}
        />

        <Route path='/payment-success' element={<PaymentSuccess />} />

        <Route
          path='/ticket/:ticketId'
          element={<TicketPage currentUser={currentUser} />}
        />

        <Route
          path='/guide'
          element={
            <Layout currentUser={currentUser}>
              <Guide />
            </Layout>
          }
        />

        <Route
          path='/contact'
          element={
            <Layout currentUser={currentUser}>
              <Contact />
            </Layout>
          }
        />
        <Route
          path='/blogs'
          element={
            <Layout currentUser={currentUser}>
              <Blog blog={blog} setBlog={setBlog} currentUser={currentUser} />
            </Layout>
          }
        />
        <Route
          path='/Write'
          element={
            <Layout currentUser={currentUser}>
              <WriteBlog />
            </Layout>
          }
        />
        <Route
          path='/blogs/:log'
          element={
            <Layout currentUser={currentUser}>
              <BlogDetail />
            </Layout>
          }
        />
        <Route
          path='/trending'
          element={
            <Layout currentUser={currentUser}>
              <Trending />
            </Layout>
          }
        />
        <Route 
        path='/organizer/:uid'
        element={
          <PublicOrganizerProfile currentUser={currentUser}
      currentUserId={currentUser?.uid}/>
        }
        />

        <Route
          path='/dashboard'
          element={
            currentUser === null ? (
              <LoadingScreen />
            ) : currentUser.isAdmin ? (
              <DashboardLayout currentUser={currentUser} />
            ) : (
              <Navigate to='/' replace />
            )
          }
        >
          <Route index element={<DashboardHome currentUser={currentUser} />} />

          <Route path='blog' element={<Dashblog currentUser={currentUser} />} />
          <Route
            path='profile'
            element={<Profile currentUser={currentUser} />}
          />

          {/* Create Event */}
          <Route
            path='create'
            element={<CreateEvent currentUser={currentUser} />}
          />

          {/* Scanner */}
          <Route
            path='scanner'
            element={<TicketScanner currentUser={currentUser} />}
          />

          {/* Analytics/Tracking */}
          <Route
            path='tracking'
            element={<Tracking currentUser={currentUser} />}
          />

          <Route
            path='wallet'
            element={<AdminWallet currentUser={currentUser} />}
          />

          {/*Event in dashboard */}
          <Route
            path='events'
            element={
              <Dashevents
                events={events}
                setEvents={setEvents}
                currentUser={currentUser}
              />
            }
          />
        </Route>

        {/* Organization Dashboard */}
<Route
  path='/dashboard/organization'
  element={<OrganizationLayout currentUser={currentUser} />}
>
  <Route index element={<Organization currentUser={currentUser} />} />
  <Route path='create' element={<OrgCreate currentUser={currentUser} />} />
  <Route path='wallet' element={<OrgWallet currentUser={currentUser} />} />
  <Route path='profile' element={<OrgProfile currentUser={currentUser} />} />
  <Route path='scanner' element={<TicketScanner currentUser={currentUser} />} />
  <Route path='events' element={<OrgEvent currentUser={currentUser} />} />
  <Route path='event/:slug' element={<TicketModal currentUser={currentUser} />} />
  <Route path='blog' element={<WriteBlog />} />

  {/* ========================================================= */}
  {/* ORG STUDIO SUB-SUITE                                      */}
  {/* Grouping these makes path maintenance and linking cleaner */}
  {/* ========================================================= */}
  <Route path="studio/:eventId">
    {/* Base Route: /dashboard/organization/studio/:eventId */}
    <Route index element={<OrgStudio currentUser={currentUser} />} />
    
    {/* Edit Route: /dashboard/organization/studio/:eventId/edit */}
    <Route path="edit" element={<OrgEdit currentUser={currentUser}/>} />
    
    {/* Attendees View: /dashboard/organization/studio/:eventId/attendees */}
    <Route path="attendees" element={<AttendeeDrawer currentUser={currentUser}/>} />
    
    {/* Buyers View: /dashboard/organization/studio/:eventId/buyers */}
    <Route path="buyers" element={<OrgBuyers currentUser={currentUser}/>} />
  </Route>

</Route>

        <Route
          path='/dashboard/users'
          element={<UserLayout currentUser={currentUser} />}
        >
          <Route index element={<UserMain currentUser={currentUser} />} />
          <Route
            path='events'
            element={<UserEventsAndTickets currentUser={currentUser} />}
          />
          <Route
            path='profile'
            element={<UserProfile currentUser={currentUser} />}
          />
          <Route
            path='transactions'
            element={<TransactionHistory currentUser={currentUser} />}
          />
          {/* <Route path="settings" element={<UserSettings currentUser={currentUser} />} /> */}
        </Route>
      </Routes>
    </>
  )
}

export default App
