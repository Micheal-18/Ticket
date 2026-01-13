import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { FaWallet, FaMoneyBillWave, FaArrowDown } from "react-icons/fa";
import { auth, db } from "../../firebase/firebase";
import AdminRevenueChart from "./component/AdminRevenueChart";
import AdminWithdraw from "./component/AdminWithdraw";
import WithdrawalHistory from "./component/WithdrawalHistory";
import AdminRequest from "./component/AdminRequest";

const AdminWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(false);

  const handleWithdraw = () => {
    setWithdrawAmount(!withdrawAmount);
  };

  const refundTicket = async (reference) => {
  if (!window.confirm("Refund this ticket?")) return;

  const token = await auth.currentUser.getIdToken();

  const res = await fetch("/api/admin/refund", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reference }),
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  alert("Refund successful");
};


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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-4">
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
          onClick={handleWithdraw}
          title="Cashout"
          value="Withdraw Funds"
          icon={<FaArrowDown />}
          color="bg-orange-500 cursor-pointer hover:bg-orange-600 transition-colors"
        />
      </div>

      {withdrawAmount && (<AdminWithdraw balance={wallet.balance || 0} />)}
        <div className="mt-8 rounded-xl shadow p-5 bg-white">
            <h2 className="text-lg font-semibold mb-4">
              Organizer Withdrawal Requests
            </h2>
         <AdminRequest />
        </div>


      <AdminRevenueChart transactions={transactions} />

      {/* <button
  onClick={() => refundTicket(tx.reference)}
  className=" bg-red-600 p-4 text-xs hover:underline"
>
  Refund
</button> */}


      {/* TRANSACTIONS SECTION */}
      <div className=" rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Recent Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="p-8 text-gray-500 text-sm text-center">No transactions yet.</p>
        ) : (
          <>
            {/* MOBILE VIEW: Shown on small screens, hidden on md and up */}
            <div className="block md:hidden divide-y ">
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

                  <div className="flex justify-end mt-2">
  <button
    onClick={() => refundTicket(tx.reference)}
    className="text-red-600 text-xs font-semibold"
  >
    Refund
  </button>
</div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Hidden on mobile, shown on md and up */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className=" text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Organizer</th>
                    <th className="py-3 px-4 text-left font-semibold">Event</th>
                    <th className="py-3 px-4 text-right font-semibold">Platform Fee</th>
                    <th className="py-3 px-4 text-right font-semibold">Date</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y ">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className=" transition-colors">
                      <td className="py-4 px-4 max-w-[200px] truncate">{tx.orgName || tx.organizerId}</td>
                      <td className="py-4 px-4 max-w-[200px] truncate">{tx.eventName || tx.eventId}</td>
                      <td className="py-4 px-4 text-right font-semibold text-green-600">
                        ₦{tx.platformFee?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-gray-400">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : ""}
                      </td>

                      <td className="py-4 px-4 text-right">
  <button
    onClick={() => refundTicket(tx.reference)}
    className="text-red-600 text-xs font-semibold hover:underline"
  >
    Refund
  </button>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <WithdrawalHistory />
    </div>
  );
};

/* =========================
   WALLET CARD
========================= */
const WalletCard = ({ title, value, icon, color, onClick }) => (
  <div
  onClick={onClick}
    className={`${color} text-white rounded-xl p-4 sm:p-6 flex items-center justify-between shadow-md ${
      onClick ? "cursor-pointer hover:opacity-90" : ""
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className="text-sm opacity-90 truncate">{title}</p>
      <h2 className="text-lg sm:text-xl font-semibold mt-1 truncate">{value}</h2>
    </div>
    <div className="text-2xl sm:text-3xl opacity-90 ml-2">{icon}</div>
  </div>
);

export default AdminWallet;
