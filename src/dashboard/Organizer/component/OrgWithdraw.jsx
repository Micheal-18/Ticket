import { auth } from "../../../firebase/firebase";
import { useState } from "react";

const OrgWithdraw = ({ balance }) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        // Only allow numbers
        const val = e.target.value.replace(/[^0-9]/g, "");
        setAmount(val);
    };

    const withdraw = async () => {
        const numAmount = Number(amount);

        // Validation
        if (!amount || numAmount <= 0) return alert("Please enter a valid amount");
        if (numAmount > balance) return alert("Insufficient balance");
        if (numAmount < 100) return alert("Minimum withdrawal is ₦100"); // Standard for Paystack

        const confirm = window.confirm(`Withdraw ₦${numAmount.toLocaleString()} to your registered bank account?`);
        if (!confirm) return;

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();

            // ✅ Pointing to the general withdrawal endpoint (non-admin)
            const res = await fetch("/api/withdraw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: numAmount }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Withdrawal failed");

            alert("Withdrawal initiated! Funds will arrive shortly.");
            setAmount("");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5  rounded-xl shadow-sm  mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Withdraw Earnings</h2>
            <p className="text-xs text-gray-500 mb-4">Payouts are sent to your connected bank account.</p>

            <div className="relative mb-4">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {[1000, 5000, 10000].map(val => (
                        <button
                            key={val}
                            onClick={() => setAmount(val.toString())}
                            className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100"
                        >
                            +₦{val.toLocaleString()}
                        </button>
                    ))}
                </div>
                <span className="absolute left-3 top-2 text-gray-400 font-medium">₦</span>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={handleInputChange}
                    className="w-full pl-8 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>

            <button
                onClick={withdraw}
                disabled={loading || !amount || Number(amount) > balance}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${loading || !amount || Number(amount) > balance
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-md"
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    "Confirm Payout"
                )}
            </button>

            {Number(amount) > balance && (
                <p className="text-red-500 text-[10px] mt-2 text-center">Amount exceeds your available balance</p>
            )}
        </div>
    );
};

export default OrgWithdraw;