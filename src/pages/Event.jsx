import React, { useEffect, useState } from 'react'
import unbox from "../assets/unbox.JPG"
import astera from "../assets/Astera.jpg"
import rep from "../assets/rep.jpg"
import { db } from "../firebase/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { FaCalendar, FaCaretDown, FaLocationArrow, FaLocationPin } from 'react-icons/fa6'

const Event = ({ currentUser }) => {
  const [events, setEvents] = useState([]);

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



  // const data = [
  //   {

  //     title: "Unboxed party, Akwa",
  //     date: "Sat,Aug 23rd, 5pm",
  //     location: "Ikpeazu Stadium, Akwa",
  //     price: 300,
  //     image: unbox,
  //   },
  //   {

  //     title: "Astera",
  //     date: "Sat,Aug 31st, 10pm",
  //     location: "Grace Manor, Pusle Night Life",
  //     price: 300,
  //     image: astera,
  //   },
  //   {

  //     title: "Unboxed party, UNN. ",
  //     date: "Sat,Aug 23rd, 5pm",
  //     location: "The Verde",
  //     price: 300,
  //     image: rep,
  //   }
  // ]

  return (
    <section className='relative min-h-screen w-full flex px-6 flex-col lg:mt-5 mt-4 flex-1  z-10'>
      <div className='flex flex-col space-y-3 p-4'>
        <div className='space-y-6'>
          <p className='font-regular text-lg '>
            All Events
          </p>
          <h1 className='font-bold text-2xl md:text-4xl text-gray-500'>
            Find Events
          </h1>
        </div>
        <div className='flex flex-col space-y-2'>
          <h1>All Events</h1>
          <span>({events.length || 0}) events</span>
          <div className='flex flex-row space-x-2'>
            <button className='w-full bg-black rounded-xl py-2 pl-2 text-left text-white'>Nigeria</button>
            <button className='w-full bg-white text-left py-2 pl-2 rounded-xl'>Price</button>
            <button className='w-full bg-white text-left py-2 pl-2 rounded-xl'>Date</button>
          </div>
        </div>

        <div className='flex justify-center items-center mt-8 mx-auto w-full max-w-6xl px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-6'>
            {events.map((event) => (
              <div key={event.id} className='flex items-center  justify-between flex-1 gap-10 relative px-8 h-[200px] bg-[#eeeeee]  rounded-3xl'>
                <span className='space-y-2 flex flex-col'>
                  <h1 className='font-bold uppercase text-2xl w-[150px] truncate lg:w-auto lg:whitespace-normal lg:overflow-visible'>{event.name}</h1>
                  <p className='md:text-lg text-sm font-regular text-gray-500 flex gap-2 items-center'><FaCalendar />{formatDate(event.date)}</p>
                  <p className='md:text-lg text-md font-regular text-gray-500 flex gap-2 items-center'><FaLocationArrow />{event.location}</p>
                  <span className='flex  justify-between items-center gap-4'>
                    <p className='font-bold text-lg text-orange-500'>{event.currency}{event.price}</p>
                    <button className='bg-orange-500 p-2 rounded-lg hover:scale-105 '>Buy Ticket</button>
                  </span>
                </span>

                <span className='overflow-hidden rounded-xl'>
                  <img src={event.photoURL} alt={event.name} className='object-cover w-[150px] h-[150px] hover:scale-105 duration-500 rounded-2xl' />
                </span>

                {/* ✅ Show delete button only for admins */}
               
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                  >
                    Delete
                  </button>
                
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  )
}

export default Event