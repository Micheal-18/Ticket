import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import OptimizedImage from '../../components/OptimizedImage';
import { FaCalendar, FaLocationArrow, FaUsers } from 'react-icons/fa';
import { Link, useOutletContext } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import Blog from '../../pages/Blog'; 
import logo from '../../assets/Default.png'; // Fallback avatar source

const UserMain = () => {
  const { currentUser } = useOutletContext();
  
  const [events, setEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        // 1. Fetch Approved Events
        const eventsQuery = query(collection(db, "events"), where("status", "==", "approved"));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);

        // 2. Fetch User Followers if currentUser exists
        if (currentUser?.uid) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists() && userDocSnap.data().followers) {
            const followerIds = userDocSnap.data().followers; // Expected structure: Array of string UIDs
            
            if (followerIds.length > 0) {
              // Map through and resolve profiles for the first few followers
              const profilePromises = followerIds.slice(0, 5).map(async (uid) => {
                const followerSnap = await getDoc(doc(db, "users", uid));
                return followerSnap.exists() ? { id: uid, ...followerSnap.data() } : null;
              });
              
              const resolvedFollowers = await Promise.all(profilePromises);
              setFollowers(resolvedFollowers.filter(f => f !== null));
            }
          }
        }
      } catch (err) {
        console.error("Error building user dashboard datasets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContent();
  }, [currentUser]);

  /* 🛠️ RESILIENT PARSER FOR INCOMING DATA (From Component A) */
  const parseToNativeDate = (dateField) => {
    if (!dateField) return null;
    if (dateField instanceof Date && !isNaN(dateField.getTime())) return dateField;
    if (typeof dateField.toDate === "function") return dateField.toDate();
    if (dateField.seconds) return new Date(dateField.seconds * 1000);
    
    if (typeof dateField === "string" && dateField.includes("-") && !dateField.includes("T")) {
      const [year, month, day] = dateField.split("-").map(Number);
      return new Date(year, month - 1, day); 
    }

    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  /* 🛠️ BEAUTIFUL DATE FORMATTER ENGINE (From Component A) */
  const getFormattedDateString = (dateField) => {
    const eventDate = parseToNativeDate(dateField);
    return eventDate
      ? eventDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      : "Date error";
  };

/* 🛠️ INTELLIGENT TIME FORMATTER ENGINE WITH EXPLICIT ISO & 12-HOUR REGIME */
  const getFormattedTimeString = (event) => {
    // Case A: If event.startTime is a full ISO timestamp string containing a "T"
    if (typeof event.startTime === "string" && event.startTime.includes("T")) {
      const parsedStart = new Date(event.startTime);
      if (!isNaN(parsedStart.getTime())) {
        return parsedStart.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }

    // Case B: Fallback if event.date contained a full time component
    const eventDate = parseToNativeDate(event.date);
    if (typeof event.date === "string" && event.date.includes("T") && eventDate) {
      return eventDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // Case C: If event.startTime is just a standalone time string (e.g., "16:00")
    if (typeof event.startTime === "string" && event.startTime.includes(":")) {
      const parts = event.startTime.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      if (!isNaN(hours) && !isNaN(minutes)) {
        const tempDate = new Date();
        tempDate.setHours(hours, minutes, 0, 0);
        return tempDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }

    // Case D: Fallback to whatever raw string value is provided
    return event.startTime || "N/A";
  };

  // Partition events dynamically using normalized cutoff filters
  const sortedEvents = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return {
      highlighted: events.filter(e => e.highlighted === true),
      
      ongoing: events.filter(e => {
        const baseDate = parseToNativeDate(e.date);
        if (!baseDate) return false;

        let startHours = 0, startMinutes = 0;
        if (typeof e.startTime === "string" && e.startTime.includes(":")) {
          const parts = e.startTime.split(":");
          startHours = parseInt(parts[0], 10) || 0;
          startMinutes = parseInt(parts[1], 10) || 0;
        }

        const start = new Date(baseDate);
        start.setHours(startHours, startMinutes, 0, 0);

        let end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
        if (typeof e.endTime === "string" && e.endTime.includes(":")) {
          const parts = e.endTime.split(":");
          const endHours = parseInt(parts[0], 10) || 0;
          const endMinutes = parseInt(parts[1], 10) || 0;
          end = new Date(baseDate);
          end.setHours(endHours, endMinutes, 0, 0);
        }

        return now >= start && now <= end;
      }),
      
      upcoming: events.filter(e => {
        const eventDate = parseToNativeDate(e.date);
        if (!eventDate) return false;

        let startHours = 0, startMinutes = 0;
        if (typeof e.startTime === "string" && e.startTime.includes(":")) {
          const parts = e.startTime.split(":");
          startHours = parseInt(parts[0], 10) || 0;
          startMinutes = parseInt(parts[1], 10) || 0;
        }

        const preciseStart = new Date(eventDate);
        preciseStart.setHours(startHours, startMinutes, 0, 0);

        return preciseStart > now || eventDate.getTime() >= todayMidnight.getTime();
      })
    };
  }, [events]);

  if (loading) {
    return (
      <div className="animate-loading-bar">
      </div>
    );
  }

  const renderEventGrid = (eventList, fallbackMessage) => {
    if (eventList.length === 0) {
      return <p className="text-sm text-gray-400 font-medium italic pl-1 py-2">{fallbackMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventList.slice(0, 3).map(event => (
          <Link 
            to={`/event/${event.slug}`} 
            key={event.id} 
            className="group border border-gray-200/10 shadow-sm rounded-2xl p-3 flex gap-4 hover:shadow-md transition-all"
          >
            <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden aspect-square">
              <OptimizedImage 
                src={event.photoURL || "/fallback.jpg"} 
                alt={event.name} 
                className="w-full h-full object-cover group-hover:scale-105 duration-300" 
              />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
              <h4 className="font-bold text-sm text-(--text-color) truncate group-hover:text-orange-500 transition-colors uppercase tracking-wide">
                {event.name}
              </h4>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                <FaCalendar className="text-orange-500 shrink-0" size={12} /> 
                {getFormattedDateString(event.date)} at {getFormattedTimeString(event)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                <FaLocationArrow className="text-orange-500 shrink-0" size={11} /> {event.location}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-14">
      
      {/* 👥 FOLLOWERS OVERVIEW SECTION */}
      <section className="bg-gradient-to-r from-orange-500/5 via-transparent to-transparent p-4 rounded-2xl border border-gray-200/10">
        <div className="flex items-center justify-between  mb-4">
          <h2 className="text-lg font-extrabold uppercase tracking-wide flex items-center gap-2">
            <FaUsers className="text-orange-500" size={20} /> Community Connections
          </h2>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2.5 py-1 rounded-full">
            {followers.length > 0 ? `${followers.length} Recent` : '0 Followers'}
          </span>
        </div>
        
        {followers.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic py-2">No connections on file yet. Share your events to grow your network!</p>
        ) : (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex -space-x-3 overflow-hidden">
              {followers.map(follower => (
                <img
                  key={follower.id}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-(--bg-color) object-cover"
                  src={follower.photoURL || logo}
                  alt={follower.fullName || "User Avatar"}
                  title={follower.fullName}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Followed by <span className="text-(--text-color) font-bold">{followers[0]?.fullName || 'Community members'}</span> 
              {followers.length > 1 && ` and ${followers.length - 1} others`}
            </div>
          </div>
        )}
      </section>

      {/* 🌟 HIGHLIGHTED EXPERIENCE EXPERIENCES */}
      {sortedEvents.highlighted.length > 0 && (
        <section>
          <h2 className="text-xl font-black uppercase tracking-wider text-orange-500 mb-4">🌟 Featured Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEvents.highlighted.slice(0, 2).map(event => (
              <Link 
                to={`/event/${event.slug}`} 
                key={event.id} 
                className="group relative rounded-3xl overflow-hidden aspect-[21/9] flex items-end p-6 border border-gray-200/10 shadow-sm"
              >
                <div className="absolute inset-0 z-0">
                  <OptimizedImage 
                    src={event.photoURL || "/fallback.jpg"} 
                    alt={event.name} 
                    className="w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>
                <div className="relative z-10 text-white space-y-1.5 min-w-0 w-full">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-orange-500 text-white rounded-md">Featured</span>
                  <h3 className="text-xl font-extrabold truncate uppercase tracking-tight">{event.name}</h3>
                  <p className="text-xs text-zinc-300 flex items-center gap-2">
                    <FaLocationArrow size={10} /> {event.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 📅 DYNAMIC EVENT SECTIONS */}
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-wide border-l-4 border-emerald-500 pl-3 mb-4">🔴 Live & Ongoing</h2>
          {renderEventGrid(sortedEvents.ongoing, "No live experiences running right now.")}
        </section>

        <section>
          <h2 className="text-lg font-extrabold uppercase tracking-wide border-l-4 border-blue-500 pl-3 mb-4">⏳ Upcoming Lineup</h2>
          {renderEventGrid(sortedEvents.upcoming, "No forthcoming activities loaded on file.")}
        </section>
      </div>

      {/* 📰 INTEGRATED BLOG VIEW SECTION */}
      <div className="border-t border-gray-200/10 pt-6">
        <Blog 
          blog={blogs} 
          setBlog={setBlogs} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
};

export default UserMain;