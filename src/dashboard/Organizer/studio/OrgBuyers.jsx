import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import {
  FaSearch,
  FaEnvelope,
  FaMoneyBillWave,
  FaTicketAlt,
  FaUsers,
} from "react-icons/fa";
import BuyerDrawer from "./component/BuyerDrawer";
import { db } from "../../../firebase/firebase";

const OrgBuyers = () => {
  const { eventId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const q = query(
      collection(db, "tickets"),
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTickets(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return unsub;
  }, [eventId]);

  const buyers = useMemo(() => {
    const grouped = {};

    tickets.forEach((ticket) => {
      const key = ticket.parentReference || ticket.reference;

      if (!grouped[key]) {
        grouped[key] = {
          reference: key,
          purchaserName: ticket.purchaserName,
          purchaserEmail: ticket.purchaserEmail,
          createdAt: ticket.createdAt,
          amountPaid: 0,
          totalTickets: 0,
          tickets: [],
        };
      }

      grouped[key].tickets.push(ticket);

      grouped[key].totalTickets++;

      grouped[key].amountPaid += Number(ticket.amount || 0);
    });

    return Object.values(grouped).filter((buyer) => {
      const q = search.toLowerCase();

      return (
        buyer.purchaserName?.toLowerCase().includes(q) ||
        buyer.purchaserEmail?.toLowerCase().includes(q) ||
        buyer.reference?.toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  const totalRevenue = buyers.reduce(
    (sum, buyer) => sum + buyer.amountPaid,
    0
  );

  const totalTickets = buyers.reduce(
    (sum, buyer) => sum + buyer.totalTickets,
    0
  );

  return (
    <section className="min-h-screen bg-(--bg-color) text-(--text-color)">

      <div className="p-8 border-b">

        <h1 className="text-4xl font-bold">
          Buyers
        </h1>

        <p className="opacity-70">
          Everyone who has purchased tickets.
        </p>

      </div>

      {/* Stats */}

      <div className="grid lg:grid-cols-3 gap-5 p-8">

        <StatCard
          icon={<FaUsers />}
          title="Buyers"
          value={buyers.length}
        />

        <StatCard
          icon={<FaTicketAlt />}
          title="Tickets"
          value={totalTickets}
        />

        <StatCard
          icon={<FaMoneyBillWave />}
          title="Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
        />

      </div>

      {/* Search */}

      <div className="px-8 mb-6">

        <div className="relative">

          <FaSearch className="absolute left-4 top-4 opacity-60" />

          <input
            placeholder="Search buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-transparent py-3 pl-12 pr-4 outline-none"
          />

        </div>

      </div>

      {/* Buyer List */}

      <div className="px-8 pb-12 space-y-5">

        {buyers.map((buyer) => (

          <div
            key={buyer.reference}
            className="border rounded-2xl p-6 hover:border-(--primary) transition cursor-pointer"
            onClick={() => setSelectedBuyer(buyer)}
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="font-bold text-xl">
                  {buyer.purchaserName}
                </h2>

                <p className="opacity-70 flex items-center gap-2 mt-2">
                  <FaEnvelope />
                  {buyer.purchaserEmail}
                </p>

              </div>

              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                Paid
              </span>

            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">

              <Info
                title="Tickets"
                value={buyer.totalTickets}
              />

              <Info
                title="Amount"
                value={`₦${buyer.amountPaid.toLocaleString()}`}
              />

              <Info
                title="Reference"
                value={buyer.reference.slice(0, 12)}
              />

            </div>

          </div>

        ))}

      </div>

      <BuyerDrawer
        open={!!selectedBuyer}
        buyer={selectedBuyer}
        onClose={() => setSelectedBuyer(null)}
      />

    </section>
  );
};

function StatCard({ icon, title, value }) {
  return (
    <div className="border rounded-2xl p-6">

      <div className="text-3xl text-(--primary)">
        {icon}
      </div>

      <p className="opacity-60 mt-4">
        {title}
      </p>

      <h2 className="text-3xl font-bold">
        {value}
      </h2>

    </div>
  );
}

function Info({ title, value }) {
  return (
    <div>

      <p className="text-sm opacity-60">
        {title}
      </p>

      <h3 className="font-semibold mt-1 break-all">
        {value}
      </h3>

    </div>
  );
}

export default OrgBuyers;