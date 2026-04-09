/*
 * Modification Context — PEI Dashboard
 * Allows admin to modify partner enablement counts AND business metrics.
 * Supports 4-tier architecture: Authorized → Preferred → Elite (Zone B) → Ambassador
 * Recomputes partner compliance (enablement + business) after each edit.
 * Persists modifications to localStorage.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  partners as basePartners,
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  computeEnablementGaps,
  computeEnablementScore,
  isEnablementCompliant,
  isBusinessCompliant,
  getTierDistribution,
  type Partner,
  type ProgramTier,
  type ComplianceFilter,
  type KPIMetric,
  type StatusCategory,
  type EnablementRequirements,
  type BusinessMetrics,
} from "@/lib/data";

// ─── Types ──────────────────────────────────────────────────

export interface GapModification {
  partnerId: number;
  // Enablement overrides
  salesPro: number;
  techPro: number;
  bootcamp: number;
  implSpec: number;
  // Business metrics overrides
  bookingsUSD: number | null;
  uniqueCustomers: number | null;
  partnerDeliveredServices: number | null;
  // Tier reassignment
  programTier?: ProgramTier;
  // Meta
  comment: string;
  modifiedAt: string;
  modifiedBy: string;
}

interface ModificationContextValue {
  modifications: GapModification[];
  modifiedPartners: Partner[];
  addModification: (mod: Omit<GapModification, "modifiedAt">) => void;
  removeModification: (partnerId: number) => void;
  getModification: (partnerId: number) => GapModification | undefined;
  getModificationHistory: (partnerId: number) => GapModification[];
  allModificationHistory: GapModification[];
  filterModifiedPartners: (filter: ComplianceFilter) => Partner[];
  getModifiedKPIs: (filtered: Partner[]) => KPIMetric[];
  getModifiedGapBreakdown: (filtered: Partner[]) => any[];
  getModifiedEnablementDistribution: (filtered: Partner[]) => StatusCategory[];
}

const STORAGE_KEY = "pei-gap-modifications";
const HISTORY_KEY = "pei-modification-history";

function loadModifications(): GapModification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadHistory(): GapModification[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveModifications(mods: GapModification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mods)); } catch {}
}

function saveHistory(history: GapModification[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

// ─── Recompute partner from modification ────────────────────

function applyModification(partner: Partner, mod: GapModification): Partner {
  const tier = mod.programTier || partner.programTier;
  const tierDef = TIER_DEFINITIONS[tier];

  const requirements: EnablementRequirements = {
    salesPro: { required: tierDef.enablement.salesPro, obtained: mod.salesPro },
    techPro: { required: tierDef.enablement.techPro, obtained: mod.techPro },
    bootcamp: { required: tierDef.enablement.bootcamp, obtained: mod.bootcamp },
    implSpec: { required: tierDef.enablement.implSpec, obtained: mod.implSpec },
  };

  const businessMetrics: BusinessMetrics = {
    bookingsUSD: mod.bookingsUSD,
    uniqueCustomers: mod.uniqueCustomers,
    partnerDeliveredServices: mod.partnerDeliveredServices,
  };

  const enablementComp = isEnablementCompliant(requirements);
  const businessComp = isBusinessCompliant(businessMetrics, tierDef.businessMetrics);

  return {
    ...partner,
    programTier: tier,
    requirements,
    businessMetrics,
    totalGaps: computeEnablementGaps(requirements),
    enablementScore: computeEnablementScore(requirements),
    enablementCompliant: enablementComp,
    businessCompliant: businessComp,
    overallCompliant: enablementComp && businessComp,
  };
}

// ─── Context ────────────────────────────────────────────────

const ModificationContext = createContext<ModificationContextValue | null>(null);

export function ModificationProvider({ children }: { children: ReactNode }) {
  const [modifications, setModifications] = useState<GapModification[]>(loadModifications);
  const [history, setHistory] = useState<GapModification[]>(loadHistory);

  const modifiedPartners = useMemo(() => {
    return basePartners.map((partner) => {
      const mod = modifications.find((m) => m.partnerId === partner.id);
      if (mod) return applyModification(partner, mod);
      return partner;
    });
  }, [modifications]);

  const addModification = useCallback(
    (mod: Omit<GapModification, "modifiedAt">) => {
      const fullMod: GapModification = {
        ...mod,
        modifiedAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const next = [...prev, fullMod];
        saveHistory(next);
        return next;
      });
      setModifications((prev) => {
        const filtered = prev.filter((m) => m.partnerId !== mod.partnerId);
        const next = [...filtered, fullMod];
        saveModifications(next);
        return next;
      });
    },
    []
  );

  const removeModification = useCallback((partnerId: number) => {
    setModifications((prev) => {
      const next = prev.filter((m) => m.partnerId !== partnerId);
      saveModifications(next);
      return next;
    });
  }, []);

  const getModification = useCallback(
    (partnerId: number) => modifications.find((m) => m.partnerId === partnerId),
    [modifications]
  );

  const getModificationHistory = useCallback(
    (partnerId: number) =>
      history
        .filter((m) => m.partnerId === partnerId)
        .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()),
    [history]
  );

  // ─── Filtered data helpers ────────────────────────────────

  const filterModifiedPartners = useCallback(
    (filter: ComplianceFilter): Partner[] => {
      if (filter === "all") return modifiedPartners;
      return modifiedPartners.filter((p) => p.programTier === filter);
    },
    [modifiedPartners]
  );

  const getModifiedKPIs = useCallback(
    (filtered: Partner[]): KPIMetric[] => {
      const total = filtered.length;
      const totalObtained = filtered.reduce(
        (s, p) =>
          s +
          Math.min(p.requirements.salesPro.obtained, p.requirements.salesPro.required) +
          Math.min(p.requirements.techPro.obtained, p.requirements.techPro.required) +
          Math.min(p.requirements.bootcamp.obtained, p.requirements.bootcamp.required) +
          Math.min(p.requirements.implSpec.obtained, p.requirements.implSpec.required),
        0
      );
      const totalRequired = filtered.reduce((s, p) => {
        const def = TIER_DEFINITIONS[p.programTier].enablement;
        return s + def.total;
      }, 0);
      const avgScore = total > 0
        ? Math.round(filtered.reduce((s, p) => s + p.enablementScore, 0) / total)
        : 0;
      const totalGaps = filtered.reduce((s, p) => s + p.totalGaps, 0);
      const totalExams = filtered.reduce((s, p) => s + p.totalExams, 0);
      const enablementCompliant = filtered.filter((p) => p.enablementCompliant).length;
      const businessCompliant = filtered.filter((p) => p.businessCompliant).length;
      const overallCompliant = filtered.filter((p) => p.overallCompliant).length;

      // FY27 Revenue aggregate
      const totalRevenueFY27 = filtered.reduce((s, p) => s + (p.revenueData.fy27Revenue ?? 0), 0);
      const totalTargetFY27 = filtered.reduce((s, p) => s + (p.revenueData.targetFY27 ?? 0), 0);
      const revenueAttainment = totalTargetFY27 > 0 ? Math.round((totalRevenueFY27 / totalTargetFY27) * 100) : 0;

      return [
        {
          id: "partners",
          label: "Total Partners",
          value: total.toString(),
          change: 4,
          changeLabel: `${overallCompliant} fully compliant`,
          trend: "up",
          sparkline: [11, 14, 17, 19, 21, 22, total],
        },
        {
          id: "revenue",
          label: "FY27 Revenue",
          value: `$${(totalRevenueFY27 / 1000000).toFixed(1)}M`,
          change: revenueAttainment,
          changeLabel: `${revenueAttainment}% of $${(totalTargetFY27 / 1000000).toFixed(1)}M target`,
          trend: revenueAttainment >= 70 ? "up" as const : revenueAttainment >= 40 ? "flat" as const : "down" as const,
          sparkline: [2.1, 3.5, 4.2, 5.0, 5.8, 6.5, totalRevenueFY27 / 1000000],
        },
        {
          id: "enablement",
          label: "Enablement Score",
          value: `${avgScore}%`,
          change: avgScore,
          changeLabel: `${totalObtained} of ${totalRequired} items met`,
          trend: avgScore >= 50 ? "up" : "down",
          sparkline: [15, 22, 30, 35, 40, 45, avgScore],
        },
        {
          id: "gaps",
          label: "Enablement Gaps",
          value: totalGaps.toString(),
          change: -15,
          changeLabel: `${enablementCompliant} partners enabled`,
          trend: "down",
          sparkline: [120, 110, 100, 90, 80, 75, totalGaps],
        },
        {
          id: "exams",
          label: "Exams Passed",
          value: totalExams.toString(),
          change: 5,
          changeLabel: `${businessCompliant} biz-compliant`,
          trend: "up",
          sparkline: [15, 20, 25, 30, 35, 38, totalExams],
        },
      ];
    },
    []
  );

  const getModifiedGapBreakdown = useCallback(
    (filtered: Partner[]) => {
      return filtered
        .filter((p) => p.totalGaps > 0)
        .sort((a, b) => b.totalGaps - a.totalGaps)
        .map((p) => ({
          partner: p.name.length > 20 ? p.name.substring(0, 18) + "…" : p.name,
          fullName: p.name,
          "Sales Pro Gap": Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained),
          "Tech Pro Gap": Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained),
          "Bootcamp Gap": Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained),
          "Impl Spec Gap": Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained),
        }));
    },
    []
  );

  const getModifiedEnablementDistribution = useCallback(
    (filtered: Partner[]): StatusCategory[] => {
      const total = filtered.length;
      if (total === 0) return [];

      const spMet = filtered.filter((p) => p.requirements.salesPro.obtained >= p.requirements.salesPro.required).length;
      const tspMet = filtered.filter((p) => p.requirements.techPro.obtained >= p.requirements.techPro.required).length;
      const bootMet = filtered.filter((p) => p.requirements.bootcamp.obtained >= p.requirements.bootcamp.required).length;
      const implMet = filtered.filter((p) => p.requirements.implSpec.obtained >= p.requirements.implSpec.required).length;

      return [
        { category: "Sales Pro", count: spMet, percentage: Math.round((spMet / total) * 100), color: "oklch(0.60 0.12 175)" },
        { category: "Tech Pro", count: tspMet, percentage: Math.round((tspMet / total) * 100), color: "oklch(0.58 0.16 290)" },
        { category: "Bootcamp", count: bootMet, percentage: Math.round((bootMet / total) * 100), color: "oklch(0.75 0.14 75)" },
        { category: "Impl Specialist", count: implMet, percentage: Math.round((implMet / total) * 100), color: "oklch(0.62 0.19 15)" },
      ];
    },
    []
  );

  return (
    <ModificationContext.Provider
      value={{
        modifications,
        modifiedPartners,
        addModification,
        removeModification,
        getModification,
        getModificationHistory,
        allModificationHistory: history,
        filterModifiedPartners,
        getModifiedKPIs,
        getModifiedGapBreakdown,
        getModifiedEnablementDistribution,
      }}
    >
      {children}
    </ModificationContext.Provider>
  );
}

export function useModifications() {
  const ctx = useContext(ModificationContext);
  if (!ctx)
    throw new Error("useModifications must be used within ModificationProvider");
  return ctx;
}
