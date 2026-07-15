import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { FiX as CloseIcon, FiLock } from 'react-icons/fi'
import PaystackPayment from '../components/PaystackPayment'
import { formatEventStatus } from '../utils/formatEventRange'
import OptimizedImage from '../components/OptimizedImage'
import FollowButton from '../components/FolllowButton'
import GoogleAuth from '../auth/GoogleAuth'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LoadingSkeleton from '../components/tickets/LoadingSkeleton'
import EventHero from '../components/tickets/EventHero'
import Countdown from '../components/tickets/Countdown'
import EventStats from '../components/tickets/EventStats'
import OrganizerCard from '../components/tickets/OrganizerCard'
import GuestList from '../components/tickets/GuestList'
import ScheduleTimeline from '../components/tickets/ScheduleTimeline'
import VenueCard from '../components/tickets/Venue'
import FAQSection from '../components/tickets/FaqSection'
import SponsorsSection from '../components/tickets/SponsorSection'
import OrganizerSection from '../components/tickets/OrganizerCard'
import RelatedEvents from '../components/tickets/RelatedEvent'
import TicketPurchaseCard from '../components/tickets/TicketPurchaseCard'

const TicketModal = ({ currentUser }) => {
  const { slug } = useParams()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [owner, setOwner] = useState(null)
  const [relatedEvents, setRelatedEvents] = useState([])
  const [ticketQty, setTicketQty] = useState({})
  const [coordinates, setCoordinates] = useState({ lat: 6.5244, lng: 3.3792 }) // Default to Lagos, Nigeria
  const [attendees, setAttendees] = useState([]) // [{name: "", email: ""}]

  // Fix Leaflet default marker icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    })
  }, [])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventQuery = query(
          collection(db, 'events'),
          where('slug', '==', slug),
          limit(1)
        )

        const querySnapshot = await getDocs(eventQuery)
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]
          const eventData = { id: docSnap.id, ...docSnap.data() }
          setSelectedEvent(eventData)

          const relatedQuery = query(
            collection(db, 'events'),
            where('category', '==', eventData.category),
            where('status', '==', 'approved'),
            limit(6)
          )

          try {
            const relatedSnap = await getDocs(relatedQuery)
            const related = relatedSnap.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .filter(event => event.id !== eventData.id)

            setRelatedEvents(related)
          } catch (err) {
            console.error('Related events failed', err)
          }

          try {
            const ownerSnap = await getDoc(doc(db, 'users', eventData.ownerId))
            if (ownerSnap.exists()) {
              setOwner({
                id: ownerSnap.id,
                ...ownerSnap.data()
              })
            }
          } catch (err) {
            console.error('Owner fetch failed', err)
          }

          if (eventData.venue) {
            geocodeLocation(eventData.venue?.address || eventData.venue?.name)
          }
        } else {
          console.error('❌ Event not found!')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        if (loading) setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  const geocodeLocation = async location => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      )
      const data = await response.json()
      if (data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleCheckoutAction = ticket => {
    const qty = ticketQty[ticket.id || ticket.label] || 0

    if (qty <= 0) {
      return alert('Please select at least 1 ticket quantity.')
    }

    if (!currentUser) {
      setSelectedTicket({
        ...ticket,
        num: qty,
        requiresAuth: true
      })
      return
    }

    setSelectedTicket({
      ...ticket,
      num: qty,
      requiresAuth: false
    })
  }

  // Handle Google authentication wall success bypass
  useEffect(() => {
    if (currentUser && selectedTicket?.requiresAuth) {
      setSelectedTicket(prev => ({
        ...prev,
        requiresAuth: false
      }))
    }
  }, [currentUser, selectedTicket])

  if (loading) return <LoadingSkeleton />
  if (!selectedEvent) {
    return <div className='text-center p-10 font-medium text-lg'>Event not found</div>
  }

  return (
    <div className='fixed left-0 top-0 w-full h-full backdrop-blur-md bg-(--bg-color)/40 flex justify-center items-center z-[9999] overflow-hidden'>
      <div className='relative w-full h-full max-w-7xl flex flex-col bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) shadow-2xl md:rounded-2xl md:h-[92vh] overflow-y-auto custom-scrollbar'>
        
        {/* Close Window Button */}
        <button
          type="button"
          aria-label="Close modal"
          className='text-2xl absolute top-4 right-4 md:right-8 bg-black/40 hover:bg-black/60 text-(
          --bg-color) p-2 rounded-full cursor-pointer hover:scale-105 transition-all z-50 flex items-center justify-center'
          onClick={() => window.history.back()}
        >
          <CloseIcon />
        </button>

        {/* Event Image Banner layout asset */}
        <div className='relative flex flex-col'>
          <EventHero event={selectedEvent} currentUser={currentUser} />

          <div className='absolute top-0 left-0 w-full flex justify-center max-w-7xl  p-4 md:p-6 text-(
          --bg-color) space-y-2'>
            <Countdown
            startTime={selectedEvent.startTime}
            endTime={selectedEvent.endTime}
          />
          </div>

        <div className='max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-8'>

          <EventStats event={selectedEvent} />

          <div >
            <h2 className="text-3xl font-bold uppercase">What to Expect</h2>
            <p className="opacity-70">
              All you need to know about the event
            </p>

            <div
              className="prose prose-sm md:prose-base max-w-none mt-4 font-mono"
              dangerouslySetInnerHTML={{
                __html: selectedEvent?.description || "",
              }}
            />
          </div>
          {/* Core Info & Ticket Purchase Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Middle Column - Description and Event Details */}
            <div className="lg:col-span-2 space-y-8">
              <GuestList guests={selectedEvent.guests} />
              
              <ScheduleTimeline schedules={selectedEvent.schedules} />
              
              <VenueCard event={selectedEvent} coordinates={coordinates} />
              
              <SponsorsSection sponsors={selectedEvent.sponsors} />
              
              <FAQSection faqs={selectedEvent.faqs} />
              
              <OrganizerSection
                organizer={selectedEvent.organizer}
                owner={owner}
                currentUser={currentUser}
                currentUserId={currentUser?.uid}
              />
            </div>

            {/* Right Column - Booking & Ticket Selector Panel */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="bg-(
              --bg-color) dark:bg-(--bg-color) border border-(--border) rounded-3xl p-6 shadow-xs">
                <h3 className="font-bold text-xl mb-4 text-(--bg-color) dark:text-zinc-50">Select Tickets</h3>
                
                <div className="space-y-4">
                  {selectedEvent.tickets?.map(ticket => {
                    const ticketId = ticket.id || ticket.label;
                    return (
                      <TicketPurchaseCard
                        key={ticketId}
                        ticket={ticket}
                        event={selectedEvent}
                        currentUser={currentUser}
                        quantity={ticketQty[ticketId] || 0}
                        attendees={attendees}
                        selected={selectedTicket?.id === ticketId || selectedTicket?.label === ticket.name}
                        onQuantityChange={qty => {
                          setTicketQty(prev => ({
                            ...prev,
                            [ticketId]: qty
                          }))

                          // Set up secondary attendees arrays (excluding buyer)
                          setAttendees(
                            Array(Math.max(0, qty - 1))
                              .fill(null)
                              .map(() => ({
                                name: '',
                                email: ''
                              }))
                          )

                          setSelectedTicket(null)
                        }}
                        onAttendeeChange={(index, field, value) => {
                          const copy = [...attendees]
                          copy[index][field] = value
                          setAttendees(copy)
                        }}
                        onSelect={() => handleCheckoutAction(ticket)}
                      />
                    )
                  })}
                </div>

                {/* Authentication Wall Prompt */}
                {selectedTicket?.requiresAuth && (
                  <div className="mt-6 border border-dashed border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl p-5 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600">
                      <FiLock size={20} />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      You need to secure your profile before securing these tickets.
                    </p>
                    <GoogleAuth className="w-full"/>
                  </div>
                )}

                {/* Dynamic Checkout Action Container */}
                {selectedTicket && !selectedTicket.requiresAuth && (
                  <div className="mt-6 pt-6 border-t border-(--border) ">
                    <PaystackPayment 
                      currentUser={currentUser}
                      event={selectedEvent}
                      ticket={selectedTicket}
                      quantity={ticketQty[selectedTicket.id || selectedTicket.label] || 0}
                      attendees={attendees}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          <RelatedEvents events={relatedEvents} />
        </div>
        </div>
      </div>
    </div>
  )
}

export default TicketModal