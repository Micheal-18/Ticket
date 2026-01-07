import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const OrgSalesChart = ({ transactions = [] }) => {
  const data = aggregateOrgDaily(transactions);

  return (
    <div className=" p-6 rounded-xl shadow-sm  mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold ">Your Sales Performance</h2>
        <p className="text-sm text-gray-500">Daily ticket revenue (after platform fees)</p>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* Removed stroke color */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }} // Removed fill color
              dy={10}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }} // Removed fill color
              tickFormatter={(val) => `₦${val.toLocaleString()}`}
              axisLine={false}
            />
            <Tooltip
              formatter={(val) => [`₦${val.toLocaleString()}`, "Earnings"]}
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={3} // Optional: keep width but no color
              dot={{ r: 4, strokeWidth: 2 }} // Removed fill and stroke
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

/* ===== Helper for Organizers ===== */
function aggregateOrgDaily(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const map = {};

  transactions.forEach((tx) => {
    // Check for organizerAmount specifically
    if (!tx.createdAt || !tx.organizerAmount) return;

    let dateObj;
    if (tx.createdAt?.toDate) {
      dateObj = tx.createdAt.toDate();
    } else if (tx.createdAt?._seconds) {
      dateObj = new Date(tx.createdAt._seconds * 1000);
    } else {
      dateObj = new Date(tx.createdAt);
    }

    if (isNaN(dateObj.getTime())) return;

    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // We aggregate organizerAmount instead of platformFee
    map[dateStr] = (map[dateStr] || 0) + tx.organizerAmount;
  });

  return Object.entries(map).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export default OrgSalesChart;