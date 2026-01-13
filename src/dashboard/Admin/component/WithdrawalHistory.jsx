import { useEffect, useState } from "react";
import { auth } from "../../../firebase/firebase";

const WithdrawalHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/withdrawals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load withdrawal history", err);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, []);


    if (loading) return <p className="text-gray-500">Loading history...</p>;

    return (
        <div className=" rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b border-gray-50">
                <h3 className="font-semibold ">Withdrawal History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="b text-xs uppercase text-gray-400 font-medium">
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Reference</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((tx) => (
                            <tr key={tx.id} className="text-sm hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-semibold">₦{tx.amount?.toLocaleString()}</td>
                                <td className="p-4 text-xs font-mono text-gray-400">{tx.reference}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        tx.status === "success" ? "bg-green-100 text-green-700" : 
                                        tx.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                                        "bg-red-100 text-red-700"
                                    }`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WithdrawalHistory;