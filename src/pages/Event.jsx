import React, { useEffect, useState } from 'react'
import { db } from '../firebase/firebase'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import {
  FaCalendar,
  FaCaretDown,
  FaCaretUp,
  FaCircle,
  FaClock,
  FaLocationArrow
} from 'react-icons/fa6'
import { useAdmin } from '../hooks/useAdmin'
import walkGif from '../assets/dog.gif'
import { formatEventStatus } from '../utils/formatEventRange'
import naijaStateLocalGov from 'naija-state-local-government'
import SearchModal from '../components/SearchModal'
import { Link } from 'react-router-dom'
import OptimizedImage from '../components/OptimizedImage'
import DatePicker from 'react-datepicker'
import { RiStarFill } from 'react-icons/ri'

const Event = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin()
  const [selectedDropdown, setSelectedDropdown] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openTicket, setOpenTicket] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [isDate, setIsDate] = useState(false)
  const [isPrice, setIsPrice] = useState(false)
  const [isStateOpen, setIsStateOpen] = useState(false)
  const [isCategory, setIsCategory] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    state: '',
    category: '',
    priceOrder: ''
  })

  const handleState = () => {
    setIsStateOpen(!isStateOpen)
  }

  const handlePrice = () => {
    setIsPrice(!isPrice)
  }

  const handleDate = () => {
    setIsDate(!isDate)
  }

  const toggleHighlight = async (eventId, currentValue) => {
    try {
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, { highlighted: !currentValue })

      // 🔥 update locally so UI changes instantly
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev.id === eventId ? { ...ev, highlighted: !currentValue } : ev
        )
      )
    } catch (error) {
      console.error('Error updating highlight:', error)
    }
  }

  const highlightedEvents = events.filter(
    e => e.highlighted && e.status === 'approved'
  )

  const states = naijaStateLocalGov.states()

  // fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'))
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const isAdmin = currentUser?.isAdmin === true

        const visibleEvents = isAdmin
          ? eventsData
          : eventsData.filter(event => event.status === 'approved')

        setEvents(visibleEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    fetchEvents()
  }, [setEvents])

  const handleOpenTicket = event => {
    setSelectedEvent(event)
    setOpenTicket(true)
  }

  const handleCate = () => {
    setIsCategory(!isCategory)
  }

  // ✅ Filtered events

  const filteredEvents = events
    .filter(event =>
      filters.state
        ? event.location?.toLowerCase().includes(filters.state.toLowerCase())
        : true
    )

    // inside your filteredEvents
    .filter(event => {
      if (!filters.date) return true

      const today = new Date()
      const eventDate = new Date(event.date)
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)

      if (filters.date === 'Today')
        return eventDate.toDateString() === today.toDateString()

      if (filters.date === 'Tomorrow')
        return eventDate.toDateString() === tomorrow.toDateString()

      if (filters.date === 'Weekend') {
        const day = eventDate.getDay()
        return day === 6 || day === 0 // Saturday or Sunday
      }

      // If using "Select Date" with a custom date
      if (filters.date instanceof Date)
        return eventDate.toDateString() === filters.date.toDateString()

      return true
    })

    .filter(event =>
      filters.category
        ? event.category?.toLowerCase() === filters.category.toLowerCase()
        : true
    )

    .sort((a, b) => {
      // Price sorting takes priority
      if (filters.priceOrder === 'lowtohigh') {
        const aPrice = Math.min(
          ...(a.tickets || []).map(t => Number(t.price) || 0)
        )
        const bPrice = Math.min(
          ...(b.tickets || []).map(t => Number(t.price) || 0)
        )
        return aPrice - bPrice
      }

      if (filters.priceOrder === 'hightolow') {
        const aPrice = Math.min(
          ...(a.tickets || []).map(t => Number(t.price) || 0)
        )
        const bPrice = Math.min(
          ...(b.tickets || []).map(t => Number(t.price) || 0)
        )
        return bPrice - aPrice
      }

      // Default: newest events first
      const aDate = a.createdAt?.seconds
        ? a.createdAt.toDate()
        : new Date(a.createdAt)

      const bDate = b.createdAt?.seconds
        ? b.createdAt.toDate()
        : new Date(b.createdAt)

      return bDate - aDate
    })

  return (
    <section
      data-aos='fade-out'
      className='relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar z-10 bg-[var(--bg-color)] text-[var(--text-color)]'
    >
      <div className='flex flex-col space-y-4 p-4 md:p-6'>
        <div className='space-y-6'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]'>All Events</p>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <h1 className='text-2xl font-black md:text-4xl text-[var(--text-color)]'>Find Events</h1>
            <SearchModal
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
            />
          </div>
        </div>

        <div className='relative flex flex-col space-y-4'>
          <div onClick={handleState} className='relative w-full group'>
            <button className='active:scale-90 flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-sm font-medium text-[var(--text-color)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]'>
              {filters.state || 'Select State'}
              <FaCaretUp className='ml-2 text-[var(--text-secondary)] transition-transform duration-300 group-hover:rotate-180' />
            </button>

            {isStateOpen && (
              <div className='absolute left-0 z-50 mt-2 max-h-44 w-full overflow-hidden custom-scrollbar rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]'>
                {states.map((st, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setFilters({ ...filters, state: st })
                      handleState()
                    }}
                    className='cursor-pointer px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--primary)] hover:text-white'
                  >
                    {st}
                  </div>
                ))}
              </div>
            )}
          </div>

          {highlightedEvents.length === 0 ? (
            <p className='text-sm text-[var(--text-secondary)]'>No highlighted events yet.</p>
          ) : (
            <div className='flex space-x-4 overflow-x-auto pb-2 custom-scrollbar'>
              {highlightedEvents.map(event => (
                <Link key={event.id} to={`/event/${event.slug}`} className='group relative w-[290px] flex-shrink-0 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]'>
                  <div className='relative overflow-hidden rounded-[24px]'>
                    <OptimizedImage
                      src={event.photoURL || event.photo}
                      alt={event.title}
                      loading='lazy'
                      className='h-64 w-full object-cover transition duration-500 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent' />
                    {event.highlighted && (
                      <div className='absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-[var(--primary)] p-2 text-lg text-white shadow-lg'>
                        <RiStarFill />
                      </div>
                    )}
                    <div className='absolute inset-x-0 bottom-0 p-4'>
                      <h3 className='mb-2 text-2xl font-bold text-white line-clamp-2'>
                        {event.name}
                      </h3>
                      <div
                        className='prose prose-sm max-w-none text-xs text-slate-200 prose-p:mb-1 prose-strong:text-white'
                        dangerouslySetInnerHTML={{
                          __html: event.description || ''
                        }}
                      />
                      <p className='mt-2 text-sm text-slate-200'>
                        {event.location || event.venue?.name || 'Venue info coming soon'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className='flex items-center justify-between gap-2'>
            <p className='text-2xl font-bold text-[var(--text-color)]'>Events</p>
            <p className='text-sm text-[var(--text-secondary)]'>
              Showing <span className='font-semibold text-[var(--text-color)]'>{filteredEvents.length}</span> of {events.length} events
            </p>
          </div>

          <div className='flex flex-col gap-2 md:flex-row'>
            <div onClick={handleCate} className='relative w-full list-none cursor-pointer outline-none group'>
              <button className='flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-sm font-medium text-[var(--text-color)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]'>
                {filters.category || 'Category'}
                <FaCaretUp className='ml-2 text-[var(--text-secondary)] transition-transform duration-300 group-hover:rotate-180' />
              </button>

              {isCategory && (
                <div className='absolute z-50 mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-md)]'>
                  <ul className='space-y-1'>
                    {['Art', 'Business', 'Entertainment', 'Food', 'Health', 'Music'].map(cat => (
                      <li
                        key={cat}
                        onClick={() => {
                          setFilters({ ...filters, category: cat })
                        }}
                        className='cursor-pointer rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--primary)] hover:text-white'
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div onClick={handlePrice} className='relative w-full list-none cursor-pointer outline-none group'>
              <button className='flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-sm font-medium text-[var(--text-color)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]'>
                {filters.priceOrder
                  ? filters.priceOrder === 'lowtohigh'
                    ? 'Price: Low → High'
                    : 'Price: High → Low'
                  : 'Price'}
                <FaCaretUp className='ml-2 text-[var(--text-secondary)] transition-transform duration-300 group-hover:rotate-180' />
              </button>

              {isPrice && (
                <div className='absolute z-50 mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-md)]'>
                  <ul className='space-y-1'>
                    <li
                      onClick={() => setFilters({ ...filters, priceOrder: 'lowtohigh' })}
                      className='cursor-pointer rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--primary)] hover:text-white'
                    >
                      Low to High
                    </li>
                    <li
                      onClick={() => setFilters({ ...filters, priceOrder: 'hightolow' })}
                      className='cursor-pointer rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--primary)] hover:text-white'
                    >
                      High to Low
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className='relative w-full list-none cursor-pointer outline-none group'>
              <button
                onClick={e => {
                  e.stopPropagation()
                  setIsDate(prev => !prev)
                }}
                className='flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-sm font-medium text-[var(--text-color)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]'
              >
                {filters.date
                  ? filters.date instanceof Date
                    ? filters.date.toDateString()
                    : filters.date
                  : 'Date'}
                <FaCaretUp className='ml-2 text-[var(--text-secondary)] transition-transform duration-300 group-hover:rotate-180' />
              </button>

              {isDate && (
                <div className='absolute left-0 z-50 mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-md)]'>
                  <ul className='space-y-1'>
                    {['Today', 'Tomorrow', 'Weekend'].map(dat => (
                      <li
                        key={dat}
                        onClick={e => {
                          e.stopPropagation()
                          setFilters({ ...filters, date: dat })
                          setIsDate(false)
                        }}
                        className='cursor-pointer rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--primary)] hover:text-white'
                      >
                        {dat}
                      </li>
                    ))}

                    <li
                      className='relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]'
                      onClick={e => e.stopPropagation()}
                    >
                      <FaCalendar
                        className='cursor-pointer'
                        onClick={() => setIsOpen(prev => !prev)}
                      />
                      {isOpen && (
                        <div className='absolute left-0 top-full z-50 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lg)]'>
                          <DatePicker
                            selected={filters.date instanceof Date ? filters.date : null}
                            onChange={date => {
                              setFilters({ ...filters, date })
                              setIsDate(false)
                              setIsOpen(false)
                            }}
                            dateFormat='EEE, MMM d, yyyy'
                            placeholderText='Select date...'
                            className='w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--text-color)] outline-none focus:border-[var(--primary)]'
                            popperPlacement='bottom-start'
                          />
                        </div>
                      )}
                      <span>Pick a date</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <p
            onClick={() => setFilters({ state: '', category: '', priceOrder: '', date: '' })}
            className='flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--primary)]'
          >
            Reset <FaCircle className='rounded-full text-red-500 animate-pulse' />
          </p>
        </div>

        <div className='mt-4 flex w-full items-center justify-center'>
          <div data-aos='fade-up' className='grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8'>
            {filteredEvents.map(event => (
              <Link
                to={`/event/${event.slug}`}
                key={event.id}
                onClick={() => handleOpenTicket(event)}
                className='group flex w-full items-center justify-between gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)]'
              >
                <span className='flex flex-1 flex-col gap-3'>
                  <h1 className='lg:w-[300px] truncate w-[150px] text-2xl font-bold uppercase text-[var(--text-color)]'>
                    {event.name}
                  </h1>

                  <p className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                    <FaCalendar className='text-[var(--primary)]' />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>

                  <p className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                    <FaClock className='text-[var(--primary)]' />
                    <span className='truncate w-[100px] md:w-[300px]'>
                      {formatEventStatus(event.startTime, event.endTime)}
                    </span>
                  </p>

                  <p className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
                    <FaLocationArrow className='text-[var(--primary)]' />
                    <span className='truncate w-[100px] md:w-[300px]'>
                      {event.location || event.venue?.name || 'Location coming soon'}
                    </span>
                  </p>

                  <div>
                    {event.isFree ? (
                      <span className='inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500'>
                        🆓 Free Admission
                      </span>
                    ) : Array.isArray(event.tickets) ? (
                      event.tickets.slice(0, 1).map((priceOption, index) => (
                        <p key={index} className='text-sm text-[var(--text-secondary)]'>
                          <span className='text-base font-semibold text-[var(--primary)]'>
                            {priceOption.name}:{' '}
                            {Number(priceOption.price) > 0 ? (
                              priceOption.currency + ' ' + priceOption.price.toLocaleString()
                            ) : (
                              <span className='inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500'>
                                Free Admission
                              </span>
                            )}
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className='text-base font-semibold text-[var(--primary)]'>
                        {event.currency}{' '}
                        {Number(event.price?.price) +
                          ((1.5 / 100) * Number(event.price?.price) + 100)}
                      </p>
                    )}
                  </div>
                </span>

                <span className='overflow-hidden rounded-[22px] border border-[var(--border)]'>
                  <OptimizedImage
                    src={event.photoURL || event.photo}
                    alt={event.name}
                    className='h-[180px] w-[180px] object-cover transition duration-500 group-hover:scale-105 md:h-[200px] md:w-[200px]'
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className='mt-10 flex justify-center'>
        <img src={walkGif} alt='walking gif' className='h-20 w-20 animation-walk' />
      </footer>
    </section>
  )
}

export default Event
