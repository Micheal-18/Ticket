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
import OrgSalesChart from "./component/OrgSaleChart";

const OrgWallet = ({ currentUser, events }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const organizerId = currentUser?.uid;

  useEffect(() => {
    if (!organizerId) return;

    setLoading(true);
    setError(null);

    // Listen to organizer's wallet
    const walletRef = doc(db, "wallets", organizerId);
    const unsubWallet = onSnapshot(
      walletRef,
      (snap) => {
        if (snap.exists()) {
          setWallet(snap.data());
        } else {
          setWallet({ pendingBalance: 0, settledBalance: 0, balance: 0 });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Wallet error:", err);
        setError("Failed to load wallet.");
        setLoading(false);
      }
    );

    // Listen to organizer's wallet transactions
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
        console.error("Transactions error:", err);
        setError("Failed to load transactions.");
      }
    );

    return () => {
      unsubWallet();
      unsubTx();
    };
  }, [organizerId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading your wallet...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  // Separate transactions
  const pendingTx = transactions.filter((tx) => tx.type === "ticket_sale");
  const settledTx = transactions.filter((tx) => tx.type === "settlement");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Earnings</h1>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <WalletCard
          title="Pending Balance"
          value={`₦${wallet.pendingBalance?.toLocaleString() || 0}`}
          icon={<FaWallet />}
          color="bg-orange-600"
        />
        <WalletCard
          title="Paid Out"
          value={`₦${wallet.totalEarned?.toLocaleString() || 0}`}
          icon={<FaMoneyBillWave />}
          color="bg-green-600"
        />
        <WalletCard
          title="Payout"
          value="Automatic after event"
          icon={<FaArrowDown />}
          color="bg-gray-600"
        />
      </div>

      {/* Analytics Chart */}
      <OrgSalesChart transactions={transactions} />

      {/* Pending Transactions */}
      <TransactionTable transactions={pendingTx} title="Pending Earnings" />

      {/* Settled Transactions */}
      <TransactionTable transactions={settledTx} title="Settled Payouts" />
    </div>
  );
};

/* =========================
   WALLET CARD COMPONENT
========================= */
const WalletCard = ({ title, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} text-white rounded-2xl p-6 flex items-center justify-between shadow-sm transition-all active:scale-95`}
  >
    <div className="min-w-0">
      <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">{title}</p>
      <h2 className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</h2>
    </div>
    <div className="text-3xl opacity-30 ml-4 shrink-0">{icon}</div>
  </div>
);

/* =========================
   TRANSACTION TABLE COMPONENT
========================= */
const TransactionTable = ({ transactions, title }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-5 flex justify-between items-center">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="p-12 text-center">
          <p className="text-gray-400">No transactions recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="p-5 flex justify-between items-center">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase tracking-widest font-bold">
            <tr>
              <th className="py-4 px-6">Event Details</th>
              <th className="py-4 px-6 text-right">Amount</th>
              <th className="py-4 px-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => (
              <tr key={tx.id} className="transition-colors">
                <td className="py-4 px-6">
                  <p className="font-semibold truncate max-w-[200px]">{tx.eventName}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    REF: {tx.reference?.slice(0, 12)}...
                  </p>
                </td>
                <td className="py-4 px-6 text-right font-bold">
                  {tx.type === "ticket_sale" ? (
                    <span className="text-orange-500">
                      ₦{tx.organizerAmount?.toLocaleString()} (Pending)
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ₦{tx.amount?.toLocaleString()} (Paid)
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right text-gray-400 text-xs">
                  {tx.createdAt?.toDate
                    ? tx.createdAt.toDate().toLocaleDateString()
                    : tx.createdAt instanceof Date
                    ? tx.createdAt.toLocaleDateString()
                    : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgWallet;
