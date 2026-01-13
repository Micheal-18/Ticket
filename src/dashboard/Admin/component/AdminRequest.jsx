import { useEffect, useState } from "react";
import { auth } from "../../../firebase/firebase";


const AdminRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);

    /* =========================
       FETCH REQUESTS
    ========================== */
    const fetchRequests = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/withdraw/requests`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load withdrawals", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    /* =========================
       PAY ORGANIZER
    ========================== */
    const payOrganizer = async (req) => {
        if (!window.confirm(`Pay ₦${req.amount.toLocaleString()} now?`)) return;

        setPayingId(req.id);

        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/withdraw/pay`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ requestId: req.id }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payment failed");

            alert("Transfer initiated");
            fetchRequests();
        } catch (err) {
            alert(err.message);
        } finally {
            setPayingId(null);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Withdrawal Requests</h2>

            {requests.length === 0 && (
                <p className="text-sm text-gray-500">No pending requests</p>
            )}

            {requests.map(req => (
                <div
                    key={req.id}
                    className="border rounded-xl p-4 flex justify-between items-center"
                >
                    <div>
                        <p className="font-semibold">₦{req.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                            {req.eventName}
                        </p>
                        <p className="text-xs text-gray-400">
                            {req.createdAt?.seconds
                                ? new Date(req.createdAt.seconds * 1000).toLocaleString()
                                : new Date(req.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {req.status === "pending" ? (
                        <button
                            onClick={() => payOrganizer(req)}
                            disabled={payingId === req.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                        >
                            {payingId === req.id ? "Paying..." : "Pay"}
                        </button>
                    ) : (
                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                            {req.status}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminRequest;
