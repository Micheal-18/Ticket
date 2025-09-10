import React, { useEffect, useState } from 'react'
import unbox from "../assets/unbox.JPG"
import astera from "../assets/Astera.jpg"
import rep from "../assets/rep.jpg"
import { db } from "../firebase/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { FaCalendar, FaCaretDown, FaLocationArrow, FaLocationPin } from 'react-icons/fa6'
import { useAdmin } from "../hooks/useAdmin";
import { FiX } from 'react-icons/fi';
import PaystackPayment from "../components/PaystackPayment";

const Event = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin();
  const [open, setOpen] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${day}${getOrdinal(day)}, ${month}, ${year}`;
  };

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
    <section data-aos="fade-out" className='relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar  z-10'>
      {openTicket && selectedEvent && (
        <div className='fixed inset-0 left-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-50'>
          <div className='relative w-full lg:top-1/4 top-1/8 flex justify-center items-center'>
            <div className='flex flex-col bg-white space-y-6 p-6 rounded-lg shadow-lg relative w-[80%] h-[100%]'>
              <div
                className='text-gray-500 text-2xl absolute top-4 right-4 cursor-pointer hover:scale-105'
                onClick={closeOpenTicket}
              >
                <FiX />
              </div>

              <div className='flex justify-center overflow-hidden rounded-xl'>
                <img
                  src={selectedEvent.photoURL}
                  alt={selectedEvent.name}
                  className='object-cover w-[150px] h-[150px] hover:scale-105 duration-500 rounded-2xl'
                />
              </div>

              <h2 className='text-2xl text-center uppercase font-bold mb-4'>
                {selectedEvent.name}
              </h2>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Description</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent.description}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Category</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent.category}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Location</h1>
                <p className='text-gray-700 mb-2'>{selectedEvent.location}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Date</h1>
                <p className='text-gray-700 mb-2'>{formatDate(selectedEvent.date)}</p>
              </div>

              <div className='border-b space-y-2 border-gray-300 w-full'>
                <h1 className='uppercase font-semibold text-xl'>Price</h1>
                <p className='text-gray-700 mb-2'>
                  {selectedEvent.currency}{selectedEvent.price}
                </p>
              </div>

              <PaystackPayment events={selectedEvent} currentUser={currentUser} />
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
            <button className='w-full bg-white text-left py-2 pl-2 rounded-xl'>Price</button>
            <button className='w-full bg-white text-left py-2 pl-2 rounded-xl'>Date</button>
          </div>
        </div>

        <div className='flex justify-center items-center mt-8  w-full max-w-6xl '>
          <div data-aos="fade-up" className='grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-6 w-full'>
            {events.map((event) => (
              <div key={event.id} className='flex items-center  justify-between flex-1 lg:gap-10 gap-4 relative lg:px-8 px-2 w-full h-[200px] bg-[#eeeeee] rounded-3xl'>
                {isAdmin && (
                  <div className='absolute top-1 right-1 text-gray-800 cursor-pointer' onClick={() => setOpen(!open)}>
                    {open ? <FiX size={24} /> : <FaCaretDown size={24} />}
                  </div>
                )}
                <span className='space-y-2 flex flex-col'>
                  <h1 className='font-bold uppercase text-2xl w-[150px] truncate lg:w-auto lg:whitespace-normal lg:overflow-visible'>{event.name}</h1>
                  <p className='md:text-lg text-sm font-regular text-gray-500 flex gap-2 items-center'><FaCalendar />{formatDate(event.date)}</p>
                  <p className='md:text-lg text-md font-regular text-gray-500 flex gap-2 items-center'><FaLocationArrow />{event.location}</p>
                  <span className='flex  justify-between items-center lg:gap-4 gap-2'>
                    <p className='font-bold text-lg text-orange-500'>{event.currency}{event.price}</p>
                    <button
                      onClick={() => handleOpenTicket(event)}
                      className='bg-orange-500 p-2 rounded-lg hover:scale-105 active:scale-90'
                    >
                      View Ticket
                    </button>

                  </span>
                </span>

                <span className='overflow-hidden rounded-xl'>
                  <img src={event.photoURL} alt={event.name} className='object-cover w-[150px] h-[150px] hover:scale-105 duration-500 rounded-2xl' />
                </span>

                <div className='absolute flex left-4 -bottom-10 '>
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
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  )
}

export default Event