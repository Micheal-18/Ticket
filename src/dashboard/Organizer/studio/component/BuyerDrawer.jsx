import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaEnvelope,
  FaDownload,
  FaTrash,
  FaMoneyBillWave,
  FaTicketAlt,
  FaUsers,
  FaPrint,
  FaCheckCircle,
} from "react-icons/fa";

const BuyerDrawer = ({ open, onClose, buyer }) => {
  if (!buyer) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer */}

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 right-0 h-screen w-full lg:w-[480px] bg-(--bg-color) border-l overflow-y-auto z-50"
          >
            <div className="p-6">

              {/* Header */}

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-3xl font-bold">
                    Buyer Details
                  </h2>

                  <p className="opacity-70">
                    Purchase Information
                  </p>

                </div>

                <button
                  onClick={onClose}
                  className="text-xl"
                >
                  <FaTimes />
                </button>

              </div>

              {/* Buyer */}

              <div className="mt-8 text-center">

                <div className="w-24 h-24 rounded-full bg-(--primary)/20 flex items-center justify-center mx-auto text-4xl font-bold text-(--primary)">
                  {buyer.purchaserName?.charAt(0)}
                </div>

                <h2 className="text-2xl font-bold mt-5">
                  {buyer.purchaserName}
                </h2>

                <p className="opacity-70">
                  {buyer.purchaserEmail}
                </p>

                <span className="inline-block mt-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                  Paid
                </span>

              </div>

              {/* Stats */}

              <div className="grid grid-cols-3 gap-3 mt-8">

                <SmallCard
                  icon={<FaMoneyBillWave />}
                  title="Amount"
                  value={`₦${buyer.amountPaid.toLocaleString()}`}
                />

                <SmallCard
                  icon={<FaTicketAlt />}
                  title="Tickets"
                  value={buyer.totalTickets}
                />

                <SmallCard
                  icon={<FaUsers />}
                  title="Attendees"
                  value={buyer.tickets.length}
                />

              </div>

              {/* Purchase */}

              <div className="mt-8 space-y-4">

                <Info
                  title="Reference"
                  value={buyer.reference}
                />

                <Info
                  title="Buyer Name"
                  value={buyer.purchaserName}
                />

                <Info
                  title="Buyer Email"
                  value={buyer.purchaserEmail}
                />

                <Info
                  title="Purchase Date"
                  value={
                    buyer.createdAt?.toDate
                      ? buyer.createdAt.toDate().toLocaleString()
                      : "-"
                  }
                />

              </div>

              {/* Attendees */}

              <div className="mt-10">

                <h3 className="text-xl font-bold mb-5">
                  Attendees
                </h3>

                <div className="space-y-3">

                  {buyer.tickets.map((ticket, index) => (

                    <div
                      key={ticket.ticketId}
                      className="border rounded-xl p-4"
                    >

                      <div className="flex justify-between">

                        <div>

                          <h4 className="font-semibold">
                            {index + 1}. {ticket.attendeeName}
                          </h4>

                          <p className="text-sm opacity-70">
                            {ticket.email}
                          </p>

                        </div>

                        <div className="text-right">

                          <span className="text-sm bg-(--primary)/20 px-2 py-1 rounded-full">
                            {ticket.ticketType}
                          </span>

                          <div className="mt-2">

                            {ticket.used ? (
                              <span className="text-green-500 flex items-center gap-2 justify-end text-sm">
                                <FaCheckCircle />
                                Checked In
                              </span>
                            ) : (
                              <span className="text-orange-500 text-sm">
                                Pending
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* Actions */}

              <div className="mt-10 grid gap-3">

                <button className="bg-(--primary) text-white py-3 rounded-xl flex items-center justify-center gap-3">
                  <FaEnvelope />
                  Resend Tickets
                </button>

                <button className="border py-3 rounded-xl flex items-center justify-center gap-3">
                  <FaDownload />
                  Download Invoice
                </button>

                <button className="border py-3 rounded-xl flex items-center justify-center gap-3">
                  <FaPrint />
                  Print Tickets
                </button>

                <button className="border py-3 rounded-xl flex items-center justify-center gap-3">
                  <FaEnvelope />
                  Email Buyer
                </button>

                <button className="border border-red-500 text-red-500 py-3 rounded-xl flex items-center justify-center gap-3">
                  <FaTrash />
                  Delete Purchase
                </button>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function Info({ title, value }) {
  return (
    <div className="border rounded-xl p-4">

      <p className="text-sm opacity-60">
        {title}
      </p>

      <h3 className="font-semibold mt-1 break-all">
        {value || "-"}
      </h3>

    </div>
  );
}

function SmallCard({ icon, title, value }) {
  return (
    <div className="border rounded-xl p-4 text-center">

      <div className="text-(--primary) text-2xl flex justify-center">
        {icon}
      </div>

      <p className="text-xs opacity-60 mt-2">
        {title}
      </p>

      <h3 className="font-bold text-lg mt-1">
        {value}
      </h3>

    </div>
  );
}

export default BuyerDrawer;