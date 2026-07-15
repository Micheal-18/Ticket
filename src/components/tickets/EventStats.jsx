import React from "react";
import { FaNairaSign, FaTicket } from "react-icons/fa6";
import {
  FiUsers,
  FiTrendingUp
} from "react-icons/fi";

const EventStats = ({ event }) => {
  if (!event) return null;

  const tickets = event.tickets || [];

  const lowestPrice =
    tickets.length > 0
      ? Math.min(
          ...tickets
            .filter(t => t.type === "paid")
            .map(t => Number(t.price))
        )
      : 0;

  const totalAvailable = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.quantity || 0),
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

const StatCard = ({
  icon,
  title,
  value,
  subtitle
}) => (
  <div className="rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition">

    <div className="w-12 h-12 rounded-full bg-orange-100 text-(--primary) flex items-center justify-center text-xl mb-4">

      {icon}

    </div>

    <h3 className="text-3xl font-black">
      {value}
    </h3>

    <p className="font-semibold mt-1">
      {title}
    </p>

    <span className="text-xs opacity-60">
      {subtitle}
    </span>

  </div>
);

export default EventStats;