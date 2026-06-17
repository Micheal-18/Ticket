import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaCalendarPlus, FaTicketAlt, FaUserFriends } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Profile from "./component/OrgProfile";
import EventChartPanel from "./component/OrgRechart";

const Organization = () => {
  const { events, recentActivities, currentUser, profileOpen, setProfileOpen  } = useOutletContext();

  /* ---------------- 🛠️ RESILIENT PARSER FOR INCOMING DATA ---------------- */
  const parseToNativeDate = (dateField) => {
    if (!dateField) return null;
    if (dateField instanceof Date && !isNaN(dateField.getTime())) return dateField;
    if (typeof dateField.toDate === "function") return dateField.toDate();
    if (dateField.seconds) return new Date(dateField.seconds * 1000);
    
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  /* ---------------- FILTER EVENTS ---------------- */
  const orgEvents = events.filter((e) => e.ownerId === currentUser?.uid);

  /* ---------------- CALCULATIONS ---------------- */
  const totalRevenue = orgEvents.reduce((sum, e) => sum + Number(e.organizerRevenue || 0), 0);
  const totalTicketsSold = orgEvents.reduce((sum, e) => sum + Number(e.ticketSold || 0), 0);
  const currency = orgEvents[0]?.currency || "₦";

  /* ---------------- CHART DATA ---------------- */
  const chartData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Object.fromEntries(months.map(m => [m, 0]));

    orgEvents.forEach((e) => {
      // e.date refers to event execution day value
      const d = parseToNativeDate(e.date);
      if (d) {
        const m = d.toLocaleString("default", { month: "short" });
        if (counts[m] !== undefined) {
          counts[m]++;
        }
      }
    });

    return months.map(m => ({ name: m, events: counts[m] }));
  })();

  /* ---------------- FOLLOWERS (READ-ONLY) ---------------- */
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchFollowers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("following", "array-contains", currentUser.uid)
        );

        const snap = await getDocs(q);
        setFollowers(
          snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (err) {
        console.error("Error reading followers dataset:", err);
      }
    };

    fetchFollowers();
  }, [currentUser]);

  return (
    <main className="flex-1 py-4 overflow-y-auto space-y-10">

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Your Events" value={orgEvents.length} />
        <SummaryCard
          title="Followers"
          value={currentUser?.followersCount || 0}
        />
        <SummaryCard
          title="Revenue"
          value={`${currency}${totalRevenue.toLocaleString()}`}
        />
        <SummaryCard title="Tickets Sold" value={totalTicketsSold} />
      </div>

      {/* ================= CHART & ACTIVITIES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* EVENTS CHART */}
        <EventChartPanel chartData={chartData} />

        {/* RECENT ACTIVITIES */}
        <div className="p-4 rounded-2xl shadow border border-gray-800/40">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivities.length === 0 && (
              <p className="text-gray-400 text-sm">No activity yet</p>
            )}

            {recentActivities.map((activity, index) => {
              const activityDate = parseToNativeDate(activity.date);

              return (
                <div
                  key={index}
                  className="flex gap-3 border-b border-gray-700 pb-4"
                >
                  <div className="text-orange-500 mt-1">
                    {activity.type === "event"
                      ? <FaCalendarPlus /> : activity.type === "users"
                      ? <FaUserFriends /> : <FaTicketAlt />}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {activity.type === "event"
                        ? `${activity?.name || "Event"} created` : activity?.type === "users"
                        ? `${activity?.user || "Someone"} followed you`
                        : `${activity?.user || "Someone"} bought a ${activity?.ticketNo || 1} ${activity?.ticketType || "Flat"} ticket for ${activity?.name || "Event"}`}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {activityDate ? activityDate.toLocaleString() : "No date snapshot"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= FOLLOWERS (READ-ONLY) ================= */}
      <div className="p-4 rounded-2xl shadow border border-gray-800">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUserFriends className="text-orange-500" /> Followers
        </h2>

        {followers.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No followers yet. Followers appear when users buy tickets.
          </p>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {followers.map((f, idx) => {
              const lastActive = parseToNativeDate(f.createdAt);
              
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center pb-3"
                >
                  <div>
                    <p className="font-semibold">{f.fullName || "Unknown"}</p>
                    <p className="text-gray-400 text-sm">
                      Last activity: {lastActive ? lastActive.toLocaleString() : "No activity timestamp"}
                    </p>
                  </div>
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full">
                    Follower
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

/* ---------------- SMALL REUSABLE CARD ---------------- */
const SummaryCard = ({ title, value }) => (
  <div className="p-4 rounded-2xl shadow ">
    <h2 className="text-gray-400 text-sm font-medium">{title}</h2>
    <p className="text-3xl font-semibold mt-2">{value}</p>
  </div>
);

export default Organization;