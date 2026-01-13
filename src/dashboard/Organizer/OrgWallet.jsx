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
import OrgWithdraw from "./component/OrgWithdraw";
import OrgSalesChart from "./component/OrgSaleChart";
import OrgWithdrawHistory from "./component/OrgWithdrawHistory";

// Components

const OrgWallet = ({ currentUser, events }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const organizerId = currentUser?.uid;

  const toggleWithdraw = () => setShowWithdraw(!showWithdraw);

  useEffect(() => {
    if (!organizerId) return;

    setLoading(true);
    setError(null);

    // 1. Listen to Organizer's specific wallet
    const walletRef = doc(db, "wallets", organizerId);
    const unsubWallet = onSnapshot(
      walletRef,
      (snap) => {
        if (snap.exists()) {
          setWallet(snap.data());
        } else {
          setWallet({ balance: 0, totalEarned: 0 });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Wallet error:", err);
        setError("Failed to load wallet.");
        setLoading(false);
      }
    );

    // 2. Listen to Organizer's specific transactions
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

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading your wallet...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 ">Your Earnings</h1>

      {/* WALLET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <WalletCard
          title="Available Balance"
          value={`₦${wallet?.balance?.toLocaleString() || 0}`}
          icon={<FaWallet />}
          color="bg-slate-800"
        />
        <WalletCard
          title="Total Earned"
          value={`₦${wallet?.totalEarned?.toLocaleString() || 0}`}
          icon={<FaMoneyBillWave />}
          color="bg-blue-600"
        />
        <WalletCard
          title="Payout"
          value="Withdraw Funds"
          icon={<FaArrowDown />}
          color="bg-orange-500 cursor-pointer hover:bg-orange-600 transition-all"
          onClick={toggleWithdraw}
        />
      </div>

      {/* WITHDRAW FORM (TOGGLE) */}
      {showWithdraw && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <OrgWithdraw balance={wallet?.balance || 0} events={events} />
        </div>
      )}

      {/* ANALYTICS CHART */}
      <OrgSalesChart transactions={transactions} />

      {/* RECENT SALES TRANSACTIONS */}
      <div className=" rounded-xl shadow-sm   overflow-hidden mb-8">
        <div className="p-5  flex justify-between items-center">
          <h2 className="text-lg font-bold ">Recent Sales</h2>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            92% Payout Rate
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No ticket sales recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="  text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6 text-right">Your Share</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y ">
                {transactions.map((tx) => (
                  <tr key={tx.id} className=" transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold truncate max-w-[200px]">
                        {tx.eventName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        REF: {tx.reference?.slice(0, 12)}...
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-green-600">
                      ₦{tx.organizerAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400 text-xs">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYOUT HISTORY */}
      <OrgWithdrawHistory themeColor="blue" />
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

export default OrgWallet;