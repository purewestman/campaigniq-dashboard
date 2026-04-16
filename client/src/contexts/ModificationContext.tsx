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
  type Partner,
  type ProgramTier,
  type ComplianceFilter,
  type KPIMetric,
  type StatusCategory,
  type EnablementRequirements,
  type BusinessMetrics,
} from "@/lib/data";
import { trainingData } from "@/lib/trainingData";

// ─── Types ──────────────────────────────────────────────────

export interface CustomRoadmapItem {
  id: string;
  label: string;
  month: string;
  category: "enablement" | "demand-gen" | "certification";
  description: string;
  status: "planned" | "completed";
}

export interface RoadmapEvent {
  id: string;
  title: string;
  date: string;
  category: GapCategory | "general";
  partnerIds: number[];
  description: string;
}

export type GapCategory = keyof EnablementRequirements;

export interface GapModification {
  partnerId: number;
  // Enablement overrides
  salesPro: number;
  techPro: number;
  bootcamp: number;
  implSpec: number;
  simplyPure: number;
  aspFoundations: number;
  aspStoragePro: number;
  aspSupportSpec: number;
  // Granular ASP breakdown
  aspFoundationsFA?: number;
  aspFoundationsFB?: number;
  aspStorageProFA?: number;
  aspStorageProFB?: number;
  aspSupportSpecFA?: number;
  aspSupportSpecFB?: number;
  // Manual List Management (New)
  addedEmails: Record<string, string[]>;
  removedEmails: Record<string, string[]>;
  // Business metrics overrides
  bookingsUSD: number | null;
  uniqueCustomers: number | null;
  partnerDeliveredServices: number | null;
  // Custom Roadmap Items
  customItems?: CustomRoadmapItem[];
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
  events: RoadmapEvent[];
  addModification: (mod: Omit<GapModification, "modifiedAt">) => void;
  removeModification: (partnerId: number) => void;
  getModification: (partnerId: number) => GapModification | undefined;
  getModificationHistory: (partnerId: number) => GapModification[];
  allModificationHistory: GapModification[];
  filterModifiedPartners: (filter: ComplianceFilter) => Partner[];
  getModifiedKPIs: (filtered: Partner[]) => KPIMetric[];
  getModifiedGapBreakdown: (filtered: Partner[]) => any[];
  getModifiedEnablementDistribution: (filtered: Partner[]) => StatusCategory[];
  addEvent: (event: Omit<RoadmapEvent, "id">) => void;
  removeEvent: (id: string) => void;
  globalRoadmap: any[] | null;
  setGlobalRoadmap: (data: any[] | null) => void;
  updatePartnerTimeline: (partnerId: number, timeline: any[]) => void;
  // Global Directory
  addedGlobalUsers: GlobalUser[];
  addGlobalUser: (user: GlobalUser) => void;
  removeGlobalUser: (email: string) => void;
  computedGlobalDirectory: GlobalUser[];
  userRoles: Record<string, "Admin" | "Sales" | "Technical">;
  updateUserRole: (email: string, role: "Admin" | "Sales" | "Technical") => void;
}

export interface GlobalUser {
  email: string;
  firstName: string;
  lastName: string;
  source: "telemetry" | "manual";
  role: "Admin" | "Sales" | "Technical";
}

// ─── Persistence ──────────────────────────────────────────

const HISTORY_KEY = "pei-modification-history-v2";
const STORAGE_EVENTS_KEY = "pei-roadmap-events";
const GLOBAL_ROADMAP_KEY = "pei-global-roadmap-v1";
const PARTNER_TIMELINES_KEY = "pei-partner-timelines-v1";
const GLOBAL_USERS_KEY = "pei-global-users-v1";
const GLOBAL_USER_ROLES_KEY = "pei-global-user-roles-v1";

function loadModifications(): GapModification[] {
  try {
    const data = localStorage.getItem("pei-gap-modifications-v2");
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function loadHistory(): GapModification[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function loadEvents(): RoadmapEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function loadGlobalRoadmap(): any[] | null {
  try {
    const data = localStorage.getItem(GLOBAL_ROADMAP_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function loadPartnerTimelines(): Record<number, any[]> {
  try {
    const data = localStorage.getItem(PARTNER_TIMELINES_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function loadAddedGlobalUsers(): GlobalUser[] {
  try {
    const data = localStorage.getItem(GLOBAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function loadUserRoles(): Record<string, "Admin" | "Sales" | "Technical"> {
  try {
    const data = localStorage.getItem(GLOBAL_USER_ROLES_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveModifications(mods: GapModification[]) {
  try { localStorage.setItem(MOD_KEY, JSON.stringify(mods)); } catch {}
}

function saveEvents(events: RoadmapEvent[]) {
  try { localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events)); } catch {}
}

function saveHistory(history: GapModification[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

function saveGlobalRoadmap(data: any[] | null) {
  try { localStorage.setItem(GLOBAL_ROADMAP_KEY, JSON.stringify(data)); } catch {}
}

function savePartnerTimelines(data: Record<number, any[]>) {
  try { localStorage.setItem(PARTNER_TIMELINES_KEY, JSON.stringify(data)); } catch {}
}

// ─── Recompute partner from modification ────────────────────

function applyModification(partner: Partner, mod: GapModification): Partner {
  const tier = mod.programTier || partner.programTier;
  const tierDef = TIER_DEFINITIONS[tier];

  const resolveList = (cat: string, autoList: any[]) => {
      const removals = mod.removedEmails[cat] || [];
      const additions = mod.addedEmails[cat] || [];

      // Remove from auto list, then add manual list
      const finalEmails = [...autoList.filter(p => !removals.includes(p.email)).map(p => p.email), ...additions];
      return Array.from(new Set(finalEmails));
    };

    const spEmails = resolveList('salesPro', trainingData[partner.id]?.salesPro || []);
    const tpEmails = resolveList('techPro', trainingData[partner.id]?.techPro || []);
    const bcEmails = resolveList('bootcamp', (trainingData[partner.id]?.bootcamp || []).filter(p => !!p.date && p.date >= '2026-02-02'));
    const isEmails = resolveList('implSpec', trainingData[partner.id]?.implSpec || []);
    const smEmails = resolveList('simplyPure', trainingData[partner.id]?.simplyPure || []);

    const afFAEmails = resolveList('aspFoundationsFA', trainingData[partner.id]?.aspFoundationsFA || []);
    const afFBEmails = resolveList('aspFoundationsFB', trainingData[partner.id]?.aspFoundationsFB || []);
    const asFAEmails = resolveList('storageProFA', trainingData[partner.id]?.storageProFA || []);
    const asFBEmails = resolveList('storageProFB', trainingData[partner.id]?.storageProFB || []);
    const auFAEmails = resolveList('supportSpecFA', trainingData[partner.id]?.supportSpecFA || []);
    const auFBEmails = resolveList('supportSpecFB', trainingData[partner.id]?.supportSpecFB || []);

    const foundationsTotal = Array.from(new Set([...afFAEmails, ...afFBEmails])).length;
    const storageTotal = Array.from(new Set([...asFAEmails, ...asFBEmails])).length;
    const supportTotal = Array.from(new Set([...auFAEmails, ...auFBEmails])).length;

  const requirements: EnablementRequirements = {
    salesPro: { required: tierDef.enablement.salesPro, obtained: spEmails.length, manualEmails: mod.addedEmails['salesPro'] || [] },
    techPro: { required: tierDef.enablement.techPro, obtained: tpEmails.length, manualEmails: mod.addedEmails['techPro'] || [] },
    bootcamp: { required: tierDef.enablement.bootcamp, obtained: bcEmails.length, manualEmails: mod.addedEmails['bootcamp'] || [] },
    implSpec: { required: tierDef.enablement.implSpec, obtained: isEmails.length, manualEmails: mod.addedEmails['implSpec'] || [] },
    simplyPure: { required: tierDef.enablement.simplyPure, obtained: smEmails.length, manualEmails: mod.addedEmails['simplyPure'] || [] },
    aspFoundations: { required: tierDef.enablement.aspFoundations, obtainedFA: afFAEmails.length, obtainedFB: afFBEmails.length, totalObtained: foundationsTotal, manualEmails: [...(mod.addedEmails['aspFoundationsFA'] || []), ...(mod.addedEmails['aspFoundationsFB'] || [])] },
    aspStoragePro: { required: tierDef.enablement.aspStoragePro, obtainedFA: asFAEmails.length, obtainedFB: asFBEmails.length, totalObtained: storageTotal, manualEmails: [...(mod.addedEmails['storageProFA'] || []), ...(mod.addedEmails['storageProFB'] || [])] },
    aspSupportSpec: { required: tierDef.enablement.aspSupportSpec, obtainedFA: auFAEmails.length, obtainedFB: auFBEmails.length, totalObtained: supportTotal, manualEmails: [...(mod.addedEmails['supportSpecFA'] || []), ...(mod.addedEmails['supportSpecFB'] || [])] },
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

import { useAuth } from './AuthContext';

export function ModificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [modifications, setModifications] = useState<GapModification[]>(loadModifications);
  const [history, setHistory] = useState<GapModification[]>(loadHistory);
  const [events, setEvents] = useState<RoadmapEvent[]>(loadEvents);
  const [globalRoadmap, setGlobalRoadmapState] = useState<any[] | null>(loadGlobalRoadmap);
  const [partnerTimelines, setPartnerTimelinesState] = useState<Record<number, any[]>>(loadPartnerTimelines);
  const [addedGlobalUsers, setAddedGlobalUsersState] = useState<GlobalUser[]>(loadAddedGlobalUsers);
  const [userRoles, setUserRolesState] = useState<Record<string, "Admin" | "Sales" | "Technical">>(loadUserRoles);

  const setGlobalRoadmap = useCallback((data: any[] | null) => {
    setGlobalRoadmapState(data);
    saveGlobalRoadmap(data);
  }, []);

  const updatePartnerTimeline = useCallback((partnerId: number, timeline: any[]) => {
    setPartnerTimelinesState(prev => {
      const next = { ...prev, [partnerId]: timeline };
      savePartnerTimelines(next);
      return next;
    });
  }, []);

  const modifiedPartners = useMemo(() => {
    let sourcePartners = basePartners;
    
    // ROW-LEVEL SECURITY: If logged in as partner, filter their visible dataset instantly
    if (user?.role === 'partner' && user.domain) {
      sourcePartners = basePartners.filter(p => p.domain === user.domain);
    }

    return sourcePartners.map((partner) => {
      const mod = modifications.find((m) => m.partnerId === partner.id);
      if (mod) return applyModification(partner, mod);
      return partner;
    });
  }, [modifications, user]);

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

  const addEvent = useCallback((event: Omit<RoadmapEvent, "id">) => {
    const newEvent: RoadmapEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents((prev) => {
      const next = [...prev, newEvent];
      saveEvents(next);
      return next;
    });
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEvents(next);
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
          Math.min(p.requirements.implSpec.obtained, p.requirements.implSpec.required) +
          Math.min(p.requirements.simplyPure.obtained, p.requirements.simplyPure.required) +
          Math.min(p.requirements.aspFoundations.totalObtained, p.requirements.aspFoundations.required) +
          Math.min(p.requirements.aspStoragePro.totalObtained, p.requirements.aspStoragePro.required) +
          Math.min(p.requirements.aspSupportSpec.totalObtained, p.requirements.aspSupportSpec.required),
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
      const totalRevenueFY27 = filtered.reduce((s, p) => s + (p.revenueData.revenueFY27 ?? 0), 0);
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
          "Simply Pure Gap": Math.max(0, p.requirements.simplyPure.required - p.requirements.simplyPure.obtained),
          "ASP Found Gap": Math.max(0, p.requirements.aspFoundations.required - p.requirements.aspFoundations.totalObtained),
          "ASP Storage Gap": Math.max(0, p.requirements.aspStoragePro.required - p.requirements.aspStoragePro.totalObtained),
          "ASP Support Gap": Math.max(0, p.requirements.aspSupportSpec.required - p.requirements.aspSupportSpec.totalObtained),
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
      const simplyMet = filtered.filter((p) => p.requirements.simplyPure.obtained >= p.requirements.simplyPure.required).length;
      const foundationsMet = filtered.filter((p) => p.requirements.aspFoundations.totalObtained >= p.requirements.aspFoundations.required).length;
      const storageMet = filtered.filter((p) => p.requirements.aspStoragePro.totalObtained >= p.requirements.aspStoragePro.required).length;
      const supportMet = filtered.filter((p) => p.requirements.aspSupportSpec.totalObtained >= p.requirements.aspSupportSpec.required).length;

      return [
        { category: "Sales Pro", count: spMet, percentage: Math.round((spMet / total) * 100), color: "var(--color-pure-orange)" },
        { category: "Tech Pro", count: tspMet, percentage: Math.round((tspMet / total) * 100), color: "var(--color-basil-green)" },
        { category: "Bootcamp", count: bootMet, percentage: Math.round((bootMet / total) * 100), color: "var(--color-moss-green)" },
        { category: "Impl Specialist", count: implMet, percentage: Math.round((implMet / total) * 100), color: "var(--color-cinnamon-brown)" },
        { category: "Simply Pure", count: simplyMet, percentage: Math.round((simplyMet / total) * 100), color: "var(--color-pure-orange)" },
        { category: "ASP Support", count: supportMet, percentage: Math.round((supportMet / total) * 100), color: "var(--color-ash-gray)" },
      ];
    },
    []
  );

  const addGlobalUser = useCallback((user: GlobalUser) => {
    setAddedGlobalUsersState(prev => {
      const exists = prev.some(u => u.email === user.email);
      if (exists) return prev;
      const next = [...prev, user];
      localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeGlobalUser = useCallback((email: string) => {
    setAddedGlobalUsersState(prev => {
      const next = prev.filter(u => u.email !== email);
      localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateUserRole = useCallback((email: string, role: "Admin" | "Sales" | "Technical") => {
    setUserRolesState(prev => {
      const next = { ...prev, [email.toLowerCase()]: role };
      localStorage.setItem(GLOBAL_USER_ROLES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const computedGlobalDirectory = useMemo(() => {
    const directoryMap = new Map<string, GlobalUser>();
    
    // Add manual users first
    addedGlobalUsers.forEach(u => directoryMap.set(u.email.toLowerCase(), {
      ...u,
      role: userRoles[u.email.toLowerCase()] || u.role || "Sales"
    }));

    // Crawl telemetry
    Object.values(trainingData).forEach(ptd => {
      Object.values(ptd).forEach((arr: any[]) => {
        arr?.forEach(p => {
          if (p && p.email && !directoryMap.has(p.email.toLowerCase())) {
            directoryMap.set(p.email.toLowerCase(), {
              email: p.email.toLowerCase(),
              firstName: p.firstName || p.email.split('@')[0],
              lastName: p.lastName || '',
              source: "telemetry",
              role: userRoles[p.email.toLowerCase()] || "Sales"
            });
          }
        });
      });
    });

    return Array.from(directoryMap.values()).sort((a, b) => a.email.localeCompare(b.email));
  }, [addedGlobalUsers, userRoles]);

  return (
    <ModificationContext.Provider
      value={{
        modifications,
        modifiedPartners,
        events,
        addModification,
        removeModification,
        getModification,
        getModificationHistory,
        allModificationHistory: history,
        filterModifiedPartners,
        getModifiedKPIs,
        getModifiedGapBreakdown,
        getModifiedEnablementDistribution,
        addEvent,
        removeEvent,
        globalRoadmap,
        setGlobalRoadmap,
        partnerTimelines,
        updatePartnerTimeline,
        addedGlobalUsers,
        addGlobalUser,
        removeGlobalUser,
        computedGlobalDirectory,
        updateUserRole
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
