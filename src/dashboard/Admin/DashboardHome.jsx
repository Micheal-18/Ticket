import React from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FaCalendarPlus,
  FaTicketAlt,
  FaUserFriends,
  FaAnchor
} from 'react-icons/fa'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import EventChartPanel from './component/Rechart'
import Profile from './component/Profile'

const DashboardHome = () => {
  const {
    events,
    users,
    recentActivities,
    currentUser,
    profileOpen,
    setProfileOpen
  } = useOutletContext()

  /* ---------------- 🛠️ RESILIENT PARSER FOR INCOMING DATA ---------------- */
  const parseToNativeDate = dateField => {
    if (!dateField) return null
    if (dateField instanceof Date && !isNaN(dateField.getTime()))
      return dateField
    if (typeof dateField.toDate === 'function') return dateField.toDate()
    if (dateField.seconds) return new Date(dateField.seconds * 1000)

    // Catch-all string parsing fix: Prevent UTC shift on standard YYYY-MM-DD input structures
    if (
      typeof dateField === 'string' &&
      dateField.includes('-') &&
      !dateField.includes('T')
    ) {
      const [year, month, day] = dateField.split('-').map(Number)
      return new Date(year, month - 1, day) // Extracted as absolute local calendar system date
    }

    const parsed = new Date(dateField)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  /* ---------------- GET SYSTEM MIDNIGHT TO FAIRLY CHECK UPCOMING ---------------- */
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  /* ---------------- CALCULATIONS ---------------- */
  const totalRevenue = events.reduce(
    (sum, e) => sum + Number(e.revenue || 0),
    0
  )
  const totalTicketsSold = events.reduce(
    (sum, e) => sum + Number(e.ticketSold || 0),
    0
  )
  const currency = events[0]?.currency || '₦'

  /* ---------------- CHART DATA ---------------- */
  const chartData = (() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    const counts = Object.fromEntries(months.map(m => [m, 0]))

    events.forEach(e => {
      const d = parseToNativeDate(e.date)
      if (d) {
        const m = d.toLocaleString('default', { month: 'short' })
        if (counts[m] !== undefined) {
          counts[m]++
        }
      }
    })

    return months.map(m => ({ name: m, registrations: counts[m] }))
  })()

  /* ---------------- FOLLOWERS PROCESSING ---------------- */
  const followersMap = {}
  recentActivities
    .filter(a => a.type === 'ticket' && a.user)
    .forEach(a => {
      followersMap[a.user] = {
        name: a.user,
        lastActivity: a.date
      }
    })

  const followers = Object.values(followersMap)

  return (
    <main data-aos="fade-up" className='flex-1 py-4 overflow-y-auto space-y-10 custom-scrollbar'>
      {/* ================= SUMMARY CARDS ================= */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          currentUser?.isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        } gap-4`}
      >
        <SummaryCard title='Total Events' value={events.length} />
        <SummaryCard title='Followers' value={followers.length} />
        {currentUser?.isAdmin && (
          <SummaryCard title='Users' value={users.length || 0} />
        )}
        <SummaryCard
          title='Revenue'
          value={`${currency}${totalRevenue.toLocaleString()}`}
        />
        <SummaryCard title='Tickets Sold' value={totalTicketsSold} />
      </div>

      {/* ================= CHART & ACTIVITIES ================= */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* EVENTS CHART */}
        <EventChartPanel chartData={chartData} />
        {/* RECENT ACTIVITIES */}
        <div className='p-4 rounded-2xl shadow'>
          <h2 className='text-xl font-semibold mb-4'>Recent Activities</h2>

          <div className='space-y-4 max-h-80 overflow-y-auto custom-scrollbar'>
            {recentActivities.length === 0 && (
              <p className='text-gray-400 text-sm'>No activity yet</p>
            )}

            {recentActivities.map((activity, index) => {
              const activityDate = parseToNativeDate(activity.date)

              return (
                <div
                  key={index}
                  className='flex gap-3 border-b border-gray-700 pb-4'
                >
                  <div className='text-(--primary) mt-1'>
                    {activity.type === 'event' ? (
                      <FaCalendarPlus />
                    ) : activity.type === 'ticket' ? (
                      <FaTicketAlt />
                    ) : activity.type === 'users' ? (
                      <FaUserFriends />
                    ) : (
                      <FaAnchor />
                    )}
                  </div>

                  <div>
                    <h3 className='font-semibold text-sm lg:text-base'>
                      {activity.type === 'event' &&
                        `${activity?.name || 'Event'} event added`}
                      {activity.type === 'ticket' &&
                        `${activity?.user || 'Someone'} bought ${
                          activity?.ticket || 'Flat'
                        } ticket for ${activity?.name || 'Event'} events`}
                      {activity.type === 'users' &&
                        `${activity?.name || 'Unknown User'} registered for ${
                          activity?.account || 'User'
                        }`}
                    </h3>
                    <p className='text-gray-400 text-xs mt-0.5'>
                      {activityDate
                        ? activityDate.toLocaleString()
                        : 'No date snapshot'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= UPCOMING EVENTS SECTION ================= */}
      <div className='p-4 rounded-2xl shadow '>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <FaCalendarPlus className='text-(--primary)' /> Upcoming Events
        </h2>
        <div className='space-y-4 max-h-80 overflow-y-auto custom-scrollbar'>
          {events
            .filter(e => {
              const eventDate = parseToNativeDate(e.date)
              return eventDate && eventDate.getTime() >= todayMidnight.getTime()
            })
            .sort((a, b) => {
              const dateA = parseToNativeDate(a.date)?.getTime() || 0
              const dateB = parseToNativeDate(b.date)?.getTime() || 0
              return dateA - dateB
            })
            .map(event => {
              const eventDate = parseToNativeDate(event.date)

              // 1. Format the Date beautifully (e.g., "Wed, Jul 1, 2026")
              const formattedDate = eventDate
                ? eventDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Date error'

              // 2. Intelligently format the time cleanly
              // 2. Intelligently format the time cleanly
              const formattedTime = (() => {
                // Case A: If event.startTime contains the full ISO timestamp (e.g., "2026-07-01T16:00:00.000Z")
                if (
                  typeof event.startTime === 'string' &&
                  event.startTime.includes('T')
                ) {
                  const parsedStart = new Date(event.startTime)
                  if (!isNaN(parsedStart.getTime())) {
                    return parsedStart.toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  }
                }

                // Case B: Fallback if event.date contains the full timestamp string instead
                if (
                  typeof event.date === 'string' &&
                  event.date.includes('T') &&
                  eventDate
                ) {
                  return eventDate.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                }

                // Case C: If event.startTime is just a standalone 24hr string (e.g., "16:00")
                if (
                  typeof event.startTime === 'string' &&
                  event.startTime.includes(':')
                ) {
                  const parts = event.startTime.split(':')
                  const hours = parseInt(parts[0], 10)
                  const minutes = parseInt(parts[1], 10)

                  if (!isNaN(hours) && !isNaN(minutes)) {
                    const tempDate = new Date()
                    tempDate.setHours(hours, minutes, 0, 0)
                    return tempDate.toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  }
                }

                // Case D: Fallback to whatever raw value is in event.startTime
                return event.startTime || 'N/A'
              })()

              return (
                <div key={event.id} className=' pb-4 last:border-0 last:pb-0'>
                  <h3 className='text-lg font-semibold'>{event.name}</h3>
                  <p className='text-gray-400 text-sm mt-0.5'>
                    {formattedDate} at {formattedTime}
                  </p>
                </div>
              )
            })}

          {events.filter(e => {
            const eventDate = parseToNativeDate(e.date)
            return eventDate && eventDate >= todayMidnight
          }).length === 0 && (
            <p className='text-gray-400 text-sm'>No upcoming events listed.</p>
          )}
        </div>
      </div>
    </main>
  )
}

/* ---------------- SMALL REUSABLE CARD ---------------- */
const SummaryCard = ({ title, value }) => (
  <div className='p-4 rounded-2xl shadow'>
    <h2 className='text-gray-400 text-sm font-medium'>{title}</h2>
    <p className='text-3xl font-semibold mt-2'>{value}</p>
  </div>
)

export default DashboardHome
