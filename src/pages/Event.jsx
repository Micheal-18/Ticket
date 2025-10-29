import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
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
            <h1 className="font-bold text-2xl md:text-4xl adaptive-text">
              Find Events:
            </h1>
            <SearchModal />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <p className=" adaptive-text">Events</p>
          <p className="text-gray-200 adaptive-text">
            Showing <span className="font-semibold">{filteredEvents.length}</span>{" "}
            of {events.length} events
          </p>

          <div className="flex flex-row space-x-2">
            {/* <button className="w-full bg-black rounded-xl py-2 pl-2 text-left text-white">
              Nigeria
            </button> */}
            <div onClick={handleState} className="relative w-full group">
              <button className="w-full active:scale-90 bg-black flex justify-between items-center text-white text-left p-3 rounded-xl">
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


            {/* <select name='state' className='p-3 w-full border bg-[#333333] rounded-lg text-white' required>
              <option value="">Nigeria</option>
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select> */}

            {/* <button className="w-full bg-white text-black text-left py-2 pl-2 rounded-xl">
              Price
            </button> */}
            {/* <select name="price" className="p-3 w-full border bg-[#eeeeee] text-[#333333] rounded-lg ">
              <option value="">Price</option>
              <option value="lowtohigh">Low to High</option>
              <option value="hightolow">High to Low</option>
            </select> */}
            <div onClick={handlePrice} className='relative w-full list-none cursor-pointer outline-none  group'>
              <button className="w-full active:scale-90 bg-[#eeeeee] flex justify-between items-center text-[#333333] text-left p-3 rounded-xl">
                {filters.priceOrder
                  ? filters.priceOrder === "lowtohigh"
                    ? "Price: Low → High"
                    : "Price: High → Low"
                  : "Sort by Price"} < FaCaretUp className='ml-2 animate-bounce transition-transform duration-300 group-hover:rotate-180' />
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
            {/* <button className="w-full bg-white text-black text-left py-2 pl-2 rounded-xl">
              Date
            </button> */}
            {/* ✅ DATE FILTER DROPDOWN */}
            <div className="relative w-full list-none cursor-pointer outline-none group">
              {/* Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent parent click closing it
                  setIsDate((prev) => !prev); // toggle dropdown
                }}
                className="w-full bg-[#eeeeee] active:scale-90 flex justify-between items-center text-[#333333] text-left p-3 rounded-xl"
              >
                {filters.date
                  ? filters.date instanceof Date
                    ? filters.date.toDateString()
                    : filters.date
                  : "Sort by Date"}
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
                className="flex items-center justify-between flex-1 lg:gap-8 gap-4 relative lg:px-8 px-2 w-full bg-[#eeeeee] py-4 text-[#333333] rounded-3xl"
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
                      <FiX size={20} />
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
                      className="bg-orange-500 p-2 rounded-lg hover:scale-105 active:scale-90"
                    >
                      View ticket
                    </button>
                  </Link>
                  {selectedDropdown === event.id && (
                    <div className="flex  gap-2">
                      <button
                        onClick={() => {
                          handleDelete(event)
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                      >
                        Del
                      </button>


                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug}`);
                          alert("📋 Link copied!");
                        }}
                        className="bg-gray-500 text-sm px-3 py-1 rounded-lg mt-2 hover:bg-gray-300"
                      >
                        Share
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
