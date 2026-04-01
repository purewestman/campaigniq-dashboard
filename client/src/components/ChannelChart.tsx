/*
 * Enablement Gap by Partner — "Soft Terrain" design
 * Horizontal stacked bar chart: Sales Pro, Tech Pro, Bootcamp, Impl Spec gaps
 * FY27 Global Reseller Program Tier Compliance
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
  "Sales Pro Gap": "oklch(0.58 0.16 290)",
  "Tech Pro Gap": "oklch(0.60 0.12 175)",
  "Bootcamp Gap": "oklch(0.75 0.14 75)",
  "Impl Spec Gap": "oklch(0.62 0.19 15)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const fullName = payload[0]?.payload?.fullName || label;
  const totalGap = payload.reduce((s: number, e: any) => s + (e.value || 0), 0);

  return (
    <div
      className="rounded-xl px-4 py-3 border shadow-lg"
      style={{
        background: "oklch(0.99 0.003 85)",
        borderColor: "oklch(0.92 0.01 85)",
      }}
    >
      <p className="text-[12px] font-semibold text-foreground mb-1">{fullName}</p>
      <p className="text-[11px] text-muted-foreground mb-2">Total gap: {totalGap} of 11 required</p>
      {payload.map((entry: any) =>
        entry.value > 0 ? (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: entry.fill }}
            />
            <span className="text-[11px] text-muted-foreground">{entry.dataKey}:</span>
            <span className="text-[11px] font-semibold text-foreground">{entry.value}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-5 mt-3 flex-wrap">
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
    "Sales Pro Gap": number;
    "Tech Pro Gap": number;
    "Bootcamp Gap": number;
    "Impl Spec Gap": number;
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
          <h3 className="text-[15px] font-bold text-foreground">Enablement Gap by Partner</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Elite Zone B requirements: 5 Sales Pro, 3 Tech Pro, 2 Bootcamp, 1 Impl Specialist
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
              <Bar dataKey="Sales Pro Gap" stackId="gaps" fill={gapColors["Sales Pro Gap"]} radius={[0, 0, 0, 0]} animationDuration={1000} />
              <Bar dataKey="Tech Pro Gap" stackId="gaps" fill={gapColors["Tech Pro Gap"]} animationDuration={1000} animationBegin={200} />
              <Bar dataKey="Bootcamp Gap" stackId="gaps" fill={gapColors["Bootcamp Gap"]} animationDuration={1000} animationBegin={400} />
              <Bar dataKey="Impl Spec Gap" stackId="gaps" fill={gapColors["Impl Spec Gap"]} radius={[0, 4, 4, 0]} animationDuration={1000} animationBegin={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-[13px]">
          All partners in this selection meet Elite Zone B requirements — no gaps to display.
        </div>
      )}
    </motion.div>
  );
}
