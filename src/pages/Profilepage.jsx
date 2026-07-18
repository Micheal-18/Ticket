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

  // 2. Real-time Followers counting from structural subcollection
  useEffect(() => {
    if (!uid) return

const unsubscribe = onSnapshot(doc(db, "users", uid), (snapshot) => {
  if (snapshot.exists()) {
    setFollowersCount(snapshot.data().followersCount || 0);
  }
});
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
      <div className="min-h-screen flex items-center justify-center bg-(--bg-color) text-(--text-color)">
        <p className="animate-pulse text-lg font-semibold uppercase tracking-wider">Loading Organizer Profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-color) text-(--text-color) p-6">
        <h2 className="text-2xl font-bold uppercase mb-2">Organizer Not Found</h2>
        <p className="text-gray-500 mb-6">The requested brand channel does not exist or has been modified.</p>
        <Link to="/" className="bg-(--primary) text-white px-6 py-3 rounded-xl font-semibold">Return Home</Link>
      </div>
    )
  }

  // Segment events timeline cleanly
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.endTime || e.date) >= now)
  const pastEvents = events.filter(e => new Date(e.endTime || e.date) < now)

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-color) pb-16">
      {/* Cover Backdrop */}
      <div className="relative h-64 md:h-80 w-full bg-(--surface) overflow-hidden">
        {profile.coverPhoto ? (
          <OptimizedImage 
            src={profile.coverPhoto} 
            className="w-full h-full object-cover"
            alt={`${profile.company || profile.fullName} cover`}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-orange-500/20 to-amber-600/30" />
        )}
      </div>

      {/* Main Structural Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* LEFT PANEL: Identity and Content Matrix */}
          <div className="space-y-8">
            {/* Header Details */}
            <div className="bg-(--surface) border border-(--border) rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                {/* Brand Logo Container */}
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-(--border) shadow-md bg-zinc-100 flex-shrink-0">
                  {profile.photoURL ? (
                    <OptimizedImage src={profile.photoURL} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <FiUser size={48} />
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight">{profile.organizer || profile.fullName}</h1>
                    {profile.verified && (
                      <FiCheckCircle className="text-blue-500 text-2xl flex-shrink-0" title="Verified Professional Organizer" />
                    )}
                  </div>
                  <p className="text-gray-500 font-medium text-sm">@{profile?.orgName || 'organizer'}</p>
                  
                  {profile.venue && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiMapPin />
                      <span>{profile.venue?.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-3 justify-center w-full md:w-auto">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Events Hosted', count: events.length, icon: <FiCalendar className="text-orange-500" /> },
                { label: 'Followers', count: profile?.followersCount, icon: <FiUsers className="text-blue-500" /> },
                { label: 'Tickets Sold', count: events.ticketSold || 0, icon: <FiAward className="text-green-500" /> },
                { label: 'Rating', count: '4.9/5', icon: <FiStar className="text-amber-500 fill-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900/30 border border-(--border) p-5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl text-xl">{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{stat.count}</p>
                    <p className="text-xs text-gray-500 uppercase font-semibold mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs for Navigating Brand Assets */}
            <div className="space-y-6">
              <div className="flex border-b border-(--border) gap-6 overflow-x-auto">
                {['upcoming', 'past', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-bold text-sm uppercase tracking-wider relative transition-all cursor-pointer whitespace-nowrap ${
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
                  <div className="grid md:grid-cols-2 gap-6">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-gray-500 py-10 col-span-2 text-center border-2 border-dashed border-(--border) rounded-2xl">No upcoming live schedules listed.</p>
                    ) : (
                      upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
                    )}
                  </div>
                )}

                {activeTab === 'past' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {pastEvents.length === 0 ? (
                      <p className="text-gray-500 py-10 col-span-2 text-center border-2 border-dashed border-(--border) rounded-2xl">No historical logs found.</p>
                    ) : (
                      pastEvents.map(event => <EventCard key={event.id} event={event} />)
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="bg-white dark:bg-zinc-900/20 border border-(--border) rounded-3xl p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="font-bold text-lg uppercase mb-3 tracking-wide">About Organizer</h3>
                      <p className="leading-relaxed whitespace-pre-wrap opacity-80">{profile.bio || "No professional profile biography added yet."}</p>
                    </div>

                    {profile.achievementBadges && profile.achievementBadges.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm uppercase text-gray-400 tracking-wider mb-3">Badges & Accolades</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.achievementBadges.map((badge, idx) => (
                            <span key={idx} className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-orange-200/50">
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
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="bg-white dark:bg-zinc-900/50 border border-(--border) rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-lg uppercase border-b border-(--border) pb-3 tracking-wide">Channels & Matrix</h3>
              
              <div className="space-y-4">
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
                    <div key={idx} className="flex items-center gap-3 text-sm group">
                      <div className="text-gray-400 group-hover:text-(--primary) text-lg transition-colors">
                        {channel.icon}
                      </div>
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                        <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">{channel.label}</span>
                        {channel.url ? (
                          <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-zinc-300 font-medium hover:text-(--primary) hover:underline break-all">
                            {channel.value}
                          </a>
                        ) : (
                          <span className="text-gray-700 dark:text-zinc-300 font-medium">{channel.value}</span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* If no contact details are setup */}
                {![profile.website, profile.instagram, profile.facebook, profile.twitter, profile.tiktok, profile.phone].some(Boolean) && (
                  <p className="text-gray-500 text-sm italic py-2">No public contact channels updated yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Inline Sub-component for Cleaner Layout Modularization
const EventCard = ({ event }) => {
  const eventDate = new Date(event.startTime || event.date)
  
  return (
    <Link to={`/event/${event.slug}`}className="group bg-white dark:bg-zinc-900/30 border border-(--border) rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-orange-500/50 transition-all flex flex-col">
      <div className="h-44 w-full bg-zinc-100 overflow-hidden relative">
        {event.photo ? (
          <OptimizedImage src={event.photo} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={event.name} />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" />
        )}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-3 py-1.5 rounded-xl text-center shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-(--primary)">
            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
          </p>
          <p className="text-lg font-black leading-tight">
            {eventDate.toLocaleDateString('en-US', { day: '2-digit' })}
          </p>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{event.category || 'Gathering'}</span>
          <h4 className="font-bold text-lg group-hover:text-(--primary) transition-colors line-clamp-1 mt-0.5">{event.name}</h4>
        </div>
        
        <p className="text-xs font-semibold text-gray-500 line-clamp-1 uppercase tracking-wide">
          📍 {event.venue?.name || event.location || 'Virtual Matrix'}
        </p>
      </div>
    </Link>
  )
}

export default PublicOrganizerProfile