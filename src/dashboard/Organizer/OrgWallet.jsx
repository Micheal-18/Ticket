import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { FaWallet, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";
import { db } from "../../firebase/firebase";

const OrgWallet = ({ currentUser }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const organizerId = currentUser?.uid;

  useEffect(() => {
    if (!organizerId) return;

    setLoading(true);
    setError(null);

    const walletRef = doc(db, "wallets", organizerId);
    const unsubWallet = onSnapshot(
      walletRef,
      (snap) => {
        setWallet(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      (err) => {
        console.error("Wallet error:", err);
        setError("Failed to load wallet.");
        setLoading(false);
      }
    );

    const txQuery = query(
      collection(db, "wallet_transactions"),
      where("organizerId", "==", organizerId),
      orderBy("createdAt", "desc")
    );

    const unsubTx = onSnapshot(
      txQuery,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Tx error:", err);
        setError("Failed to load transactions.");
      }
    );

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [organizerId]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading wallet...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!wallet) return <p className="text-center mt-10 text-gray-500">Wallet not initialized yet.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">Organizer Wallet</h1>

      {/* WALLET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <WalletCard
          title="Available Balance"
          value={`₦${wallet.balance?.toLocaleString() || 0}`}
          icon={<FaWallet />}
          color="bg-green-600"
        />
        <WalletCard
          title="Total Earned"
          value={`₦${wallet.totalEarned?.toLocaleString() || 0}`}
          icon={<FaMoneyBillWave />}
          color="bg-blue-600"
        />
        <WalletCard
          title="Cashout"
          value="Withdraw Funds"
          icon={<FaArrowDown />}
          color="bg-orange-500"
        />
      </div>

      {/* TRANSACTIONS SECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="p-10 text-center text-gray-500">No transactions yet.</p>
        ) : (
          <>
            {/* MOBILE LIST VIEW (Visible on small screens) */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Event</span>
                    <span className="text-sm font-medium truncate ml-4 text-right">
                      {tx.eventName || tx.eventId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ref</span>
                    <span className="text-xs text-gray-500 font-mono">{tx.reference}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Amount</span>
                    <span className="text-sm font-bold text-green-600">
                      ₦{tx.organizerAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (Visible on md screens and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="text-left py-4 px-6">Event</th>
                    <th className="text-left py-4 px-6">Reference</th>
                    <th className="text-right py-4 px-6">Amount</th>
                    <th className="text-right py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 px-6 font-medium max-w-[200px] truncate">
                        {tx.eventName || tx.eventId}
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                        {tx.reference}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600">
                        ₦{tx.organizerAmount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-gray-400">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WalletCard = ({ title, value, icon, color }) => (
  <div className={`${color} text-white rounded-xl p-6 flex items-center justify-between shadow-md transition-transform hover:scale-[1.02]`}>
    <div className="min-w-0">
      <p className="text-xs opacity-80 uppercase font-bold tracking-wider">{title}</p>
      <h2 className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</h2>
    </div>
    <div className="text-3xl opacity-40 ml-4 shrink-0">{icon}</div>
  </div>
);

export default OrgWallet;