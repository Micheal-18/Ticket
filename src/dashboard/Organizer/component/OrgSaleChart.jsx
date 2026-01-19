import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const OrgSalesChart = ({ transactions = [] }) => {
  const data = aggregateOrgDaily(transactions);

  return (
    <div className="p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Flow</h2>
          <p className="text-sm text-gray-500">Net earnings after platform split</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Live Updates
          </span>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="sineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false}  />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              dy={10}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              cursor={{ stroke: '#4F46E5', strokeWidth: 2 }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              formatter={(val) => [`₦${val.toLocaleString()}`, "Earnings"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#sineGradient)"
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


/* ===== Enhanced Helper for Continuous Flow ===== */
function aggregateOrgDaily(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const map = {};
  const allDates = [];

  // 1. Map existing sales
  transactions.forEach((tx) => {
    if (!tx.createdAt || tx.type !== "ticket_sale") return;
    const dateObj = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    map[dateStr] = (map[dateStr] || 0) + (tx.organizerAmount || 0);
  });

  // 2. Convert to Array and Sort by Time
  return Object.entries(map)
    .map(([date, revenue]) => ({ date, revenue, timestamp: new Date(date).getTime() }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export default OrgSalesChart;