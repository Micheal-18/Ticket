import React, { useEffect, useState, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase'
import { FaBell, FaCalendarAlt, FaCog, FaExchangeAlt, FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { FiMenu, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import Darkmode from '../../components/DarkMode'
import NotificationPanel from '../../components/NotificationPanel'
import toast from "react-hot-toast"
import logo from '../../assets/Default.png'

const UserLayout = ({ currentUser }) => {
  const [slide, setSlide] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const initialized = useRef(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const handleOpenProfile = async () => {
    setProfileOpen(true);
    navigate('/dashboard/users/profile');
    }
  const unreadCount = notifications.filter(n => !n.read).length
  const slideMovement = () => setSlide(!slide)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  // Live Notification Listener Stream
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
            toast.custom((t) => (
              <div
                onClick={() => {
                  toast.dismiss(t.id);
                  if (n.link) navigate(n.link);
                }}
                className="cursor-pointer bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-4 w-80 border-l-4 border-(--primary)"
              >
                <div className="flex items-center gap-2">
                  <span>{n.type === 'ticket_purchase' ? "🎫" : "🔔"}</span>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{n.title}</p>
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
  }, [currentUser, navigate]);

  const navItem = (to, icon, label, isMobileFooter = false) => (
    <NavLink
      to={to}
      onClick={!isMobileFooter ? slideMovement : undefined}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1.5 transition text-center rounded-xs
        ${isMobileFooter ? 'py-1 px-3' : 'lg:flex-row lg:text-left px-5 py-4 w-full'}
        ${isActive ? 'text-(--primary) bg-(--primary)/10 font-medium' : 'text-gray-400 hover:text-orange-400 hover:bg-(--primary)/5'}`
      }
    >
      {icon}
      <span className={isMobileFooter ? 'text-[10px]' : 'text-xs lg:text-base'}>{label}</span>
    </NavLink>
  )

  return (
    <section className='flex min-h-screen bg-(--bg-color) text-(--text-color) transition-colors duration-300'>
      
      {/* DESKTOP SIDEBAR PANEL */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 space-y-6
          w-64 h-screen bg-(--bg-color) border-r border-gray-200/10 shadow-xl
          flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out
          ${slide ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${slide ? 'block custom-scrollbar' : 'hidden lg:flex'}
        `}
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold tracking-wider uppercase text-(--primary)">{currentUser?.name || "User"}</span>
            <FiX size={20} onClick={slideMovement} className='lg:hidden cursor-pointer hover:text-(--primary)' />
          </div>
          
          <nav className='w-full flex flex-col gap-2'>
            {navItem('/dashboard/users', <FaHome size={18} />, 'Overview')}
            {navItem('/dashboard/users/events', <FaCalendarAlt size={18} />, 'Events')}
            {navItem('/dashboard/users/profile', <FaUser size={18} />, 'Profile')}
            {navItem('/dashboard/users/transactions', <FaExchangeAlt size={18} />, 'Transactions')}
          </nav>
        </div>


        <button
          onClick={handleLogout}
          className='w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl font-medium transition-all duration-200'
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* RIGHT SIDE MAIN BASE PANEL CONTAINER */}
      <div className='flex-1 flex flex-col min-w-0'>
        
        {/* HEADER */}
        <header className='sticky top-0 z-40 bg-(--bg-color) border-b border-gray-200/10 px-2 lg:px-8 py-3 shadow-sm flex items-center justify-between backdrop-blur-md bg-opacity-95'>
          <div onClick={handleOpenProfile} className='flex gap-2 items-center cursor-pointer group'>
            <img
              src={currentUser?.photoURL || logo }
              alt="profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-(--primary) transition-all duration-300"
            />
            <div className="leading-tight">
              <h2 className='font-semibold text-sm lg:text-base group-hover:text-(--primary) transition-colors capitalize'>
                {currentUser?.name || currentUser?.fullName || "User Account"}
              </h2>
              <p className='text-xs text-gray-400 max-w-[180px] lg:max-w-none truncate'>{currentUser?.email}</p>
            </div>
          </div>
          
          <div className='flex items-center gap-4'>
            <div className="lg:hidden block">
              <FiMenu size={24} onClick={slideMovement} className="cursor-pointer text-gray-400 hover:text-(--primary) transition" />
            </div>

            <Darkmode />

            {/* BELL DROPBOX */}
            <div className='relative'>
              <button onClick={() => setShowNotif(!showNotif)} className="relative p-1 text-gray-400 hover:text-(--primary) transition">
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center text-white'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className='absolute right-0 mt-3 w-80 bg-zinc-900 border border-gray-800 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200'>
                  <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                    <h4 className='font-bold text-sm text-white'>Notifications</h4>
                    <span className="text-[10px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>

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
              className='p-1 text-gray-400 hover:text-red-500 transition hidden lg:block'
              title="Logout Account"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </header>

        {/* OUTLET VIEWPORT CONTROLLER TARGET */}
        <main className='flex-1 p-4 lg:p-8 pb-28 lg:pb-8 max-w-[1600px] w-full mx-auto'>
          <Outlet context={{ currentUser, profileOpen, setProfileOpen }} />
        </main>

        {/* RESPONSIVE FIXED MOBILE TAB BAR FOOTER */}
        <footer className='fixed bottom-0 left-0 w-full h-16 border-t border-gray-800 backdrop-blur-lg flex justify-around items-center lg:hidden z-40 px-2'>
          {navItem('/dashboard/users', <FaHome size={18} />, 'Overview', true)}
          {navItem('/dashboard/users/events', <FaCalendarAlt size={18} />, 'Events', true)}
          {navItem('/dashboard/users/profile', <FaUser size={18} />, 'Profile', true)}
          {navItem('/dashboard/users/transactions', <FaExchangeAlt size={18} />, 'History', true)}
        </footer>
      </div>
    </section>
  )
}

export default UserLayout