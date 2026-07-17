import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaCheckCircle,
    FaTrash,
    FaEnvelope,
    FaDownload
} from "react-icons/fa";

const AttendeeDrawer = ({ open, onClose, ticket }) => {

    if (!ticket) return null;

    return (
        <AnimatePresence>

            {open && (

                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: .5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: .25 }}
                        className="fixed right-0 top-0 h-screen w-full lg:w-[450px] bg-(--bg-color) border-l z-50 overflow-y-auto"
                    >

                        <div className="p-6">

                            <div className="flex justify-between items-center">

                                <h2 className="text-2xl font-bold">
                                    Attendee
                                </h2>

                                <button onClick={onClose}>
                                    <FaTimes />
                                </button>

                            </div>

                            <div className="mt-8 text-center">

                                <img
                                    src={`data:image/png;base64,${ticket.qr}`}
                                    className="w-52 mx-auto rounded-xl"
                                    alt=""
                                />

                                <h2 className="mt-5 text-2xl font-bold">
                                    {ticket.attendeeName}
                                </h2>

                                <p className="opacity-70">
                                    #{ticket.attendeeNumber}
                                </p>

                            </div>

                            <div className="mt-8 space-y-5">

                                <Info
                                    title="Email"
                                    value={ticket.email}
                                />

                                <Info
                                    title="Ticket"
                                    value={ticket.ticketType}
                                />

                                <Info
                                    title="Buyer"
                                    value={ticket.purchaserName}
                                />

                                <Info
                                    title="Buyer Email"
                                    value={ticket.purchaserEmail}
                                />

                                <Info
                                    title="Reference"
                                    value={ticket.reference}
                                />

                                <Info
                                    title="Checked In"
                                    value={ticket.used ? "Yes" : "No"}
                                />

                            </div>

                            <div className="mt-10 grid gap-3">

                                <button
                                    className="bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-3"
                                >
                                    <FaCheckCircle />

                                    {ticket.used
                                        ? "Already Checked In"
                                        : "Check In"}
                                </button>

                                <button
                                    className="border py-3 rounded-xl flex items-center justify-center gap-3"
                                >
                                    <FaEnvelope />

                                    Resend Ticket
                                </button>

                                <button
                                    className="border py-3 rounded-xl flex items-center justify-center gap-3"
                                >
                                    <FaDownload />

                                    Download Ticket
                                </button>

                                <button
                                    className="border border-red-500 text-red-500 py-3 rounded-xl flex items-center justify-center gap-3"
                                >
                                    <FaTrash />

                                    Delete Ticket
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

export default AttendeeDrawer;