import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  Cell 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className=" p-3 rounded-xl shadow-2xl text-left">
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-orange-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          {payload[0].value} {payload[0].value === 1 ? 'Event' : 'Events'}
        </p>
      </div>
    );
  }
  return null;
};

const EventsChartPanel = ({ chartData }) => {
  // 🛠️ FALLBACK CHECK: If data hasn't finished loading, show an explicit loading block instead of collapsing
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[320px] rounded-3xl shadow backdrop-blur-sm flex items-center justify-center text-gray-400 text-sm">
        No chart metrics recorded...
      </div>
    );
  }

  return (
    /* 🛠️ FIX 1: Enforced a concrete minimum dimensions frame context on the outermost wrapper component */
    <div className="p-5 rounded-3xl backdrop-blur-sm shadow flex flex-col w-full h-[340px]">
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-bold tracking-wide ">Events Velocity</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Total verified event distributions per calendar month</p>
      </div>
      
      {/* 🛠️ FIX 2: Swapped utility "h-64" for layout absolute explicit flex-1 to keep rendering canvas from collapsing to 0px height */}
      <div className="flex-1 w-full min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          {/* 🛠️ FIX 3: Expanded margins to protect the left-side text layout numbers from overflowing off-screen */}
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EA580C" stopOpacity={1} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              vertical={false} 
              strokeDasharray="4 4" 
              // 🛠️ FIX 4: Explicit CSS layout styling color mappings over pure SVG style hooks
              strokeOpacity={0.5}
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
              dx={-5}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(249, 115, 22, 0.03)', radius: 8 }} 
            />
            
            <Bar 
              dataKey="registrations" 
              fill="url(#barGradient)" 
              maxBarSize={32}
              radius={[6, 6, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  className="hover:opacity-80 transition-opacity cursor-pointer duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventsChartPanel;