/*
 * KPI Cards — "Soft Terrain" design
 * FY27 Global Reseller Program Tier Compliance
 * Displays: Total Partners, Enablement Score, Total Gaps, Exams Passed
 */

import { motion } from "framer-motion";
import {
  Building2,
  Target,
  AlertTriangle,
  Award,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { type KPIMetric } from "@/lib/data";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  partners: Building2,
  revenue: DollarSign,
  enablement: Target,
  gaps: AlertTriangle,
  exams: Award,
};

const gradientMap: Record<string, { from: string; to: string; iconBg: string }> = {
  partners: {
    from: "oklch(0.60 0.12 175 / 0.12)",
    to: "oklch(0.60 0.12 175 / 0.02)",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
  },
  enablement: {
    from: "oklch(0.58 0.16 290 / 0.12)",
    to: "oklch(0.58 0.16 290 / 0.02)",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
  },
  gaps: {
    from: "oklch(0.62 0.19 15 / 0.12)",
    to: "oklch(0.62 0.19 15 / 0.02)",
    iconBg: "oklch(0.62 0.19 15 / 0.12)",
  },
  exams: {
    from: "oklch(0.75 0.14 75 / 0.12)",
    to: "oklch(0.75 0.14 75 / 0.02)",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
  },
  revenue: {
    from: "oklch(0.55 0.18 145 / 0.12)",
    to: "oklch(0.55 0.18 145 / 0.02)",
    iconBg: "oklch(0.55 0.18 145 / 0.12)",
  },
};

const sparklineColorMap: Record<string, string> = {
  partners: "oklch(0.55 0.12 175)",
  revenue: "oklch(0.50 0.18 145)",
  enablement: "oklch(0.53 0.16 290)",
  gaps: "oklch(0.58 0.19 15)",
  exams: "oklch(0.70 0.14 75)",
};

function MiniSparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const chartData = data.map((v, i) => ({ idx: i, val: v }));

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${id})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KPICard({ metric, index }: { metric: KPIMetric; index: number }) {
  const Icon = iconMap[metric.id] || Award;
  const colors = gradientMap[metric.id] || gradientMap.exams;
  const sparkColor = sparklineColorMap[metric.id] || "oklch(0.55 0.12 175)";

  // For "gaps" metric, trend down is positive (closing gaps)
  const isPositiveTrend =
    metric.id === "gaps" ? metric.trend === "down" : metric.trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="terrain-card p-5 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: colors.iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: sparkColor }} />
          </div>
          <MiniSparkline data={metric.sparkline} color={sparkColor} id={metric.id} />
        </div>

        <div className="mb-1">
          <p className="text-[13px] font-medium text-muted-foreground mb-1">
            {metric.label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {metric.value}
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isPositiveTrend
                ? "oklch(0.60 0.12 175 / 0.10)"
                : "oklch(0.62 0.19 15 / 0.10)",
              color: isPositiveTrend
                ? "oklch(0.50 0.12 175)"
                : "oklch(0.55 0.19 15)",
            }}
          >
            {metric.trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : metric.trend === "down" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(metric.change)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {metric.changeLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface KPICardsProps {
  metrics: KPIMetric[];
}

export default function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${metrics.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-4`}>
      {metrics.map((metric, i) => (
        <KPICard key={metric.id} metric={metric} index={i} />
      ))}
    </div>
  );
}
