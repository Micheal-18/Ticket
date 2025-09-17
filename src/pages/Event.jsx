import React, { useEffect, useState } from 'react'
import unbox from "../assets/unbox.JPG"
import astera from "../assets/Astera.jpg"
import rep from "../assets/rep.jpg"
import { db } from "../firebase/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { FaCalendar, FaCaretDown, FaClock, FaLocationArrow, FaLocationPin } from 'react-icons/fa6'
import { useAdmin } from "../hooks/useAdmin";
import { FiX } from 'react-icons/fi';
import walkGif from "../assets/dog.gif"
import PaystackPayment from "../components/PaystackPayment";
import { formatEventStatus } from '../utils/formatEventRange';

const Event = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin();
  const [open, setOpen] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);


  const handleOpenTicket = (event) => {
    setSelectedEvent(event);
    setOpenTicket(true);
  };

  const closeOpenTicket = () => {
    setSelectedEvent(null);
    setOpenTicket(false);
  };

  // get details from firestore db
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
  }, []);
  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const day = date.getDate();
  //   const month = date.toLocaleString("default", { month: "long" });
  //   const year = date.getFullYear();

  //   const getOrdinal = (n) => {
  //     if (n > 3 && n < 21) return "th";
  //     switch (n % 10) {
  //       case 1: return "st";
  //       case 2: return "nd";
  //       case 3: return "rd";
  //       default: return "th";
  //     }
  //   };

  //   return `${day}${getOrdinal(day)}, ${month}, ${year}`;
  // };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      alert("✅ Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("❌ Failed to delete event.");
    }
  };


  return (
    <section data-aos="fade-out" className='relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1  custom-scrollbar z-10'>
      {openTicket && selectedEvent && (
        <div className='fixed left-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-[9999] custom-scrollbar'>
          <div className='absolute on top-1/8'>
            <div className='relative w-full  flex justify-center items-center'>
            <div className='flex flex-col bg-[#eeeeee] text-[#333333] space-y-6 p-6 rounded-lg shadow-lg relative w-[80%] h-[100%]'>
              <div
                className=' text-2xl absolute top-4 right-4 cursor-pointer hover:scale-105'
                onClick={closeOpenTicket}
              >
                <FiX />
              </div>

              <div className='flex justify-center overflow-hidden rounded-2xl'>
                <img
                  src={selectedEvent?.photoURL}
                  alt={selectedEvent?.name}
                  className='object-contain w-1/2 hover:scale-105 duration-500 rounded-2xl'
                />
              </div>

              <h2 className='text-2xl text-center uppercase font-bold mb-4'>
                {selectedEvent?.name}
              </h2>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Description</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent?.description}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Category</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent?.category}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Location</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent?.location}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Organized by</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent?.organizer}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Date & Time</h1>
                <p className="text-gray-700 mb-2">
                  {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" | "}
                  {new Date(selectedEvent.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" → "}
                  {new Date(selectedEvent.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Price</h1>
                {/* <p className='text-gray-700 mb-2'>
                  {selectedEvent?.label}: {selectedEvent?.currency}{selectedEvent?.price}
                </p> */}

                <div className='space-y-2'>
                  {selectedEvent?.price?.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)} // 👈 track which ticket user picked
                      className='w-full text-left p-2 border rounded-lg hover:bg-orange-100 active:scale-95'
                    >
                      {ticket.label}: {ticket.currency}{ticket.amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* <PaystackPayment  events={selectedEvent} currentUser={currentUser} /> */}
              {selectedTicket && (
                <PaystackPayment
                  events={selectedEvent}
                  ticket={selectedTicket} // 👈 pass the chosen ticket
                  currentUser={currentUser}
                />
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      <div className='flex flex-col space-y-3 p-4'>
        <div className='space-y-6'>
          <p className='font-regular  text-sm text-gray-500'>
            All Events:
          </p>
          <h1 className='font-bold text-2xl md:text-4xl text-gray-080'>
            Find Events
          </h1>
        </div>
        <div className='flex flex-col space-y-2'>
          <p className='text-gray-500'>Events</p>
          <span>({events.length || 0}) events</span>
          <div className='flex flex-row space-x-2'>
            <button className='w-full bg-black rounded-xl py-2 pl-2 text-left text-white'>Nigeria</button>
            <button className='w-full bg-white text-black text-left py-2 pl-2 rounded-xl'>Price</button>
            <button className='w-full bg-white text-black text-left py-2 pl-2 rounded-xl'>Date</button>
          </div>
        </div>

        <div className='flex justify-center items-center mt-8  w-full max-w-6xl '>
          <div data-aos="fade-up" className='grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-6 w-full '>
            {events.map((event) => (
              <div key={event.id} className='flex items-center justify-between flex-1 lg:gap-10 gap-4 relative lg:px-8 px-2 w-full bg-[#eeeeee] py-4  text-[#333333] rounded-3xl'>
                {isAdmin && (
                  <div className='absolute top-1 right-1  cursor-pointer' onClick={() => setOpen(!open)}>
                    {open ? <FiX size={24} /> : <FaCaretDown size={24} />}
                  </div>
                )}
                <span className='space-y-2 flex flex-col'>
                  <h1 className='font-bold text-gray-700 uppercase text-2xl w-[150px] truncate lg:w-auto lg:whitespace-normal lg:overflow-visible'>{event.name}</h1>
                  <p className='md:text-lg text-sm font-regular text-gray-500 flex gap-2 items-center'><FaCalendar /> {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaClock />
                    {formatEventStatus(event.startTime, event.endTime)}
                  </p>
                  <p className="md:text-lg text-md w-[200px] lg:w-auto font-normal text-gray-500 flex gap-2 items-center">
                    <FaLocationArrow />
                    <span className="truncate lg:whitespace-normal lg:overflow-visible">
                      {event.location}
                    </span>
                  </p>

                  <span className='flex justify-between items-center'>
                    {/* <p key={event.id} className='font-bold text-lg text-orange-500'>{event.label}: {event.currency}{event.price}</p>
                    <div className="flex flex-col">
                      {event.price?.map((ticket) => (
                        <p key={ticket.id} className="font-bold text-lg text-orange-500">
                          {ticket.label}: {ticket.currency}{ticket.amount}
                        </p>
                      ))}
                    </div> */}
                    <button
                      onClick={() => handleOpenTicket(event)}
                      className='bg-orange-500 p-2 rounded-lg hover:scale-105 active:scale-90'
                    >
                      View Ticket
                    </button>

                    <div >
                  {/* ✅ Show delete button only for admins */}
                  {isAdmin && open && (
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className='bg-red-500 text-white px-3 py-1  rounded-lg font-bold mt-2 hover:scale-105'
                    >
                      Delete
                    </button>
                  )}
                </div>

                  </span>
                </span>

                <span className='overflow-hidden rounded-xl'>
                  <img src={event.photoURL} alt={event.name} className='object-contain w-[200px] hover:scale-105 duration-500 rounded-2xl' />
                </span>

              </div>
            ))}

          </div>
        </div>
      </div>
      <footer className='mt-10'>
        <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
      </footer>
    </section>
  )
}

export default Event