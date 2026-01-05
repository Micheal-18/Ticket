import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { FaWallet, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";
import { db } from "../../firebase/firebase";

const AdminWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Wallet
    const walletRef = doc(db, "wallets", "platform");
    const unsubWallet = onSnapshot(
      walletRef,
      (snap) => {
        if (snap.exists()) setWallet(snap.data());
        setLoading(false);
      },
      (err) => {
        console.error("Wallet snapshot error:", err);
        setError("Failed to load platform wallet.");
        setLoading(false);
      }
    );

    // Transactions
    const txQuery = query(
      collection(db, "wallet_transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubTx = onSnapshot(
      txQuery,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Transactions snapshot error:", err);
        setError("Failed to load transactions. Make sure you are admin.");
      }
    );

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading wallet...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!wallet)
    return <p className="text-center mt-10 text-gray-500">Wallet not initialized yet.</p>;

return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">Admin Wallet</h1>

      {/* WALLET CARDS */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
        />
      </div>

      {/* TRANSACTIONS SECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="p-8 text-gray-500 text-sm text-center">No transactions yet.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Shown on small screens, hidden on md and up */}
            <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase">Organizer</span>
                    <span className="text-sm font-medium truncate max-w-[200px]">{tx.orgName || tx.organizerId}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase">Event</span>
                    <span className="text-sm truncate max-w-[200px]">{tx.eventName || tx.eventId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase">Fee</span>
                    <span className="text-sm font-bold text-green-600">₦{tx.platformFee?.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Hidden on mobile, shown on md and up */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Organizer</th>
                    <th className="py-3 px-4 text-left font-semibold">Event</th>
                    <th className="py-3 px-4 text-right font-semibold">Platform Fee</th>
                    <th className="py-3 px-4 text-right font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4 max-w-[200px] truncate">{tx.orgName || tx.organizerId}</td>
                      <td className="py-4 px-4 max-w-[200px] truncate">{tx.eventName || tx.eventId}</td>
                      <td className="py-4 px-4 text-right font-semibold text-green-600">
                        ₦{tx.platformFee?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-gray-400">
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

/* =========================
   WALLET CARD
========================= */
const WalletCard = ({ title, value, icon, color }) => (
  <div
    className={`${color} text-white rounded-xl p-4 sm:p-6 flex items-center justify-between shadow-md`}
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm opacity-90 truncate">{title}</p>
      <h2 className="text-lg sm:text-xl font-semibold mt-1 truncate">{value}</h2>
    </div>
    <div className="text-2xl sm:text-3xl opacity-90 ml-2">{icon}</div>
  </div>
);

export default AdminWallet;
