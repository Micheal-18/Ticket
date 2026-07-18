import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { 
  FiCheckCircle, 
  FiMapPin, 
  FiGlobe, 
  FiInstagram, 
  FiFacebook, 
  FiTwitter, 
  FiPhone, 
  FiCalendar, 
  FiUsers, 
  FiAward, 
  FiStar,
  FiUser
} from 'react-icons/fi'
import { FaTiktok } from 'react-icons/fa'
import FollowButton from '../components/FolllowButton'
import OptimizedImage from '../components/OptimizedImage'

const PublicOrganizerProfile = ({ currentUser, currentUserId }) => {
  const { uid } = useParams()
  
  // Real-time State Matrix
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [followersCount, setFollowersCount] = useState(0)
  const [activeTab, setActiveTab] = useState('upcoming') // upcoming | past | about

  // 1. Listen to Organizer Profile Document changes real-time
  useEffect(() => {
    if (!uid) return

    const unsubscribe = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() })
      } else {
        setProfile(null)
      }
      setLoading(false)
    }, (error) => {
      console.error("Error listening to organizer document:", error)
      setLoading(false)
    })

    return unsubscribe
  }, [uid])

  // 2. Real-time Followers counting
  useEffect(() => {
    if (!uid) return

    const unsubscribe = onSnapshot(doc(db, "users", uid), (snapshot) => {
      if (snapshot.exists()) {
        setFollowersCount(snapshot.data().followersCount || 0)
      }
    })
    return unsubscribe
  }, [uid])

  // 3. Real-time Events querying hosted by this provider
  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'events'),
      where('ownerId', '==', uid),
      orderBy('startTime', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = []
      snapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() })
      })
      setEvents(fetchedEvents)
    }, (error) => {
      console.error("Error matching events tracking logs:", error)
    })

    return unsubscribe
  }, [uid])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-color) text-(--text-color) px-4">
        <p className="animate-pulse text-base sm:text-lg font-semibold uppercase tracking-wider">Loading Organizer Profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-color) text-(--text-color) p-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold uppercase mb-2">Organizer Not Found</h2>
        <p className="text-gray-500 mb-6 max-w-sm text-sm sm:text-base">The requested brand channel does not exist or has been modified.</p>
        <Link to="/" className="bg-(--primary) text-white px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-transform active:scale-95">Return Home</Link>
      </div>
    )
  }

  // Segment events timeline cleanly
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.endTime || e.date) >= now)
  const pastEvents = events.filter(e => new Date(e.endTime || e.date) < now)

  // Calculate accumulated ticket sales safely
  const aggregateTicketsSold = Array.isArray(events) 
    ? events.reduce((acc, curr) => acc + (Number(curr.ticketSold) || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-color) pb-16">
      {/* Cover Backdrop */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full bg-(--surface) overflow-hidden">
        {profile.coverPhoto ? (
          <OptimizedImage 
            src={profile.coverPhoto} 
            className="w-full h-full object-cover"
            alt={`${profile.organizer || profile.fullName} cover`}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-(--primary)/20 to-amber-600/30" />
        )}
      </div>

      {/* Main Structural Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          
          {/* LEFT PANEL: Identity and Content Matrix */}
          <div className="space-y-6 sm:space-y-8 w-full min-w-0">
            {/* Header Details Card */}
            <div className="bg-(--surface) border border-(--border) rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full min-w-0">
                {/* Brand Logo Container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-(--surface) shadow-md bg-(--surface) flex-shrink-0 relative">
                  {profile.photoURL ? (
                    <OptimizedImage src={profile.photoURL} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-zinc-100 dark:bg-zinc-800">
                      <FiUser size={40} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2 w-full min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap max-w-full">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate max-w-full">
                      {profile.organizer || profile.fullName}
                    </h1>
                    {profile.verified && (
                      <FiCheckCircle className="text-blue-500 text-lg sm:text-xl md:text-2xl flex-shrink-0" title="Verified Professional Organizer" />
                    )}
                  </div>
                  <p className="text-gray-500 font-medium text-xs sm:text-sm truncate">@{profile?.orgName || 'organizer'}</p>
                  
                  {profile.venue?.name && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-full">
                      <FiMapPin className="flex-shrink-0" />
                      <span className="truncate">{profile.venue.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-3 justify-center w-full md:w-auto flex-shrink-0">
                {currentUserId !== uid && (
                  <FollowButton 
                    currentUser={currentUser}
                    currentUserId={currentUserId}
                    ownerId={uid}
                  />
                )}
              </div>
            </div>

            {/* Core Analytics Metric Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Events Hosted', count: events.length, icon: <FiCalendar className="text-(--primary)" /> },
                { label: 'Followers', count: followersCount, icon: <FiUsers className="text-blue-500" /> },
                { label: 'Tickets Sold', count: aggregateTicketsSold, icon: <FiAward className="text-green-500" /> },
                { label: 'Rating', count: '4.9/5', icon: <FiStar className="text-amber-500 fill-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-(--bg-color) border border-(--border) p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 bg-(--surface) border border-(--border) rounded-xl text-lg sm:text-xl flex-shrink-0">{stat.icon}</div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">{stat.count}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold mt-0.5 truncate break-all">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs for Navigating Brand Assets */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex border-b border-(--border) gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x">
                {['upcoming', 'past', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 sm:pb-4 font-bold text-xs sm:text-sm uppercase tracking-wider relative transition-all cursor-pointer whitespace-nowrap snap-items ${
                      activeTab === tab ? 'text-(--primary)' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab} ({tab === 'upcoming' ? upcomingEvents.length : tab === 'past' ? pastEvents.length : 'Info'})
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--primary)" />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Content Views */}
              <div className="min-h-64">
                {activeTab === 'upcoming' && (
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-gray-500 py-12 col-span-full text-center border-2 border-dashed border-(--border) rounded-2xl text-sm sm:text-base">No upcoming live schedules listed.</p>
                    ) : (
                      upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
                    )}
                  </div>
                )}

                {activeTab === 'past' && (
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {pastEvents.length === 0 ? (
                      <p className="text-gray-500 py-12 col-span-full text-center border-2 border-dashed border-(--border) rounded-2xl text-sm sm:text-base">No historical logs found.</p>
                    ) : (
                      pastEvents.map(event => <EventCard key={event.id} event={event} />)
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="bg-(--surface) border border-(--border) rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg uppercase mb-3 tracking-wide">About Organizer</h3>
                      <p className="leading-relaxed text-sm sm:text-base whitespace-pre-wrap opacity-80 text-zinc-700 dark:text-zinc-300">{profile.bio || "No professional profile biography added yet."}</p>
                    </div>

                    {profile.achievementBadges && profile.achievementBadges.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider mb-3">Badges & Accolades</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.achievementBadges.map((badge, idx) => (
                            <span key={idx} className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider border border-orange-200/40">
                              🏆 {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Communications Panel / Brand Channels */}
          <div className="space-y-6 lg:sticky lg:top-6 w-full lg:max-w-none">
            <div className="bg-(--surface) border border-(--border) rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
              <h3 className="font-bold text-base sm:text-lg uppercase border-b border-(--border) pb-3 tracking-wide">Channels & Matrix</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { icon: <FiGlobe />, value: profile.website, label: "Website", url: profile.website },
                  { icon: <FiInstagram />, value: profile.instagram, label: "Instagram", url: profile.instagram ? `https://instagram.com/${profile.instagram}` : null },
                  { icon: <FiFacebook />, value: profile.facebook, label: "Facebook", url: profile.facebook },
                  { icon: <FiTwitter />, value: profile.twitter, label: "Twitter", url: profile.twitter ? `https://twitter.com/${profile.twitter}` : null },
                  { icon: <FaTiktok />, value: profile.tiktok, label: "TikTok", url: profile.tiktok ? `https://tiktok.com/@${profile.tiktok}` : null },
                  { icon: <FiPhone />, value: profile.phone, label: "Contact Channel", url: profile.phone ? `tel:${profile.phone}` : null }
                ].map((channel, idx) => {
                  if (!channel.value) return null
                  return (
                    <div key={idx} className="flex items-start gap-3 text-sm group min-w-0">
                      <div className="text-gray-400 group-hover:text-(--primary) text-lg transition-colors mt-1 flex-shrink-0">
                        {channel.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] sm:text-xs text-gray-400 block font-semibold uppercase tracking-wider">{channel.label}</span>
                        {channel.url ? (
                          <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 font-medium hover:text-(--primary) hover:underline block truncate text-xs sm:text-sm transition-colors">
                            {channel.value}
                          </a>
                        ) : (
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium block truncate text-xs sm:text-sm">{channel.value}</span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* If no contact details are setup */}
                {![profile.website, profile.instagram, profile.facebook, profile.twitter, profile.tiktok, profile.phone].some(Boolean) && (
                  <p className="text-gray-400 text-xs sm:text-sm italic py-2 col-span-full">No public contact channels updated yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Inline Sub-component for Event Cards
const EventCard = ({ event }) => {
  const eventDate = new Date(event.startTime || event.date)
  
  return (
    <Link to={`/event/${event.slug || event.id}`} className="group bg-(--surface) border border-(--border) rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-(--primary)/50 transition-all flex flex-col w-full min-w-0 h-full">
      <div className="h-40 sm:h-44 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative flex-shrink-0">
        {event.photo ? (
          <OptimizedImage src={event.photo} className="w-full h-full object-cover group-hover:scale-102 transition duration-500" alt={event.name} />
        ) : (
          <div className="w-full h-full bg-(--surface) border-b border-(--border)" />
        )}
        <div className="absolute top-3 left-3 bg-(--surface) border border-(--border) backdrop-blur-xs px-2.5 py-1 sm:py-1.5 rounded-xl text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-(--primary)">
            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
          </p>
          <p className="text-base sm:text-lg font-black leading-tight">
            {eventDate.toLocaleDateString('en-US', { day: '2-digit' })}
          </p>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
        <div className="min-w-0 space-y-1">
          <span className="text-[10px] font-bold text-(--primary) uppercase tracking-widest block truncate">{event.category || 'Gathering'}</span>
          <h4 className="font-bold text-base sm:text-lg group-hover:text-(--primary) transition-colors line-clamp-2 leading-snug">{event.name}</h4>
        </div>
        
        <p className="text-[11px] sm:text-xs font-semibold text-gray-500 line-clamp-1 uppercase tracking-wide flex items-center gap-1 min-w-0">
          <span className="flex-shrink-0">📍</span> 
          <span className="truncate">{event.venue?.name || event.location || 'Virtual Matrix'}</span>
        </p>
      </div>
    </Link>
  )
}

export default PublicOrganizerProfile