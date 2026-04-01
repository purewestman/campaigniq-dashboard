/*
 * Channel Breakdown Chart — "Soft Terrain" design
 * Bar chart showing monthly channel performance (Social, Search, Email)
 * Warm rounded bars, soft shadows, organic feel
 */

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { channelMonthlyData } from "@/lib/data";

const channelColors = {
  Social: "oklch(0.60 0.12 175)",
  Search: "oklch(0.58 0.16 290)",
  Email: "oklch(0.75 0.14 75)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 border shadow-lg"
      style={{
        background: "oklch(0.99 0.003 85)",
        borderColor: "oklch(0.92 0.01 85)",
      }}
    >
      <p className="text-[12px] font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-[12px] py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            ${(entry.value / 1000).toFixed(1)}k
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-5 mt-2">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[12px] font-medium text-muted-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChannelChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="terrain-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Channel Performance</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Monthly spend by channel (Jan — Jun 2026)
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{
            background: "oklch(0.60 0.12 175 / 0.08)",
            color: "oklch(0.50 0.12 175)",
          }}
        >
          6 months
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={channelMonthlyData}
            margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
            barCategoryGap="20%"
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.92 0.01 85)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "oklch(0.55 0.02 55)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "oklch(0.55 0.02 55)" }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.95 0.008 85 / 0.5)" }} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="Social"
              fill={channelColors.Social}
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="Search"
              fill={channelColors.Search}
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />
            <Bar
              dataKey="Email"
              fill={channelColors.Email}
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
              animationBegin={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
