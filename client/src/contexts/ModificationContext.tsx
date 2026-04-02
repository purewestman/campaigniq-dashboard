/*
 * Modification Context — CampaignIQ Dashboard
 * Allows admin to modify partner gap counts with justification comments.
 * Recomputes partner metrics (tier, enablement score, total gaps) after each edit.
 * Persists modifications to localStorage so they survive page refreshes.
 * All pages should consume `useModifiedPartners()` instead of the static `partners` array.
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
  ELITE_ZONE_B,
  TIER_CONFIG,
  type Partner,
  type EliteRequirements,
  type ComplianceFilter,
  type KPIMetric,
  type StatusCategory,
} from "@/lib/data";

// ─── Types ──────────────────────────────────────────────────

export interface GapModification {
  partnerId: number;
  salesPro: number;
  techPro: number;
  bootcamp: number;
  implSpec: number;
  comment: string;
  modifiedAt: string; // ISO timestamp
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
  // Filtered data helpers that use modifiedPartners
  filterModifiedPartners: (filter: ComplianceFilter) => Partner[];
  getModifiedKPIs: (filtered: Partner[]) => KPIMetric[];
  getModifiedGapBreakdown: (filtered: Partner[]) => any[];
  getModifiedEnablementDistribution: (filtered: Partner[]) => StatusCategory[];
}

const STORAGE_KEY = "campaigniq-gap-modifications";
const HISTORY_KEY = "campaigniq-modification-history";

function loadModifications(): GapModification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadHistory(): GapModification[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveModifications(mods: GapModification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mods));
  } catch {}
}

function saveHistory(history: GapModification[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

// ─── Recompute partner from modification ────────────────────

function computeGaps(reqs: EliteRequirements): number {
  return (
    Math.max(0, reqs.salesPro.required - reqs.salesPro.obtained) +
    Math.max(0, reqs.techPro.required - reqs.techPro.obtained) +
    Math.max(0, reqs.bootcamp.required - reqs.bootcamp.obtained) +
    Math.max(0, reqs.implSpec.required - reqs.implSpec.obtained)
  );
}

function computeScore(reqs: EliteRequirements): number {
  const obtained =
    Math.min(reqs.salesPro.obtained, reqs.salesPro.required) +
    Math.min(reqs.techPro.obtained, reqs.techPro.required) +
    Math.min(reqs.bootcamp.obtained, reqs.bootcamp.required) +
    Math.min(reqs.implSpec.obtained, reqs.implSpec.required);
  return Math.round((obtained / ELITE_ZONE_B.total) * 100);
}

function determineTier(score: number): Partner["tier"] {
  if (score >= 80) return "tier1";
  if (score >= 40) return "tier2";
  return "tier3";
}

function applyModification(partner: Partner, mod: GapModification): Partner {
  const requirements: EliteRequirements = {
    salesPro: { required: ELITE_ZONE_B.salesPro, obtained: mod.salesPro },
    techPro: { required: ELITE_ZONE_B.techPro, obtained: mod.techPro },
    bootcamp: { required: ELITE_ZONE_B.bootcamp, obtained: mod.bootcamp },
    implSpec: { required: ELITE_ZONE_B.implSpec, obtained: mod.implSpec },
  };
  const score = computeScore(requirements);
  const tier = determineTier(score);

  return {
    ...partner,
    requirements,
    totalGaps: computeGaps(requirements),
    enablementScore: score,
    tier,
    tierLabel: TIER_CONFIG[tier].label,
  };
}

// ─── Context ────────────────────────────────────────────────

const ModificationContext = createContext<ModificationContextValue | null>(null);

export function ModificationProvider({ children }: { children: ReactNode }) {
  const [modifications, setModifications] = useState<GapModification[]>(loadModifications);
  const [history, setHistory] = useState<GapModification[]>(loadHistory);

  // Build the modified partners array
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

      // Save to history
      setHistory((prev) => {
        const next = [...prev, fullMod];
        saveHistory(next);
        return next;
      });

      // Update current modifications (one per partner, latest wins)
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
      return modifiedPartners.filter((p) => p.tier === filter);
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
      const totalRequired = total * ELITE_ZONE_B.total;
      const avgScore =
        total > 0
          ? Math.round(filtered.reduce((s, p) => s + p.enablementScore, 0) / total)
          : 0;
      const totalGaps = filtered.reduce((s, p) => s + p.totalGaps, 0);
      const totalExams = filtered.reduce((s, p) => s + p.totalExams, 0);

      return [
        {
          id: "partners",
          label: "Total Partners",
          value: total.toString(),
          change: 4,
          changeLabel: "new since last update",
          trend: "up",
          sparkline: [11, 14, 17, 19, 21, 22, total],
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
          label: "Total Gaps",
          value: totalGaps.toString(),
          change: -15,
          changeLabel: "closed since last update",
          trend: "down",
          sparkline: [120, 110, 100, 90, 80, 75, totalGaps],
        },
        {
          id: "exams",
          label: "Exams Passed",
          value: totalExams.toString(),
          change: 5,
          changeLabel: "new certifications",
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
          partner:
            p.name.length > 20 ? p.name.substring(0, 18) + "…" : p.name,
          fullName: p.name,
          "Sales Pro Gap": Math.max(
            0,
            p.requirements.salesPro.required - p.requirements.salesPro.obtained
          ),
          "Tech Pro Gap": Math.max(
            0,
            p.requirements.techPro.required - p.requirements.techPro.obtained
          ),
          "Bootcamp Gap": Math.max(
            0,
            p.requirements.bootcamp.required - p.requirements.bootcamp.obtained
          ),
          "Impl Spec Gap": Math.max(
            0,
            p.requirements.implSpec.required - p.requirements.implSpec.obtained
          ),
        }));
    },
    []
  );

  const getModifiedEnablementDistribution = useCallback(
    (filtered: Partner[]): StatusCategory[] => {
      const total = filtered.length;
      if (total === 0) return [];

      const spMet = filtered.filter(
        (p) => p.requirements.salesPro.obtained >= p.requirements.salesPro.required
      ).length;
      const tspMet = filtered.filter(
        (p) => p.requirements.techPro.obtained >= p.requirements.techPro.required
      ).length;
      const bootMet = filtered.filter(
        (p) =>
          p.requirements.bootcamp.obtained >= p.requirements.bootcamp.required
      ).length;
      const implMet = filtered.filter(
        (p) =>
          p.requirements.implSpec.obtained >= p.requirements.implSpec.required
      ).length;

      return [
        {
          category: "Sales Pro (5 req)",
          count: spMet,
          percentage: Math.round((spMet / total) * 100),
          color: "oklch(0.60 0.12 175)",
        },
        {
          category: "Tech Pro (3 req)",
          count: tspMet,
          percentage: Math.round((tspMet / total) * 100),
          color: "oklch(0.58 0.16 290)",
        },
        {
          category: "Bootcamp (2 req)",
          count: bootMet,
          percentage: Math.round((bootMet / total) * 100),
          color: "oklch(0.75 0.14 75)",
        },
        {
          category: "Impl Specialist (1 req)",
          count: implMet,
          percentage: Math.round((implMet / total) * 100),
          color: "oklch(0.62 0.19 15)",
        },
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
