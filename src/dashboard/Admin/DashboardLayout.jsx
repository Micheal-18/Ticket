import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase'
import { FaBell, FaBlog, FaMoneyBillTrendUp } from 'react-icons/fa6'
import { RiDashboard2Line, RiQrScanLine, RiTicket2Line } from 'react-icons/ri'
import { FiMenu, FiX } from 'react-icons/fi'
import { signOut } from 'firebase/auth'
import Darkmode from '../../components/DarkMode'
import { FaSignOutAlt } from 'react-icons/fa'

const DashboardLayout = ({ currentUser }) => {
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [slide, setSlide] = useState(false)

  const slideMovement = () => setSlide(!slide)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsSnap = await getDocs(collection(db, 'events'))
        const eventsData = eventsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setEvents(eventsData)

        // Fetch users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersData = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUsers(usersData)

        // Fetch tickets
        const ticketsSnap = await getDocs(collection(db, 'tickets'))
        const ticketsData = ticketsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Build recent activities
        const activities = [
          ...eventsData.map(e => ({
            type: 'event',
            name: e.name,
            date: e.createdAt || e.date
          })),
          ...usersData.map(u => ({
            type: 'users',
            name: u.fullName,
            account: u.accountType,
            date: u.createdAt
          })),
          ...ticketsData.map(t => ({
            type: 'ticket',
            user: t.buyerName,
            ticket: t.ticketType,
            name: t.eventName,
            date: t.createdAt
          }))
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)

        setRecentActivities(activities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const navItem = (to, icon, label, count) => (
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
      <span className='text-xs lg:text-base relative'>
        {label}
        {count !== undefined && (
          <span className='ml-1 bg-orange-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full absolute -top-2 -right-4'>
            {count}
          </span>
        )}
      </span>
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
                '/dashboard',
                <RiDashboard2Line size={22} />,
                'Overview'
              )}
              {navItem(
                '/dashboard/events',
                <RiTicket2Line size={22} />,
                'My Events'
              )}
              {navItem(
                '/dashboard/scanner',
                <RiQrScanLine size={22} />,
                'Scan'
              )}
              {navItem(
                '/dashboard/wallet',
                <FaMoneyBillTrendUp size={22} />,
                'Earnings'
              )}
              {navItem('/dashboard/blog', <FaBlog size={22} />, 'Blogs')}
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
          <div>
            <h2 className='font-semibold text-lg'>{currentUser?.fullName}</h2>
            <p className='text-sm'>Admin Dashboard</p>
          </div>

          <div className='flex items-center gap-2'>
            <Darkmode />

            <div className='relative'>
              <FaBell size={16} />
              <span className='absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {recentActivities.length > 9 ? '9+' : recentActivities.length}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-2 px-4 py-2 rounded-lg'
            >
              <FaSignOutAlt />
            </button>
          </div>


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
            <Outlet
              context={{ events, users, recentActivities, currentUser }}
            />
          )}
        </main>

        <footer className='fixed bottom-0 left-0 w-full h-20  bg-(--bg-color)  flex justify-around items-center lg:hidden'>
          {navItem('/dashboard', <RiDashboard2Line size={22} />, 'Overview')}
          {navItem(
            '/dashboard/events',
            <RiTicket2Line size={22} />,
            'My Events'
          )}
          {navItem('/dashboard/scanner', <RiQrScanLine size={22} />, 'Scan')}
          {navItem(
            '/dashboard/wallet',
            <FaMoneyBillTrendUp size={22} />,
            'Earnings'
          )}
          {navItem('/dashboard/blog', <FaBlog size={22} />, 'Blogs')}
        </footer>
      </div>
    </section>
  )
}

export default DashboardLayout
