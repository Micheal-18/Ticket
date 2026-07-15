import React, { useRef, useState, useEffect } from 'react'
import { RiArrowLeftFill } from 'react-icons/ri'
import { FaCalendarCheck, FaPlus } from 'react-icons/fa6'
import { FiX } from 'react-icons/fi'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '../../firebase/firebase'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatEventStatus } from '../../utils/formatEventRange'
import { uploadToCloudinary } from '../../utils/cloudinaryUpload'
import { notifyFollowersOfNewEvent } from '../../utils/notifyFollowersOfNewEvent'
import axios from 'axios'
import { toPng } from 'html-to-image'
import BasicInfo from './component/create event/BasicInfo'
import CoverUpload from './component/create event/CoverUpload'
import StorySection from './component/create event/StorySection'
import GenreInput from './component/create event/GenreInput'
import TicketBuilder from './component/create event/TicketBuilder'
import SponsorsSection from './component/create event/SponsorSection'
import GuestsSection from './component/create event/AddGuest'
import ScheduleBuilder from './component/create event/ScheduleBuilder'
import VenueSection from './component/create event/VenueSection'
import RulesSection from './component/create event/RuleSection'
import ThemeSection from './component/create event/ThemeSection'
import LivePreview from './component/create event/LivePreview'

const CreateEvent = () => {
  const navigate = useNavigate()
  const flyerRef = useRef(null)
  const { currentUser } = useOutletContext()
  // Event state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flyerImage, setFlyerImage] = useState('')
  const [loadingFlyer, setLoadingFlyer] = useState(false)
  const [loadingDescription, setLoadingDescription] = useState(false)
  const [coverStyle, setCoverStyle] = useState('standard')
  const [tickets, setTickets] = useState([])
  const [genres, setGenres] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [guests, setGuests] = useState([])
  const [genreInput, setGenreInput] = useState('')

  const [venue, setVenue] = useState({
    name: '',
    address: '',
    map: '',
    type: '',
    parking: '',
    directions: ''
  })

  // Ticket Mode & Pricing States
  // const [ticketType, setTicketType] = useState('paid')
  // const [price, setPrice] = useState([
  //   { id: 1, label: '', amount: '', currency: '₦' }
  // ])
  const [openDate, setOpenDate] = useState(false)

  // Bank info
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [banks, setBanks] = useState([])
  const [bankCode, setBankCode] = useState('')
  const [rules, setRules] = useState('')
  const [theme, setTheme] = useState({
    accent: '#f97316',

    layout: 'Modern',

    button: 'Rounded',

    animation: 'Fade'
  })

  const [faqs, setFaqs] = useState([])

  const currencies = ['₦', '$', '€']

  const handleOpenDate = () => setOpenDate(!openDate)
  const handlePhotoUpload = e => setPhoto(e.target.files[0])

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/banks`
        )

        setBanks(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchBanks()
  }, [])

  const hasPaidTicket = tickets.some(t => t.type === 'paid')

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
      alert(err.response?.data?.error || 'Invalid account.')
    } finally {
      setResolving(false)
    }
  }

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

  const generateFlyer = async () => {
    try {
      setLoadingFlyer(true)
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/flyer`,
        { name, category, description, location, organizer }
      )
      setFlyerImage(response.data.image) // Works perfectly with Data URIs or normal URLs!
    } catch (err) {
      console.error(err)
      alert('Failed to generate flyer.')
    } finally {
      setLoadingFlyer(false)
    }
  }

  const downloadFlyer = async () => {
    if (!flyerRef.current) return
    try {
      const dataUrl = await toPng(flyerRef.current, {
        cacheBust: true,
        allowCORS: true
      })
      const link = document.createElement('a')
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-flyer.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Flyer export failed:', err)
      alert('Failed to render canvas image. Try manually taking a screenshot.')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!currentUser) return alert('You must be logged in to create an event.')

    // Dynamic bank requirement check depending on ticket type

    if (hasPaidTicket && (!accountNumber || !bankCode || !accountName)) {
      return alert('Please verify your bank account.')
    }

    if (
      !name ||
      !category ||
      !description ||
      !venue ||
      !organizer ||
      !tickets ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return alert('Please fill all required fields.')
    }

    try {
      setLoading(true)
      const eventId = `${Date.now()}_${currentUser.uid}`
      const eventRef = doc(db, 'events', eventId)

      let photoURL = ''
      if (photo) photoURL = await uploadToCloudinary(photo)

      const slug = `${name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')}-${Date.now()}`
      const finalStart = new Date(date)
      finalStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)

      const finalEnd = new Date(date)
      finalEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)

      // Fallback check if end time inadvertently rolled behind start time configuration
      if (finalEnd <= finalStart) {
        finalEnd.setDate(finalEnd.getDate() + 1)
      }

      const hasPaidTicket = tickets.some(ticket => ticket.type === 'paid')

      const uploadedGuests = await Promise.all(
        guests.map(async guest => {
          return {
            ...guest,
            photo: guest.photo ? await uploadToCloudinary(guest.photo) : ''
          }
        })
      )

      const uploadedSponsors = await Promise.all(
        sponsors.map(async sponsor => {
          return {
            ...sponsor,
            logo: sponsor.logo ? await uploadToCloudinary(sponsor.logo) : ''
          }
        })
      )

      // Save event as PENDING
      await setDoc(eventRef, {
        name,
        category,
        genres,
        description,
        venue,
        organizer,
        tickets,
        isFree: !hasPaidTicket,
        photo: photoURL,
        coverStyle,
        rules,
        faqs,
        sponsors: uploadedSponsors,
        guests: uploadedGuests,
        schedules, // Throws ReferenceError: guest is not defined
        date: date.toISOString(),
        startTime: finalStart.toISOString(),
        endTime: finalEnd.toISOString(),
        createdBy: currentUser.uid,
        ownerId: currentUser.uid,
        organizerEmail: currentUser.email,
        slug,
        status: 'pending', // Pending admin approval
        ticketSold: 0,
        accountNumber: hasPaidTicket ? accountNumber : '',
        accountName: hasPaidTicket ? accountName : '',
        bankName: hasPaidTicket ? bankName : '',
        bankCode: hasPaidTicket ? bankCode : '',
        adminFee: hasPaidTicket ? 8 : 0,
        createdAt: new Date().toISOString()
      })

      await setDoc(doc(db, 'notifications', `${Date.now()}_${eventId}`), {
        type: 'event_submission',
        title: '📢 New Event Submission',
        message: `Event "${name}" needs admin review and approval.`,
        userId: "admin",
        senderId: currentUser.uid,
        senderName: organizer,
        link: `/event/${slug}`,
        status: 'pending',
        read: false,
        createdAt: new Date().toISOString()
      })

      if (currentUser) {
        await notifyFollowersOfNewEvent(currentUser, {
          id: eventId,
          name: name
        })
      }

      alert('✅ Event submitted for approval. Admin will review it.')
      navigate('/dashboard/organization')
    } catch (err) {
      console.error(err)
      setLoading(false)
      alert('❌ Failed to submit event.')
    }
  }

  return (
    <div className='grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-start w-full min-w-0 flex-1 mx-auto'>
      <div className='space-y-10'>
        {/* Your existing Create Event form */}
        <div className='w-full py-4 flex flex-col space-y-10 custom-scrollbar mx-0 lg:px-6 shadow'>
          <div className='flex space-x-4 items-center'>
            <h1 className='uppercase font-semibold lg:text-5xl text-3xl'>
              Create Event
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className='uppercase font-semibold space-y-8 flex flex-col mb-4'
          >
            {/* Event Info */}
            <BasicInfo
              name={name}
              setName={setName}
              category={category}
              setCategory={setCategory}
            />

            <StorySection
              description={description}
              setDescription={setDescription}
            />

            <GenreInput
              genres={genres}
              setGenres={setGenres}
              genreInput={genreInput}
              setGenreInput={setGenreInput}
            />

            <button
              type='button'
              onClick={generateDescription}
              className='bg-orange-600 text-white px-4 py-2 rounded-xs mb-4 cursor-pointer active:scale-90 hover:bg-orange-700 transition'
            >
              {loadingDescription ? 'Rewriting...' : ' ✨ Rewrite with AI'}
            </button>

            <CoverUpload
              photo={photo}
              setPhoto={setPhoto}
              coverStyle={coverStyle}
              setCoverStyle={setCoverStyle}
            />

            <button
              type='button'
              onClick={generateFlyer}
              className='bg-purple-900 text-white px-4 py-2 rounded-xs'
            >
              {loadingFlyer ? 'Generating...' : '🎨 Generate Flyer'}
            </button>

            {/* AI Flyer Preview */}
            {flyerImage && (
              <div className='mt-4 flex justify-center flex-col items-center'>
                <div
                  ref={flyerRef}
                  className='relative w-[340px] aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl border border-white/10'
                >
                  {/* Background */}
                  <img
                    src={flyerImage}
                    alt='AI Flyer'
                    className='absolute inset-0 w-full h-full object-cover'
                  />

                  {/* Dark Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80' />

                  {/* Content */}
                  <div className='absolute inset-0 flex flex-col justify-between p-4'>
                    {/* Category */}
                    <div>
                      <span className='inline-block bg-(--primary) text-white text-xs px-3 py-1 rounded-full font-semibold  tracking-wider'>
                        {category}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className='space-y-2'>
                      <h1
                        className='text-white font-black leading-tight'
                        style={{
                          fontSize:
                            name.length > 30
                              ? '24px'
                              : name.length > 18
                              ? '30px'
                              : '38px'
                        }}
                      >
                        {name}
                      </h1>

                      <p className='text-white/90 text-[12px] line-clamp-2'>
                        {description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className='space-y-3'>
                      <div className='flex justify-between gap-4 text-white/90 text-[12px] items-center'>
                        <div>
                          <p className='text-xs text-gray-300 uppercase'>
                            Organizer
                          </p>

                          <p className='text-white font-semibold'>
                            {organizer}
                          </p>
                        </div>

                        <div className='text-right text-xs'>
                          <p className='text-sm text-gray-300 uppercase'>
                            Venue
                          </p>

                          <p className='text-white font-semibold'>{location}</p>
                        </div>
                      </div>

                      <button
                        type='button'
                        className='w-full bg-(--primary) hover:bg-orange-600  py-2 rounded-xl font-bold text-white'
                      >
                        🎟 Get Ticket
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={downloadFlyer}
                  className='mt-4 w-full bg-green-600 cursor-pointer active:scale-90 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition'
                >
                  {loading ? 'Downloading...' : '📥 Download Flyer'}
                </button>
              </div>
            )}

            <VenueSection venue={venue} setVenue={setVenue} />

            <ScheduleBuilder
              schedules={schedules}
              setSchedules={setSchedules}
            />

            {/* Calendar */}
            <div className='relative flex justify-between border-b py-6'>
              <div className='flex items-center space-x-4'>
                <h1 className='font-semibold uppercase '>Dates:</h1>
                <p className='text-sm text-gray-600'>
                  {formatEventStatus(startTime, endTime)}
                </p>
              </div>
              <div
                onClick={handleOpenDate}
                className='border rounded-xl px-2 space-x-2 flex items-center '
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
                  selected={date}
                  onChange={newDate => setDate(newDate)}
                  dateFormat='MMMM d, yyyy'
                  className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs'
                />
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-400'>
                    Start Time (24h)
                  </span>
                  <DatePicker
                    selected={startTime}
                    onChange={time => setStartTime(time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    timeCaption='Start Time'
                    timeFormat='HH:mm'
                    dateFormat='HH:mm'
                    className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs w-full'
                  />
                </div>

                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-400'>End Time (24h)</span>
                  <DatePicker
                    selected={endTime}
                    onChange={time => setEndTime(time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    timeCaption='End Time'
                    timeFormat='HH:mm'
                    dateFormat='HH:mm'
                    className='text-white cursor-pointer bg-gray-800 p-4 rounded-xs w-full'
                  />
                </div>
              </div>
            )}

            <div className='flex items-center p-2 w-full space-x-2 border-b '>
              <label>Organized by:</label>
              <input
                required
                onChange={e => setOrganizer(e.target.value)}
                type='text'
                value={organizer}
                placeholder='Organizer'
                className='w-full p-3 flex justify-center'
              />
            </div>
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

            {/* Bank Info Container (Hidden entirely if the event is 100% Free) */}
            {hasPaidTicket && (
              <div className='flex flex-col space-y-4 pt-2'>
                <h2 className='font-semibold'>Bank Info (for payout)</h2>
                <input
                  required={hasPaidTicket}
                  placeholder='Account Number'
                  value={accountNumber}
                  maxLength={10}
                  onChange={e => {
                    const value = e.target.value
                    setAccountNumber(value)

                    if (value.length === 10 && bankCode) {
                      resolveAccount(value, bankCode)
                    }
                  }}
                  className='p-3 border rounded-xs  focus:outline-none'
                />

                <select
                  value={bankCode}
                  onChange={e => {
                    const code = e.target.value
                    setBankCode(code)
                    const selected = banks.find(bank => bank.code === code)
                    setBankName(selected?.name || '')
                    if (accountNumber.length === 10) {
                      resolveAccount(accountNumber, code)
                    }
                  }}
                  className='p-3 border rounded-xs focus:outline-none '
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
              disabled={loading || resolving}
              className='bg-(--primary) text-white py-3 rounded-xs disabled:opacity-50'
            >
              {loading
                ? 'Submitting...'
                : resolving
                ? 'Verifying Account...'
                : 'Submit Event for Approval'}
            </button>
          </form>
        </div>
      </div>

      <div>
        <LivePreview
          name={name}
          photo={photo}
          coverStyle={coverStyle}
          description={description}
          location={location}
          date={date}
          category={category}
          organizer={organizer}
          genres={genres}
          tickets={tickets}
          schedules={schedules}
          sponsors={sponsors}
          theme={theme}
        />
      </div>
    </div>
  )
}

export default CreateEvent
