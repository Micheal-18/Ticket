import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { FaWallet, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";
import { db } from "../../firebase/firebase";

const OrgWallet = ({ organizerId }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizerId) return;

    // Wallet listener
    const walletRef = doc(db, "wallets", "organizers", "users", organizerId);
    const unsubWallet = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) setWallet(snap.data());
      setLoading(false);
    });

    // Transactions listener
    const txQuery = query(
      collection(db, "wallet_transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubTx = onSnapshot(txQuery, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.organizerId === organizerId);
      setTransactions(list);
    });

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [organizerId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading wallet...</p>;

  if (!wallet)
    return (
      <p className="text-center mt-10 text-gray-500">
        Wallet not initialized yet.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Organizer Wallet</h1>

      {/* WALLET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <WalletCard
          title="Available Balance"
          value={`₦${wallet.balance?.toLocaleString() || 0}`}
          icon={<FaWallet />}
          color="bg-green-500"
        />
        <WalletCard
          title="Total Earned"
          value={`₦${wallet.totalEarned?.toLocaleString() || 0}`}
          icon={<FaMoneyBillWave />}
          color="bg-blue-500"
        />
        <WalletCard
          title="Cashout"
          value="Withdraw Funds"
          icon={<FaArrowDown />}
          color="bg-orange-500"
          action
        />
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="text-left py-2">Event</th>
                  <th className="text-left py-2">Reference</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-2">{tx.eventName || tx.eventId}</td>
                    <td className="py-2 text-xs text-gray-500">{tx.reference}</td>
                    <td className="py-2 text-right font-medium text-green-600">
                      ₦{tx.organizerAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-2 text-right text-xs text-gray-400">
                      {tx.createdAt?.toDate
                        ? tx.createdAt.toDate().toLocaleString()
                        : new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================
   REUSABLE CARD
========================= */
const WalletCard = ({ title, value, icon, color }) => (
  <div
    className={`${color} text-white rounded-xl p-6 flex items-center justify-between shadow-md`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-xl font-semibold mt-1">{value}</h2>
    </div>
    <div className="text-3xl opacity-90">{icon}</div>
  </div>
);

export default OrgWallet;
