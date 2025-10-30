import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { FaCalendar, FaCaretDown, FaCaretUp, FaCircle, FaClock, FaLocationArrow } from "react-icons/fa6";
import { useAdmin } from "../hooks/useAdmin";
import { FiX } from "react-icons/fi";
import walkGif from "../assets/dog.gif";
import TicketModal from "./TicketModal";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import { formatEventStatus } from "../utils/formatEventRange";
import naijaStateLocalGov from "naija-state-local-government";
import { FaSearch } from 'react-icons/fa';
import SearchModal from "../components/SearchModal";
import { Link } from "react-router-dom";
import OptimizedImage from "../components/OptimizedImage";
import DatePicker from "react-datepicker";
import { RiStarFill } from "react-icons/ri";


const Event = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin();
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [isDate, setIsDate] = useState(false);
  const [isPrice, setIsPrice] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCategory, setIsCategory] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({ state: "", category: "", priceOrder: "" });

  const handleState = () => {
    setIsStateOpen(!isStateOpen);
  }

  const handlePrice = () => {
    setIsPrice(!isPrice);
  }

  const handleDate = () => {
    setIsDate(!isDate);
  }

  const toggleHighlight = async (eventId, currentValue) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { highlighted: !currentValue });

      // 🔥 update locally so UI changes instantly
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? { ...ev, highlighted: !currentValue } : ev
        )
      );
    } catch (error) {
      console.error("Error updating highlight:", error);
    }
  };


  const highlightedEvents = events.filter(e => e.highlighted);


  const states = naijaStateLocalGov.states();

  // fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [setEvents]);

  const handleOpenTicket = (event) => {
    setSelectedEvent(event);
    setOpenTicket(true);
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setIsEditing(true);
  };

  const handleDelete = (event) => {
    setSelectedEvent(event);
    setIsDeleting(true);
  }

  const handleCate = () => {
    setIsCategory(!isCategory);
  }


  // ✅ Filtered events

  const filteredEvents = events
    .filter((event) =>
      filters.state
        ? event.location?.toLowerCase().includes(filters.state.toLowerCase())
        : true
    )

    // inside your filteredEvents
    .filter((event) => {
      if (!filters.date) return true;

      const today = new Date();
      const eventDate = new Date(event.date);
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (filters.date === "Today")
        return eventDate.toDateString() === today.toDateString();

      if (filters.date === "Tomorrow")
        return eventDate.toDateString() === tomorrow.toDateString();

      if (filters.date === "Weekend") {
        const day = eventDate.getDay();
        return day === 6 || day === 0; // Saturday or Sunday
      }

      // If using "Select Date" with a custom date
      if (filters.date instanceof Date)
        return eventDate.toDateString() === filters.date.toDateString();

      return true;
    })

    .filter((event) =>
      filters.category
        ? event.category?.toLowerCase() === filters.category.toLowerCase()
        : true
    )

    .sort((a, b) => {
      if (filters.priceOrder === "lowtohigh") return a.price - b.price;
      if (filters.priceOrder === "hightolow") return b.price - a.price;
      return 0;
    });

  return (
    <section
      data-aos="fade-out"
      className="relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar z-10"
    >
      {/* DELETE MODAL */}
      {isDeleting && selectedEvent && (
        <DeleteModal
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setIsDeleting={setIsDeleting}
          setEvents={setEvents}
        />
      )}

      {/* EDIT MODAL */}
      {isEditing && editEvent && (
        <EditModal
          currentUser={currentUser}
          editEvent={editEvent}
          setEditEvent={setEditEvent}
          setIsEditing={setIsEditing}
          events={events}
          setEvents={setEvents}
        />
      )}


      {/* EVENT LIST */}
      <div className="flex flex-col space-y-3 p-4">
        <div className="space-y-6">
          <p className="font-regular text-sm  adaptive-text">All Events:</p>
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-2xl md:text-4xl">
              Find Events:
            </h1>
            <SearchModal />
          </div>
        </div>

        <div className="relative flex flex-col space-y-4">
          <div onClick={handleState} className="relative w-full group">
            <button className=" active:scale-90 border-2 border-gray-500 flex justify-between items-center text-left p-3 rounded-xl">
              {filters.state || "Select State"}
              <FaCaretUp
                className="ml-2 animate-bounce transition-transform duration-300 group-hover:rotate-180"
              />
            </button>

            {isStateOpen && (
              <div className="absolute left-0 mt-1 lg:hidden lg:group-hover:block w-full max-h-40 overflow-hidden custom-scrollbar rounded-lg bg-white shadow-lg border border-gray-200 z-50">
                {states.map((st, index) => (
                  <div
                    key={index}
                    onClick={() => { setFilters({ ...filters, state: st }); handleState(); }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-orange-500 hover:text-[#eeeeee] cursor-pointer transition-colors duration-200"
                  >
                    {st}
                  </div>
                ))}
              </div>
            )}
          </div>

          {highlightedEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No highlighted events yet.</p>
          ) : (
            <div className="flex custom-scrollbar space-x-4 py-2">
              {highlightedEvents.map((event) => (
                <Link to={`/event/${event.slug}`} className="flex-shrink-0">
                  <div
                    key={event.id}
                    className="relative w-75 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                  >
                    <div className="flex justify-center overflow-hidden rounded-2xl">
                      <OptimizedImage
                        src={event.photoURL}
                        alt={event.title}
                        loading="lazy"
                        className="w-full object-contain hover:scale-105  duration-500"
                      />
                    </div>
                    <div className="absolute p-4 top-1/2 flex-1 flex flex-col">
                      <h3 className="text-3xl adaptive-text text-gray-600 font-bold line-clamp-2 mb-2">{event.name}</h3>
                      <p className="text-gray-600 adaptive-text text-sm line-clamp-2 mb-3">{event.description}</p>
                      <p className="text-sm adaptive-text text-gray-400 mb-4">{event.location}</p>
                    </div>
                    {/* ⭐ Highlight Tag */}
            {event.highlighted && (
              <div className="absolute top-2 right-2 text-yellow-400 text-lg font-bold px-2 py-1 rounded-full shadow-sm">
                <RiStarFill />
              </div>
            )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <p className="fonts-bold text-2xl">Events</p>
          <p className="text-gray-200 adaptive-text">
            Showing <span className="font-semibold">{filteredEvents.length}</span>{" "}
            of {events.length} events
          </p>

          <div className="flex flex-row space-x-2">

            <div onClick={handleCate} className='w-full list-none cursor-pointer outline-none group'>
              <button className="w-full border-2 border-gray-500 bg-[#eeeeee] active:scale-90 flex justify-between items-center text-[#333333] text-left p-3 rounded-xl">
                {filters.category || "Category"}< FaCaretUp className='ml-2 animate-bounce transition-transform duration-300 group-hover:rotate-180' />
              </button>


              {isCategory && (
                <div className='fixed z-50 md:hidden md:group-hover:block w-1/4 mt-1  rounded-md bg-white  shadow-md transition duration-1000 ease-in-out p-2 text-[#333333] '>
                  <ul className='space-y-2 '>
                    <li className='flex flex-col space-y-2 text-sm text-gray-500 hover:text-[#333333] duration-1000 w-full'>
                      {["Art", "Business", "Entertainment", "Food", "Health", "Music"].map(
                        (cat) => (
                          <a
                            key={cat}
                            onClick={() => {
                              setFilters({ ...filters, category: cat });
                            }}
                            className="px-3 py-2 text-sm hover:bg-orange-500 hover:text-white cursor-pointer"
                          >
                            {cat}
                          </a>
                        )
                      )}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div onClick={handlePrice} className='relative w-full list-none cursor-pointer outline-none  group'>
              <button className="w-full border-2 border-gray-500 active:scale-90 bg-[#eeeeee] flex justify-between items-center text-[#333333] text-left p-3 rounded-xl">
                {filters.priceOrder
                  ? filters.priceOrder === "lowtohigh"
                    ? "Price: Low → High"
                    : "Price: High → Low"
                  : "Price"} < FaCaretUp className='ml-2 animate-bounce transition-transform duration-300 group-hover:rotate-180' />
              </button>

              {isPrice && (
                <div className='absolute z-50 lg:hidden lg:group-hover:block  mt-1  rounded-md bg-white  shadow-md transition duration-1000 ease-in-out p-2 text-[#333333] '>
                  <ul className='space-y-2 '>
                    <li className='flex flex-col space-y-2 text-sm text-gray-500 hover:text-[#333333] duration-1000 w-full'>
                      <a
                        onClick={() => setFilters({ ...filters, priceOrder: "lowtohigh" })}
                        className="hover:bg-orange-500 rounded-sm cursor-pointer px-2 py-1"
                      >
                        Low to High
                      </a>
                      <a
                        onClick={() => setFilters({ ...filters, priceOrder: "hightolow" })}
                        className="hover:bg-orange-500 rounded-sm cursor-pointer px-2 py-1"
                      >
                        High to Low
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* ✅ DATE FILTER DROPDOWN */}
            <div className="relative w-full list-none cursor-pointer outline-none group">
              {/* Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent parent click closing it
                  setIsDate((prev) => !prev); // toggle dropdown
                }}
                className="w-full bg-[#eeeeee] border-2 border-gray-500 active:scale-90 flex justify-between items-center text-[#333333] text-left p-3 rounded-xl"
              >
                {filters.date
                  ? filters.date instanceof Date
                    ? filters.date.toDateString()
                    : filters.date
                  : "Date"}
                <FaCaretUp className="ml-2 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              {/* Dropdown List */}
              {isDate && (
                <div className="absolute left-0 mt-2 w-full rounded-md bg-white shadow-md border border-gray-200 z-50 p-2 text-[#333333]">
                  <ul className="space-y-2">
                    {["Today", "Tomorrow", "Weekend"].map((dat) => (
                      <li
                        key={dat}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters({ ...filters, date: dat });
                          setIsDate(false);
                        }}
                        className="px-3 py-2 text-sm hover:bg-orange-500 hover:text-white rounded cursor-pointer transition"
                      >
                        {dat}
                      </li>
                    ))}

                    {/* Custom DatePicker */}
                    <li
                      className="relative px-3 py-2 text-sm flex items-center gap-2 hover:text-orange-500"
                      onClick={(e) => e.stopPropagation()} // prevent closing dropdown
                    >
                      <FaCalendar
                        className="cursor-pointer"
                        onClick={() => setIsOpen((prev) => !prev)}
                      />
                      {isOpen && (
                        <div className="absolute left-0 mt-2 z-50 bg-white shadow-lg rounded-lg border border-gray-200 p-2">
                          <DatePicker
                            selected={filters.date instanceof Date ? filters.date : null}
                            onChange={(date) => {
                              setFilters({ ...filters, date });
                              setIsDate(false);
                              setIsOpen(false);
                            }}
                            dateFormat="EEE, MMM d, yyyy"
                            placeholderText="Select date..."
                            className="border border-gray-300 p-2 rounded-lg text-black w-full"
                            popperPlacement="bottom-start"
                          />
                        </div>
                      )}
                      <span className="text-sm">Pick a date</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </div>
          <p className="flex items-center gap-2">
            Reset <FaCircle
              onClick={() => setFilters({ state: "", category: "", priceOrder: "", date: "" })}
              className="text-red-600 rounded-full animate-pulse"
            />
          </p>

        </div>

        <div className="flex justify-center items-center mt-8 w-full max-w-7xl">
          <div
            data-aos="fade-up"
            className="grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-8 w-full"
          >
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between flex-1 lg:gap-8 gap-4 adaptive-text relative lg:px-8 px-2 w-full py-4  border-2 border-gray-500 box-shadow-lg rounded-3xl"
              >
                {isAdmin && (
                  <div
                    className="absolute top-1 right-1 animate-bounce cursor-pointer"
                    onClick={() =>
                      setSelectedDropdown(
                        selectedDropdown === event.id ? null : event.id
                      )
                    }
                  >
                    {selectedDropdown === event.id ? (
                      <FiX size={20} className="font-bold" />
                    ) : (
                      <FaCaretDown size={20} />
                    )}
                  </div>
                )}

                <span className="space-y-2 flex flex-col">
                  <h1 className="font-bold text-gray-700 uppercase text-2xl w-[150px] truncate lg:w-[300px] ">
                    {event.name}
                  </h1>
                  <p className="md:text-lg text-sm font-regular text-gray-500 flex gap-2 items-center">
                    <FaCalendar />{" "}
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm w-[150px] lg:w-[300px] text-gray-500 flex items-center gap-2">
                    <FaClock />
                    <span className="truncate">
                      {formatEventStatus(event.startTime, event.endTime)}
                    </span>
                  </p>
                  <p className="md:text-lg text-md w-[180px] lg:w-[300px] font-normal text-gray-500 flex gap-2 items-center">
                    <FaLocationArrow />
                    <span className="truncate ">
                      {event.location}
                    </span>
                  </p>

                  <Link to={`/event/${event.slug}`} className="flex justify-between items-center">
                    <button
                      onClick={() => handleOpenTicket(event)}
                      className="bg-orange-500 cursor-pointer p-2 rounded-lg hover:scale-105 active:scale-90"
                    >
                      View ticket
                    </button>
                  </Link>
                  {selectedDropdown === event.id && (
                    <div className="flex flex-wrap  gap-2">
                      <button
                        onClick={() => {
                          handleDelete(event)
                        }}
                        className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                      >
                        Del
                      </button>


                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-green-500 text-white cursor-pointer px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug}`);
                          alert("📋 Link copied!");
                        }}
                        className="bg-gray-500 text-sm cursor-pointer px-3 py-1 rounded-lg mt-2 hover:bg-gray-300"
                      >
                        Share
                      </button>

                      <button
                        onClick={() => toggleHighlight(event.id, event.highlighted)}
                        className={`px-3 py-1  rounded-lg cursor-pointer ${event.highlighted ? "text-yellow-400 text-md" : "text-gray-600 text-lg"
                          }`}
                      >
                        <RiStarFill />
                      </button>

                    </div>
                  )}
                </span>

                <span className="overflow-hidden rounded-xl">
                  <OptimizedImage
                    src={event.photoURL}
                    alt={event.name}
                    className="object-contain w-[150px] hover:scale-105 duration-500 rounded-2xl"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-10 flex justify-center">
        <img
          src={walkGif}
          alt="walking gif"
          className="w-20 h-20  animation-walk"
        />
      </footer>
    </section>
  );
};

export default Event;
