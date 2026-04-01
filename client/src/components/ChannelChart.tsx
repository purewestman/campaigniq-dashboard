/*
 * SE Gap Analysis Chart — "Soft Terrain" design
 * Stacked horizontal bar chart showing SE gap and course progress by partner
 * SE Gap, Has SP Only, Has TSP Only
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
import { partnerGapBreakdown } from "@/lib/data";

const gapColors = {
  "SE Gap": "oklch(0.62 0.19 15)",
  "Has SP Only": "oklch(0.60 0.12 175)",
  "Has TSP Only": "oklch(0.58 0.16 290)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;

  const entry = partnerGapBreakdown.find((p) => p.partner === label);

  return (
    <div
      className="rounded-xl px-4 py-3 border shadow-lg max-w-[280px]"
      style={{
        background: "oklch(0.99 0.003 85)",
        borderColor: "oklch(0.92 0.01 85)",
      }}
    >
      <p className="text-[12px] font-semibold text-foreground mb-2">
        {entry?.fullName || label}
      </p>
      {payload
        .filter((p: any) => p.value > 0)
        .map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 text-[12px] py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold text-foreground">
              {p.value} SE{p.value !== 1 ? "s" : ""}
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

export default function GapAnalysisChart() {
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
            background: "oklch(0.62 0.19 15 / 0.08)",
            color: "oklch(0.50 0.19 15)",
          }}
        >
          {partnerGapBreakdown.length} partners with gaps
        </div>
      </div>

      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={partnerGapBreakdown}
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
    </motion.div>
  );
}
