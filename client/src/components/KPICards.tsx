/*
 * KPI Cards — "Soft Terrain" design
 * Warm cream cards with soft shadows, micro-sparklines, animated values
 * Rounded 16px corners, gentle hover lift
 */

import { motion } from "framer-motion";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { kpiMetrics, type KPIMetric } from "@/lib/data";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  "ad-spend": DollarSign,
  impressions: Eye,
  ctr: MousePointerClick,
  roas: TrendingUp,
};

const gradientMap: Record<string, { from: string; to: string; iconBg: string }> = {
  "ad-spend": {
    from: "oklch(0.60 0.12 175 / 0.12)",
    to: "oklch(0.60 0.12 175 / 0.02)",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
  },
  impressions: {
    from: "oklch(0.58 0.16 290 / 0.12)",
    to: "oklch(0.58 0.16 290 / 0.02)",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
  },
  ctr: {
    from: "oklch(0.62 0.19 15 / 0.12)",
    to: "oklch(0.62 0.19 15 / 0.02)",
    iconBg: "oklch(0.62 0.19 15 / 0.12)",
  },
  roas: {
    from: "oklch(0.75 0.14 75 / 0.12)",
    to: "oklch(0.75 0.14 75 / 0.02)",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
  },
};

const sparklineColorMap: Record<string, string> = {
  "ad-spend": "oklch(0.55 0.12 175)",
  impressions: "oklch(0.53 0.16 290)",
  ctr: "oklch(0.58 0.19 15)",
  roas: "oklch(0.70 0.14 75)",
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
  const Icon = iconMap[metric.id] || TrendingUp;
  const colors = gradientMap[metric.id];
  const sparkColor = sparklineColorMap[metric.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="terrain-card p-5 relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: colors.iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: sparkColor }} />
          </div>
          <MiniSparkline data={metric.sparkline} color={sparkColor} id={metric.id} />
        </div>

        {/* Value */}
        <div className="mb-1">
          <p className="text-[13px] font-medium text-muted-foreground mb-1">
            {metric.label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {metric.value}
          </p>
        </div>

        {/* Change indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background:
                metric.trend === "up"
                  ? "oklch(0.60 0.12 175 / 0.10)"
                  : "oklch(0.62 0.19 15 / 0.10)",
              color:
                metric.trend === "up"
                  ? "oklch(0.50 0.12 175)"
                  : "oklch(0.55 0.19 15)",
            }}
          >
            {metric.trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(metric.change)}%
          </span>
          <span className="text-[11px] text-muted-foreground">
            {metric.changeLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpiMetrics.map((metric, i) => (
        <KPICard key={metric.id} metric={metric} index={i} />
      ))}
    </div>
  );
}
