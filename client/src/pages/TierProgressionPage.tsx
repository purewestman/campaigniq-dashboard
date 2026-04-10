/*
 * Tier Progression Page — "Soft Terrain" design
 * FY27 Global Reseller Program — 4-Tier Architecture
 * Visualizes what each partner needs to advance to the next tier
 * Shows enablement deltas + business metric gaps per partner
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModifications } from "@/contexts/ModificationContext";
import {
  type Partner,
  type ProgramTier,
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
} from "@/lib/data";
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Users,
  Wrench,
  GraduationCap,
  ShieldCheck,
  Cpu,
  BookOpen,
  Star,
  Filter,
} from "lucide-react";

// ─── Progression Helpers ──────────────────────────────────

const TIER_ORDER: ProgramTier[] = ["authorized", "preferred", "elite", "ambassador"];

interface ProgressionDelta {
  partner: Partner;
  currentTier: ProgramTier;
  nextTier: ProgramTier | null; // null = already at Ambassador
  enablementDeltas: {
    salesPro: number;
    techPro: number;
    bootcamp: number;
    implSpec: number;
    total: number;
  };
  businessDeltas: {
    bookingsUSD: { needed: number | null; current: number | null; gap: number | null };
    uniqueCustomers: { needed: number | null; current: number | null; gap: number | null };
    pds: { needed: number | null; current: number | null; gap: number | null };
  };
  enablementReady: boolean;
  businessReady: boolean;
  fullyReady: boolean;
  readinessPercent: number;
}

function computeProgression(partner: Partner): ProgressionDelta {
  const currentIdx = TIER_ORDER.indexOf(partner.programTier);
  const nextTier = currentIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentIdx + 1] : null;

  if (!nextTier) {
    return {
      partner,
      currentTier: partner.programTier,
      nextTier: null,
      enablementDeltas: { salesPro: 0, techPro: 0, bootcamp: 0, implSpec: 0, total: 0 },
      businessDeltas: {
        bookingsUSD: { needed: null, current: null, gap: null },
        uniqueCustomers: { needed: null, current: null, gap: null },
        pds: { needed: null, current: null, gap: null },
      },
      enablementReady: true,
      businessReady: true,
      fullyReady: true,
      readinessPercent: 100,
    };
  }

  const nextDef = TIER_DEFINITIONS[nextTier];
  const reqs = partner.requirements;

  // Enablement deltas: how many more needed for next tier
  const spDelta = Math.max(0, nextDef.enablement.salesPro - reqs.salesPro.obtained);
  const tpDelta = Math.max(0, nextDef.enablement.techPro - reqs.techPro.obtained);
  const bcDelta = Math.max(0, nextDef.enablement.bootcamp - reqs.bootcamp.obtained);
  const isDelta = Math.max(0, nextDef.enablement.implSpec - reqs.implSpec.obtained);
  const totalEnablementDelta = spDelta + tpDelta + bcDelta + isDelta;

  // Business metric deltas
  const bm = partner.businessMetrics;
  const bt = nextDef.businessMetrics;

  const bookingsGap = bt.bookingsUSD !== null
    ? Math.max(0, bt.bookingsUSD - (bm.bookingsUSD ?? 0))
    : null;
  const customersGap = bt.uniqueCustomers !== null
    ? Math.max(0, bt.uniqueCustomers - (bm.uniqueCustomers ?? 0))
    : null;
  const pdsGap = bt.partnerDeliveredServices !== null
    ? Math.max(0, bt.partnerDeliveredServices - (bm.partnerDeliveredServices ?? 0))
    : null;

  const enablementReady = totalEnablementDelta === 0;

  // Business ready = all applicable thresholds met
  const businessReady =
    (bookingsGap === null || bookingsGap === 0) &&
    (customersGap === null || customersGap === 0) &&
    (pdsGap === null || pdsGap === 0);

  // Readiness percent: weighted average of enablement + business
  const nextTotal = nextDef.enablement.total;
  const enablementObtained = Math.min(
    reqs.salesPro.obtained, nextDef.enablement.salesPro
  ) + Math.min(
    reqs.techPro.obtained, nextDef.enablement.techPro
  ) + Math.min(
    reqs.bootcamp.obtained, nextDef.enablement.bootcamp
  ) + Math.min(
    reqs.implSpec.obtained, nextDef.enablement.implSpec
  );
  const enablementPct = nextTotal > 0 ? (enablementObtained / nextTotal) * 100 : 100;

  // Business readiness: count how many metrics are met out of applicable ones
  let bizMet = 0;
  let bizTotal = 0;
  if (bt.bookingsUSD !== null) { bizTotal++; if (bookingsGap === 0) bizMet++; }
  if (bt.uniqueCustomers !== null) { bizTotal++; if (customersGap === 0) bizMet++; }
  if (bt.partnerDeliveredServices !== null) { bizTotal++; if (pdsGap === 0) bizMet++; }
  const bizPct = bizTotal > 0 ? (bizMet / bizTotal) * 100 : 100;

  const readinessPercent = Math.round((enablementPct * 0.6 + bizPct * 0.4));

  return {
    partner,
    currentTier: partner.programTier,
    nextTier,
    enablementDeltas: {
      salesPro: spDelta,
      techPro: tpDelta,
      bootcamp: bcDelta,
      implSpec: isDelta,
      total: totalEnablementDelta,
    },
    businessDeltas: {
      bookingsUSD: { needed: bt.bookingsUSD, current: bm.bookingsUSD, gap: bookingsGap },
      uniqueCustomers: { needed: bt.uniqueCustomers, current: bm.uniqueCustomers, gap: customersGap },
      pds: { needed: bt.partnerDeliveredServices, current: bm.partnerDeliveredServices, gap: pdsGap },
    },
    enablementReady,
    businessReady,
    fullyReady: enablementReady && businessReady,
    readinessPercent,
  };
}

// ─── Sub-components ───────────────────────────────────────

function TierBadge({ tier }: { tier: ProgramTier }) {
  const def = TIER_DEFINITIONS[tier];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: def.bg, color: def.color }}
    >
      {def.label}
    </span>
  );
}

function ProgressRing({ percent, size = 56 }: { percent: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 80 ? "var(--color-basil-green)" :
    percent >= 50 ? "var(--color-moss-green)" :
    "var(--color-cinnamon-brown)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-stone-gray)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold text-foreground">{percent}%</span>
      </div>
    </div>
  );
}

function EnablementDeltaBar({
  label,
  icon: Icon,
  obtained,
  nextRequired,
  delta,
}: {
  label: string;
  icon: React.ElementType;
  obtained: number;
  nextRequired: number;
  delta: number;
}) {
  const pct = nextRequired > 0 ? Math.min(100, (obtained / nextRequired) * 100) : 100;
  const isMet = delta === 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isMet ? "color-mix(in srgb, var(--color-basil-green) 10%, transparent)" : "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isMet ? "var(--color-basil-green)" : "var(--color-cinnamon-brown)" }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-foreground">{label}</span>
          <span className="text-[11px] text-muted-foreground">
            {obtained}/{nextRequired}
            {delta > 0 && (
              <span className="ml-1 font-semibold" style={{ color: "var(--color-cinnamon-brown)" }}>
                (need {delta} more)
              </span>
            )}
            {isMet && (
              <span className="ml-1" style={{ color: "var(--color-basil-green)" }}>
                ✓
              </span>
            )}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-stone-gray)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: isMet
                ? "var(--color-basil-green)"
                : `linear-gradient(90deg, var(--color-moss-green), var(--color-cinnamon-brown))`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BusinessMetricRow({
  label,
  icon: Icon,
  needed,
  current,
  gap,
  format,
}: {
  label: string;
  icon: React.ElementType;
  needed: number | null;
  current: number | null;
  gap: number | null;
  format: (n: number) => string;
}) {
  if (needed === null) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--color-stone-gray)" }}
        >
          <Icon className="w-4 h-4 text-muted-foreground/50" />
        </div>
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="ml-auto text-[11px] text-muted-foreground/50">N/A for this tier</span>
      </div>
    );
  }

  const isMet = gap === 0;
  const notEntered = current === null;

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isMet ? "color-mix(in srgb, var(--color-basil-green) 10%, transparent)" : "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isMet ? "var(--color-basil-green)" : "var(--color-cinnamon-brown)" }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-foreground">{label}</span>
          <div className="text-right">
            {notEntered ? (
              <span className="text-[11px] text-muted-foreground italic">
                Not entered — need {format(needed)}
              </span>
            ) : isMet ? (
              <span className="text-[11px]" style={{ color: "var(--color-basil-green)" }}>
                {format(current!)} / {format(needed)} ✓
              </span>
            ) : (
              <span className="text-[11px]">
                <span className="text-muted-foreground">{format(current!)} / {format(needed)}</span>
                <span className="ml-1 font-semibold" style={{ color: "var(--color-cinnamon-brown)" }}>
                  (gap: {format(gap!)})
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerProgressionCard({ prog, index }: { prog: ProgressionDelta; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const partner = prog.partner;
  const currentDef = TIER_DEFINITIONS[prog.currentTier];
  const nextDef = prog.nextTier ? TIER_DEFINITIONS[prog.nextTier] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="terrain-card overflow-hidden"
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/40 transition-colors"
      >
        {/* Readiness ring */}
        <ProgressRing percent={prog.readinessPercent} />

        {/* Partner info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-bold text-foreground">{partner.name}</h3>
            {prog.fullyReady && (
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-basil-green)" }} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <TierBadge tier={prog.currentTier} />
            {nextDef && (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                <TierBadge tier={prog.nextTier!} />
              </>
            )}
            {!nextDef && (
              <span className="text-[11px] text-muted-foreground italic ml-1">
                Highest tier reached
              </span>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-6 mr-2">
          {nextDef && (
            <>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Enablement</p>
                <p
                  className="text-[14px] font-bold"
                  style={{
                    color: prog.enablementReady ? "var(--color-basil-green)" : "var(--color-cinnamon-brown)",
                  }}
                >
                  {prog.enablementReady ? "Ready" : `${prog.enablementDeltas.total} gaps`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Business</p>
                <p
                  className="text-[14px] font-bold"
                  style={{
                    color: prog.businessReady ? "var(--color-basil-green)" : "var(--color-cinnamon-brown)",
                  }}
                >
                  {prog.businessReady ? "Ready" : "Gaps"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Expand chevron */}
        {nextDef && (
          <div className="text-muted-foreground/40">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && nextDef && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "var(--color-stone-gray)" }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enablement Requirements */}
                <div>
                  <h4 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" style={{ color: currentDef.color }} />
                    Enablement for {nextDef.label}
                  </h4>
                  <div className="space-y-3">
                    <EnablementDeltaBar
                      label="Sales Pro"
                      icon={Star}
                      obtained={partner.requirements.salesPro.obtained}
                      nextRequired={nextDef.enablement.salesPro}
                      delta={prog.enablementDeltas.salesPro}
                    />
                    <EnablementDeltaBar
                      label="Tech Pro"
                      icon={Cpu}
                      obtained={partner.requirements.techPro.obtained}
                      nextRequired={nextDef.enablement.techPro}
                      delta={prog.enablementDeltas.techPro}
                    />
                    <EnablementDeltaBar
                      label="Bootcamp"
                      icon={BookOpen}
                      obtained={partner.requirements.bootcamp.obtained}
                      nextRequired={nextDef.enablement.bootcamp}
                      delta={prog.enablementDeltas.bootcamp}
                    />
                    <EnablementDeltaBar
                      label="Impl. Specialist"
                      icon={ShieldCheck}
                      obtained={partner.requirements.implSpec.obtained}
                      nextRequired={nextDef.enablement.implSpec}
                      delta={prog.enablementDeltas.implSpec}
                    />
                  </div>
                  {prog.enablementReady && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2"
                      style={{
                        background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
                        color: "var(--color-basil-green)",
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      All enablement requirements met for {nextDef.label}
                    </div>
                  )}
                </div>

                {/* Business Metrics */}
                <div>
                  <h4 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" style={{ color: currentDef.color }} />
                    Business Metrics for {nextDef.label}
                  </h4>
                  <div className="space-y-1">
                    <BusinessMetricRow
                      label="Bookings USD"
                      icon={DollarSign}
                      needed={prog.businessDeltas.bookingsUSD.needed}
                      current={prog.businessDeltas.bookingsUSD.current}
                      gap={prog.businessDeltas.bookingsUSD.gap}
                      format={(n) => `$${n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString()}`}
                    />
                    <BusinessMetricRow
                      label="Unique Customers"
                      icon={Users}
                      needed={prog.businessDeltas.uniqueCustomers.needed}
                      current={prog.businessDeltas.uniqueCustomers.current}
                      gap={prog.businessDeltas.uniqueCustomers.gap}
                      format={(n) => n.toString()}
                    />
                    <BusinessMetricRow
                      label="Partner Delivered Services"
                      icon={Wrench}
                      needed={prog.businessDeltas.pds.needed}
                      current={prog.businessDeltas.pds.current}
                      gap={prog.businessDeltas.pds.gap}
                      format={(n) => n.toString()}
                    />
                  </div>
                  {prog.businessReady && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2"
                      style={{
                        background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
                        color: "var(--color-basil-green)",
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      All business metrics met for {nextDef.label}
                    </div>
                  )}
                  {!prog.businessReady && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2"
                      style={{
                        background: "color-mix(in srgb, var(--color-moss-green) 8%, transparent)",
                        color: "var(--color-moss-green)",
                      }}
                    >
                      <DollarSign className="w-4 h-4" />
                      Enter business metrics via the Modify button on the Partners tab
                    </div>
                  )}
                </div>
              </div>

              {/* Overall readiness summary */}
              {prog.fullyReady && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 px-4 py-3 rounded-xl text-center"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--color-basil-green) 8%, transparent), color-mix(in srgb, var(--color-pure-orange) 6%, transparent))",
                    border: "1px solid color-mix(in srgb, var(--color-basil-green) 15%, transparent)",
                  }}
                >
                  <p className="text-[13px] font-bold" style={{ color: "var(--color-pure-orange)" }}>
                    🎯 {partner.name} is fully ready to advance to {nextDef.label}!
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    All enablement and business metric requirements are met.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────

export default function TierProgressionPage() {
  const { modifiedPartners } = useModifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<ProgramTier | "all">("all");
  const [sortBy, setSortBy] = useState<"readiness" | "name" | "gaps">("readiness");

  const progressions = useMemo(() => {
    return modifiedPartners.map(computeProgression);
  }, [modifiedPartners]);

  const filtered = useMemo(() => {
    let result = progressions;

    if (tierFilter !== "all") {
      result = result.filter((p) => p.currentTier === tierFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) =>
        p.partner.name.toLowerCase().includes(q) ||
        TIER_DEFINITIONS[p.currentTier].label.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "readiness") {
      result = [...result].sort((a, b) => b.readinessPercent - a.readinessPercent);
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.partner.name.localeCompare(b.partner.name));
    } else {
      result = [...result].sort((a, b) => a.enablementDeltas.total - b.enablementDeltas.total);
    }

    return result;
  }, [progressions, tierFilter, searchQuery, sortBy]);

  // Summary stats
  const readyCount = progressions.filter((p) => p.fullyReady).length;
  const enablementReadyCount = progressions.filter((p) => p.enablementReady).length;
  const atTopTier = progressions.filter((p) => p.nextTier === null).length;
  const avgReadiness = progressions.length > 0
    ? Math.round(progressions.reduce((s, p) => s + p.readinessPercent, 0) / progressions.length)
    : 0;

  // Tier distribution for filter buttons
  const tierCounts = PROGRAM_TIERS.reduce((acc, tier) => {
    acc[tier] = progressions.filter((p) => p.currentTier === tier).length;
    return acc;
  }, {} as Record<ProgramTier, number>);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: "var(--color-basil-green)" }} />
          Tier Progression
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          What each partner needs to advance to the next tier — enablement and business metric gaps
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Fully Ready",
            value: readyCount,
            sub: `of ${progressions.length} partners`,
            color: "var(--color-basil-green)",
            bg: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
          },
          {
            label: "Enablement Ready",
            value: enablementReadyCount,
            sub: "met next-tier enablement",
            color: "var(--color-pure-orange)",
            bg: "color-mix(in srgb, var(--color-pure-orange) 8%, transparent)",
          },
          {
            label: "Avg Readiness",
            value: `${avgReadiness}%`,
            sub: "across all partners",
            color: "var(--color-moss-green)",
            bg: "color-mix(in srgb, var(--color-moss-green) 8%, transparent)",
          },
          {
            label: "At Top Tier",
            value: atTopTier,
            sub: "Ambassador level",
            color: "var(--color-basil-green)",
            bg: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
          },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="terrain-card p-4"
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] bg-white border transition-all focus:ring-2 focus:ring-ring/20 outline-none"
            style={{ borderColor: "var(--color-stone-gray)" }}
          />
        </div>

        {/* Tier filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground/50" />
          <button
            onClick={() => setTierFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              tierFilter === "all"
                ? "bg-foreground text-background"
                : "bg-white border hover:bg-muted/50"
            }`}
            style={tierFilter !== "all" ? { borderColor: "var(--color-stone-gray)" } : {}}
          >
            All ({progressions.length})
          </button>
          {PROGRAM_TIERS.map((tier) => {
            const def = TIER_DEFINITIONS[tier];
            const isActive = tierFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(isActive ? "all" : tier)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: isActive ? def.bg : "white",
                  color: isActive ? def.color : "var(--color-walnut-brown)",
                  border: `1px solid ${isActive ? def.color + "30" : "var(--color-stone-gray)"}`,
                }}
              >
                {def.shortLabel} ({tierCounts[tier]})
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-xl text-[12px] bg-white border outline-none"
          style={{ borderColor: "var(--color-stone-gray)" }}
        >
          <option value="readiness">Sort: Readiness ↓</option>
          <option value="name">Sort: Name A-Z</option>
          <option value="gaps">Sort: Fewest Gaps</option>
        </select>
      </div>

      {/* Partner progression cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="terrain-card p-12 text-center">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-[14px] font-medium text-muted-foreground">No partners match your filter</p>
          </div>
        ) : (
          filtered.map((prog, i) => (
            <PartnerProgressionCard key={prog.partner.id} prog={prog} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
