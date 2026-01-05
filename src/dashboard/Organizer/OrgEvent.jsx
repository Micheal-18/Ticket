import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link, useOutletContext } from "react-router-dom";
import { db } from "../../firebase/firebase";
import OptimizedImage from "../../components/OptimizedImage";
import { FaCalendar, FaClock, FaLocationArrow } from "react-icons/fa6";
import { formatEventStatus } from "../../utils/formatEventRange";

const TABS = ["approved", "pending", "rejected"];

const OrgEvent = () => {
    const { currentUser } = useOutletContext();
    const [events, setEvents] = useState([]);
    const [status, setStatus] = useState("approved");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.uid) return;

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "events"),
                    where("ownerId", "==", currentUser.uid),
                    where("status", "==", status)
                );

                const snap = await getDocs(q);
                setEvents(
                    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentUser, status]);

    return (
        <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">My Events</h1>

                <Link
                    to="/dashboard/organization/create"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                >
                    Create Event
                </Link>
            </div>

            {/* STATUS TABS */}
            <div className="flex gap-3 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setStatus(tab)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${status === tab
                            ? "bg-orange-600 text-white"
                            : "bg-gray-200 dark:bg-zinc-800"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            {loading ? (
                <p className="text-gray-500">Loading events...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-500">
                    No {status} events.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 custom-scrollbar ">
                    {events.map((event) => {
                        const ticket = event.price?.[0];
                        return (
                            <div
                                key={event.id}
                                className="flex justify-between p-5 rounded-xl shadow"
                            >
                                <div className="space-y-2">
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
                                        <span className="truncate">{event.location}</span>
                                    </p>

                                    <p className="text-sm font-medium text-green-600">
                                        {ticket
                                            ? `${ticket.currency}${Number(ticket.amount).toLocaleString()}`
                                            : "Free"}
                                    </p>

                                    <Link
                                        to={`/dashboard/organization/event/${event.slug}`}
                                        className="text-orange-600 text-sm mt-3 inline-block"
                                    >
                                        Manage →
                                    </Link>
                                </div>

                                <OptimizedImage
                                    src={event.photoURL}
                                    alt={event.name}
                                    className="object-contain w-[150px] hover:scale-105 duration-500 rounded-2xl"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrgEvent;
