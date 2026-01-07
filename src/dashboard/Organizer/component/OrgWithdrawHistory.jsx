import { useEffect, useState } from "react";
import { auth } from "../../../firebase/firebase";
import OrgWithdraw from "./OrgWithdraw";

const OrgWithdrawHistory = ({ themeColor = "blue" }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const res = await fetch("/api/withdrawals", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Helper to format date safely
    const formatDate = (dateInput) => {
        if (!dateInput) return "N/A";
        const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
        return d.toLocaleDateString();
    };

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="rounded-xl shadow-sm  overflow-hidden mt-6">
            <div className="p-4  flex justify-between items-center">
                <h3 className="font-semibold ">Withdrawal History</h3>
                <span className="text-xs text-gray-400">{history.length} records found</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className=" text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Reference</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">
                                    No withdrawal records found.
                                </td>
                            </tr>
                        ) : (
                            history.map((tx) => (
                                <tr key={tx.id} className="text-sm hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">
                                        {formatDate(tx.createdAt)}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800">
                                        ₦{tx.amount?.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-[10px] font-mono text-gray-400 uppercase">
                                        {tx.reference?.slice(0, 12)}...
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                            tx.status === "success" ? "bg-green-100 text-green-700" : 
                                            tx.status === "pending" ? "bg-orange-100 text-orange-700" : 
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrgWithdrawHistory;