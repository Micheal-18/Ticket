import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { FaNairaSign, FaTicket } from "react-icons/fa6";
import { FiUsers, FiTrendingUp } from "react-icons/fi";

const EventStats = ({ eventId }) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = onSnapshot(
      doc(db, "events", eventId),
      (docSnap) => {
        if (docSnap.exists()) {
          setEvent({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      }
    );

    return unsubscribe;
  }, [eventId]);

  if (!event) return null;

  const tickets = event.tickets || [];

  const paidTickets = tickets.filter((t) => t.type === "paid");

  const lowestPrice =
    paidTickets.length > 0
      ? Math.min(...paidTickets.map((t) => Number(t.price || 0)))
      : 0;

  const totalAvailable = tickets.reduce(
    (sum, ticket) =>
      sum +
      Math.max(
        0,
        Number(ticket.quantity || 0) - Number(ticket.sold || 0)
      ),
    0
  );

  const totalGuests = event.guests?.length || 0;

  return (
    <section className="grid md:grid-cols-4 gap-5">
      <StatCard
        icon={<FiUsers />}
        title="Guests"
        value={totalGuests}
        subtitle="Featured"
      />

      <StatCard
        icon={<FaTicket />}
        title="Tickets"
        value={totalAvailable}
        subtitle="Available"
      />

      <StatCard
        icon={<FaNairaSign />}
        title="Starts From"
        value={
          event.isFree
            ? "FREE"
            : `₦${lowestPrice.toLocaleString()}`
        }
        subtitle="Entry"
      />

      <StatCard
        icon={<FiTrendingUp />}
        title="Sold"
        value={event.ticketSold || 0}
        subtitle="Tickets"
      />
    </section>
  );
};

const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="rounded-3xl border border-(--border) bg-(--bg-color) p-6 shadow-sm hover:shadow-xl transition">
    <div className="w-12 h-12 rounded-full bg-amber-100 text-(--primary) flex items-center justify-center text-xl mb-4">
      {icon}
    </div>

    <h3 className="text-3xl font-black">{value}</h3>

    <p className="font-semibold mt-1">{title}</p>

    <span className="text-xs opacity-60">{subtitle}</span>
  </div>
);

export default EventStats;