/*
 * Tier Compliance Page — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Visual tier breakdown with requirements matrix, progress tracking, and tier movement indicators
 * Uses modifiedPartners so admin edits propagate here
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TIER_CONFIG, ELITE_ZONE_B } from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import {
  Shield,
  Trophy,
  Minus,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const tierIcons: Record<string, React.ElementType> = {
  tier1: Trophy,
  tier2: Minus,
  tier3: AlertTriangle,
};

export default function TierCompliancePage() {
  const { modifiedPartners } = useModifications();

  const tierData = useMemo(() => {
    return (["tier1", "tier2", "tier3"] as const).map((tier) => {
      const p = modifiedPartners.filter((x) => x.tier === tier);
      const config = TIER_CONFIG[tier];
      const avgScore = p.length > 0
        ? Math.round(p.reduce((s, x) => s + x.enablementScore, 0) / p.length)
        : 0;
      const totalGaps = p.reduce((s, x) => s + x.totalGaps, 0);
      return {
        tier,
        label: config.label,
        description: config.description,
        partners: p,
        count: p.length,
        avgScore,
        totalGaps,
        config,
      };
    });
  }, [modifiedPartners]);

  const requirementMatrix = useMemo(() => {
    return (["tier1", "tier2", "tier3"] as const).map((tier) => {
      const p = modifiedPartners.filter((x) => x.tier === tier);
      return {
        tier,
        label: TIER_CONFIG[tier].label,
        salesPro: {
          met: p.filter((x) => x.requirements.salesPro.obtained >= x.requirements.salesPro.required).length,
          total: p.length,
        },
        techPro: {
          met: p.filter((x) => x.requirements.techPro.obtained >= x.requirements.techPro.required).length,
          total: p.length,
        },
        bootcamp: {
          met: p.filter((x) => x.requirements.bootcamp.obtained >= x.requirements.bootcamp.required).length,
          total: p.length,
        },
        implSpec: {
          met: p.filter((x) => x.requirements.implSpec.obtained >= x.requirements.implSpec.required).length,
          total: p.length,
        },
      };
    });
  }, [modifiedPartners]);

  const barData = useMemo(() => {
    return [...modifiedPartners]
      .sort((a, b) => b.enablementScore - a.enablementScore)
      .map((p) => ({
        name: p.name.length > 18 ? p.name.substring(0, 16) + "…" : p.name,
        fullName: p.name,
        score: p.enablementScore,
        tier: p.tier,
      }));
  }, [modifiedPartners]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "oklch(0.50 0.12 175)" }} />
          Tier Compliance
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          FY27 Elite Zone B enablement tiers — {ELITE_ZONE_B.total} requirements per partner
        </p>
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tierData.map((td, i) => {
          const Icon = tierIcons[td.tier];
          return (
            <motion.div
              key={td.tier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="terrain-card p-5"
              style={{ borderLeft: `3px solid ${td.config.color}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: td.config.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: td.config.iconColor }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold" style={{ color: td.config.color }}>
                    {td.label}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">{td.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{td.count}</p>
                  <p className="text-[10px] text-muted-foreground">Partners</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: td.config.color }}>{td.avgScore}%</p>
                  <p className="text-[10px] text-muted-foreground">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{td.totalGaps}</p>
                  <p className="text-[10px] text-muted-foreground">Total Gaps</p>
                </div>
              </div>

              {/* Partner list */}
              <div className="space-y-1">
                {td.partners.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px]"
                    style={{ background: "oklch(0.97 0.005 85 / 0.6)" }}
                  >
                    <span className="font-medium text-foreground truncate flex-1">{p.name}</span>
                    <span className="font-bold ml-2" style={{ color: td.config.color }}>
                      {p.enablementScore}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Requirements Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
          Requirements Compliance Matrix
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Partners meeting each Elite Zone B requirement by tier
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Tier</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Sales Pro (5)</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Tech Pro (3)</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Bootcamp (2)</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Impl Spec (1)</th>
              </tr>
            </thead>
            <tbody>
              {requirementMatrix.map((row) => {
                const config = TIER_CONFIG[row.tier as keyof typeof TIER_CONFIG];
                return (
                  <tr key={row.tier} className="border-b border-border/30">
                    <td className="py-3 px-3 font-semibold" style={{ color: config.color }}>
                      {row.label}
                    </td>
                    {([
                      row.salesPro,
                      row.techPro,
                      row.bootcamp,
                      row.implSpec,
                    ]).map((cell, ci) => {
                      const allMet = cell.met === cell.total && cell.total > 0;
                      const noneMet = cell.met === 0;
                      return (
                        <td key={ci} className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {allMet ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.50 0.12 175)" }} />
                            ) : noneMet ? (
                              <XCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.50 0.19 15)" }} />
                            ) : (
                              <Minus className="w-3.5 h-3.5" style={{ color: "oklch(0.58 0.14 75)" }} />
                            )}
                            <span
                              className="font-bold"
                              style={{
                                color: allMet
                                  ? "oklch(0.45 0.12 175)"
                                  : noneMet
                                  ? "oklch(0.50 0.19 15)"
                                  : "oklch(0.58 0.14 75)",
                              }}
                            >
                              {cell.met}/{cell.total}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Enablement Score Ranking */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1">
          Partner Enablement Ranking
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          All partners ranked by enablement score (% of Elite Zone B requirements met)
        </p>
        <div style={{ height: Math.max(400, barData.length * 28) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.55 0.02 55)" }} tickFormatter={(v) => `${v}%`} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "oklch(0.45 0.02 55)" }}
                width={115}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="terrain-card px-3 py-2 shadow-lg">
                      <p className="text-[11px] font-bold text-foreground">{d.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Score: <span className="font-bold">{d.score}%</span> · {TIER_CONFIG[d.tier as keyof typeof TIER_CONFIG].label}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={TIER_CONFIG[entry.tier as keyof typeof TIER_CONFIG].color}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tier Movement Guide */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-3">
          Tier Progression Path
        </h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {(["tier3", "tier2", "tier1"] as const).map((tier, i) => {
            const config = TIER_CONFIG[tier];
            const Icon = tierIcons[tier];
            return (
              <div key={tier} className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: config.bg, border: `1px solid ${config.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: config.color }}>{config.label}</p>
                    <p className="text-[10px] text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                {i < 2 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Partners progress from Tier 3 → Tier 2 → Tier 1 as they complete more enablement requirements
        </p>
      </motion.div>
    </div>
  );
}
