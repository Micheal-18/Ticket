import React from "react";
import { useOutletContext } from "react-router-dom";
import { FaCalendarPlus, FaShoppingCart, FaTicketAlt } from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardHome = () => {
  const { events, users, recentActivities, currentUser } = useOutletContext();

  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalTicketsSold = events.reduce((sum, e) => sum + (e.ticketSold || 0), 0);

  const chartData = (() => {
    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const counts = {};
    monthOrder.forEach(m => counts[m]=0);
    events.forEach(e => {
      const date = e.date ? new Date(e.date) : null;
      if(date && !isNaN(date)){
        const month = date.toLocaleString("default",{month:"short"});
        counts[month]+=1;
      }
    });
    return monthOrder.map(m => ({ name: m, registrations: counts[m] }));
  })();
    
  return (
    <main className="flex-1 p-4 overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className=" p-4 rounded-2xl shadow">
                  <h2 className="text-gray-400">Total Events</h2>
                  <p className="text-3xl font-semibold mt-2">{events.length}</p>
                </div>
                <div className=" p-4 rounded-2xl shadow">
                  <h2 className="text-gray-400">Upcoming Events</h2>
                  <span className="text-3xl font-semibold mt-2">
                    {events.filter((e) => new Date(e.date) > new Date()).length}
                  </span>
                </div>
                {currentUser?.isAdmin && (
                  <div className=" p-4 rounded-2xl shadow">
                    <h2 className="text-gray-400">Users</h2>
                    <span className="text-3xl font-semibold mt-2">{users.length || 0}</span>
                  </div>
                )}
                <div className=" p-4 rounded-2xl shadow">
                  <h2 className="text-gray-400">Revenue</h2>
                  <span className="text-3xl font-semibold mt-2">{events[0]?.currency}{" "}{totalRevenue.toLocaleString()}</span>
                </div>
                <div className=" p-4 rounded-2xl shadow">
                  <h2 className="text-gray-400">TicketSold</h2>
                  <span className="text-3xl font-semibold mt-2">{totalTicketsSold}</span>
                </div>
              </div>
    
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chart Section */}
                <div className=" p-6 rounded-2xl shadow mb-8">
                  <h2 className="text-xl font-semibold mb-4">Events per Month</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip />
                        <Bar dataKey="registrations" fill="#F97316" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
    
                {/* Recent Activities Section */}
                <div className=" p-6 rounded-2xl shadow mb-8">
                  <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 border-b border-gray-700 pb-4">
                        <div className="text-orange-500 mt-1">
                          {activity.type === "event" ? <FaCalendarPlus /> : activity.type === "registration" ? <FaTicketAlt /> : <FaShoppingCart />}
                        </div>
    
                        <div>
                          {activity.type === "event" && (
                            <>
                              <h3 className="text-lg font-semibold">{activity.name} event added</h3>
                              <p className="text-gray-400">{new Date(activity.date).toLocaleString()}</p>
                            </>
                          )}
                          {activity.type === "registration" && (
                            <>
                              <h3 className="text-lg font-semibold">{activity.user} registered for {activity.name}</h3>
                              <p className="text-gray-400">{new Date(activity.date).toLocaleString()}</p>
                            </>
                          )}
                          {activity.type === "ticket" && (
                            <>
                              <h3 className="text-lg font-semibold">{activity.user} bought ticket for {activity.name}</h3>
                              <p className="text-gray-400">{new Date(activity.date).toLocaleString()}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
    
                  </div>
                </div>
              </div>
    
              {/*Upcoming Events Section */}
              <div className=" p-6 rounded-2xl shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {events
                    .filter((e) => new Date(e.date) > new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date)).map((event) => (
                      <div key={event.id} className="border-b border-gray-700 pb-4">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        <p className="text-gray-400">
                          {new Date(event.date).toLocaleDateString()} at {event.startTime}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
              <div></div>
            </main>
  )
}

export default DashboardHome