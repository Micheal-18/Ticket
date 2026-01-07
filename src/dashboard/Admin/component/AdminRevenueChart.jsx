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
  const data = aggregateDaily(transactions);

  return (
    <div className=" p-4 rounded-xl shadow mb-8">
      <h2 className="text-lg font-semibold mb-4">Platform Revenue</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            strokeWidth={2}
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
