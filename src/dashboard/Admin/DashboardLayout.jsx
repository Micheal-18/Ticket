import React, { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { FaBell, FaMoneyBillTrendUp } from "react-icons/fa6";
import { RiDashboard2Line, RiHome2Line, RiQrScanLine, RiTicket2Line } from "react-icons/ri";
import { FiMenu, FiX } from "react-icons/fi";
import SearchModal from "../../components/SearchModal";
import Darkmode from "../../components/DarkMode";
import { signOut } from "firebase/auth";

const DashboardLayout = ({ currentUser }) => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const toggleOpen = () => setOpen(!open);

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

                // Fetch tickets
                const ticketsSnap = await getDocs(collection(db, "tickets"));
                const ticketsData = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Build recent activities
                const activities = [
                    ...eventsData.map(e => ({ type: "event", name: e.name, date: e.createdAt || e.date })),
                    ...usersData.map(u => ({ type: "users", name: u.fullName, account: u.accountType, date: u.createdAt })),
                    ...ticketsData.map(t => ({ type: "ticket", user: t.buyerName, ticket: t.ticketType, name: t.eventName, date: t.createdAt })),
                ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

                setRecentActivities(activities);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const navItem = (to, icon, label, count) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col lg:flex-row items-center gap-2 px-5 py-4 rounded-lg transition
       ${isActive ? "text-orange-500 bg-orange-500/10" : "hover:text-orange-400 hover:bg-orange-500/10"}`
            }
        >
            {icon}
            <span className="text-xs lg:text-base relative">
                {label}
                {count !== undefined && (
                    <span className="ml-1 bg-orange-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full absolute -top-2 -right-4">
                        {count}
                    </span>
                )}
            </span>
        </NavLink>
    );


    return (
        <section className="flex min-h-screen">
            {/* SIDEBAR */}
            <aside className="
        fixed bottom-0 left-0 z-50
        w-full h-20 lg:h-screen lg:w-64
        bg-(--bg-color) text-(--text-color)
        shadow
        flex lg:flex-col justify-around lg:justify-start
        items-center lg:items-start
        px-2 py-3 lg:p-6
      ">
                <NavLink to="/" className="hidden lg:block mb-10">
                    <h1 className="text-2xl font-bold">
                        Airticks <span className="text-orange-500">Events</span>
                    </h1>
                </NavLink>

                <nav className="w-full flex justify-around lg:flex-col lg:gap-4">
                    {navItem("/dashboard", <RiHome2Line size={22} />, "Home")}
                    {navItem("/dashboard/events", <RiTicket2Line size={22} />, "Events", events.length)}
                    {navItem("/dashboard/scanner", <RiQrScanLine size={22} />, "QR Scanner")}
                    {navItem("/dashboard/tracking", <FaMoneyBillTrendUp size={22} />, "Analytics", recentActivities.length)}
                </nav>

            </aside>

            {/* MAIN */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* HEADER */}
                <header className="
          sticky top-0 z-40
          bg-(--bg-color) dark:bg-(--bg-color)
          text-(--text-color) dark:text-(--text-color)
          px-4 py-3 shadow
          flex items-center justify-between
        ">
                    <div>
                        <h2 className="font-semibold text-lg">{currentUser?.fullName}</h2>
                        <p className="text-sm">Admin Dashboard</p>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Darkmode />
                        <NavLink
                            to="/dashboard/blog"
                            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg"
                        >
                            Blog
                        </NavLink>
                        <div className="relative">
                            <FaBell size={22} />
                            <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {recentActivities.length > 9 ? "9+" : recentActivities.length}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-400 dark:bg-gray-700 hover:bg-gray-600 text-[#333333] dark:text-[#eeeeee] px-4 py-2 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>

                    {/* MOBILE MENU */}
                    <button
                        onClick={toggleOpen}
                        aria-label="Toggle menu"
                        className="relative w-10 h-10 lg:hidden flex items-center justify-center text-3xl cursor-pointer"
                    >
                        <FiMenu className={`absolute inset-0 m-auto transform transition-all duration-[300ms] ease-in-out ${open ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"}`} />
                        <FiX className={`absolute inset-0 m-auto transform transition-all duration-[300ms] ease-in-out ${open ? "opacity-100 scale-100 rotate-180" : "opacity-0 scale-0 rotate-0"}`} />
                    </button>

                    {open && (
                        <div className="absolute top-14 left-0 w-full justify-evenly p-4 rounded-lg shadow-lg flex items-center gap-4 lg:hidden z-50 transition-all duration-300">
                            <Darkmode />
                            <Link
                                onClick={() => setOpen(false)}
                                to="/dashboard/blog"
                                className="bg-orange-600 text-[#333333] dark:text-[#eeeeee] hover:bg-orange-700 px-4 py-2 rounded-lg"
                            >
                                blog
                            </Link>
                            <div onClick={() => setOpen(false)} className="relative">
                                <FaBell size={22} className="cursor-pointer" />
                                <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-[#333333] dark:text-[#eeeeee] rounded-full w-5 h-5 flex items-center justify-center">
                                    {recentActivities.length}
                                </span>
                            </div>
                            <button
                                onClick={() => { handleLogout(); setOpen(false); }}
                                className="bg-gray-400 dark:bg-gray-700 hover:bg-gray-600 text-[#333333] dark:text-[#eeeeee] px-4 py-2 rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </header>

                {/* CONTENT */}
                <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
                    {loading ? (
                        <p className="text-gray-400">Loading dashboard...</p>
                    ) : (
                        <Outlet context={{ events, users, recentActivities, currentUser }} />
                    )}
                </main>
            </div>
        </section>
    );
};

export default DashboardLayout;
