/*
 * Certification Category Donut — "Soft Terrain" design
 * Breakdown of exam types passed across all partners
 */

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { certCategories } from "@/lib/data";

const COLORS = certCategories.map((c) => c.color);

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
        {data.count} certifications ({data.percentage}%)
      </p>
    </div>
  );
}

export default function CertificationDonut() {
  const totalCerts = certCategories.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="terrain-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-foreground">Certifications by Type</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Distribution of exams passed across categories
        </p>
      </div>

      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={certCategories}
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
              {certCategories.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground font-medium">Total</p>
            <p className="text-xl font-bold text-foreground">{totalCerts}</p>
            <p className="text-[10px] text-muted-foreground">certs</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {certCategories.map((item, i) => (
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
                {item.count}
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
