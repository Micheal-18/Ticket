import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FiX as CloseIcon } from "react-icons/fi"; // Adjusted duplicate naming cleaner
import PaystackPayment from "../components/PaystackPayment";
import { formatEventStatus } from "../utils/formatEventRange";
import OptimizedImage from "../components/OptimizedImage";
import FollowButton from "../components/FolllowButton";
import GoogleAuth from "../components/GoogleAuth";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TicketModal = ({ currentUser }) => {
  const { slug } = useParams();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [ticketQty, setTicketQty] = useState({});
  const [coordinates, setCoordinates] = useState({ lat: 6.5244, lng: 3.3792 }); // Default to Lagos, Nigeria

  // Fix Leaflet default marker icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const numberOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventQuery = query(
          collection(db, "events"),
          where("slug", "==", slug),
          limit(1)
        );
        const querySnapshot = await getDocs(eventQuery);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const eventData = { id: docSnap.id, ...docSnap.data() };
          setSelectedEvent(eventData);
          
          // Geocode the location
          if (eventData.location) {
            geocodeLocation(eventData.location);
          }
        } else {
          console.error("❌ Event not found!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        loading && setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // Geocode location string to coordinates using Google Geocoding API
  const geocodeLocation = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Keep default coordinates if geocoding fails
    }
  };

  const handleCheckoutAction = (ticket) => {
    const qty = ticketQty[ticket.label] || 0;

    if (qty <= 0) {
      return alert("Please select at least 1 ticket quantity.");
    }

    if (!currentUser) {
      // Prompt Authentication Wall
      setSelectedTicket({
        ...ticket,
        num: qty,
        requiresAuth: true,
      });
      return;
    }

    setSelectedTicket({
      ...ticket,
      num: qty,
      requiresAuth: false,
    });
  };

  // Keep state sync updated when user logs in via the GoogleAuth wall trigger
  useEffect(() => {
    if (currentUser && selectedTicket?.requiresAuth) {
      setSelectedTicket((prev) => ({
        ...prev,
        requiresAuth: false,
      }));
    }
  }, [currentUser, selectedTicket]);

  const formatDate = (date) => {
    try {
      if (!date) return "Date not set";
      const formattedDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      if (isNaN(formattedDate)) return "Invalid date";

      return formattedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) return <div className="text-center p-10">Loading event...</div>;
  if (!selectedEvent) return <div className="text-center p-10">Event not found</div>;

  return (
    <div className="fixed left-0 top-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-[9999] custom-scrollbar">
      <div className="relative w-full flex justify-center items-center">
        <div className="flex flex-col bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) space-y-4 p-6 rounded-lg shadow-lg lg:w-[70%] w-[80%] max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Close Window Banner Button */}
          <div
            className="text-2xl absolute top-4 lg:right-1/6 right-12 cursor-pointer hover:scale-105 z-50"
            onClick={() => window.history.back()}
          >
            <CloseIcon />
          </div>

          {/* Event Image Banner layout asset */}
          <div className="flex justify-center mb-4">
            <OptimizedImage
              src={selectedEvent.photoURL}
              alt={selectedEvent.name}
              className="object-contain w-1/2 hover:scale-105 duration-500 rounded-2xl"
            />
          </div>

          <h2 className="text-2xl text-center uppercase font-bold mb-4">
            {selectedEvent.name}
          </h2>

          <div className="space-y-4">
            {/* Description Meta Section */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Description</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.description}</p>
            </div>

            {/* Category Section */}
            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Category</h1>
              <p className="text-gray-400 mb-2">{selectedEvent?.category}</p>
            </div>

            {/* Location Section with Map */}
            <div className="border-b space-y-3 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Location</h1>
              <p className="text-gray-400 mb-3 flex items-center gap-2">
                📍 {selectedEvent?.location}
              </p>
              
              {/* Leaflet Map Display */}
              <div className="w-full h-64 rounded-lg overflow-hidden shadow-md border border-gray-400">
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">{selectedEvent?.name}</p>
                        <p className="text-sm">{selectedEvent?.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Organizer Block */}
            <div className="flex justify-between items-center border-b space-y-2 border-gray-300 w-full">
              <div>
                <h1 className="uppercase font-semibold text-xl">Organized by</h1>
                <p className="text-gray-400 mb-2">{selectedEvent?.organizer}</p>
              </div>
              {currentUser?.uid !== selectedEvent?.ownerId && (
                <FollowButton
                  currentUser={currentUser}
                  currentUserId={selectedEvent?.currentUserId}
                  ownerId={selectedEvent?.ownerId}
                />
              )}
            </div>

            {/* Date & Time Section */}
            <div className="border-b pb-4 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Date & Time</h1>
              <p className="text-gray-400">
                {formatDate(selectedEvent.date)} |{" "}
                {formatEventStatus(selectedEvent.startTime)} →{" "}
                {formatEventStatus(selectedEvent.endTime)}
              </p>
            </div>

            {/* Interactive Ticket Management Selection Grid */}
            <div className="space-y-2 w-full">
              <h1 className="uppercase font-semibold text-xl mb-2">Select Tickets</h1>

              {Array.isArray(selectedEvent.price) && selectedEvent.price.length > 0 ? (
                selectedEvent.price.map((ticket, index) => {
                  const currentQty = ticketQty[ticket.label] || 0;
                  const isFree = Number(ticket.amount) === 0 || selectedEvent.isFree;
                  const isThisTicketSelected = selectedTicket?.label === ticket.label;

                  return (
                    <div key={index} className="flex flex-col gap-3 p-4 shadow rounded-xl  mb-4">
                      
                      {/* Ticket Information Bar Row Control */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-orange-500">{ticket.label}</span>
                          <span className="text-sm text-gray-400">
                            {isFree ? "Free Admission" : `${ticket.currency || "₦"}${Number(ticket.amount).toLocaleString()}`}
                          </span>
                        </div>

                        {/* Quantity Dropdown Counter Option */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-400 font-medium uppercase">Qty:</label>
                          <select
                            value={currentQty}
                            onChange={(e) => {
                              setTicketQty({
                                ...ticketQty,
                                [ticket.label]: Number(e.target.value),
                              });
                              // Clear active ticket state layout mapping if count parameters alter
                              setSelectedTicket(null);
                            }}
                            className="p-2 rounded-lg shadow font-semibold"
                          >
                            {numberOptions.map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Dynamic Action Buttons Rendering Layer */}
                      <div className="w-full flex flex-col items-stretch mt-1">
                        {currentQty > 0 ? (
                          !currentUser ? (
                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg">
                              <p className="text-xs text-gray-400 text-center">Authentication required to secure pass allocation tiers.</p>
                              <GoogleAuth 
                                className="w-full" 
                                onAuthSuccess={(userData) => {
                                  // Immediately update the ticket state without waiting for parent prop refresh
                                  setSelectedTicket((prev) => ({
                                    ...prev,
                                    requiresAuth: false,
                                  }));
                                }}
                              />
                            </div>
                          ) : isThisTicketSelected && !selectedTicket.requiresAuth ? (
                            /* Embed direct action handlers securely into mapped array positions */
                            <PaystackPayment
                              events={selectedEvent}
                              ticket={selectedTicket}
                              currentUser={currentUser}
                              guestEmail={guestEmail}
                              guestName={guestName}
                              guestNumber={guestNumber}
                            />
                          ) : (
                            <button
                              onClick={() => handleCheckoutAction(ticket)}
                              className={`w-full py-2.5 px-4 rounded-lg font-bold transition tracking-wide active:scale-95 ${
                                isFree 
                                  ? "bg-green-600 hover:bg-green-700 text-white" 
                                  : "bg-orange-500 hover:bg-orange-600 text-white"
                              }`}
                            >
                              {isFree ? `Claim Free Pass (${currentQty})` : `Buy Ticket • ${ticket.currency || "₦"}${(Number(ticket.amount) * currentQty).toLocaleString()}`}
                            </button>
                          )
                        ) : (
                          <button disabled className="w-full py-2.5 px-4 rounded-lg font-bold bg-gray-700/40 text-gray-500 cursor-not-allowed text-sm text-center">
                            Select quantity above to unlock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm">No tickets available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;