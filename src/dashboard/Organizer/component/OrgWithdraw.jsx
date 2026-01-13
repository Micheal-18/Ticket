import { useEffect, useState, useMemo } from "react";
import { auth, db } from "../../../firebase/firebase";
import { onSnapshot, doc, collection, query, where, orderBy } from "firebase/firestore";

const OrgWithdraw = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [notifiedRequests, setNotifiedRequests] = useState({}); // Track notifications

  /* =========================
     FETCH USER EVENTS (Real-time)
  ========================== */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "events"),
      where("ownerId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const evs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(evs);

      // Update selectedEvent if already selected
      if (selectedEventId) {
        const sel = evs.find(e => e.id === selectedEventId);
        setSelectedEvent(sel || null);
      }
    });

    return () => unsubscribe();
  }, [selectedEventId]);

  /* =========================
     FETCH WITHDRAW REQUESTS (Real-time)
  ========================== */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "withdraw_requests"),
      where("organizerId", "==", auth.currentUser.uid),
    );

    const unsubscribe = onSnapshot(q, snap => {
      const requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(requests);
      setHistoryLoading(false);

      // Notify for newly approved requests
      requests.forEach(r => {
        if (r.status === "paid" && !notifiedRequests[r.id]) {
          alert(`✅ Withdrawal of ₦${r.amount.toLocaleString()} approved!`);
          setNotifiedRequests(prev => ({ ...prev, [r.id]: true }));
        }
      });
    });

    return () => unsubscribe();
  }, [notifiedRequests]);

  /* =========================
     EVENT SELECT
  ========================== */
  useEffect(() => {
    const ev = events.find(e => e.id === selectedEventId);
    setSelectedEvent(ev || null);
    setAmount("");
  }, [selectedEventId, events]);

  /* =========================
     INPUT HANDLER
  ========================== */
  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/[^0-9]/g, ""));
  };

  /* =========================
     REQUEST WITHDRAW
  ========================== */
  const withdraw = async () => {
    if (!selectedEvent) return alert("Select an event");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return alert("Invalid amount");
    if (numAmount < 100) return alert("Minimum withdrawal is ₦100");
    if (numAmount > selectedEvent.balance) return alert("Insufficient balance");

    if (!window.confirm(`Request ₦${numAmount.toLocaleString()} withdrawal for "${selectedEvent.name}"?`))
      return;

    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/withdraw/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          amount: numAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      alert("Withdrawal request sent successfully!");
      setAmount("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const safeEvents = useMemo(() => (Array.isArray(events) ? events : []), [events]);

  return (
    <div className="space-y-6">

      {/* EVENT SELECT */}
      <div className="p-4 rounded-xl border bg-white">
        <h2 className="font-semibold mb-2">Select Event</h2>

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">-- Choose event --</option>
          {safeEvents.length === 0 && <option disabled>No events available</option>}
          {safeEvents.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.name} — ₦{(ev.balance || 0).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* WITHDRAW */}
      {selectedEvent && (
        <div className="p-5 rounded-xl border bg-white">
          <p className="text-xs mb-3">Balance: ₦{selectedEvent.balance.toLocaleString()}</p>

          <input
            value={amount}
            onChange={handleAmountChange}
            placeholder="₦0"
            className="w-full p-2 border rounded-lg mb-3"
          />

          <button
            onClick={withdraw}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Sending..." : "Request Withdrawal"}
          </button>
        </div>
      )}

      {/* HISTORY */}
      <div className="p-5 rounded-xl border bg-white">
        <h3 className="font-semibold mb-3">Withdrawal Requests</h3>

        {historyLoading && <p>Loading...</p>}

        {!historyLoading && history.length === 0 && (
          <p className="text-sm text-gray-400">No requests yet</p>
        )}

        {history.map(r => (
          <div key={r.id} className="border p-3 rounded-lg mb-2">
            <p>₦{r.amount.toLocaleString()}</p>
            <p className={`text-xs font-semibold ${r.status === "paid" ? "text-green-500" : "text-gray-500"}`}>
              {r.status.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgWithdraw;
