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

const Organization = () => {
  const { events, recentActivities, currentUser } = useOutletContext();

  /* ---------------- FILTER EVENTS ---------------- */
  const orgEvents = events.filter(
    (e) => e.ownerId === currentUser?.uid
  );

  /* ---------------- CALCULATIONS ---------------- */
  const totalRevenue = orgEvents.reduce(
    (sum, e) => sum + Number(e.revenue || 0),
    0
  );

  const totalTicketsSold = orgEvents.reduce(
    (sum, e) => sum + Number(e.ticketSold || 0),
    0
  );

  const currency = orgEvents[0]?.currency || "₦";

  /* ---------------- CHART DATA ---------------- */
  const chartData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Object.fromEntries(months.map(m => [m, 0]));

    orgEvents.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (!isNaN(d)) {
        const m = d.toLocaleString("default", { month: "short" });
        counts[m]++;
      }
    });

    return months.map(m => ({ name: m, events: counts[m] }));
  })();

  /* ---------------- FOLLOWERS (READ-ONLY) ---------------- */


const [followers, setFollowers] = useState([]);

useEffect(() => {
  if (!currentUser) return;

  const fetchFollowers = async () => {
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
        <div className="p-4 rounded-2xl shadow ">
          <h2 className="text-xl font-semibold mb-4">Events per Month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="events" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="p-4 rounded-2xl shadow ">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivities.length === 0 && (
              <p className="text-gray-400 text-sm">No activity yet</p>
            )}

            {recentActivities.map((activity, index) => (
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
                      ? `${activity.name} event created` : activity.type === "users"
                      ? `${activity.user} followed you`
                      : `${activity?.user} bought a ticket for ${activity?.name}`}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
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
            {followers.map((f, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center  pb-3"
              >
                <div>
                  <p className="font-semibold">{f.fullName}</p>
                  <p className="text-gray-400 text-sm">
                    Last activity: {new Date(f.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full">
                  Follower
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

/* ---------------- SMALL REUSABLE CARD ---------------- */
const SummaryCard = ({ title, value }) => (
  <div className="p-4 rounded-2xl shadow ">
    <h2 className="text-gray-400">{title}</h2>
    <p className="text-3xl font-semibold mt-2">{value}</p>
  </div>
);

export default Organization;
