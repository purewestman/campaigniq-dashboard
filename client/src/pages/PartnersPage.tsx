/*
 * Partners Page — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Full partner directory with search, tier badges, contact info, and enablement progress
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { partners, TIER_CONFIG, ELITE_ZONE_B } from "@/lib/data";
import { useOverrides } from "@/contexts/OverrideContext";
import {
  Search,
  Building2,
  Trophy,
  Minus,
  AlertTriangle,
  Mail,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Users,
  Target,
  X,
} from "lucide-react";

const tierIcons: Record<string, React.ElementType> = {
  tier1: Trophy,
  tier2: Minus,
  tier3: AlertTriangle,
};

export default function PartnersPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const { getOverrideCount } = useOverrides();

  const filtered = useMemo(() => {
    let result = partners;
    if (tierFilter !== "all") {
      result = result.filter((p) => p.tier === tierFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.targetEmails.some((e) => e.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, tierFilter]);

  const tierCounts = useMemo(() => ({
    all: partners.length,
    tier1: partners.filter((p) => p.tier === "tier1").length,
    tier2: partners.filter((p) => p.tier === "tier2").length,
    tier3: partners.filter((p) => p.tier === "tier3").length,
  }), []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5" style={{ color: "oklch(0.50 0.12 175)" }} />
          Partner Directory
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          {partners.length} registered partners in the FY27 Elite Zone B program
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[250px]"
          style={{
            background: "oklch(0.99 0.003 85 / 0.95)",
            borderColor: search ? "oklch(0.60 0.12 175 / 0.4)" : "oklch(0.92 0.01 85)",
          }}
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by partner name or email..."
            className="bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch("")} className="p-0.5 rounded hover:bg-black/5">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "tier1", "tier2", "tier3"] as const).map((t) => {
            const isActive = tierFilter === t;
            const label = t === "all" ? "All" : TIER_CONFIG[t].label;
            const count = tierCounts[t];
            return (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: isActive
                    ? t !== "all" ? TIER_CONFIG[t].bg : "oklch(0.22 0.02 200 / 0.10)"
                    : "transparent",
                  color: isActive
                    ? t !== "all" ? TIER_CONFIG[t].color : "oklch(0.22 0.02 200)"
                    : "oklch(0.55 0.02 55)",
                  border: isActive ? "1px solid currentColor" : "1px solid transparent",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((partner, i) => {
            const tierStyle = TIER_CONFIG[partner.tier];
            const TierIcon = tierIcons[partner.tier] || Minus;
            const isExpanded = expandedId === partner.id;
            const overrides = getOverrideCount(partner.id);
            const totalObtained =
              Math.min(partner.requirements.salesPro.obtained, partner.requirements.salesPro.required) +
              Math.min(partner.requirements.techPro.obtained, partner.requirements.techPro.required) +
              Math.min(partner.requirements.bootcamp.obtained, partner.requirements.bootcamp.required) +
              Math.min(partner.requirements.implSpec.obtained, partner.requirements.implSpec.required);

            return (
              <motion.div
                key={partner.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="terrain-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setExpandedId(isExpanded ? null : partner.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-foreground leading-tight">
                        {partner.name}
                      </h3>
                      {overrides > 0 && (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "oklch(0.60 0.12 175 / 0.10)", color: "oklch(0.45 0.12 175)" }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {overrides}
                        </span>
                      )}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: tierStyle.bg, color: tierStyle.color }}
                    >
                      <TierIcon className="w-3 h-3" />
                      {partner.tierLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: partner.enablementScore >= 80
                          ? "oklch(0.45 0.12 175)"
                          : partner.enablementScore >= 40
                          ? "oklch(0.58 0.14 75)"
                          : "oklch(0.50 0.19 15)",
                      }}
                    >
                      {partner.enablementScore}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{totalObtained}/{ELITE_ZONE_B.total} met</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "oklch(0.93 0.008 85)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${partner.enablementScore}%`,
                      background: partner.enablementScore >= 80
                        ? "oklch(0.60 0.12 175)"
                        : partner.enablementScore >= 40
                        ? "oklch(0.75 0.14 75)"
                        : "oklch(0.62 0.19 15)",
                    }}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {partner.totalGaps} gaps
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {partner.totalExams} exams
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {partner.targetEmails.length} contacts
                  </span>
                  {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 pt-4 border-t border-border/50 space-y-3"
                    >
                      {/* Requirements Breakdown */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                          Requirements Breakdown
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { label: "Sales Pro", key: "salesPro" as const },
                            { label: "Tech Pro", key: "techPro" as const },
                            { label: "Bootcamp", key: "bootcamp" as const },
                            { label: "Impl Spec", key: "implSpec" as const },
                          ]).map(({ label, key }) => {
                            const req = partner.requirements[key];
                            const met = req.obtained >= req.required;
                            return (
                              <div
                                key={key}
                                className="px-3 py-2 rounded-lg text-center"
                                style={{
                                  background: met ? "oklch(0.60 0.12 175 / 0.06)" : "oklch(0.62 0.19 15 / 0.04)",
                                }}
                              >
                                <p className="text-[10px] text-muted-foreground">{label}</p>
                                <p
                                  className="text-[14px] font-bold"
                                  style={{ color: met ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)" }}
                                >
                                  {req.obtained}/{req.required}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                          Recommended Action
                        </p>
                        <p className="text-[12px] text-foreground leading-relaxed">{partner.action}</p>
                      </div>

                      {/* Contacts */}
                      {partner.targetEmails.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            Contacts
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {partner.targetEmails.map((email) => (
                              <a
                                key={email}
                                href={`mailto:${email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium hover:opacity-80 transition-opacity"
                                style={{ background: "oklch(0.58 0.16 290 / 0.08)", color: "oklch(0.48 0.16 290)" }}
                              >
                                {email}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="terrain-card p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-[14px] font-medium text-muted-foreground">No partners found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
