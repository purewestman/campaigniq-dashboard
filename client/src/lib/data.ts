/*
 * PEI Dashboard — FY27 Global Reseller Program Tier Compliance
 * 4-tier architecture: Authorized → Preferred → Elite (Zone B) → Ambassador
 * Compliance = Enablement & Certifications + Business Metrics
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

import { trainingData } from "./trainingData";
import { activityData } from "./activityData";

// ─── Program Tier Types ────────────────────────────────────

export type ProgramTier = "authorized" | "preferred" | "elite" | "ambassador";
export type ComplianceFilter = "all" | ProgramTier;

// Helpers
export function isLinkedDomain(userDomain: string | undefined, targetDomain: string | undefined): boolean {
  if (!userDomain || !targetDomain) return false;
  const ud = userDomain.toLowerCase();
  const td = targetDomain.toLowerCase();
  
  if (ud === td) return true;
  
  // Specific group rule: nttdata.com can see dimensiondata.com and global.ntt
  const nttGroup = ['nttdata.com', 'dimensiondata.com', 'global.ntt', 'ntt.com'];
  if (nttGroup.includes(ud) && nttGroup.includes(td)) {
      return true;
  }
  
  return false;
}

export interface EnablementRequirements {
  salesPro: { required: number; obtained: number; manualEmails?: string[] };
  techPro: { required: number; obtained: number; manualEmails?: string[] };
  bootcamp: { required: number; obtained: number; manualEmails?: string[] };
  implSpec: { required: number; obtained: number; manualEmails?: string[] };
  simplyPure: { required: number; obtained: number; manualEmails?: string[] };
  aspFoundations: { required: number; obtainedFA: number; obtainedFB: number; totalObtained: number; manualEmails?: string[] };
  aspStoragePro: { required: number; obtainedFA: number; obtainedFB: number; totalObtained: number; manualEmails?: string[] };
  aspSupportSpec: { required: number; obtainedFA: number; obtainedFB: number; totalObtained: number; manualEmails?: string[] };
}

export interface BusinessMetrics {
  bookingsUSD: number | null;       // non-renewal, in-year
  uniqueCustomers: number | null;   // non-renewal, in-year
  partnerDeliveredServices: number | null; // installations, in-year
}

export interface BusinessMetricThresholds {
  bookingsUSD: number | null;       // null = N/A
  uniqueCustomers: number | null;
  partnerDeliveredServices: number | null;
}

export interface TierDefinition {
  id: ProgramTier;
  label: string;
  shortLabel: string;
  description: string;
  enablement: {
    salesPro: number;
    techPro: number;
    bootcamp: number;
    implSpec: number;
    simplyPure: number;
    aspFoundations: number;
    aspStoragePro: number;
    aspSupportSpec: number;
    total: number;
  };
  businessMetrics: BusinessMetricThresholds;
  bg: string;
  color: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  activeRing: string;
  badgeClass: string;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "flat";
  sparkline: number[];
}

export interface PartnerFinancials {
  targetFY27: number;
  pipelineFY27: number;
  fy27Revenue: number;
  contributionFY27: number;
  drFY27: number;           // DR (P-S) count
  fy26Revenue: number;
  contributionFY26: number;
  fy25Revenue: number;
  fy24Revenue: number;
}

export interface RevenueData {
  revenueFY27: number;
  targetFY27: number;
  pipelineFY27: number;
  contributionFY27: number;
  drFY27: number;
  revenueFY26: number;
  revenueFY25: number;
}

export interface TrainingContacts {
  salesProContacts: number;
  techSalesProContacts: number;
  seBootcampContacts: number;
}

export interface PartnerMeta {
  region: string;
  pam: string;
  subRegion: string;
  statusFY27: string;
}

export interface ExamRecord {
  email: string;
  certifications: string[];
}

export interface Partner {
  id: number;
  name: string;
  programTier: ProgramTier;         // assigned program tier
  requirements: EnablementRequirements;
  businessMetrics: BusinessMetrics;  // manually entered
  totalGaps: number;                // enablement gaps only
  enablementScore: number;          // % of enablement requirements met
  enablementCompliant: boolean;     // all enablement requirements met
  businessCompliant: boolean;       // all business metric thresholds met
  overallCompliant: boolean;        // both enablement + business met
  action: string;
  targetEmails: string[];
  exams: ExamRecord[];
  totalExams: number;
  financials: PartnerFinancials | null;
  revenueData: RevenueData;
  trainingContacts: TrainingContacts;
  meta: PartnerMeta | null;
  domain: string;
}

export interface StatusCategory {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

// ─── Tier Definitions ───────────────────────────────────────

export const TIER_DEFINITIONS: Record<ProgramTier, TierDefinition> = {
  authorized: {
    id: "authorized",
    label: "Authorized",
    shortLabel: "Auth",
    description: "Entry-level partner tier with basic enablement",
    enablement: { salesPro: 1, techPro: 1, bootcamp: 0, implSpec: 0, simplyPure: 1, aspFoundations: 0, aspStoragePro: 0, aspSupportSpec: 0, total: 3 },
    businessMetrics: { bookingsUSD: null, uniqueCustomers: 1, partnerDeliveredServices: null },
    bg: "color-mix(in srgb, var(--color-ash-gray) 10%, transparent)",
    color: "var(--color-ash-gray)",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--color-ash-gray) 6%, transparent), color-mix(in srgb, var(--color-ash-gray) 1%, transparent))",
    iconBg: "color-mix(in srgb, var(--color-ash-gray) 12%, transparent)",
    iconColor: "var(--color-ash-gray)",
    activeRing: "var(--color-ash-gray)",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  preferred: {
    id: "preferred",
    label: "Preferred",
    shortLabel: "Pref",
    description: "Mid-level partner with expanded enablement",
    enablement: { salesPro: 2, techPro: 2, bootcamp: 1, implSpec: 0, simplyPure: 2, aspFoundations: 2, aspStoragePro: 2, aspSupportSpec: 2, total: 13 },
    businessMetrics: { bookingsUSD: null, uniqueCustomers: 2, partnerDeliveredServices: null },
    bg: "color-mix(in srgb, var(--color-moss-green) 12%, transparent)",
    color: "var(--color-moss-green)",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--color-moss-green) 6%, transparent), color-mix(in srgb, var(--color-moss-green) 1%, transparent))",
    iconBg: "color-mix(in srgb, var(--color-moss-green) 12%, transparent)",
    iconColor: "var(--color-moss-green)",
    activeRing: "var(--color-moss-green)",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  elite: {
    id: "elite",
    label: "Elite (Zone B)",
    shortLabel: "Elite",
    description: "Advanced partner with full enablement suite",
    enablement: { salesPro: 5, techPro: 3, bootcamp: 2, implSpec: 1, simplyPure: 5, aspFoundations: 2, aspStoragePro: 2, aspSupportSpec: 2, total: 22 },
    businessMetrics: { bookingsUSD: 500000, uniqueCustomers: 3, partnerDeliveredServices: 5 },
    bg: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)",
    color: "var(--color-pure-orange)",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--color-pure-orange) 6%, transparent), color-mix(in srgb, var(--color-pure-orange) 1%, transparent))",
    iconBg: "color-mix(in srgb, var(--color-pure-orange) 12%, transparent)",
    iconColor: "var(--color-pure-orange)",
    activeRing: "var(--color-pure-orange)",
    badgeClass: "bg-teal-100 text-teal-700",
  },
  ambassador: {
    id: "ambassador",
    label: "Ambassador",
    shortLabel: "Amb",
    description: "Top-tier partner with highest enablement and business targets",
    enablement: { salesPro: 8, techPro: 5, bootcamp: 3, implSpec: 2, simplyPure: 8, aspFoundations: 2, aspStoragePro: 2, aspSupportSpec: 2, total: 32 },
    businessMetrics: { bookingsUSD: 10000000, uniqueCustomers: 10, partnerDeliveredServices: 15 },
    bg: "color-mix(in srgb, var(--color-basil-green) 10%, transparent)",
    color: "var(--color-basil-green)",
    gradient: "linear-gradient(135deg, color-mix(in srgb, var(--color-basil-green) 6%, transparent), color-mix(in srgb, var(--color-basil-green) 1%, transparent))",
    iconBg: "color-mix(in srgb, var(--color-basil-green) 12%, transparent)",
    iconColor: "var(--color-basil-green)",
    activeRing: "var(--color-basil-green)",
    badgeClass: "bg-purple-100 text-purple-700",
  },
};

// Legacy alias for backward compatibility
export const ELITE_ZONE_B = TIER_DEFINITIONS.elite.enablement;

// Legacy TIER_CONFIG mapping for components that still reference tier1/tier2/tier3
export const TIER_CONFIG = {
  tier1: { ...TIER_DEFINITIONS.elite },
  tier2: { ...TIER_DEFINITIONS.preferred },
  tier3: { ...TIER_DEFINITIONS.authorized },
};

// ─── Formatting Utilities ──────────────────────────────────

export function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value === null || value === undefined) return "—";
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}

export function getRevenueAttainment(partner: Partner): number | null {
  const { revenueFY27, targetFY27 } = partner.revenueData;
  if (!targetFY27) return null;
  return Math.round((revenueFY27 / targetFY27) * 100);
}

// ─── Helper Functions ──────────────────────────────────────

export function getTierDef(tier: ProgramTier): TierDefinition {
  return TIER_DEFINITIONS[tier];
}

/**
 * Generates a recommended action string for a partner based on their CURRENT
 * enablement and business metric gaps. Always reflects the live data — never
 * hard-coded — so it cannot fall out of sync with training or financial updates.
 */
export function generateRecommendedAction(partner: Partner): string {
  const tierDef = TIER_DEFINITIONS[partner.programTier];
  const { requirements, businessMetrics } = partner;

  // ── Enablement gaps ───────────────────────────────────────
  const enablementGaps: string[] = [];
  if (requirements.salesPro.obtained < requirements.salesPro.required) {
    const n = requirements.salesPro.required - requirements.salesPro.obtained;
    enablementGaps.push(`${n} more Sales Pro completion${n !== 1 ? "s" : ""} (${requirements.salesPro.obtained}/${requirements.salesPro.required})`);
  }
  if (requirements.techPro.obtained < requirements.techPro.required) {
    const n = requirements.techPro.required - requirements.techPro.obtained;
    enablementGaps.push(`${n} more Tech Pro completion${n !== 1 ? "s" : ""} (${requirements.techPro.obtained}/${requirements.techPro.required})`);
  }
  if (requirements.bootcamp.obtained < requirements.bootcamp.required) {
    const n = requirements.bootcamp.required - requirements.bootcamp.obtained;
    enablementGaps.push(`${n} more SE Bootcamp completion${n !== 1 ? "s" : ""} (${requirements.bootcamp.obtained}/${requirements.bootcamp.required})`);
  }
  if (requirements.implSpec.obtained < requirements.implSpec.required) {
    const n = requirements.implSpec.required - requirements.implSpec.obtained;
    enablementGaps.push(`${n} more Impl Spec completion${n !== 1 ? "s" : ""} (${requirements.implSpec.obtained}/${requirements.implSpec.required})`);
  }
  if (requirements.simplyPure.obtained < requirements.simplyPure.required) {
    const n = requirements.simplyPure.required - requirements.simplyPure.obtained;
    enablementGaps.push(`${n} more Simply Pure completion${n !== 1 ? "s" : ""} (${requirements.simplyPure.obtained}/${requirements.simplyPure.required})`);
  }
  if (requirements.aspFoundations.totalObtained < requirements.aspFoundations.required) {
    const n = requirements.aspFoundations.required - requirements.aspFoundations.totalObtained;
    enablementGaps.push(`${n} more ASP Foundations completion${n !== 1 ? "s" : ""} (${requirements.aspFoundations.totalObtained}/${requirements.aspFoundations.required})`);
  }
  if (requirements.aspStoragePro.totalObtained < requirements.aspStoragePro.required) {
    const n = requirements.aspStoragePro.required - requirements.aspStoragePro.totalObtained;
    enablementGaps.push(`${n} more Storage Pro completion${n !== 1 ? "s" : ""} (${requirements.aspStoragePro.totalObtained}/${requirements.aspStoragePro.required})`);
  }
  if (requirements.aspSupportSpec.totalObtained < requirements.aspSupportSpec.required) {
    const n = requirements.aspSupportSpec.required - requirements.aspSupportSpec.totalObtained;
    enablementGaps.push(`${n} more Support Spec completion${n !== 1 ? "s" : ""} (${requirements.aspSupportSpec.totalObtained}/${requirements.aspSupportSpec.required})`);
  }

  // ── Business metric gaps ──────────────────────────────────
  const businessGaps: string[] = [];
  const bm = tierDef.businessMetrics;
  if (bm.bookingsUSD !== null) {
    const current = businessMetrics.bookingsUSD ?? 0;
    if (current < bm.bookingsUSD) {
      const remaining = formatCurrency(bm.bookingsUSD - current, true);
      businessGaps.push(`${remaining} more in bookings (${formatCurrency(current, true)} of ${formatCurrency(bm.bookingsUSD, true)} required)`);
    }
  }
  if (bm.uniqueCustomers !== null) {
    const current = businessMetrics.uniqueCustomers ?? 0;
    if (current < bm.uniqueCustomers) {
      businessGaps.push(`${bm.uniqueCustomers - current} more unique customer${bm.uniqueCustomers - current !== 1 ? "s" : ""} (${current}/${bm.uniqueCustomers} required)`);
    }
  }
  if (bm.partnerDeliveredServices !== null) {
    const current = businessMetrics.partnerDeliveredServices ?? 0;
    if (current < bm.partnerDeliveredServices) {
      businessGaps.push(`${bm.partnerDeliveredServices - current} more partner-delivered installation${bm.partnerDeliveredServices - current !== 1 ? "s" : ""} (${current}/${bm.partnerDeliveredServices} required)`);
    }
  }

  // ── Build output ──────────────────────────────────────────
  if (enablementGaps.length === 0 && businessGaps.length === 0) {
    return `All ${tierDef.label} tier requirements met. Sustain training activity and business metrics to maintain ${tierDef.shortLabel} status.`;
  }

  const lines: string[] = [];
  if (enablementGaps.length > 0) {
    lines.push(`Enablement outstanding — complete: ${enablementGaps.join("; ")}.`);
  }
  if (businessGaps.length > 0) {
    lines.push(`Business criteria outstanding — close: ${businessGaps.join("; ")}.`);
  }
  return lines.join(" ");
}

export function computeEnablementGaps(reqs: EnablementRequirements): number {
  return (
    Math.max(0, reqs.salesPro.required - reqs.salesPro.obtained) +
    Math.max(0, reqs.techPro.required - reqs.techPro.obtained) +
    Math.max(0, reqs.bootcamp.required - reqs.bootcamp.obtained) +
    Math.max(0, reqs.implSpec.required - reqs.implSpec.obtained) +
    Math.max(0, reqs.simplyPure.required - reqs.simplyPure.obtained) +
    Math.max(0, reqs.aspFoundations.required - reqs.aspFoundations.totalObtained) +
    Math.max(0, reqs.aspStoragePro.required - reqs.aspStoragePro.totalObtained) +
    Math.max(0, reqs.aspSupportSpec.required - reqs.aspSupportSpec.totalObtained)
  );
}

export function computeEnablementScore(reqs: EnablementRequirements): number {
  const totalRequired =
    reqs.salesPro.required + reqs.techPro.required +
    reqs.bootcamp.required + reqs.implSpec.required +
    reqs.simplyPure.required + 
    reqs.aspFoundations.required + reqs.aspStoragePro.required + reqs.aspSupportSpec.required;
  if (totalRequired === 0) return 100;
  const obtained =
    Math.min(reqs.salesPro.obtained, reqs.salesPro.required) +
    Math.min(reqs.techPro.obtained, reqs.techPro.required) +
    Math.min(reqs.bootcamp.obtained, reqs.bootcamp.required) +
    Math.min(reqs.implSpec.obtained, reqs.implSpec.required) +
    Math.min(reqs.simplyPure.obtained, reqs.simplyPure.required) +
    Math.min(reqs.aspFoundations.totalObtained, reqs.aspFoundations.required) +
    Math.min(reqs.aspStoragePro.totalObtained, reqs.aspStoragePro.required) +
    Math.min(reqs.aspSupportSpec.totalObtained, reqs.aspSupportSpec.required);
  return Math.round((obtained / totalRequired) * 100);
}

export function isEnablementCompliant(reqs: EnablementRequirements): boolean {
  return (
    reqs.salesPro.obtained >= reqs.salesPro.required &&
    reqs.techPro.obtained >= reqs.techPro.required &&
    reqs.bootcamp.obtained >= reqs.bootcamp.required &&
    reqs.implSpec.obtained >= reqs.implSpec.required &&
    reqs.simplyPure.obtained >= reqs.simplyPure.required &&
    reqs.aspFoundations.totalObtained >= reqs.aspFoundations.required &&
    reqs.aspStoragePro.totalObtained >= reqs.aspStoragePro.required &&
    reqs.aspSupportSpec.totalObtained >= reqs.aspSupportSpec.required
  );
}

export function isBusinessCompliant(
  metrics: BusinessMetrics,
  thresholds: BusinessMetricThresholds
): boolean {
  if (thresholds.bookingsUSD !== null && (metrics.bookingsUSD === null || metrics.bookingsUSD < thresholds.bookingsUSD)) return false;
  if (thresholds.uniqueCustomers !== null && (metrics.uniqueCustomers === null || metrics.uniqueCustomers < thresholds.uniqueCustomers)) return false;
  if (thresholds.partnerDeliveredServices !== null && (metrics.partnerDeliveredServices === null || metrics.partnerDeliveredServices < thresholds.partnerDeliveredServices)) return false;
  return true;
}

export function buildRequirements(
  tier: ProgramTier,
  sp: number,
  tsp: number,
  boot: number,
  impl: number,
  simp: number,
  fTotal: number,
  sTotal: number,
  uTotal: number,
  afFA: number, afFB: number,
  asFA: number, asFB: number,
  auFA: number, auFB: number,
  manualEmails: Partial<Record<keyof EnablementRequirements, string[]>> = {}
): EnablementRequirements {
  const def = TIER_DEFINITIONS[tier].enablement;
  
  return {
    salesPro: { required: def.salesPro, obtained: sp, manualEmails: manualEmails.salesPro },
    techPro: { required: def.techPro, obtained: tsp, manualEmails: manualEmails.techPro },
    bootcamp: { required: def.bootcamp, obtained: boot, manualEmails: manualEmails.bootcamp },
    implSpec: { required: def.implSpec, obtained: impl, manualEmails: manualEmails.implSpec },
    simplyPure: { required: def.simplyPure, obtained: simp, manualEmails: manualEmails.simplyPure },
    aspFoundations: { required: def.aspFoundations, obtainedFA: afFA, obtainedFB: afFB, totalObtained: fTotal, manualEmails: manualEmails.aspFoundations },
    aspStoragePro: { required: def.aspStoragePro, obtainedFA: asFA, obtainedFB: asFB, totalObtained: sTotal, manualEmails: manualEmails.aspStoragePro },
    aspSupportSpec: { required: def.aspSupportSpec, obtainedFA: auFA, obtainedFB: auFB, totalObtained: uTotal, manualEmails: manualEmails.aspSupportSpec },
  };
}

function makePartner(
  id: number,
  name: string,
  programTier: ProgramTier,
  sp: number,
  tsp: number,
  boot: number,
  impl: number,
  action: string,
  emails: string[],
  exams: ExamRecord[] = [],
  bm: BusinessMetrics = { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
  financials: PartnerFinancials | null = null,
  meta: PartnerMeta | null = null
): Partner {
  // When trainingData exists, use it as single source of truth for counts.
  // When it doesn't, try activityData filtered by category keywords.
  const td = trainingData[id];
  const getActivityCount = (keywords: string[]) => {
    const partnerActivity = activityData[name] || [];
    const uniqueEmails = new Set(
      partnerActivity
        .filter(a => keywords.some(k => a.activity.includes(k)))
        .map(a => a.email)
    );
    return uniqueEmails.size;
  };

  const resolvedSp  = td ? td.salesPro.length : getActivityCount(['Sales', 'Positioning', 'Business']);
  const resolvedTsp = td ? td.techPro.length  : getActivityCount(['Technical', 'Architect', 'Solution', 'Pre-Sales', 'Modernization']);
  const BOOTCAMP_CUTOFF = '2026-02-02';
  // Bootcamps ONLY count if passed after 2026-02-02. Without trainingData, we cannot verify dates → 0.
  const resolvedBoot = td ? td.bootcamp.filter(p => !!p.date && p.date >= BOOTCAMP_CUTOFF).length : 0;
  const resolvedImpl = td ? td.implSpec.length : getActivityCount(['Implementation']);
  const resolvedSimp = td ? td.simplyPure.length : 0;
  
  const afFA = td ? td.aspFoundationsFA.length : 0;
  const afFB = td ? td.aspFoundationsFB.length : 0;
  const asFA = td ? td.storageProFA.length : 0;
  const asFB = td ? td.storageProFB.length : 0;
  const auFA = td ? td.supportSpecFA.length : 0;
  const auFB = td ? td.supportSpecFB.length : 0;

  // UNIQUE COUNT logic for ASP (Ensures one person with both FA/FB only counts as 1 individual)
  const getUniqueCount = (l1: any[] = [], l2: any[] = []) => {
    const emails = new Set([...l1.map(p => p.email), ...l2.map(p => p.email)]);
    return emails.size;
  };

  const foundationsTotal = td ? getUniqueCount(td.aspFoundationsFA, td.aspFoundationsFB) : (afFA + afFB);
  const storageTotal = td ? getUniqueCount(td.storageProFA, td.storageProFB) : (asFA + asFB);
  const supportTotal = td ? getUniqueCount(td.supportSpecFA, td.supportSpecFB) : (auFA + auFB);

  const requirements = buildRequirements(programTier, resolvedSp, resolvedTsp, resolvedBoot, resolvedImpl, resolvedSimp, foundationsTotal, storageTotal, supportTotal, afFA, afFB, asFA, asFB, auFA, auFB);
  const totalExams = exams.reduce((s, e) => s + e.certifications.length, 0);
  const tierDef = TIER_DEFINITIONS[programTier];
  const enablementComp = isEnablementCompliant(requirements);

  // Revenue = Bookings USD — auto-populate bookingsUSD from fy27Revenue if not explicitly set
  const resolvedBm: BusinessMetrics = {
    ...bm,
    bookingsUSD: bm.bookingsUSD !== null ? bm.bookingsUSD : (financials ? financials.fy27Revenue : null),
  };
  const businessComp = isBusinessCompliant(resolvedBm, tierDef.businessMetrics);

  const revenueData: RevenueData = financials
    ? {
        revenueFY27: financials.fy27Revenue,
        targetFY27: financials.targetFY27,
        pipelineFY27: financials.pipelineFY27,
        contributionFY27: financials.contributionFY27,
        drFY27: financials.drFY27,
        revenueFY26: financials.fy26Revenue,
        revenueFY25: financials.fy25Revenue,
      }
    : { revenueFY27: 0, targetFY27: 0, pipelineFY27: 0, contributionFY27: 0, drFY27: 0, revenueFY26: 0, revenueFY25: 0 };

  const manualDomains: Record<number, string> = {
    1: "datasciences.co.za", 2: "axiz.com", 3: "nttdata.com", 4: "nec.xon.co.za",
    5: "ftechkzn.co.za", 6: "ioco.tech", 7: "sithabile.co.za", 8: "tcm.co.za",
    9: "altron.com", 10: "itgility.co.za", 11: "bcx.co.za", 12: "triplehgroup.co.za",
    13: "lekonakonetsi.co.za", 17: "cesmozambique.com", 18: "cesnamibia.com",
    19: "ceszambia.com", 20: "datasciences.co.uk", 24: "firstnet.co.za", 25: "ioco.tech",
    26: "kenac.co.zw", 28: "matlala.co.za", 29: "mbulase.co.za", 30: "ukuvela.co.za",
    31: "vmxperts.co.za"
  };

  let domain = manualDomains[id];
  if (!domain && emails.length > 0) {
    domain = emails[0].split('@')[1].toLowerCase();
  }
  if (!domain) {
    domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  }

  return {
    id,
    name,
    programTier,
    requirements,
    businessMetrics: resolvedBm,
    totalGaps: computeEnablementGaps(requirements),
    enablementScore: computeEnablementScore(requirements),
    enablementCompliant: enablementComp,
    businessCompliant: businessComp,
    overallCompliant: enablementComp && businessComp,
    action,
    targetEmails: emails,
    exams,
    totalExams,
    financials,
    revenueData,
    trainingContacts: {
      salesProContacts: resolvedSp,
      techSalesProContacts: resolvedTsp,
      seBootcampContacts: resolvedBoot,
    },
    meta,
    domain,
  };
}

// ─── Partners Data ──────────────────────────────────────────
// All 31 partners — tagged to their program tier based on FY27 Gap Analysis

export const partners: Partner[] = [
  // ── Tier 1: FULLY COMPLIANT (8 partners) ──
  makePartner(1, "Data Sciences Corporation", "elite", 13, 3, 4, 13,
    "Gap CLOSED. 18 certs across 11 SEs. $681K FY27 revenue, $21.2M pipeline.",
    ["steven.moore@datasciences.co.za", "howard@datasciences.co.za"],
    [
      { email: "jp.marais@datasciences.co.za", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "enrico.vanniekerk@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "antony@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "mekeal.beepath@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "irtond@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "rudolf.vandergryp@datasciences.co.za", certifications: ["Pure Platform Positioning Certificate", "Pure Storage FlashArray Architect Associate", "Pure Storage FlashArray Architect Professional Exam", "Pure Storage FlashBlade Architect Associate", "Pure Storage FlashBlade Architect Professional Exam", "Pure Storage Platform Solutions Associate"] },
      { email: "koos.hattingh@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashBlade Architect Associate"] },
      { email: "nelson.lopes@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Professional Exam"] },
      { email: "kenny.thiart@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Professional Exam", "Pure Storage FlashBlade Architect Professional Exam"] },
      { email: "rukaya.najam@datasciences.co.za", certifications: ["Pure Storage FlashBlade Architect Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: 4, partnerDeliveredServices: 9 },
    { targetFY27: 1000000, pipelineFY27: 21210081, fy27Revenue: 681950, contributionFY27: 0.37, drFY27: 87, fy26Revenue: 5111976, contributionFY26: 0.34, fy25Revenue: 6122066, fy24Revenue: 12991230 }),

  makePartner(2, "AXIZ (PTY) LTD", "elite", 6, 3, 2, 1,
    "Gap CLOSED. 7 certs across 3 SEs. Maintain Elite status.",
    ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"],
    [
      { email: "lerato.mabunda@axiz.com", certifications: ["Pure Platform Positioning Certificate"] },
      { email: "adolph.strydom@axiz.com", certifications: ["Pure Platform Positioning Exam", "Pure Storage Certified Architect Associate FlashArray", "Pure Storage FlashArray Implementation Specialist", "Pure Storage FlashBlade Architect Associate", "Pure Storage Platform Solutions Associate"] },
      { email: "oscar.ronander@axiz.com", certifications: ["Pure Platform Positioning Exam"] },
    ]),

  makePartner(3, "NTT DATA South Africa Proprietary Limited", "elite", 4, 2, 2, 5,
    "Gap CLOSED. 15 certs across 8 SEs. $68K FY27 revenue, $14.7M pipeline.",
    ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"],
    [
      { email: "kayode.fatoki@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist", "Pure Certified FlashArray Implementation Specialist"] },
      { email: "angelo.campbell@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist", "Pure Storage FlashArray Implementation Specialist"] },
      { email: "thulani.kunene@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "peetri.riekert@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "mannes.nijeboer@global.ntt", certifications: ["Pure Certified FlashArray Implementation Specialist", "Pure Certified FlashBlade Implementation Specialist"] },
      { email: "kamalan.naraidoo@global.ntt", certifications: ["Pure Certified FlashArray Implementation Specialist", "Pure Certified FlashBlade Implementation Specialist"] },
      { email: "lourens.jvrensburg@nttdata.com", certifications: ["Pure Storage Certified Architect Associate FlashBlade", "Pure Storage FlashArray Architect Associate"] },
      { email: "morne.frans@dimensiondata.com", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashArray Implementation Specialist", "Pure Storage FlashBlade Architect Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 14663939, fy27Revenue: 68427, contributionFY27: 0.04, drFY27: 34, fy26Revenue: 2582381, contributionFY26: 0.17, fy25Revenue: 917409, fy24Revenue: 0 }),

  makePartner(4, "NEC XON SYSTEMS (PTY) LTD", "elite", 6, 1, 2, 2,
    "Gap CLOSED. 3 certs, $11.8M pipeline. Focus on conversion.",
    ["monique.pretorius@nec.xon.co.za", "peter.mcguigan@nec.xon.co.za"],
    [
      { email: "merwe.erasmus@nec.xon.co.za", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashArray Architect Professional Exam", "Pure Storage FlashBlade Architect Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 11754114, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 29, fy26Revenue: 2313276, contributionFY26: 0.15, fy25Revenue: 1786458, fy24Revenue: 2009087 }),

  makePartner(5, "FIRST TECHNOLOGY KWAZULU NATAL (PTY) LTD", "elite", 18, 1, 4, 6,
    "Gap CLOSED. $369K FY27 revenue, $1.5M pipeline. 1 customer, 1 installation.",
    ["steliosk@ftechkzn.co.za"],
    [],
    { bookingsUSD: null, uniqueCustomers: 1, partnerDeliveredServices: 1 },
    { targetFY27: 1000000, pipelineFY27: 1474699, fy27Revenue: 368798, contributionFY27: 0.20, drFY27: 17, fy26Revenue: 1161197, contributionFY26: 0.08, fy25Revenue: 0, fy24Revenue: 0 }),

  makePartner(6, "iOCO Infrastructure Services", "elite", 7, 0, 1, 1,
    "Gap CLOSED. $3M pipeline, focus on conversion. 6 DRs in flight.",
    ["jacques.dejager@ioco.tech"],
    [],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 3048476, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 6, fy26Revenue: 0, contributionFY26: 0.0, fy25Revenue: 751411, fy24Revenue: 2271293 }),

  makePartner(7, "SITHABILE TECHNOLOGY SERVICES (PTY) LTD", "elite", 4, 0, 0, 1,
    "Gap CLOSED. High compliance. $1M pipeline, 4 DRs registered.",
    [],
    [],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 1049129, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 4, fy26Revenue: 722318, contributionFY26: 0.05, fy25Revenue: 723226, fy24Revenue: 1476692 }),

  makePartner(8, "Technology Corporate Management", "elite", 6, 0, 5, 3,
    "Gap CLOSED. $49K FY27 revenue, $1.6M pipeline. 3 certs on file.",
    ["vishnu.naidoo@tcm.co.za"],
    [
      { email: "dierk.lobbecke@tcm.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "vishnu.naidoo@tcm.co.za", certifications: ["Pure Platform Positioning Certificate", "Pure Storage Platform Solutions Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: 1, partnerDeliveredServices: 1 },
    { targetFY27: 1000000, pipelineFY27: 1636573, fy27Revenue: 49390, contributionFY27: 0.03, drFY27: 14, fy26Revenue: 749572, contributionFY26: 0.05, fy25Revenue: 400457, fy24Revenue: 1370355 }),

  // ── Tier 2: PARTIAL PROGRESS (5 partners) ──
  makePartner(9, "Altron Digital Business", "preferred", 10, 3, 3, 2,
    "Strong training activity. 6 certs on file. $194K pipeline, 2 DRs registered.",
    ["robert.mlombile@altron.com"],
    [
      { email: "williamrobert.souter@altron.com", certifications: ["Pure Platform Positioning Certificate"] },
      { email: "zane.maphalle@altron.com", certifications: ["Pure Platform Positioning Exam", "Pure Storage FlashArray Architect Associate", "Pure Storage FlashBlade Architect Associate", "Pure Storage Platform Solutions Associate"] },
      { email: "johan.westman@altron.com", certifications: ["Pure Platform Positioning Exam"] },
    ],
    { bookingsUSD: null, uniqueCustomers: 0, partnerDeliveredServices: 0 },
    { targetFY27: 1000000, pipelineFY27: 194302, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 2, fy26Revenue: 0, contributionFY26: 0.0, fy25Revenue: 0, fy24Revenue: 0 }),

  makePartner(10, "ITgility PTY (Ltd)", "preferred", 2, 1, 1, 1,
    "Gap of 1. 1 cert on file. $179K pipeline, 2 DRs registered.",
    ["envorp@itgility.co.za"],
    [
      { email: "jamesb@itgility.co.za", certifications: ["Pure Platform Positioning Certificate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 178588, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 2, fy26Revenue: 248321, contributionFY26: 0.02, fy25Revenue: 405146, fy24Revenue: 0 }),

  makePartner(11, "BCX", "preferred", 1, 1, 0, 0,
    "Gap of 2. Initial certifications in progress.",
    []),

  makePartner(12, "Triple H Technology Group", "preferred", 2, 0, 0, 0,
    "Gap of 2. 1 cert on file. $1.4M pipeline, 12 DRs registered.",
    ["frederiks@triplehgroup.co.za"],
    [
      { email: "frederiks@triplehgroup.co.za", certifications: ["Pure Storage FlashArray Architect Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: 1, partnerDeliveredServices: 0 },
    { targetFY27: 1000000, pipelineFY27: 1397860, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 12, fy26Revenue: 151860, contributionFY26: 0.01, fy25Revenue: 153427, fy24Revenue: 246160 }),

  makePartner(13, "Lekonakonetsi Consulting Services (PTY) LTD", "preferred", 3, 0, 0, 0,
    "Gap of 1. Sales path in progress. Push for Tech Pro and Bootcamp completions.",
    []),

  // ── Tier 3: AUTHORIZED / NEW SCOPE (18 partners) ──
  makePartner(14, "ALTRON FINANCE", "authorized", 0, 0, 0, 0,
    "High Gap. Enablement roadmap needed.", []),

  makePartner(15, "BILLION ROWS (PTY) LTD", "authorized", 1, 0, 0, 0,
    "1 sales path completion. Push for remaining enablement.", []),

  makePartner(16, "Bottomline IT", "authorized", 0, 0, 0, 0,
    "High Gap. No completions recorded.", []),

  makePartner(17, "Complete Enterprise Solutions Mozambique, Limitada", "authorized", 9, 1, 1, 2,
    "Strong training activity for regional partner. Push for Tech Pro and Impl Spec completions.", []),

  makePartner(18, "Complete Enterprise Solutions Namibia PTY Ltd", "authorized", 0, 0, 0, 0,
    "High Gap. $1.1M pipeline, 8 DRs registered.", [],
    [],
    { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null },
    { targetFY27: 1000000, pipelineFY27: 1079690, fy27Revenue: 0, contributionFY27: 0.0, drFY27: 8, fy26Revenue: 293007, contributionFY26: 0.02, fy25Revenue: 0, fy24Revenue: 0 }),

  makePartner(19, "Complete Enterprise Solutions Zambia, Ltd", "authorized", 1, 0, 1, 0,
    "Good Bootcamp completions. Prioritise Sales Pro and Tech Pro paths.", []),

  makePartner(20, "Data Sciences Corporation UK", "authorized", 0, 0, 0, 0,
    "High Gap. Subsidiary enablement pending.", []),

  makePartner(21, "Dimension Data Saudi Arabia", "authorized", 0, 0, 0, 0,
    "High Gap. Regional expansion target.", []),

  makePartner(22, "First Technology - Gauteng", "authorized", 0, 0, 0, 0,
    "High Gap. Zero completions.", []),

  makePartner(23, "FIRST TECHNOLOGY GROUP (PTY) LTD", "authorized", 0, 1, 0, 0,
    "1 Tech Pro completion. Prioritise Sales Pro, Bootcamp, and Impl Spec paths.", ["calvinm@firsttech.co.za"]),

  makePartner(24, "FirstNet", "authorized", 0, 0, 0, 0,
    "High Gap. Enablement plan required.", []),

  makePartner(25, "iOCO Cloud Services", "authorized", 0, 0, 0, 0,
    "High Gap. Zero completions.", []),

  makePartner(26, "Kenac Computer Systems (PVT) LTD", "authorized", 0, 0, 0, 0,
    "High Gap. Initial training pending.", []),

  makePartner(27, "Lcs Holdings", "authorized", 0, 0, 0, 0,
    "High Gap. Enablement roadmap needed.", []),

  makePartner(28, "MATLALA GROUP (PTY) LTD", "authorized", 1, 0, 0, 0,
    "1 sales path completion. Push for remaining enablement.", []),

  makePartner(29, "MBULASE GROUP", "authorized", 0, 0, 0, 0,
    "High Gap. New partner entry.", []),

  makePartner(30, "UKUVELA GROUP (PTY) LTD", "authorized", 0, 0, 0, 0,
    "High Gap. New partner entry.", []),

  makePartner(31, "Vmxperts (Pty) Ltd", "authorized", 0, 0, 0, 0,
    "High Gap. Initial engagement pending.", []),
];

// ─── Filter helpers ─────────────────────────────────────────

export function filterPartners(filter: ComplianceFilter): Partner[] {
  if (filter === "all") return partners;
  return partners.filter((p) => p.programTier === filter);
}

export function getFilteredGapBreakdown(filtered: Partner[]) {
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
      "ASP Foundations Gap": Math.max(0, p.requirements.aspFoundations.required - p.requirements.aspFoundations.totalObtained),
      "ASP Storage Pro Gap": Math.max(0, p.requirements.aspStoragePro.required - p.requirements.aspStoragePro.totalObtained),
      "ASP Support Spec Gap": Math.max(0, p.requirements.aspSupportSpec.required - p.requirements.aspSupportSpec.totalObtained),
    }));
}

export function getFilteredEnablementDistribution(filtered: Partner[]): StatusCategory[] {
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
}

export function getFilteredKPIs(filtered: Partner[]): KPIMetric[] {
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
  const avgScore = total > 0 ? Math.round(filtered.reduce((s, p) => s + p.enablementScore, 0) / total) : 0;
  const totalGaps = filtered.reduce((s, p) => s + p.totalGaps, 0);
  const totalExams = filtered.reduce((s, p) => s + p.totalExams, 0);
  const enablementCompliant = filtered.filter((p) => p.enablementCompliant).length;

  return [
    {
      id: "partners",
      label: "Total Partners",
      value: total.toString(),
      change: total - 11,
      changeLabel: "partners in FY27 scope",
      trend: "up",
      sparkline: [11, 14, 17, 19, 19, 19, total],
    },
    {
      id: "enablement",
      label: "Roadmap Score",
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
      changeLabel: `${enablementCompliant} partners fully enabled`,
      trend: "down",
      sparkline: [120, 110, 100, 90, 80, 75, totalGaps],
    },
    {
      id: "exams",
      label: "Exams Passed",
      value: totalExams.toString(),
      change: 5,
      changeLabel: "pinnacle certifications matched",
      trend: "up",
      sparkline: [5, 10, 15, 20, 25, 30, totalExams],
    },
  ];
}

// ─── Tier Distribution ────────────────────────────────────

export const PROGRAM_TIERS: ProgramTier[] = ["authorized", "preferred", "elite", "ambassador"];

export function getTierDistribution(partnerList: Partner[]) {
  return PROGRAM_TIERS.map((tier) => ({
    tier,
    ...TIER_DEFINITIONS[tier],
    count: partnerList.filter((p) => p.programTier === tier).length,
  }));
}

// ─── Sidebar Navigation ────────────────────────────────────

const totalPartnersCount = partners.length;
const totalExamsPassedCount = partners.reduce((s, p) => s + p.totalExams, 0);

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "training", label: "Training & Activity", icon: "Award", badge: totalExamsPassedCount },
  { id: "asp", label: "ASP Tracking", icon: "ShieldAlert" },
  { id: "planning", label: "Strategic Planning", icon: "Map" },
  { id: "enablement", label: "Enablement Plans", icon: "ClipboardList" },
  { id: "reports", label: "Reporting Center", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
