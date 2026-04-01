/*
 * Budget Allocation Donut Chart — "Soft Terrain" design
 * Gradient-filled segments with rounded appearance
 * Center label showing total budget
 */

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { budgetAllocation } from "@/lib/data";

const COLORS = [
  "oklch(0.60 0.12 175)",
  "oklch(0.58 0.16 290)",
  "oklch(0.75 0.14 75)",
  "oklch(0.62 0.19 15)",
  "oklch(0.65 0.10 145)",
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;

  return (
    <div
      className="rounded-xl px-4 py-3 border shadow-lg"
      style={{
        background: "oklch(0.99 0.003 85)",
        borderColor: "oklch(0.92 0.01 85)",
      }}
    >
      <p className="text-[12px] font-semibold text-foreground">{data.category}</p>
      <p className="text-[12px] text-muted-foreground mt-1">
        ${data.amount.toLocaleString()} ({data.percentage}%)
      </p>
    </div>
  );
}

export default function BudgetDonut() {
  const totalBudget = budgetAllocation.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="terrain-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-foreground">Budget Allocation</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          How your budget is distributed
        </p>
      </div>

      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={budgetAllocation}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
              strokeWidth={0}
              animationDuration={1200}
              animationBegin={300}
            >
              {budgetAllocation.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Total</p>
            <p className="text-xl font-bold text-foreground">
              ${(totalBudget / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2">
        {budgetAllocation.map((item, i) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i] }}
              />
              <span className="text-[12px] text-muted-foreground">{item.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-foreground">
                ${item.amount.toLocaleString()}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  background: "oklch(0.95 0.008 85)",
                  color: "oklch(0.55 0.02 55)",
                }}
              >
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
