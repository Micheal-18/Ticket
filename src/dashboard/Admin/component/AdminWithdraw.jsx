import { auth } from "../../../firebase/firebase";
import { useState } from "react";

const AdminWithdraw = ({ balance }) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        // Only allow numbers
        const val = e.target.value.replace(/[^0-9]/g, "");
        setAmount(val);
    };

    const handleQuickSelect = (e, val) => {
        e.preventDefault(); // Prevents any parent click actions
        setAmount(val.toString());
    };

    const withdraw = async () => {
        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) return alert("Invalid amount");
        if (numAmount > balance) return alert("Insufficient balance");

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/withdraw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: numAmount }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Withdrawal failed");

            alert("Withdrawal successful");
            setAmount("");
            if (onSuccess) onSuccess(); // Tell parent to refresh the balance!
        alert("Success!");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 rounded-xl shadow mb-8 ">
            <h2 className="text-lg font-semibold mb-3 ">Withdraw Platform Funds</h2>
            
            {/* QUICK SELECT CHIPS */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {[1000, 5000, 10000].map(val => (
                    <button
                        type="button" // Important: prevents form submission
                        key={val}
                        onClick={(e) => handleQuickSelect(e, val)}
                        className={`text-[10px] px-3 py-1 rounded-full border transition-colors cursor-pointer font-bold ${
                            amount === val.toString() 
                            ? "bg-orange-500 text-white border-orange-500" 
                            : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                        }`}
                    >
                        +₦{val.toLocaleString()}
                    </button>
                ))}
            </div>

            <div className="relative mb-3">
                <span className="absolute left-3 top-2 text-gray-400">₦</span>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={handleInputChange}
                    className="w-full pl-7 p-2 rounded border shadow focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
                />
            </div>

            <button
                onClick={withdraw}
                disabled={loading || !amount || Number(amount) > balance}
                className={`w-full py-2 rounded font-bold text-white transition-all ${
                    loading || !amount || Number(amount) > balance
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 cursor-pointer shadow-sm"
                }`}
            >
                {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>

            {Number(amount) > balance && (
                <p className="text-[10px] text-red-500 mt-2 text-center font-medium">
                    Exceeds available balance (₦{balance?.toLocaleString()})
                </p>
            )}
        </div>
    );
};

export default AdminWithdraw;