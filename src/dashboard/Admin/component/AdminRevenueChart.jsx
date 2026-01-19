import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminRevenueChart = ({ transactions }) => {
  const revenueData = aggregateDaily(transactions);

  // Add sine wave overlay (same length as revenueData)
  const data = revenueData.map((d, i) => ({
    ...d,
    sine: Math.sin(i * 0.5), // sine wave scaled
  }));

  return (
    <div className="p-4 rounded-xl shadow mb-8">
      <h2 className="text-lg font-semibold mb-4">Platform Revenue</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          {/* Real revenue */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            strokeWidth={2}
          />
          {/* Sine wave overlay */}
          <Line
            type="monotone"
            dataKey="sine"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminRevenueChart;

/* ===== helpers ===== */
function aggregateDaily(transactions) {
  const map = {};

  transactions.forEach((tx) => {
    if (!tx.createdAt || !tx.platformFee) return;

    const date = tx.createdAt
      .toDate()
      .toISOString()
      .split("T")[0];

    map[date] = (map[date] || 0) + tx.platformFee;
  });

  return Object.entries(map).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}
