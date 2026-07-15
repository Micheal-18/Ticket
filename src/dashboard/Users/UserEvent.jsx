import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import OptimizedImage from '../../components/OptimizedImage';
import { FaTicketAlt, FaCalendar, FaLocationArrow, FaQrcode, FaArrowRight } from 'react-icons/fa';
import { Link, useOutletContext } from 'react-router-dom';
import Spinner from '../../components/Spinner';

const UserEventsAndTickets = () => {
  const { currentUser } = useOutletContext();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchUserTickets = async () => {
      // Fallback matching logic strategy for guests or active users
      const targetUserId = currentUser?.uid || localStorage.getItem("guest_userId");
      const targetEmail = currentUser?.email || localStorage.getItem("guest_email");

      if (!targetUserId && !targetEmail) {
        setLoading(false);
        return;
      }

      try {
        let ticketsQuery;
        if (targetUserId) {
          ticketsQuery = query(
            collection(db, "tickets"), 
            where("userId", "==", targetUserId)
          );
        } else {
          ticketsQuery = query(
            collection(db, "tickets"),
            where("email", "==", targetEmail.toLowerCase().trim())
          );
        }

        const ticketSnapshot = await getDocs(ticketsQuery);
        const rawTickets = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 🔄 BACKEND CROSS-REFERENCE ENHANCEMENT PIPELINE
        // Since the backend writes lightweight metadata, we pull fresh layout definitions directly from the event document.
        const augmentedTickets = await Promise.all(
          rawTickets.map(async (ticket) => {
            if (!ticket.eventId) return ticket;
            try {
              const eventSnap = await getDocs(query(collection(db, "events")));
              const targetEventDoc = eventSnapshotFinder(eventSnap, ticket.eventId);
              
              if (targetEventDoc) {
                return {
                  ...ticket,
                  eventDate: targetEventDoc.date,
                  eventTime: targetEventDoc.startTime,
                  location: targetEventDoc.venue.name,
                  photoURL: targetEventDoc.photoURL || targetEventDoc.photo,
                  slug: targetEventDoc.slug || ""
                };
              }
            } catch (err) {
              console.warn(`Could not cross-reference context for event ${ticket.eventId}:`, err);
            }
            return ticket;
          })
        );

        setTickets(augmentedTickets);
      } catch (err) {
        console.error("Error building ticket array maps:", err);
      } finally {
        setLoading(false);
      }
    };

    const eventSnapshotFinder = (snap, id) => {
      const match = snap.docs.find(d => d.id === id);
      return match ? match.data() : null;
    };

    fetchUserTickets();
  }, [currentUser]);


  /* 🛠️ NORMALIZED NATIVE TIMESTAMP COERCION UTILITY */
  const parseToNativeDate = (dateField) => {
    if (!dateField) return null;
    if (dateField instanceof Date) return dateField;
    if (typeof dateField.toDate === "function") return dateField.toDate();
    if (dateField.seconds) return new Date(dateField.seconds * 1000);
    
    if (typeof dateField === "string" && dateField.includes("-") && !dateField.includes("T")) {
      const [year, month, day] = dateField.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateField);
  };

    /* 🎨 HUMAN-READABLE DATE & TIME FORMATTING UTILITY */
const formatEventDateTime = (dateField) => {
  const nativeDate = parseToNativeDate(dateField);
  if (!nativeDate || isNaN(nativeDate.getTime())) {
    return typeof dateField === 'string' ? dateField : "Date & Time TBD";
  }
  
  // Format the calendar date string
  const dateStr = nativeDate.toLocaleDateString('en-US', {
    weekday: 'short', 
    month: 'short',   
    day: 'numeric',   
    year: 'numeric'   
  });

  // Format the time string safely
  const timeStr = nativeDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true // e.g., "6:30 PM"
  });

  // If the parsed time is exactly midnight (00:00), it's usually just a fallback date without an explicit time set
  if (nativeDate.getHours() === 0 && nativeDate.getMinutes() === 0) {
    return dateStr;
  }

  return `${dateStr} @ ${timeStr}`;
};

  /* 📅 FILTER & SEGMENT DATA BY DATE SEPARATORS */
  const partitionedTickets = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return {
      upcoming: tickets.filter(t => {
        const targetDate = parseToNativeDate(t.eventDate);
        if (!targetDate) return true; // Fallback to valid if unparseable
        return targetDate.getTime() >= todayMidnight.getTime();
      }),
      past: tickets.filter(t => {
        const targetDate = parseToNativeDate(t.eventDate);
        if (!targetDate) return false;
        return targetDate.getTime() < todayMidnight.getTime();
      })
    };
  }, [tickets]);

  if (loading) {
    return (
      <div className="animate-spin flex items-center justify-center">
      </div>
    );
  }

  const currentTabTickets = activeTab === 'upcoming' ? partitionedTickets.upcoming : partitionedTickets.past;

  return (
    <div  className="space-y-8 max-w-7xl mx-auto px-1">
      
      {/* HEADER SECTION BLOCK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100  pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-(--text-color) flex items-center gap-2.5">
            <FaTicketAlt className="text-orange-500" size={22} /> My Access Passes
          </h1>
          <p className="text-xs text-gray-400 mt-1">Access verified tickets from your Express checkout history ledger.</p>
        </div>

        {/* TAB SWITCHES */}
        <div className="flex  p-1 rounded-xl self-start sm:self-center">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-white dark:bg-zinc-850 text-orange-500 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-zinc-300'
            }`}
          >
            Active Passes ({partitionedTickets.upcoming.length})
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
              activeTab === 'past' 
                ? 'bg-white dark:bg-zinc-850 text-orange-500 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-zinc-300'
            }`}
          >
            History ({partitionedTickets.past.length})
          </button>
        </div>
      </div>

      {/* CORE DISPLAY MATRIX */}
      {currentTabTickets.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-zinc-800/40 rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
            <FaTicketAlt className="text-orange-500" size={18} />
          </div>
          <h3 className="font-bold text-sm text-(--text-color) uppercase">No tickets loaded</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">No confirmation reference profiles found matching your system parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTabTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="shadow border border-gray-500 rounded-3xl p-4 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Cover Thumbnail */}
              <div className="w-full sm:w-32 aspect-video sm:aspect-square shrink-0 rounded-2xl overflow-hidden bg-zinc-800">
                <OptimizedImage 
                  src={ticket.photoURL || "/fallback.jpg"} 
                  alt={ticket.eventName} 
                  className="w-full h-full object-cover group-hover:scale-103 duration-500"
                />
              </div>

              {/* Information Layout Metadata */}
              <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3 sm:space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-500">
                      {ticket.ticketType} {/* Matches metadata.ticketLabel mapped in webhook/free init */}
                    </span>
                    <span className="text-[10px] font-bold shadow-sm px-1.5 py-0.5 rounded-md">
                      Qty: {ticket.ticketNumber || 1}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-(--text-color) uppercase tracking-wide truncate mt-1">
                    {ticket.eventName}
                  </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                    <FaCalendar className="text-orange-500/80 shrink-0" size={11} /> 
                    {formatEventDateTime(ticket.eventTime)}
                    </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                    <FaLocationArrow className="text-orange-500/80 shrink-0" size={11} /> {ticket.location}
                  </p>
                </div>

                {/* Actions Grid */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-500/5 sm:border-t-0">
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                  >
                    <FaQrcode size={12} /> Digital Pass
                  </button>
                  {ticket.slug && (
                    <Link 
                      to={`/event/${ticket.slug}`}
                      className="flex-1 sm:flex-none  hover:bg-zinc-800 border border-gray-500/10 text-center text-xs font-bold uppercase px-3 py-2.5 rounded-xl transition-colors"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎫 MODAL QR SLIDER SCREEN OVERLAY */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-(--bg-color) border border-zinc-800/40 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-6">
            
            <div className="flex justify-between items-center">
              <h4 className="font-black uppercase text-sm text-gray-400 tracking-wider">Gate Entrance Clearance</h4>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-(--bg-color) text-xs font-bold flex items-center justify-center text-gray-400 hover:text-(--text-color)"
              >
                ✕
              </button>
            </div>

            {/* Base64 Payment QR Core Rendering Framework */}
            <div className="text-center space-y-4">
              <div className="bg-(--bg-color) shadow hover:shadow-md p-6 rounded-2xl inline-block border border-gray-500/5 ">
                <div className="w-44 h-44 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2 mx-auto shadow-sm">
                  {selectedTicket.qr ? (
                    <img
                      src={`data:image/png;base64,${selectedTicket.qr}`}
                      alt="Gate Verification Access QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <FaQrcode size={120} className="text-zinc-300" />
                  )}
                </div>
                <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-3">
                  REF: #{selectedTicket.reference}
                </p>
              </div>

              <div className="space-y-1">
                <h2 className="font-black text-lg text-(--text-color) uppercase tracking-wide px-2 line-clamp-2">
                  {selectedTicket.eventName}
                </h2>
                <p className="text-xs text-orange-500 font-bold tracking-wide uppercase">
                  {selectedTicket.ticketType} Holder Pass ({selectedTicket.ticketNumber} seats)
                </p>
              </div>
            </div>

            {/* Verification Metadata Footer Grid */}
            <div className="border-t-2 border-dashed border-gray-100 dark:border-zinc-800/80 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Attendee Identity</span>
                  <span className="font-semibold text-(--text-color) truncate block">
                    {selectedTicket.buyerName || "Guest Registrant"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Transaction Ledger</span>
                  <span className="font-bold text-emerald-500 uppercase block">Paid ✓</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTicket.location || '')}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full  hover:bg-zinc-800 border border-gray-500/10 text-center font-bold uppercase text-[11px] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <FaLocationArrow size={10} /> Route Gate Location
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserEventsAndTickets;