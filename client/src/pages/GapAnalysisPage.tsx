/*
 * Gap Analysis Page — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Detailed gap breakdown with heatmap, category analysis, and actionable partner recommendations
 * Uses modifiedPartners so admin edits propagate here
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TIER_CONFIG, ELITE_ZONE_B } from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import {
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const GAP_COLORS = {
  salesPro: "oklch(0.60 0.12 175)",
  techPro: "oklch(0.58 0.16 290)",
  bootcamp: "oklch(0.75 0.14 75)",
  implSpec: "oklch(0.62 0.19 15)",
};

export default function GapAnalysisPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { getOverrideCount } = useOverrides();
  const { modifiedPartners } = useModifications();

  const gapSummary = useMemo(() => {
    const categories = [
      { key: "salesPro", label: "Sales Pro", required: ELITE_ZONE_B.salesPro, color: GAP_COLORS.salesPro },
      { key: "techPro", label: "Tech Pro", required: ELITE_ZONE_B.techPro, color: GAP_COLORS.techPro },
      { key: "bootcamp", label: "Bootcamp", required: ELITE_ZONE_B.bootcamp, color: GAP_COLORS.bootcamp },
      { key: "implSpec", label: "Impl Specialist", required: ELITE_ZONE_B.implSpec, color: GAP_COLORS.implSpec },
    ];

    return categories.map((cat) => {
      const totalGap = modifiedPartners.reduce((s, p) => {
        const req = p.requirements[cat.key as keyof typeof p.requirements];
        return s + Math.max(0, req.required - req.obtained);
      }, 0);
      const partnersWithGap = modifiedPartners.filter((p) => {
        const req = p.requirements[cat.key as keyof typeof p.requirements];
        return req.obtained < req.required;
      });
      const partnersMet = modifiedPartners.filter((p) => {
        const req = p.requirements[cat.key as keyof typeof p.requirements];
        return req.obtained >= req.required;
      });

      return {
        ...cat,
        totalGap,
        partnersWithGap: partnersWithGap.length,
        partnersMet: partnersMet.length,
        partners: partnersWithGap.sort((a, b) => {
          const gapA = a.requirements[cat.key as keyof typeof a.requirements].required - a.requirements[cat.key as keyof typeof a.requirements].obtained;
          const gapB = b.requirements[cat.key as keyof typeof b.requirements].required - b.requirements[cat.key as keyof typeof b.requirements].obtained;
          return gapB - gapA;
        }),
      };
    });
  }, [modifiedPartners]);

  const totalGaps = gapSummary.reduce((s, c) => s + c.totalGap, 0);

  const pieData = gapSummary.map((c) => ({
    name: c.label,
    value: c.totalGap,
    color: c.color,
  }));

  const heatmapData = useMemo(() => {
    return modifiedPartners
      .map((p) => ({
        id: p.id,
        name: p.name.length > 22 ? p.name.substring(0, 20) + "…" : p.name,
        fullName: p.name,
        tier: p.tier,
        salesPro: Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained),
        techPro: Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained),
        bootcamp: Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained),
        implSpec: Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained),
        total: p.totalGaps,
      }))
      .sort((a, b) => b.total - a.total);
  }, [modifiedPartners]);

  const getHeatColor = (gap: number, max: number) => {
    if (gap === 0) return "oklch(0.60 0.12 175 / 0.12)";
    const intensity = Math.min(gap / max, 1);
    return `oklch(0.62 0.19 15 / ${0.1 + intensity * 0.5})`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" style={{ color: "oklch(0.58 0.14 75)" }} />
          Gap Analysis
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          {totalGaps} total gaps across {modifiedPartners.length} partners — detailed breakdown by category
        </p>
      </div>

      {/* Gap Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gapSummary.map((cat, i) => {
          const isExpanded = expandedCategory === cat.key;
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="terrain-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
              style={{ borderTop: `3px solid ${cat.color}` }}
              onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-bold" style={{ color: cat.color }}>
                  {cat.label}
                </h4>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{cat.totalGap}</p>
              <p className="text-[10px] text-muted-foreground">
                gaps across {cat.partnersWithGap} partners · {cat.required} required per partner
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "oklch(0.93 0.008 85)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((cat.partnersMet / modifiedPartners.length) * 100)}%`,
                      background: cat.color,
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {cat.partnersMet}/{modifiedPartners.length} met
                </span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-border/40 space-y-1"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Partners with gaps
                    </p>
                    {cat.partners.map((p) => {
                      const req = p.requirements[cat.key as keyof typeof p.requirements];
                      const gap = req.required - req.obtained;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-2 py-1 rounded-md text-[10px]"
                          style={{ background: "oklch(0.97 0.005 85 / 0.6)" }}
                        >
                          <span className="text-foreground font-medium truncate flex-1">{p.name}</span>
                          <span className="font-bold ml-2" style={{ color: cat.color }}>
                            -{gap}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Stacked Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="terrain-card p-5 lg:col-span-3"
        >
          <h3 className="text-[14px] font-bold text-foreground mb-1">Gap Distribution by Partner</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Stacked gaps across all four requirement categories
          </p>
          <div style={{ height: Math.max(350, heatmapData.filter((d) => d.total > 0).length * 28) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={heatmapData.filter((d) => d.total > 0)}
                layout="vertical"
                margin={{ left: 130, right: 20, top: 5, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.55 0.02 55)" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "oklch(0.45 0.02 55)" }}
                  width={125}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="terrain-card px-3 py-2 shadow-lg">
                        <p className="text-[11px] font-bold text-foreground">{d.fullName}</p>
                        <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
                          <p>Sales Pro: <span className="font-bold">{d.salesPro}</span></p>
                          <p>Tech Pro: <span className="font-bold">{d.techPro}</span></p>
                          <p>Bootcamp: <span className="font-bold">{d.bootcamp}</span></p>
                          <p>Impl Spec: <span className="font-bold">{d.implSpec}</span></p>
                          <p className="pt-1 border-t border-border/30 font-bold">Total: {d.total}</p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => <span style={{ color: "oklch(0.45 0.02 55)", fontSize: 10 }}>{value}</span>}
                />
                <Bar dataKey="salesPro" name="Sales Pro" stackId="a" fill={GAP_COLORS.salesPro} radius={[0, 0, 0, 0]} />
                <Bar dataKey="techPro" name="Tech Pro" stackId="a" fill={GAP_COLORS.techPro} />
                <Bar dataKey="bootcamp" name="Bootcamp" stackId="a" fill={GAP_COLORS.bootcamp} />
                <Bar dataKey="implSpec" name="Impl Spec" stackId="a" fill={GAP_COLORS.implSpec} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gap Proportion Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="terrain-card p-5 lg:col-span-2"
        >
          <h3 className="text-[14px] font-bold text-foreground mb-1">Gap Proportion</h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Share of total gaps by category
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.filter((d) => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="terrain-card px-3 py-2 shadow-lg">
                        <p className="text-[11px] font-bold text-foreground">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {d.value} gaps ({totalGaps > 0 ? Math.round((d.value / totalGaps) * 100) : 0}%)
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-foreground font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-muted-foreground">
                  {d.value} ({totalGaps > 0 ? Math.round((d.value / totalGaps) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gap Heatmap Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" style={{ color: "oklch(0.62 0.19 15)" }} />
          Gap Heatmap
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Darker shading indicates larger gaps — zero gaps shown in green
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Partner</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Tier</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: GAP_COLORS.salesPro }}>Sales Pro</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: GAP_COLORS.techPro }}>Tech Pro</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: GAP_COLORS.bootcamp }}>Bootcamp</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: GAP_COLORS.implSpec }}>Impl Spec</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Total</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Overrides</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => {
                const overrides = getOverrideCount(row.id);
                return (
                  <tr key={row.id} className="border-b border-border/20 hover:bg-black/[0.02] transition-colors">
                    <td className="py-2 px-3 font-medium text-foreground">{row.name}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: TIER_CONFIG[row.tier as keyof typeof TIER_CONFIG].bg,
                          color: TIER_CONFIG[row.tier as keyof typeof TIER_CONFIG].color,
                        }}
                      >
                        {TIER_CONFIG[row.tier as keyof typeof TIER_CONFIG].label}
                      </span>
                    </td>
                    {(["salesPro", "techPro", "bootcamp", "implSpec"] as const).map((cat) => {
                      const gap = row[cat];
                      const max = cat === "salesPro" ? 5 : cat === "techPro" ? 3 : cat === "bootcamp" ? 2 : 1;
                      return (
                        <td key={cat} className="py-2 px-3 text-center">
                          <span
                            className="inline-flex items-center justify-center w-8 h-6 rounded-md font-bold text-[11px]"
                            style={{
                              background: getHeatColor(gap, max),
                              color: gap === 0 ? "oklch(0.45 0.12 175)" : "oklch(0.40 0.15 15)",
                            }}
                          >
                            {gap === 0 ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              gap
                            )}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-center font-bold text-foreground">{row.total}</td>
                    <td className="py-2 px-3 text-center">
                      {overrides > 0 ? (
                        <span
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "oklch(0.60 0.12 175 / 0.10)", color: "oklch(0.45 0.12 175)" }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {overrides}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
