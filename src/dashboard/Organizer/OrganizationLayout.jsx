import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDocs
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase'
import { FaBell, FaBlog, FaMoneyBillTrendUp } from 'react-icons/fa6'
import { RiDashboard2Line, RiQrScanLine, RiTicket2Line } from 'react-icons/ri'
import { FiMenu, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import Darkmode from '../../components/DarkMode'
import { FaSignOutAlt } from 'react-icons/fa'
import NotificationPanel from '../../components/NotificationPanel'
import toast from "react-hot-toast";
import { useRef } from "react";
import logo from '../../assets/Default.png'

const OrganizationLayout = ({ currentUser }) => {
  const [events, setEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const initialized = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length

  const slideMovement = () => setSlide(!slide)

  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

useEffect(() => {
  if (!currentUser?.uid) return;

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', currentUser.uid), 
    orderBy('createdAt', 'desc')
  );

  const unsub = onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    if (!initialized.current) {
      initialized.current = true;
    } else {
      snap.docChanges()
        .filter(c => c.type === "added")
        .forEach(c => {
          const n = c.doc.data();
          // Use your ticket icon for the toast
          toast.custom((t) => (
            <div
              onClick={() => {
                toast.dismiss(t.id);
                if (n.link) navigate(n.link);
              }}
              className="cursor-pointer bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-4 w-80 border-l-4 border-green-500"
            >
              <div className="flex items-center gap-2">
                <span>{n.type === 'ticket_purchase' ? "🎫" : "🔔"}</span>
                <p className="font-semibold text-sm">{n.title}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{n.message}</p>
            </div>
          ), { duration: 6000 });
        });
    }

    setNotifications(docs);
    
  }, (error) => {
    console.error("Notification Listener Error:", error);
  });

  return () => unsub();
}, [currentUser]);

  // Fetch organizer's data
  useEffect(() => {
    if (!currentUser) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [eventsSnap, ticketsSnap, usersSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, 'events'),
              where('ownerId', '==', currentUser.uid)
            )
          ),
          getDocs(
            query(
              collection(db, 'tickets'),
              where('organizerId', '==', currentUser.uid)
            )
          ),
          getDocs(
            query(
              collection(db, 'users'),
              where('following', 'array-contains', currentUser.uid)
            )
          )
        ])
      
        const eventsData = eventsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        const ticketsData = ticketsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        const usersData = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Combine activities
        const activities = [
          ...eventsData.map(e => ({
            type: 'event',
            title: 'Event created',
            name: e.name,
            date: e.createdAt?.toDate?.() || new Date(0)
          })),
           ...ticketsData
              .filter(t => t.organizerId === currentUser.uid) // ✅ only tickets for this organizer
              .map(t => ({
                type: 'ticket',
                title: 'Ticket purchased',
                user: t.buyerName || "Unknown",
                ticket: t.ticketType || "Flat",
                name: t.eventName || "Unknown",
                date: t.createdAt?.toDate?.() || new Date(0)
              })),
          ...usersData.map(u => ({
            type: 'user',
            title: 'New follower',
            user: u.fullName || "Unknown",
            date: u.createdAt?.toDate?.() || new Date(0)
          }))
        ]
          .filter(a => a.date instanceof Date && !isNaN(a.date)) // remove invalid ones
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)

        setEvents(eventsData)
        setRecentActivities(activities)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser])

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      onClick={slideMovement}
      className={({ isActive }) =>
        `flex flex-col lg:flex-row items-center gap-2 px-5 py-4 rounded-lg transition
        ${
          isActive
            ? 'text-orange-500 bg-orange-500/10'
            : 'hover:text-orange-400 hover:bg-orange-500/10'
        }`
      }
    >
      {icon}
      <span className='text-xs lg:text-base'>{label}</span>
    </NavLink>
  )

  return (
    <section className='flex min-h-screen'>
      {/* SIDEBAR */}
      {slide && (
        <>
          <aside
            className={`
        fixed lg:top-18 bottom-0 left-0 z-50
        w-full h-20 lg:h-[90vh] lg:w-64
        bg-(--bg-color) text-(--text-color)
        shadow ${
          slide ? 'translate-x-0 opacity-90 ' : '-translate-x-full opacity-0 '
        } flex lg:flex-col lg:justify-between justify-start
        items-center lg:items-start transform transition-all duration-1000 ease-in-out custom-scrollbar
        px-2 py-3 lg:p-6
      `}
          >
            <FiX
              size={18}
              onClick={slideMovement}
              className='hidden lg:flex absolute top-2 right-2 cursor-pointer'
            />
            <nav className='w-full flex justify-around lg:flex-col lg:gap-2'>
              {navItem(
                '/dashboard/organization',
                <RiDashboard2Line size={22} />,
                'Overview'
              )}
              {navItem(
                '/dashboard/organization/events',
                <RiTicket2Line size={22} />,
                'Events'
              )}
              {navItem(
                '/dashboard/organization/scanner',
                <RiQrScanLine size={22} />,
                'Scan'
              )}
              {navItem(
                '/dashboard/organization/wallet',
                <FaMoneyBillTrendUp size={22} />,
                'Earnings'
              )}
              {navItem(
                '/dashboard/organization/blog',
                <FaBlog size={22} />,
                'Blogs'
              )}
            </nav>

            <button
              onClick={handleLogout}
              className='w-full lg:flex hidden items-center gap-2 bg-red-100 hover:bg-red-400 text-gray-500 px-4 py-2 rounded-lg'
            >
              <FaSignOutAlt />
              Logout
            </button>
          </aside>
        </>
      )}

      {/* MAIN */}
      <div className='flex-1 flex flex-col '>
        {/* HEADER */}
        <header
          className='
          sticky top-0 z-40
          bg-(--bg-color) dark:bg-(--bg-color)
          text-(--text-color) dark:text-(--text-color)
          px-4 py-3 shadow flex items-center justify-between
        '
        >
          <div className='flex gap-2 items-center'><img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
            <div>
                <h2 className='font-semibold text-lg'>{currentUser?.orgName}</h2>
                <p className='text-sm'>Organizer Dashboard</p>
            </div>
          </div>
          
          {/* Desktop controls */}
          <div className='flex items-center gap-2'>
            <Darkmode />

            <div className='relative'>
              <button onClick={() => setShowNotif(!showNotif)}>
                <FaBell size={16} />
                {unreadCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className='absolute -right-2 lg:right-0 mt-3 w-80 bg-(--bg-color) shadow-xl rounded-xl p-3 z-50'>
                  <h4 className='font-semibold mb-2 text-sm'>Notifications</h4>

                  <NotificationPanel
                    notifications={notifications}
                    close={() => setShowNotif(false)}
                    onRead={async (notifId) => {
                      await updateDoc(doc(db, 'notifications', notifId), {
                        read: true
                      })
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-2 px-4 py-2 rounded-lg'
            >
              <FaSignOutAlt />
            </button>
          </div>

          {/* MOBILE DROPDOWN */}
          <FiMenu
            size={22}
            onClick={slideMovement}
            className='lg:flex hidden m-4 absolute top-16 left-0 z-50'
          />
        </header>

        {/* CONTENT */}
        <main className='flex-1 p-4 lg:p-8 pb-24 lg:pb-8'>
          {loading ? (
            <p className='text-gray-400'>Loading dashboard...</p>
          ) : (
            <Outlet context={{ events, recentActivities, currentUser }} />
          )}
        </main>

        <footer className='fixed bottom-0 left-0 w-full h-20  bg-(--bg-color)  flex justify-around items-center lg:hidden'>
          {navItem(
            '/dashboard/organization',
            <RiDashboard2Line size={22} />,
            'Overview'
          )}
          {navItem(
            '/dashboard/organization/events',
            <RiTicket2Line size={22} />,
            'Events'
          )}
          {navItem(
            '/dashboard/organization/scanner',
            <RiQrScanLine size={22} />,
            'Scan'
          )}
          {navItem(
            '/dashboard/organization/wallet',
            <FaMoneyBillTrendUp size={22} />,
            'Earnings'
          )}
          {navItem(
            '/dashboard/organization/blogs',
            <FaBlog size={22} />,
            'Blogs'
          )}
        </footer>
      </div>
    </section>
  )
}

export default OrganizationLayout
