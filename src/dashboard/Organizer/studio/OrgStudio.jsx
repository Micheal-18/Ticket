import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../../firebase/firebase'
import {
  FaEdit,
  FaUsers,
  FaSearch,
  FaTrash,
  FaCopy,
  FaEye,
  FaCheckCircle
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import AttendeeDrawer from './OrgAttendees'

const OrgStudio = ({ currentUser }) => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [openDrawer, setOpenDrawer] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      const snap = await getDoc(doc(db, 'events', eventId))

      if (snap.exists()) {
        setEvent({
          id: snap.id,
          ...snap.data()
        })
      }
    }

    loadEvent()
  }, [eventId])

  // Ensure you have access to your currentUser or auth instance in OrgStudio
  // or pass currentUser as a prop

  useEffect(() => {
    if (!currentUser) return

    // We query by both eventId AND organizerId to satisfy security rules constraints
    const q = query(
      collection(db, 'tickets'),
      where('eventId', '==', eventId),
      where('organizerId', '==', currentUser.uid)
    )

    const unsub = onSnapshot(
      q,
      snapshot => {
        setTickets(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        )
        setLoading(false)
      },
      error => {
        console.error('Snapshot error:', error)
      }
    )

    return unsub
  }, [eventId, currentUser])

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const text = search.toLowerCase()

      return (
        ticket.attendeeName?.toLowerCase().includes(text) ||
        ticket.email?.toLowerCase().includes(text) ||
        ticket.buyerName?.toLowerCase().includes(text) ||
        String(ticket.attendeeNumber).includes(text) ||
        ticket.ticketType?.toLowerCase().includes(text)
      )
    })
  }, [tickets, search])

  const checkedIn = tickets.filter(t => t.used).length
  const pending = tickets.length - checkedIn

  const ticketTypes = {}

  tickets.forEach(ticket => {
    ticketTypes[ticket.ticketType] = (ticketTypes[ticket.ticketType] || 0) + 1
  })

  return (
    <div className='space-y-8'>
      {/* HEADER */}
      <div className='flex justify-between items-start flex-wrap gap-5'>
        <div>
          <h1 className='text-4xl font-black'>{event?.name}</h1>
          <p className='opacity-70 uppercase font-bold mt-2'>
            Organizer Studio
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={() =>
              navigate(`/dashboard/organization/studio/${eventId}/edit`)
            }
            className='bg-(--primary) text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer'
          >
            <FaEdit />
            Edit Event
          </button>

          <button className='border px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer'>
            <FaCopy />
            Duplicate
          </button>

          <button className='border border-red-500 text-red-500 px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer'>
            <FaTrash />
            Delete
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className='grid lg:grid-cols-4 gap-5'>
        <StatCard
          title='Attendees'
          value={tickets.length}
          color='bg-blue-500'
        />

        <StatCard title='Checked In' value={checkedIn} color='bg-green-500' />

        <StatCard title='Pending' value={pending} color='bg-orange-500' />

        <StatCard
          title='Ticket Types'
          value={Object.keys(ticketTypes).length}
          color='bg-purple-500'
        />
      </div>

      {/* SEARCH */}
      <div className='relative'>
        <FaSearch className='absolute left-4 top-4 text-gray-400' />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search attendee...'
          className='w-full border border-(--border) rounded-xl pl-12 pr-4 py-4 bg-transparent'
        />
      </div>

      {/* TABLE */}
      <div className='overflow-auto rounded-xl border border-(--border)'>
        <table className='w-full'>
          <thead className='border border-(--border)'>
            <tr>
              <th className='p-4 text-left'>No</th>
              <th className='p-4 text-left'>Attendee</th>
              <th className='p-4 text-left'>Email</th>
              <th className='p-4 text-left'>Ticket</th>
              <th className='p-4 text-left'>Buyer</th>
              <th className='p-4 text-left'>Status</th>
              <th className='p-4 text-left'></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className='p-10 text-center'>
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              filteredTickets.map(ticket => (
                <motion.tr
                  key={ticket.id}
                  layout
                  whileHover={{
                    background: 'rgba(255,255,255,.04)'
                  }}
                  className='border-t'
                >
                  <td className='p-4 font-bold'>#{ticket.attendeeNumber}</td>
                  <td className='p-4'>{ticket.attendeeName}</td>
                  <td className='p-4'>{ticket.email}</td>
                  <td className='p-4'>{ticket.ticketType}</td>
                  <td className='p-4'>{ticket.purchaserName}</td>
                  <td className='p-4'>
                    {ticket.used ? (
                      <span className='text-green-500 flex items-center gap-2'>
                        <FaCheckCircle />
                        Checked In
                      </span>
                    ) : (
                      <span className='text-orange-500'>Pending</span>
                    )}
                  </td>
                  <td className='p-4'>
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket)
                        setOpenDrawer(true)
                      }}
                      className='border rounded-lg p-3 hover:bg-(--primary) hover:text-white transition cursor-pointer'
                    >
                      <FaEye />
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Renders safely down here inside the return statement */}
      <AttendeeDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        ticket={selectedTicket}
      />
    </div>
  )
}

function StatCard ({ title, value, color }) {
  return (
    <div className='rounded-2xl border p-6'>
      <div className={`w-12 h-12 rounded-xl ${color}`} />
      <h2 className='mt-5 opacity-70'>{title}</h2>
      <h1 className='text-4xl font-black mt-2'>{value}</h1>
    </div>
  )
}

export default OrgStudio
