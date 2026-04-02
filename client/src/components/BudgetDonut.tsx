/*
 * Enablement Requirements Donut — "Soft Terrain" design
 * Shows how many partners meet each Elite Zone B requirement category
 * FY27 Global Reseller Program Tier Compliance
 */

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type StatusCategory } from "@/lib/data";

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
        {data.count} partner{data.count !== 1 ? "s" : ""} meeting requirement ({data.percentage}%)
      </p>
    </div>
  );
}

interface EnablementDonutProps {
  data: StatusCategory[];
}

export default function EnablementDonut({ data }: EnablementDonutProps) {
  const totalPartners = data.length > 0 ? Math.max(...data.map((d) => Math.round((d.count / d.percentage) * 100))) || 23 : 0;
  const displayCategories = data.filter((c) => c.count > 0);
  const displayColors = displayCategories.map((c) => c.color);

  // If no categories have any partners meeting them, show all with zero
  const hasData = displayCategories.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="terrain-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-foreground">Requirement Compliance</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Partners meeting their tier-specific requirements
        </p>
      </div>

      {hasData ? (
        <>
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="category"
                  strokeWidth={0}
                  animationDuration={1200}
                  animationBegin={300}
                >
                  {displayCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={displayColors[index % displayColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[11px] text-muted-foreground font-medium">Categories</p>
                <p className="text-xl font-bold text-foreground">4</p>
                <p className="text-[10px] text-muted-foreground">required</p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {data.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-[12px] text-muted-foreground">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-foreground">
                    {item.count}
                  </span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{
                      background: item.percentage >= 50 ? "oklch(0.60 0.12 175 / 0.10)" : "oklch(0.62 0.19 15 / 0.10)",
                      color: item.percentage >= 50 ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)",
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-[13px]">
          No partners in this selection.
        </div>
      )}
    </motion.div>
  );
}
