import React, { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import OptimizedImage from '../components/OptimizedImage';
import { FaEllipsisV, FaCalendar, FaClock, FaLocationArrow } from 'react-icons/fa';
import { RiStarFill } from 'react-icons/ri';
import { useAdmin } from '../hooks/useAdmin';
import DeleteModal from '../components/DeleteModal';
import EditModal from '../components/EditModal';
import { formatEventStatus } from '../utils/formatEventRange';

const Dashevents = ({ currentUser, events, setEvents }) => {
    const isAdmin = useAdmin();
    const [selectedDropdown, setSelectedDropdown] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editEvent, setEditEvent] = useState(null);

    // Fetch events
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

    // Toggle Highlight
    const toggleHighlight = async (eventId, currentValue) => {
        try {
            const eventRef = doc(db, "events", eventId);
            await updateDoc(eventRef, { highlighted: !currentValue });
            setEvents((prev) =>
                prev.map((ev) =>
                    ev.id === eventId ? { ...ev, highlighted: !currentValue } : ev
                )
            );
        } catch (error) {
            console.error("Error updating highlight:", error);
        }
    };

    // Admin actions
    const handleEdit = (event) => {
        setEditEvent(event);
        setIsEditing(true);
    };
    const handleDelete = (event) => {
        setSelectedEvent(event);
        setIsDeleting(true);
    };

    return (
        <section className="relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 custom-scrollbar z-10">
            {/* Delete Modal */}
            {isDeleting && selectedEvent && (
                <DeleteModal
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    setIsDeleting={setIsDeleting}
                    setEvents={setEvents}
                />
            )}
            {/* Edit Modal */}
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

            {/* Event Grid */}
            <div className="flex justify-center items-center  w-full max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-8 w-full ">
                    {events.map((event) => (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedDropdown(
                                    selectedDropdown === event.id ? null : event.id
                                );
                            }}
                            key={event.id}
                            className="flex items-center justify-between flex-1 gap-4 relative lg:px-8 px-2 w-full py-4 shadow rounded-3xl cursor-default"
                        >

                            <span className="space-y-2 flex flex-col">
                                <h1 className="font-bold uppercase text-2xl w-[150px] truncate lg:w-[250px]">
                                    {event.name}
                                </h1>
                                <p className="md:text-md text-sm font-regular text-gray-500 flex gap-2 items-center">
                                    <FaCalendar />{" "}
                                    {new Date(event.date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                                <p className="text-sm w-[150px] lg:w-[250px] text-gray-500 flex items-center gap-2">
                                    <FaClock />
                                    <span className="truncate">
                                        {formatEventStatus(event.startTime, event.endTime)}
                                    </span>
                                </p>
                                <p className="md:text-md text-md w-[180px] lg:w-[250px] font-normal text-gray-500 flex gap-2 items-center">
                                    <FaLocationArrow />
                                    <span className="truncate">
                                        {event.location}
                                    </span>
                                </p>

                                {Array.isArray(event.price) ? (
                                    event.price.map((priceOption, index) => (
                                        <p key={index}>
                                            <span className="text-orange-500 text-md font-semibold">
                                                {priceOption.currency}{" "}
                                                {Number(priceOption.amount) + ((1.5 / 100) * Number(priceOption.amount) + 100)}
                                            </span>
                                        </p>
                                    ))
                                ) : (
                                    <p>
                                        <span className="text-orange-500 text-md font-semibold">
                                            {event.currency}{" "}
                                            {Number(event.price?.amount) + ((1.5 / 100) * Number(event.price?.amount) + 100)}
                                        </span>
                                    </p>
                                )}

                                {selectedDropdown === event.id && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(event);
                                            }}
                                            className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                                        >
                                            Delete
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEdit(event);
                                            }}
                                            className="bg-green-500 text-white cursor-pointer px-3 py-1 rounded-lg font-bold mt-2 hover:scale-105"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleHighlight(event.id, event.highlighted);
                                            }}
                                            className={`px-3 py-1 rounded-lg cursor-pointer ${event.highlighted ? "text-yellow-400" : "text-gray-600"
                                                }`}
                                        >
                                            <RiStarFill />
                                        </button>
                                    </div>
                                )}
                            </span>

                            <OptimizedImage
                                src={event.photoURL}
                                alt={event.name}
                                className="object-contain w-[150px] hover:scale-105 duration-500 rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Dashevents;
