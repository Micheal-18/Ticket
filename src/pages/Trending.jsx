import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import OptimizedImage from "../components/OptimizedImage";


const Trending = ({ currentUser, events, setEvents }) => {
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [trendingEvents, setTrendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openTicket, setOpenTicket] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleOpenTicket = (event) => {
        setSelectedEvent(event);
        setOpenTicket(true);
    };

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Fetch top 5 latest blogs
                const blogQuery = query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(5));
                const blogSnap = await getDocs(blogQuery);
                const blogsData = blogSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Fetch top 5 latest events
                const eventQuery = query(collection(db, "events"), orderBy("ticketSold", "desc"), limit(5));
                const eventSnap = await getDocs(eventQuery);
                const eventsData = eventSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setTrendingBlogs(blogsData);
                setTrendingEvents(eventsData);
            } catch (error) {
                console.error("Error fetching trending data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-gray-600">Loading trending updates...</div>;
    }

    const CLOUD_NAME = "dkny4uowy";

    const optimizeImage = (url, width = 600) => {
        // Extract just the public_id part after "/upload/"
        const parts = url.split("/upload/");
        if (parts.length < 2) return url; // fallback if malformed

        return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
    };


    return (
        <section className="w-full min-h-screen space-y-8 py-16 px-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-12">🔥 Trending Updates</h1>

            {/* TICKET MODAL
            {openTicket && selectedEvent && (
                <TicketModal
                    currentUser={currentUser}
                    events={events}
                    setEvents={setEvents}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                />
            )} */}

            {/* Trending Events */}
            <div >
                <h2 className="text-2xl font-semibold mb-6 text-orange-600">🎟️ Top Selling Events</h2>
                {trendingEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No trending events yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {trendingEvents.map((event) => (
                            <Link to={`/event/${event.slug}`}>
                                <div
                                    key={event.id}
                                    onClick={() => handleOpenTicket(event)}
                                    className="relative shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
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
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>


            {/* Trending Blogs */}
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-orange-500">📰 Trending Blogs</h2>
                {trendingBlogs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No trending blogs yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {trendingBlogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
                            >
                                <OptimizedImage
                                    src={blog.photoURL}
                                    alt={blog.title}
                                    loading="lazy"
                                    className=" w-full object-cover "
                                />
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-lg text-gray-500 font-semibold line-clamp-2 mb-2">{blog.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{blog.description}</p>
                                    <p className="text-xs text-gray-400 mb-4">{blog.published}</p>
                                    <Link
                                        to={`/blogs/${blog.id}`}
                                        className="text-orange-500 hover:underline mt-auto"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Trending;
