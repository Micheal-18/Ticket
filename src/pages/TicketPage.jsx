import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const TicketPage = () => {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTicket = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticketId}`
        );

        setTicket(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">

        <h1 className="text-3xl font-bold text-red-500">
          Ticket Not Found
        </h1>

        <Link
          to="/"
          className="mt-5 bg-orange-500 text-white px-6 py-3 rounded-lg"
        >
          Go Home
        </Link>

      </div>
    );
  }

  return (
    <section className="min-h-screen flex justify-center items-center p-5">

      <div className="bg-(--primary) rounded-3xl shadow-xl max-w-lg w-full overflow-hidden">

        <div className="bg-orange-500 p-8">

          <h1 className="text-3xl font-bold">
            {ticket.eventName}
          </h1>

          <p className="opacity-80 mt-2">
            Airticks Verified Ticket
          </p>

        </div>

        <div className="p-8 space-y-5">

          <div>
            <h3 className="text-gray-500 text-sm">
              Ticket Holder
            </h3>

            <p className="font-bold text-xl">
              {ticket.buyerName}
            </p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">
              Ticket Type
            </h3>

            <p className="font-semibold">
              {ticket.ticketType}
            </p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">
              Ticket Number
            </h3>

            <p>{ticket.ticketNumber}</p>
          </div>

          <div>

            <h3 className="text-gray-500 text-sm">
              Status
            </h3>

            {ticket.used ? (

              <div className="mt-2 bg-red-100 border border-red-300 rounded-xl p-4">

                <h2 className="text-red-600 text-2xl font-bold">
                  ❌ Already Used
                </h2>

                <p className="mt-2">
                  Scanned By:
                  <span className="font-semibold">
                    {" "}
                    {ticket.scannedByName}
                  </span>
                </p>

                {ticket.scannedAt && (
                  <p>
                    {new Date(ticket.scannedAt).toLocaleString()}
                  </p>
                )}

              </div>

            ) : (

              <div className="mt-2 bg-green-100 border border-green-300 rounded-xl p-4">

                <h2 className="text-green-700 text-2xl font-bold">
                  ✅ Valid Ticket
                </h2>

                <p className="mt-2">
                  This ticket has not yet been used.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </section>
  );
};

export default TicketPage;