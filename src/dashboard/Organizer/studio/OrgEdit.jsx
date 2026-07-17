import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Components matching your updated layout paths
import BasicInfo from '../component/create event/BasicInfo'
import CoverUpload from '../component/create event/CoverUpload'
import VenueSection from '../component/create event/VenueSection'
import ScheduleBuilder from '../component/create event/ScheduleBuilder'
import GuestsSection from '../component/create event/AddGuest'
import SponsorsSection from '../component/create event/SponsorSection'
import RulesSection from '../component/create event/RuleSection'
import ThemeSection from '../component/create event/ThemeSection'
import TicketBuilder from '../component/create event/TicketBuilder'
import StorySection from '../component/create event/StorySection'
import LivePreview from '../component/create event/LivePreview'
import { formatEventStatus } from '../../../utils/formatEventRange'
import { uploadToCloudinary } from '../../../utils/cloudinaryUpload'
import { FaCalendarCheck } from 'react-icons/fa6'

const OrgEdit = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // Status flags
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [loadingDescription, setLoadingDescription] = useState(false)

  // Basic Info
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [genres, setGenres] = useState([])
  const [description, setDescription] = useState('')
  const [organizer, setOrganizer] = useState('')

  // Media
  const [photo, setPhoto] = useState(null)
  const [coverStyle, setCoverStyle] = useState('standard')

  // Dates & Times
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())

  // Location / Venue
  const [location, setLocation] = useState('')
  const [venue, setVenue] = useState({
    name: '',
    address: '',
    map: '',
    latitude: '',
    longitude: '',
    type: '',
    parking: '',
    directions: ''
  })

  // Dynamic Lists
  const [tickets, setTickets] = useState([])
  const [schedules, setSchedules] = useState([])
  const [guests, setGuests] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [faqs, setFaqs] = useState([])

  // Legal & Customization
  const [rules, setRules] = useState('')
  const [theme, setTheme] = useState({
    accent: '#F59E0B',
    button: 'Rounded',
    layout: 'Modern',
    animation: 'Fade'
  })
  const [openDate, setOpenDate] = useState(false)

  // Payout / Bank details (Added from CreateEvent context)
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [banks, setBanks] = useState([])

  const hasPaidTicket = tickets.some(t => t.type === 'paid')
  const handleOpenDate = () => setOpenDate(!openDate)

  // Fetch bank details if needed
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/banks`
        )
        setBanks(res.data)
      } catch (err) {
        console.error('Error fetching banks:', err)
      }
    }
    fetchBanks()
  }, [])

  // Fetch and hydrate event details on load
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        const snap = await getDoc(doc(db, 'events', eventId))

        if (!snap.exists()) {
          alert('Event not found.')
          navigate('/dashboard/organization')
          return
        }

        const event = snap.data()
        console.log('Event Data:', event)
        console.log('date:', event.date)
        console.log('startTime:', event.startTime)
        console.log('endTime:', event.endTime)

        setName(event.name || '')
        setCategory(event.category || '')
        setGenres(event.genres || [])
        setDescription(event.description || '')
        setOrganizer(event.organizer || '')
        setPhoto(event.photo || null)
        setCoverStyle(event.coverStyle || 'standard')
        setLocation(event.location || '')
        setVenue(
          event.venue || {
            name: '',
            address: '',
            map: '',
            type: '',
            parking: '',
            directions: ''
          }
        )
        setTickets(event.tickets || [])
        setSchedules(event.schedules || [])
        setGuests(event.guests || [])
        setSponsors(event.sponsors || [])
        setRules(event.rules || '')
        setFaqs(event.faqs || [])
        setTheme(
          event.theme || {
            accent: '#F59E0B',
            button: 'Rounded',
            layout: 'Modern',
            animation: 'Fade'
          }
        )

        // Handle bank information if present
        setAccountNumber(event.accountNumber || '')
        setBankCode(event.bankCode || '')
        setBankName(event.bankName || '')
        setAccountName(event.accountName || '')

        // Safely parse Firestore timestamps or ISO date strings
        const parseDate = value => {
          if (!value) return new Date()

          const d = value?.toDate ? value.toDate() : new Date(value)

          if (isNaN(d.getTime())) {
            console.log('Invalid date:', value)
            return new Date()
          }

          return d
        }

        console.log(parseDate(event.date))
        console.log(parseDate(event.startTime))
        console.log(parseDate(event.endTime))

        setDate(parseDate(event.date))
        setStartTime(parseDate(event.startTime))
        setEndTime(parseDate(event.endTime))
      } catch (error) {
        console.error('Error loading event data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) loadEvent()
  }, [eventId, navigate])

  // Account verification helper
  const resolveAccount = async (accountNo, code) => {
    if (accountNo.length !== 10 || !code) return
    try {
      setResolving(true)
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/resolve-account`,
        {
          accountNumber: accountNo,
          bankCode: code
        }
      )
      setAccountName(res.data.accountName)
    } catch (err) {
      setAccountName('')
      alert(
        err.response?.data?.error || 'Invalid account confirmation details.'
      )
    } finally {
      setResolving(false)
    }
  }

  // AI Description Generator Integration
  const generateDescription = async () => {
    try {
      setLoadingDescription(true)
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/description`,
        {
          name,
          category,
          venue,
          description
        }
      )
      setDescription(response.data.description)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDescription(false)
    }
  }

  // Submit Updated Changes
  const handleUpdate = async e => {
    e.preventDefault()

    let photoURL = ''
    if (photo) photoURL = await uploadToCloudinary(photo)

    if (hasPaidTicket && (!accountNumber || !bankCode || !accountName)) {
      return alert(
        'Please verify your bank details before saving paid tickets.'
      )
    }

    const updatedGuests = await Promise.all(
      guests.map(async guest => ({
        ...guest,
        photo:
          guest.photo instanceof File
            ? await uploadToCloudinary(guest.photo)
            : guest.photo
      }))
    )

    const updatedSponsors = await Promise.all(
      sponsors.map(async sponsor => ({
        ...sponsor,
        logo:
          sponsor.logo instanceof File
            ? await uploadToCloudinary(sponsor.logo)
            : sponsor.logo
      }))
    )

    try {
      setUpdating(true)

      const finalStart = new Date(date)
      finalStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)

      const finalEnd = new Date(date)
      finalEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)

      if (finalEnd <= finalStart) {
        finalEnd.setDate(finalEnd.getDate() + 1)
      }

      await updateDoc(doc(db, 'events', eventId), {
        name,
        category,
        genres,
        description,
        organizer,
        photo: photoURL || photo,
        coverStyle,
        location,
        venue,
        tickets,
        isFree: !hasPaidTicket,
        schedules,
        guests: updatedGuests,
        sponsors: updatedSponsors,
        rules,
        faqs,
        theme,
        date: date.toISOString(),
        startTime: finalStart.toISOString(),
        endTime: finalEnd.toISOString(),
        accountNumber: hasPaidTicket ? accountNumber : '',
        accountName: hasPaidTicket ? accountName : '',
        bankName: hasPaidTicket ? bankName : '',
        bankCode: hasPaidTicket ? bankCode : '',
        updatedAt: serverTimestamp()
      })

      alert('✅ Event updated successfully!')
      navigate('/dashboard/organization')
    } catch (err) {
      console.error('Failed to update event document:', err)
      alert('❌ Failed to save updates.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-(--bg-color) text-(--text-color) '>
        <p className='animate-pulse text-lg font-semibold'>
          Loading Event Data...
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-(--bg-color) text-(--text-color) py-10 px-4 max-w-7xl mx-auto'>
      <div className='flex items-center space-x-4 mb-8'>
        <h1 className='uppercase font-semibold lg:text-5xl text-3xl'>
          Edit Event
        </h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className='grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-start w-full '
      >
        {/* Form Build Panel */}
        <div className='space-y-10 py-4 custom-scrollbar mx-0 lg:px-6 px-4 shadow flex flex-col uppercase font-semibold'>
          <BasicInfo
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            organizer={organizer}
            setOrganizer={setOrganizer}
            genres={genres}
            setGenres={setGenres}
          />

          <div className='flex flex-col gap-2'>
            <StorySection
              description={description}
              setDescription={setDescription}
            />
            <button
              type='button'
              onClick={generateDescription}
              className='bg-orange-600 self-start text-white px-4 py-2 text-xs rounded-xs font-semibold cursor-pointer active:scale-90 hover:bg-orange-700 transition'
            >
              {loadingDescription
                ? 'Rewriting...'
                : '✨ Rewrite description with AI'}
            </button>
          </div>

          <CoverUpload
            photo={photo}
            setPhoto={setPhoto}
            coverStyle={coverStyle}
            setCoverStyle={setCoverStyle}
          />

          <VenueSection venue={venue} setVenue={setVenue} />

          <div className='relative flex justify-between border-b py-6'>
            <div className='flex items-center space-x-4'>
              <h1 className='font-semibold uppercase '>Dates:</h1>
              <p className='text-sm text-gray-600'>
                {formatEventStatus(startTime, endTime)}
              </p>
            </div>
            <div
              onClick={handleOpenDate}
              className='border rounded-xs px-2 space-x-2 flex items-center '
              style={{ cursor: 'pointer' }}
            >
              <FaCalendarCheck className='text-gray-500' />
              <h1 className='uppercase font-semibold lg:text-xl text-sm'>
                Calendar
              </h1>
            </div>
          </div>
          {openDate && (
            <div className='flex flex-col gap-2 justify-center'>
              <DatePicker
                selected={
                  date instanceof Date && !isNaN(date.getTime())
                    ? date
                    : new Date()
                }
                onChange={newDate => {
                  if (!newDate || isNaN(newDate.getTime())) return
                  setDate(newDate)

                  if (startTime && !isNaN(startTime.getTime())) {
                    const newStart = new Date(startTime)
                    newStart.setFullYear(
                      newDate.getFullYear(),
                      newDate.getMonth(),
                      newDate.getDate()
                    )
                    setStartTime(newStart)
                  }

                  if (endTime && !isNaN(endTime.getTime())) {
                    const newEnd = new Date(endTime)
                    newEnd.setFullYear(
                      newDate.getFullYear(),
                      newDate.getMonth(),
                      newDate.getDate()
                    )

                    if (startTime && newEnd <= startTime) {
                      newEnd.setDate(newEnd.getDate() + 1)
                    }
                    setEndTime(newEnd)
                  }
                }}
                dateFormat='MMMM d, yyyy'
                className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs w-full'
              />

              <div className='flex flex-col gap-1'>
                <span className='text-xs text-gray-400'>Start Time (24h)</span>
                <DatePicker
                  selected={
                    startTime instanceof Date && !isNaN(startTime.getTime())
                      ? startTime
                      : new Date()
                  }
                  onChange={time => {
                    if (!time || isNaN(time.getTime())) return

                    const newStart = new Date(date)
                    newStart.setHours(time.getHours(), time.getMinutes(), 0, 0)
                    setStartTime(newStart)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption='Time'
                  timeFormat='HH:mm'
                  dateFormat='HH:mm' // Keep it simple and scannable
                  className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs w-full'
                />
              </div>

              <div className='flex flex-col gap-1'>
                <span className='text-xs text-gray-400'>End Time (24h)</span>
                <DatePicker
                  selected={
                    endTime instanceof Date && !isNaN(endTime.getTime())
                      ? endTime
                      : new Date()
                  }
                  onChange={time => {
                    if (!time || isNaN(time.getTime())) return

                    const newEnd = new Date(date)
                    newEnd.setHours(time.getHours(), time.getMinutes(), 0, 0)

                    if (
                      startTime &&
                      !isNaN(startTime.getTime()) &&
                      newEnd <= startTime
                    ) {
                      newEnd.setDate(newEnd.getDate() + 1)
                    }
                    setEndTime(newEnd)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption='Time'
                  timeFormat='HH:mm'
                  dateFormat='HH:mm'
                  className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs w-full'
                />
              </div>
            </div>
          )}

          <ScheduleBuilder schedules={schedules} setSchedules={setSchedules} />

          <GuestsSection guests={guests} setGuests={setGuests} />

          <SponsorsSection sponsors={sponsors} setSponsors={setSponsors} />

          <RulesSection
            rules={rules}
            setRules={setRules}
            faqs={faqs}
            setFaqs={setFaqs}
          />

          <ThemeSection theme={theme} setTheme={setTheme} />

          <TicketBuilder tickets={tickets} setTickets={setTickets} />

          {/* Conditional Bank Info Management matching CreateEvent configuration */}
          {hasPaidTicket && (
            <div className='flex flex-col space-y-4 pt-2 border-t border-(--border)'>
              <h2 className='font-semibold text-lg'>
                Bank Info (for payout modification)
              </h2>
              <input
                required={hasPaidTicket}
                placeholder='Account Number'
                value={accountNumber}
                maxLength={10}
                onChange={e => {
                  const val = e.target.value
                  setAccountNumber(val)
                  if (val.length === 10 && bankCode)
                    resolveAccount(val, bankCode)
                }}
                className='p-3 border rounded-xs focus:outline-none normal-case bg-transparent'
              />

              <select
                value={bankCode}
                onChange={e => {
                  const code = e.target.value
                  setBankCode(code)
                  const selected = banks.find(b => b.code === code)
                  setBankName(selected?.name || '')
                  if (accountNumber.length === 10)
                    resolveAccount(accountNumber, code)
                }}
                className='p-3 border rounded-xs focus:outline-none bg-transparent'
              >
                <option value=''>Select Bank</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>

              {resolving ? (
                <p className='text-xs text-blue-400 normal-case font-normal italic'>
                  Verifying bank account payload calculations...
                </p>
              ) : accountName ? (
                <p className='text-xs text-green-500 normal-case font-bold'>
                  ✅ {accountName}
                </p>
              ) : null}
            </div>
          )}

          <button
            type='submit'
            disabled={updating || resolving}
            className='bg-(--primary) text-white font-bold py-4 rounded-xs tracking-wider disabled:opacity-50 transition uppercase cursor-pointer'
          >
            {updating
              ? 'Saving Changes...'
              : resolving
              ? 'Verifying Account...'
              : 'Save and Update Event'}
          </button>
        </div>

        {/* Sticky Live Preview Panel Container */}
        <div className='space-y-6 lg:sticky lg:top-6'>
          <div className='bg-(--bg-color) border border-(--border) rounded-3xl p-6 shadow-xs'>
            <h3 className='font-bold text-xl mb-4 dark:text-zinc-50'>
              Live Preview
            </h3>
            <LivePreview
              name={name}
              photo={photo}
              coverStyle={coverStyle}
              description={description}
              location={location}
              date={date}
              startTime={startTime}
              endTime={endTime}
              category={category}
              organizer={organizer}
              genres={genres}
              tickets={tickets}
              schedules={schedules}
              guests={guests}
              sponsors={sponsors}
              venue={venue}
              rules={rules}
              faqs={faqs}
              theme={theme}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default OrgEdit
