import { useState, useMemo } from "react";
import { Activity, Trophy } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { activityData } from "@/lib/activityData";

// Colors for the top 10 lines
const LINE_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#9333ea", // purple-600
  "#0891b2", // cyan-600
  "#c026d3", // fuchsia-600
  "#ea580c", // orange-600
  "#4f46e5", // indigo-600
  "#059669", // emerald-600
];

export default function PartnerActivityPage() {
  const partners = Object.keys(activityData).sort();
  const [selectedPartner, setSelectedPartner] = useState<string>(partners[0] || "");

  // Compute leaderboard
  const topEmployees = useMemo(() => {
    if (!selectedPartner || !activityData[selectedPartner]) return [];
    
    const records = activityData[selectedPartner];
    const counts: Record<string, { name: string, email: string, count: number, activities: Set<string> }> = {};
    
    records.forEach(r => {
      const key = r.email;
      if (!counts[key]) {
        counts[key] = { name: r.name, email: r.email, count: 0, activities: new Set() };
      }
      counts[key].count += 1;
      if (r.activity) counts[key].activities.add(r.activity);
    });

    return Object.values(counts)
      .map(emp => ({ ...emp, activities: Array.from(emp.activities) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [selectedPartner]);

  // Compute timeline data
  const chartData = useMemo(() => {
    if (!selectedPartner || !activityData[selectedPartner]) return [];
    
    const records = activityData[selectedPartner];
    const timelineMap: Record<string, any> = {};

    // Get the top employee emails for separate lines
    const topEmails = topEmployees.map(e => e.email);

    records.forEach(r => {
      if (!r.date) return;
      const dateObj = new Date(r.date);
      // Format as YYYY-MM
      const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      if (!timelineMap[monthStr]) {
        timelineMap[monthStr] = { name: monthStr, Total: 0 };
        topEmails.forEach(e => timelineMap[monthStr][e] = 0);
      }
      
      timelineMap[monthStr].Total += 1;
      if (topEmails.includes(r.email)) {
        timelineMap[monthStr][r.email] += 1;
      }
    });

    return Object.values(timelineMap).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [selectedPartner, topEmployees]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Partner Activity Tracking
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Top 10 employees and module completion timeline.
          </p>
        </div>
        
        {/* Partner Selector */}
        <select
          value={selectedPartner}
          onChange={(e) => setSelectedPartner(e.target.value)}
          className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
        >
          {partners.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="terrain-card p-6 flex flex-col h-[600px] lg:h-[500px]">
          <h3 className="text-[14px] font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top 10 Employees
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topEmployees.length > 0 ? (
              <div className="space-y-4">
                {topEmployees.map((emp, idx) => (
                  <div key={emp.email} className="flex flex-col p-4 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground leading-tight">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {emp.count} <span className="text-[10px] font-medium text-blue-500">modules</span>
                      </div>
                    </div>
                    {/* Cluster View of specific activities */}
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-10">
                      {emp.activities.map((act, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-black/10 bg-white shadow-sm text-muted-foreground break-words max-w-full">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
                No activity data found.
              </div>
            )}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="terrain-card p-6 lg:col-span-2 h-[400px] flex flex-col">
          <h3 className="text-[14px] font-bold text-foreground mb-4">
            Activity Timeline (Modules Completed per Month)
          </h3>
          <div className="flex-1 w-full min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "var(--foreground)" }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "var(--foreground)" }} 
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", background: "rgba(255,255,255,0.9)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {/* Total Line */}
                  <Line 
                    type="monotone" 
                    dataKey="Total" 
                    stroke="#000" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                  {/* Top Employees Lines */}
                  {topEmployees.map((emp, i) => (
                    <Line 
                      key={emp.email}
                      type="monotone" 
                      dataKey={emp.email} 
                      name={emp.name || emp.email.split('@')[0]}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]} 
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
                Not enough date data to draw timeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
