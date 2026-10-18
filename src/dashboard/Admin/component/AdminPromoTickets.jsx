
import React, { useEffect, useState } from "react";
import { auth, db} from "../../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL ||
    "https://tick-backend-2.onrender.com").replace(/\/+$/, "");

const inputClass =
  "w-full rounded-xl border border-(--border) bg-(--bg-color) px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50";

const AdminPromoTickets = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [promoReason, setPromoReason] = useState("Promotional giveaway");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastTicket, setLastTicket] = useState(null);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"));

        const items = snapshot.docs.map((eventDoc) => ({
          id: eventDoc.id,
          ...eventDoc.data(),
        }));

        items.sort((a, b) =>
          String(a.name || a.title || "").localeCompare(
            String(b.name || b.title || "")
          )
        );

        if (active) setEvents(items);
      } catch (err) {
        console.error("Could not load events:", err);

        if (active) {
          setError("Could not load events. Please refresh the page.");
        }
      } finally {
        if (active) setLoadingEvents(false);
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const getAuthHeaders = async () => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please sign in to your admin account again.");
    }

    const token = await user.getIdToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleIssueTicket = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLastTicket(null);

    if (!eventId || !attendeeName.trim() || !attendeeEmail.trim()) {
      setError("Select an event and enter the attendee's name and email.");
      return;
    }

    setIssuing(true);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE}/api/admin/promo-tickets`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            eventId,
            attendeeName: attendeeName.trim(),
            attendeeEmail: attendeeEmail.trim(),
            promoReason: promoReason.trim(),
          }),
        }
      );

      const result = await response.json();

      if (result.ticketId) {
        setLastTicket({
          ticketId: result.ticketId,
          emailSent: result.emailSent === true,
        });
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Could not issue the giveaway ticket."
        );
      }

      setMessage(
        `Giveaway ticket created and emailed successfully. Ticket ID: ${result.ticketId}`
      );

      setAttendeeName("");
      setAttendeeEmail("");
      setPromoReason("Promotional giveaway");
    } catch (err) {
      console.error("Giveaway ticket error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIssuing(false);
    }
  };

  const handleResendEmail = async () => {
    if (!lastTicket?.ticketId) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE}/api/admin/promo-tickets/${encodeURIComponent(
          lastTicket.ticketId
        )}/resend`,
        {
          method: "POST",
          headers,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not resend the email.");
      }

      setLastTicket((prev) => ({ ...prev, emailSent: true }));
      setMessage("Ticket email resent successfully.");
    } catch (err) {
      setError(err.message || "Could not resend the email.");
    } finally {
      setResending(false);
    }
  };

  const selectedEvent = events.find((event) => event.id === eventId);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <span>🎁</span>
          Admin tools
        </div>

        <h1 className="text-2xl font-bold text-(--text-color) sm:text-3xl">
          Giveaway Tickets
        </h1>

        <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
          Issue complimentary tickets for any event, even when no promotional
          ticket type has been created. Tickets use the existing AirTicks
          QR verification system.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-(--border) bg-(--bg-color) p-4 ">
          <p className="text-sm text-(--text-muted)">Ticket cost</p>
          <p className="mt-1 text-xl font-bold text-(--text-color)">
            ₦0
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-color) p-4 ">
          <p className="text-sm text-(--text-muted)">Payment required</p>
          <p className="mt-1 text-xl font-bold text-(--text-color)">
            No
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-color) p-4 ">
          <p className="text-sm text-(--text-muted)">Ticket delivery</p>
          <p className="mt-1 text-xl font-bold text-(--text-color)">
            Email + QR
          </p>
        </div>
      </div>

      <form
        onSubmit={handleIssueTicket}
        className="space-y-5 rounded-2xl border border-(--border) p-5 text-(--text-muted) bg-(--bg-color) sm:p-7"
      >
        <div>
          <h2 className="text-lg font-bold text-(--text-color) dark:text-white">
            Issue a new ticket
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            One attendee receives one unique ticket.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="promo-event"
            className="block text-sm font-semibold text-(--text-color) "
          >
            Select event
          </label>

          <select
            id="promo-event"
            className={inputClass}
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
            disabled={loadingEvents || issuing}
          >
            <option value="">
              {loadingEvents ? "Loading events..." : "Choose an event"}
            </option>

            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name || event.title || "Untitled event"}
                {event.status ? ` — ${event.status}` : ""}
              </option>
            ))}
          </select>

          {!loadingEvents && events.length === 0 && (
            <p className="text-sm text-gray-500">
              No events were found in Firestore.
            </p>
          )}

          {selectedEvent && (
            <p className="text-xs text-gray-500">
              Event ID: {selectedEvent.id}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="promo-name"
              className="block text-sm font-semibold text-(--text-color) "
            >
              Attendee's full name
            </label>

            <input
              id="promo-name"
              className={inputClass}
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="Enter full name"
              maxLength={120}
              autoComplete="name"
              required
              disabled={issuing}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="promo-email"
              className="block text-sm font-semibold text-(--text-color) "
            >
              Attendee's email
            </label>

            <input
              id="promo-email"
              type="email"
              className={inputClass}
              value={attendeeEmail}
              onChange={(e) => setAttendeeEmail(e.target.value)}
              placeholder="attendee@example.com"
              maxLength={254}
              autoComplete="email"
              required
              disabled={issuing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="promo-reason"
            className="block text-sm font-semibold text-(--text-color) "
          >
            Giveaway reason (optional)
          </label>

          <input
            id="promo-reason"
            className={inputClass}
            value={promoReason}
            onChange={(e) => setPromoReason(e.target.value)}
            placeholder="Instagram giveaway, event ambassador..."
            maxLength={200}
            disabled={issuing}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
            {lastTicket?.ticketId && !lastTicket.emailSent && (
              <div className="mt-2 break-all">
                Ticket was created. ID: {lastTicket.ticketId}
              </div>
            )}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          >
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className={buttonClass}
            disabled={issuing || loadingEvents || events.length === 0}
          >
            {issuing ? "Issuing ticket..." : "🎁 Issue Free Ticket"}
          </button>

          {lastTicket?.ticketId && !lastTicket.emailSent && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
              onClick={handleResendEmail}
              disabled={resending || issuing}
            >
              {resending ? "Resending..." : "Resend Email"}
            </button>
          )}
        </div>

        <p className="text-xs leading-5 text-gray-500">
          The ticket is issued by AirTicks administration. No Paystack
          transaction is created, and no wallet or paid revenue is changed.
        </p>
      </form>
    </div>
  );
};

export default AdminPromoTickets;
