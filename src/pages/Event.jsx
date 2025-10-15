import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import {
  FaCalendar,
  FaCaretDown,
  FaClock,
  FaLocationArrow,
} from "react-icons/fa6";
import { useAdmin } from "../hooks/useAdmin";
import { FiX } from "react-icons/fi";
import walkGif from "../assets/dog.gif";
import TicketModal from "../components/TicketModal";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import { formatEventStatus } from "../utils/formatEventRange";

const Event = ({ currentUser, events, setEvents }) => {
  const isAdmin = useAdmin();
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

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

      {/* TICKET MODAL */}
      {openTicket && selectedEvent && (
        <TicketModal
          currentUser={currentUser}
          events={events}
          setEvents={setEvents}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      )}

      {/* EVENT LIST */}
      <div className="flex flex-col space-y-3 p-4">
        <div className="space-y-6">
          <p className="font-regular text-sm text-gray-500">All Events:</p>
          <h1 className="font-bold text-2xl md:text-4xl text-gray-800">
            Find Events
          </h1>
        </div>

        <div className="flex flex-col space-y-2">
          <p className="text-gray-500">Events</p>
          <span>({events.length || 0}) events</span>
          <div className="flex flex-row space-x-2">
            <button className="w-full bg-black rounded-xl py-2 pl-2 text-left text-white">
              Nigeria
            </button>
            <button className="w-full bg-white text-black text-left py-2 pl-2 rounded-xl">
              Price
            </button>
            <button className="w-full bg-white text-black text-left py-2 pl-2 rounded-xl">
              Date
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center mt-8 w-full max-w-6xl">
          <div
            data-aos="fade-up"
            className="grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-6 w-full"
          >
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between flex-1 lg:gap-10 gap-4 relative lg:px-8 px-6 w-full bg-[#eeeeee] py-4 text-[#333333] rounded-3xl"
              >
                {isAdmin && (
                  <div
                    className="absolute top-1 right-1 cursor-pointer"
                    onClick={() =>
                      setSelectedDropdown(
                        selectedDropdown === event.id ? null : event.id
                      )
                    }
                  >
                    {selectedDropdown === event.id ? (
                      <FiX size={24} />
                    ) : (
                      <FaCaretDown size={24} />
                    )}
                  </div>
                )}

                <span className="space-y-2 flex flex-col">
                  <h1 className="font-bold text-gray-700 uppercase text-2xl w-[150px] truncate lg:w-auto lg:whitespace-normal lg:overflow-visible">
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

                  <span className="flex justify-between items-center">
                    <button
                      onClick={() => handleOpenTicket(event)}
                      className="bg-orange-500 p-2 rounded-lg hover:scale-105 active:scale-90"
                    >
                      View Ticket
                    </button>

                    {selectedDropdown === event.id && (
                      <div className="flex mx-4 gap-2">
                        <button
                          onClick={() => {
                            handleDelete(event)
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                        >
                          Delete
                        </button>
                        
                        
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </span>
                </span>

                <span className="overflow-hidden rounded-xl">
                  <img
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
          className="w-20 h-20 animate-bounce"
        />
      </footer>
    </section>
  );
};

export default Event;
