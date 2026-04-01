/*
 * SE Compliance Gap by Partner — "Soft Terrain" design
 * Horizontal stacked bar chart showing SE gaps, SP-only, TSP-only per partner
 * Accepts filtered data from parent
 */

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const gapColors: Record<string, string> = {
  "SE Gap": "oklch(0.62 0.19 15)",
  "Has SP Only": "oklch(0.60 0.12 175)",
  "Has TSP Only": "oklch(0.58 0.16 290)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const fullName = payload[0]?.payload?.fullName || label;

  return (
    <div
      className="rounded-xl px-4 py-3 border shadow-lg"
      style={{
        background: "oklch(0.99 0.003 85)",
        borderColor: "oklch(0.92 0.01 85)",
      }}
    >
      <p className="text-[12px] font-semibold text-foreground mb-2">{fullName}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.fill }}
          />
          <span className="text-[11px] text-muted-foreground">{entry.dataKey}:</span>
          <span className="text-[11px] font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-5 mt-3">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[11px] text-muted-foreground font-medium">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface GapAnalysisChartProps {
  data: {
    partner: string;
    fullName: string;
    "SE Gap": number;
    "Has SP Only": number;
    "Has TSP Only": number;
  }[];
}

export default function GapAnalysisChart({ data }: GapAnalysisChartProps) {
  const chartHeight = Math.max(200, data.length * 38 + 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="terrain-card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">SE Compliance Gap by Partner</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            SEs needed to reach 3-SE baseline across all partners
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{
            background: data.length > 0 ? "oklch(0.62 0.19 15 / 0.08)" : "oklch(0.60 0.12 175 / 0.08)",
            color: data.length > 0 ? "oklch(0.50 0.19 15)" : "oklch(0.45 0.12 175)",
          }}
        >
          {data.length > 0 ? `${data.length} partners with gaps` : "No gaps in selection"}
        </div>
      </div>

      {data.length > 0 ? (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 5 }}
              barCategoryGap="14%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.92 0.01 85)"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "oklch(0.55 0.02 55)" }}
              />
              <YAxis
                type="category"
                dataKey="partner"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "oklch(0.55 0.02 55)" }}
                width={145}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.95 0.008 85 / 0.5)" }} />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="SE Gap"
                stackId="gaps"
                fill={gapColors["SE Gap"]}
                radius={[0, 0, 0, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="Has SP Only"
                stackId="gaps"
                fill={gapColors["Has SP Only"]}
                animationDuration={1000}
                animationBegin={200}
              />
              <Bar
                dataKey="Has TSP Only"
                stackId="gaps"
                fill={gapColors["Has TSP Only"]}
                radius={[0, 4, 4, 0]}
                animationDuration={1000}
                animationBegin={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-[13px]">
          All partners in this selection are compliant — no gaps to display.
        </div>
      )}
    </motion.div>
  );
}
