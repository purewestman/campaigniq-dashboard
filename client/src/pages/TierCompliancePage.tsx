/*
 * Tier Compliance Page — PEI Dashboard
 * "Soft Terrain" design
 * 4-tier architecture: Authorized → Preferred → Elite (Zone B) → Ambassador
 * Shows tier overview cards, requirements matrix, enablement ranking, and business metrics status
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  type ProgramTier,
} from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import {
  Shield,
  Trophy,
  Star,
  Award,
  Crown,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  Target,
  DollarSign,
  Users,
  Wrench,
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

const tierIcons: Record<ProgramTier, React.ElementType> = {
  authorized: Shield,
  preferred: Star,
  elite: Award,
  ambassador: Crown,
};

export default function TierCompliancePage() {
  const { modifiedPartners } = useModifications();

  const tierData = useMemo(() => {
    return PROGRAM_TIERS.map((tier) => {
      const p = modifiedPartners.filter((x) => x.programTier === tier);
      const def = TIER_DEFINITIONS[tier];
      const avgScore = p.length > 0
        ? Math.round(p.reduce((s, x) => s + x.enablementScore, 0) / p.length)
        : 0;
      const totalGaps = p.reduce((s, x) => s + x.totalGaps, 0);
      const enabledCount = p.filter((x) => x.enablementCompliant).length;
      const bizCount = p.filter((x) => x.businessCompliant).length;
      const overallCount = p.filter((x) => x.overallCompliant).length;
      return {
        tier,
        def,
        partners: p,
        count: p.length,
        avgScore,
        totalGaps,
        enabledCount,
        bizCount,
        overallCount,
      };
    });
  }, [modifiedPartners]);

  const requirementMatrix = useMemo(() => {
    return PROGRAM_TIERS.map((tier) => {
      const p = modifiedPartners.filter((x) => x.programTier === tier);
      const def = TIER_DEFINITIONS[tier];
      return {
        tier,
        label: def.label,
        color: def.color,
        enablement: def.enablement,
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
        tier: p.programTier,
      }));
  }, [modifiedPartners]);

  const formatCurrency = (val: number | null) => {
    if (val === null) return "N/A";
    return val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "oklch(0.50 0.12 175)" }} />
          Tier Compliance
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          FY27 Global Reseller Program — 4-tier architecture with Enablement & Business Metrics
        </p>
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {tierData.map((td, i) => {
          const Icon = tierIcons[td.tier];
          return (
            <motion.div
              key={td.tier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="terrain-card p-5"
              style={{ borderLeft: `3px solid ${td.def.color}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: td.def.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: td.def.iconColor }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold" style={{ color: td.def.color }}>
                    {td.def.label}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">{td.def.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{td.count}</p>
                  <p className="text-[10px] text-muted-foreground">Partners</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: td.def.color }}>{td.avgScore}%</p>
                  <p className="text-[10px] text-muted-foreground">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{td.overallCount}</p>
                  <p className="text-[10px] text-muted-foreground">Compliant</p>
                </div>
              </div>

              {/* Enablement requirements summary */}
              <div className="text-[10px] text-muted-foreground mb-2 px-2 py-1.5 rounded-lg" style={{ background: "oklch(0.97 0.005 85 / 0.6)" }}>
                Req: SP:{td.def.enablement.salesPro} TP:{td.def.enablement.techPro} BC:{td.def.enablement.bootcamp} IS:{td.def.enablement.implSpec}
              </div>

              {/* Partner list */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {td.partners.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px]"
                    style={{ background: "oklch(0.97 0.005 85 / 0.6)" }}
                  >
                    <span className="font-medium text-foreground truncate flex-1">{p.name}</span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="font-bold" style={{ color: td.def.color }}>
                        {p.enablementScore}%
                      </span>
                      {p.overallCompliant ? (
                        <CheckCircle2 className="w-3 h-3" style={{ color: "oklch(0.50 0.12 175)" }} />
                      ) : (
                        <XCircle className="w-3 h-3" style={{ color: "oklch(0.55 0.15 50)" }} />
                      )}
                    </div>
                  </div>
                ))}
                {td.partners.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-2">No partners in this tier</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Requirements Compliance Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
          Enablement Compliance Matrix
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Partners meeting each enablement requirement by tier (requirement in parentheses)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Tier</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Sales Pro</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Tech Pro</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Bootcamp</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Impl Spec</th>
              </tr>
            </thead>
            <tbody>
              {requirementMatrix.map((row) => (
                <tr key={row.tier} className="border-b border-border/30">
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-semibold" style={{ color: row.color }}>{row.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({row.enablement.salesPro}/{row.enablement.techPro}/{row.enablement.bootcamp}/{row.enablement.implSpec})
                      </span>
                    </div>
                  </td>
                  {([row.salesPro, row.techPro, row.bootcamp, row.implSpec]).map((cell, ci) => {
                    const allMet = cell.met === cell.total && cell.total > 0;
                    const noneMet = cell.met === 0;
                    return (
                      <td key={ci} className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {allMet ? (
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.50 0.12 175)" }} />
                          ) : noneMet && cell.total > 0 ? (
                            <XCircle className="w-3.5 h-3.5" style={{ color: "oklch(0.50 0.19 15)" }} />
                          ) : cell.total === 0 ? (
                            <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" style={{ color: "oklch(0.58 0.14 75)" }} />
                          )}
                          <span
                            className="font-bold"
                            style={{
                              color: allMet ? "oklch(0.45 0.12 175)" : noneMet && cell.total > 0 ? "oklch(0.50 0.19 15)" : "oklch(0.58 0.14 75)",
                            }}
                          >
                            {cell.total > 0 ? `${cell.met}/${cell.total}` : "—"}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Business Metrics Thresholds */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
          Business Metric Thresholds by Tier
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Required business metrics for each program tier (non-renewal, in-year)
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Tier</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3" /> Bookings USD
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> Unique Customers
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Wrench className="w-3 h-3" /> PDS (Installs)
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Biz Compliant</th>
              </tr>
            </thead>
            <tbody>
              {tierData.map((td) => (
                <tr key={td.tier} className="border-b border-border/30">
                  <td className="py-3 px-3 font-semibold" style={{ color: td.def.color }}>
                    {td.def.label}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {td.def.businessMetrics.bookingsUSD !== null
                      ? formatCurrency(td.def.businessMetrics.bookingsUSD)
                      : <span className="text-muted-foreground">N/A</span>}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {td.def.businessMetrics.uniqueCustomers !== null
                      ? `≥ ${td.def.businessMetrics.uniqueCustomers}`
                      : <span className="text-muted-foreground">N/A</span>}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {td.def.businessMetrics.partnerDeliveredServices !== null
                      ? `≥ ${td.def.businessMetrics.partnerDeliveredServices}`
                      : <span className="text-muted-foreground">N/A</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold" style={{ color: td.bizCount > 0 ? "oklch(0.45 0.12 175)" : "oklch(0.55 0.15 50)" }}>
                      {td.bizCount}/{td.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Enablement Score Ranking */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1">
          Partner Enablement Ranking
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          All partners ranked by enablement score (% of tier-specific requirements met)
        </p>
        <div style={{ height: Math.max(400, barData.length * 28) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.55 0.02 55)" }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.45 0.02 55)" }} width={115} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  const def = TIER_DEFINITIONS[d.tier as ProgramTier];
                  return (
                    <div className="terrain-card px-3 py-2 shadow-lg">
                      <p className="text-[11px] font-bold text-foreground">{d.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Score: <span className="font-bold">{d.score}%</span> · {def.label}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={TIER_DEFINITIONS[entry.tier].color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tier Progression Path */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-3">
          Tier Progression Path
        </h3>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {PROGRAM_TIERS.map((tier, i) => {
            const def = TIER_DEFINITIONS[tier];
            const Icon = tierIcons[tier];
            return (
              <div key={tier} className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: def.bg, border: `1px solid ${def.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: def.color }} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: def.color }}>{def.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      E:{def.enablement.total} items
                    </p>
                  </div>
                </div>
                {i < PROGRAM_TIERS.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Partners progress through tiers by meeting both Enablement & Business Metric thresholds
        </p>
      </motion.div>
    </div>
  );
}
