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

                // 2. Fetch People I'm Following
        if (currentUser?.uid) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const followingIds = userDocSnap.data().following || [];

            if (followingIds.length > 0) {
              const profilePromises = followingIds.slice(0, 5).map(async (uid) => {
                const userSnap = await getDoc(doc(db, "users", uid));

                return userSnap.exists()
                  ? { id: uid, ...userSnap.data() }
                  : null;
              });

              const resolvedProfiles = await Promise.all(profilePromises);

              setFollowers(
                resolvedProfiles.filter(profile => profile !== null)
              );
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

  const getDateTime = (dateField, timeField) => {
    const date = parseToNativeDate(dateField);

    if (!date) return null;

    // ISO datetime
    if (
      typeof timeField === "string" &&
      timeField.includes("T")
    ) {
      const iso = new Date(timeField);
      return isNaN(iso) ? null : iso;
    }

    // HH:mm
    if (
      typeof timeField === "string" &&
      /^\d{1,2}:\d{2}$/.test(timeField)
    ) {
      const [h, m] = timeField.split(":").map(Number);
      const result = new Date(date);
      result.setHours(h, m, 0, 0);
      return result;
    }

    return date;
  };

  return {
    highlighted: events.filter(e => e.highlighted),

    ongoing: events.filter(e => {
      const start = getDateTime(e.date, e.startTime);
      const end = getDateTime(e.date, e.endTime);

      return start && end && now >= start && now <= end;
    }),

    upcoming: events.filter(e => {
      const start = getDateTime(e.date, e.startTime);

      return start && start > now;
    }),

    past: events.filter(e => {
      const end = getDateTime(e.date, e.endTime);

      return end && end < now;
    }),
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
                src={event.photoURL || event.photo || "/fallback.jpg"} 
                alt={event.name} 
                className="w-full h-full object-cover group-hover:scale-105 duration-300" 
              />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
              <h4 className="font-bold text-sm text-(--text-color) truncate group-hover:text-(--primary) transition-colors uppercase tracking-wide">
                {event.name}
              </h4>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                <FaCalendar className="text-(--primary) shrink-0" size={12} /> 
                {getFormattedDateString(event.date)} at {getFormattedTimeString(event)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                <FaLocationArrow className="text-(--primary) shrink-0" size={11} /> {event.venue.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div  className="space-y-14">
      
      {/* 👥 FOLLOWERS OVERVIEW SECTION */}
      <section className="bg-gradient-to-r from-(--primary)/5 via-transparent to-transparent p-4 rounded-2xl border border-gray-200/10">
        <div className="flex items-center justify-between  mb-4">
          <h2 className="text-lg font-extrabold uppercase tracking-wide flex items-center gap-2">
            <FaUsers className="text-(--primary)" size={20} />
            Following
          </h2>
          <span className="text-xs font-bold text-(--primary) uppercase tracking-wider bg-(--primary)/10 px-2.5 py-1 rounded-full">
            {followers.length} Following
          </span>
        </div>
        
        {followers.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium italic py-2">
            You are not following anyone yet.
          </p>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Following{" "}
            <span className="text-(--text-color) font-bold">
              {followers[0]?.fullName || "Users"}
            </span>
            {followers.length > 1 && ` and ${followers.length - 1} others`}
          </div>
        )}
      </section>

      {/* Become Organizer */}
<section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div>
    <h2 className="text-xl font-bold text-(--text-color)">
      Ready to host your own event?
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Upgrade your account and start creating, selling and managing tickets with Airticks.
    </p>
  </div>

  <Link
    to="/become-organizer"
    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
  >
    Become an Organizer
  </Link>
</section>

      {/* 🌟 HIGHLIGHTED EXPERIENCE EXPERIENCES */}
      {sortedEvents.highlighted.length > 0 && (
        <section>
          <h2 className="text-xl font-black uppercase tracking-wider text-(--primary) mb-4">🌟 Featured Highlights</h2>
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
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-(--primary) text-white rounded-md">Featured</span>
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