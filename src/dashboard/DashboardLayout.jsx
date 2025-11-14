import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { FaBell, FaMoneyBillTrendUp } from "react-icons/fa6";
import { signOut } from "firebase/auth";
import SearchModal from "../components/SearchModal";
import { RiDashboard2Line, RiHome2Line, RiQrScanLine, RiTicket2Line } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";

const DashboardLayout = ({ currentUser }) => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    }

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch events
                const eventsSnap = await getDocs(collection(db, "events"));
                const eventsData = eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setEvents(eventsData);

                // Fetch users
                const usersSnap = await getDocs(collection(db, "users"));
                const usersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);

                // Build recent activities
                const activities = [
                    ...eventsData.map((e) => ({
                        type: "event",
                        name: e.name,
                        date: e.createdAt || e.date,
                    })),
                    ...usersData.flatMap((u) => {
                        const acts = [];
                        if (u.registeredEventName)
                            acts.push({
                                type: "registration",
                                user: u.name,
                                name: u.registeredEventName,
                                date: u.registeredAt || u.createdAt,
                            });
                        if (u.tickets)
                            u.tickets.forEach((t) =>
                                acts.push({
                                    type: "ticket",
                                    user: u.name,
                                    name: t.eventName,
                                    date: t.purchasedAt || t.createdAt,
                                })
                            );
                        return acts;
                    }),
                ]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setRecentActivities(activities);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);




    return (
        <section className="relative flex scheme-light-dark lg:space-y-0 space-y-2">
            {/* Sidebar */}
            <div className=" fixed left-0 bottom-0 z-50 space-y-2 w-full h-20 border-t border-gray-800 p-3 flex justify-center items-center lg:static lg:w-50 lg:h-full lg:border-t-0 lg:border-r lg:border-gray-800 lg:p-6 flex-col lg:items-start">
                <Link to='/'>
                    <h1 className="text-2xl text-left font-bold mb-2">
                        Airticks<span className="text-orange-600">Events</span>
                    </h1>
                </Link>
                <nav className="w-full">
                    <ul className="w-full flex justify-evenly space-y-2 items-center  lg:flex-col lg:justify-start lg:items-start">
                        <Link to='/dashboard'>
                            <li className="mb-4 flex flex-col lg:flex-row space-x-2 justify-center items-center hover:scale-105 transition ease-in-out  duration-500">
                                <RiHome2Line className="text-orange-500 hover:text-orange-700 text-xl" />
                                <a className="hover:underline">Home</a>
                            </li>
                        </Link>
                        <Link to="/dashboard/events">
                            <li className="mb-4 flex flex-col lg:flex-row space-x-2 justify-center items-center hover:scale-105 transition ease-in-out duration-600">
                                <RiTicket2Line className="hover:text-orange-500 text-xl" />
                                <a className="text-gray-300 hover:text-orange-500">Events</a>
                            </li>
                        </Link>

                        <Link to="/dashboard/scanner">
                            <li className="mb-4 flex flex-col lg:flex-row space-x-2 justify-center items-center hover:scale-105 transition ease-in-out duration-700">
                                <RiQrScanLine className="hover:text-orange-500 text-xl" />
                                <a className="text-gray-300 hover:text-orange-500">QR Scanner</a>
                            </li>
                        </Link>

                        <Link to="/dashboard/tracking">
                            <li className="mb-4 flex flex-col lg:flex-row space-x-2 justify-center items-center hover:scale-105 transition ease-in-out  duration-800">
                                <FaMoneyBillTrendUp className="hover:text-orange-500 text-xl" />
                                <a className="text-gray-300 hover:text-orange-500">Analytics</a>
                            </li>
                        </Link>

                    </ul>
                </nav>
            </div>

            <div className="flex-1  flex flex-col">
                {/* Header */}
                <header className="w-full p-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="text-xl font-semibold">Welcome, {currentUser?.fullName}</div>

                    <div className="lg:flex hidden items-center gap-4">
                        <SearchModal />
                        <Link to="/dashboard/create" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg">
                            Create Event
                        </Link>
                        <div className="relative">
                            <FaBell size={22} className="cursor-pointer " />
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{recentActivities.length}</span>
                        </div>
                        <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                            Logout
                        </button>
                    </div>

                    <button
                        onClick={toggleOpen}
                        aria-label="Toggle menu"
                        className="relative w-10 h-10 lg:hidden flex items-center justify-center text-3xl  cursor-pointer"
                    >
                        {/* Menu icon */}
                        <FiMenu
                            className={`absolute inset-0 m-auto origin-center transform transition-all duration-[1200ms] ease-in-out
                                  ${open ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"}`}
                        />
                        {/* Close icon */}
                        <FiX
                            className={`absolute inset-0 m-auto origin-center transform transition-all duration-[1200ms] ease-in-out
                                  ${open ? "opacity-100 scale-100 rotate-180" : "opacity-0 scale-0 rotate-0"}`}
                        />
                    </button>

                    {open && (
                        <div className="absolute top-16 right-4  p-4 rounded-lg shadow-lg flex  items-center gap-4 lg:hidden z-50">
                            <SearchModal />
                            <Link onClick={() => {
                                setOpen(false)
                            }} to="/dashboard/create" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg">
                                Create Event
                            </Link>
                            <div className="relative">
                                <FaBell size={22} className="cursor-pointer " />
                                <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">{recentActivities.length}</span>
                            </div>
                            <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                                Logout
                            </button>
                        </div>
                    )}
                </header>

                <main className="p-8 pb-28 lg:pb-8">
                    {loading ? (
                        <div className="text-gray-400">Loading dashboard...</div>
                    ) : (
                        <Outlet context={{ events, users, recentActivities, currentUser }} />
                    )}
                </main>
            </div>

        </section>
    );
};

export default DashboardLayout;
