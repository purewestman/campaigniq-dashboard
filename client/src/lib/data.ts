/*
 * PEI Dashboard — FY27 Global Reseller Program Tier Compliance
 * 4-tier architecture: Authorized → Preferred → Elite (Zone B) → Ambassador
 * Compliance = Enablement & Certifications + Business Metrics
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

// ─── Program Tier Types ────────────────────────────────────

export type ProgramTier = "authorized" | "preferred" | "elite" | "ambassador";
export type ComplianceFilter = "all" | ProgramTier;

export interface EnablementRequirements {
  salesPro: { required: number; obtained: number };
  techPro: { required: number; obtained: number };
  bootcamp: { required: number; obtained: number };
  implSpec: { required: number; obtained: number };
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
    enablement: { salesPro: 1, techPro: 1, bootcamp: 0, implSpec: 0, total: 2 },
    businessMetrics: { bookingsUSD: null, uniqueCustomers: 1, partnerDeliveredServices: null },
    bg: "oklch(0.70 0.10 220 / 0.10)",
    color: "oklch(0.50 0.12 220)",
    gradient: "linear-gradient(135deg, oklch(0.70 0.10 220 / 0.06), oklch(0.70 0.10 220 / 0.01))",
    iconBg: "oklch(0.70 0.10 220 / 0.12)",
    iconColor: "oklch(0.50 0.12 220)",
    activeRing: "oklch(0.55 0.12 220)",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  preferred: {
    id: "preferred",
    label: "Preferred",
    shortLabel: "Pref",
    description: "Mid-level partner with expanded enablement",
    enablement: { salesPro: 2, techPro: 2, bootcamp: 1, implSpec: 0, total: 5 },
    businessMetrics: { bookingsUSD: null, uniqueCustomers: 2, partnerDeliveredServices: null },
    bg: "oklch(0.75 0.14 75 / 0.12)",
    color: "oklch(0.58 0.14 75)",
    gradient: "linear-gradient(135deg, oklch(0.75 0.14 75 / 0.06), oklch(0.75 0.14 75 / 0.01))",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
    iconColor: "oklch(0.60 0.14 75)",
    activeRing: "oklch(0.65 0.14 75)",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  elite: {
    id: "elite",
    label: "Elite (Zone B)",
    shortLabel: "Elite",
    description: "Advanced partner with full enablement suite",
    enablement: { salesPro: 5, techPro: 3, bootcamp: 2, implSpec: 1, total: 11 },
    businessMetrics: { bookingsUSD: 500000, uniqueCustomers: 3, partnerDeliveredServices: 5 },
    bg: "oklch(0.60 0.12 175 / 0.10)",
    color: "oklch(0.45 0.12 175)",
    gradient: "linear-gradient(135deg, oklch(0.60 0.12 175 / 0.06), oklch(0.60 0.12 175 / 0.01))",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
    iconColor: "oklch(0.50 0.12 175)",
    activeRing: "oklch(0.55 0.12 175)",
    badgeClass: "bg-teal-100 text-teal-700",
  },
  ambassador: {
    id: "ambassador",
    label: "Ambassador",
    shortLabel: "Amb",
    description: "Top-tier partner with highest enablement and business targets",
    enablement: { salesPro: 8, techPro: 5, bootcamp: 3, implSpec: 2, total: 18 },
    businessMetrics: { bookingsUSD: 10000000, uniqueCustomers: 10, partnerDeliveredServices: 15 },
    bg: "oklch(0.58 0.16 290 / 0.10)",
    color: "oklch(0.45 0.16 290)",
    gradient: "linear-gradient(135deg, oklch(0.58 0.16 290 / 0.06), oklch(0.58 0.16 290 / 0.01))",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
    iconColor: "oklch(0.48 0.16 290)",
    activeRing: "oklch(0.50 0.16 290)",
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

export function computeEnablementGaps(reqs: EnablementRequirements): number {
  return (
    Math.max(0, reqs.salesPro.required - reqs.salesPro.obtained) +
    Math.max(0, reqs.techPro.required - reqs.techPro.obtained) +
    Math.max(0, reqs.bootcamp.required - reqs.bootcamp.obtained) +
    Math.max(0, reqs.implSpec.required - reqs.implSpec.obtained)
  );
}

export function computeEnablementScore(reqs: EnablementRequirements): number {
  const totalRequired =
    reqs.salesPro.required + reqs.techPro.required +
    reqs.bootcamp.required + reqs.implSpec.required;
  if (totalRequired === 0) return 100;
  const obtained =
    Math.min(reqs.salesPro.obtained, reqs.salesPro.required) +
    Math.min(reqs.techPro.obtained, reqs.techPro.required) +
    Math.min(reqs.bootcamp.obtained, reqs.bootcamp.required) +
    Math.min(reqs.implSpec.obtained, reqs.implSpec.required);
  return Math.round((obtained / totalRequired) * 100);
}

export function isEnablementCompliant(reqs: EnablementRequirements): boolean {
  return (
    reqs.salesPro.obtained >= reqs.salesPro.required &&
    reqs.techPro.obtained >= reqs.techPro.required &&
    reqs.bootcamp.obtained >= reqs.bootcamp.required &&
    reqs.implSpec.obtained >= reqs.implSpec.required
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
  impl: number
): EnablementRequirements {
  const def = TIER_DEFINITIONS[tier].enablement;
  return {
    salesPro: { required: def.salesPro, obtained: sp },
    techPro: { required: def.techPro, obtained: tsp },
    bootcamp: { required: def.bootcamp, obtained: boot },
    implSpec: { required: def.implSpec, obtained: impl },
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
  const requirements = buildRequirements(programTier, sp, tsp, boot, impl);
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
      salesProContacts: sp,
      techSalesProContacts: tsp,
      seBootcampContacts: boot,
    },
    meta,
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
      { email: "enrico.vanniekerk@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "jp.marais@datasciences.co.za", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "nelson.lopes@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Professional Exam"] },
      { email: "antony@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "koos.hattingh@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashBlade Architect Associate"] },
      { email: "mekeal.beepath@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "kenny.thiart@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Professional Exam", "Pure Storage FlashBlade Architect Professional Exam"] },
      { email: "mndeni.msibi@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Associate"] },
      { email: "irtond@datasciences.co.za", certifications: ["Pure Certified FlashArray Implementation Specialist"] },
      { email: "rudolf.vandergryp@datasciences.co.za", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashBlade Architect Associate", "Pure Storage FlashArray Architect Professional Exam", "Pure Storage FlashBlade Architect Professional Exam", "Pure Platform Positioning Certificate", "Pure Storage Platform Solutions Associate"] },
      { email: "rukaya.najam@datasciences.co.za", certifications: ["Pure Storage FlashBlade Architect Associate"] },
    ],
    { bookingsUSD: null, uniqueCustomers: 4, partnerDeliveredServices: 9 },
    { targetFY27: 1000000, pipelineFY27: 21210081, fy27Revenue: 681950, contributionFY27: 0.37, drFY27: 87, fy26Revenue: 5111976, contributionFY26: 0.34, fy25Revenue: 6122066, fy24Revenue: 12991230 }),

  makePartner(2, "AXIZ (PTY) LTD", "elite", 6, 3, 2, 1,
    "Gap CLOSED. 7 certs across 3 SEs. Maintain Elite status.",
    ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"],
    [
      { email: "adolph.strydom@axiz.com", certifications: ["Pure Storage FlashBlade Architect Associate", "Pure Platform Positioning Exam", "Pure Storage FlashArray Implementation Specialist", "Pure Storage Platform Solutions Associate", "Pure Storage Certified Architect Associate FlashArray"] },
      { email: "oscar.ronander@axiz.com", certifications: ["Pure Platform Positioning Exam"] },
      { email: "lerato.mabunda@axiz.com", certifications: ["Pure Platform Positioning Certificate"] },
    ]),

  makePartner(3, "NTT DATA South Africa Proprietary Limited", "elite", 4, 2, 2, 5,
    "Gap CLOSED. 15 certs across 8 SEs. $68K FY27 revenue, $14.7M pipeline.",
    ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"],
    [
      { email: "mannes.nijeboer@global.ntt", certifications: ["Pure Certified FlashArray Implementation Specialist", "Pure Certified FlashBlade Implementation Specialist"] },
      { email: "morne.frans@dimensiondata.com", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage FlashBlade Architect Associate", "Pure Storage FlashArray Implementation Specialist"] },
      { email: "kayode.fatoki@global.ntt", certifications: ["Pure Certified FlashArray Implementation Specialist", "Pure Certifed FlashArray Support Specialist"] },
      { email: "angelo.campbell@global.ntt", certifications: ["Pure Storage FlashArray Implementation Specialist", "Pure Certifed FlashArray Support Specialist"] },
      { email: "thulani.kunene@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "kamalan.naraidoo@global.ntt", certifications: ["Pure Certified FlashArray Implementation Specialist", "Pure Certified FlashBlade Implementation Specialist"] },
      { email: "peetri.riekert@global.ntt", certifications: ["Pure Certifed FlashArray Support Specialist"] },
      { email: "lourens.jvrensburg@nttdata.com", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Storage Certified Architect Associate FlashBlade"] },
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
      { email: "zane.maphalle@altron.com", certifications: ["Pure Storage FlashArray Architect Associate", "Pure Platform Positioning Exam", "Pure Storage FlashBlade Architect Associate", "Pure Storage Platform Solutions Associate"] },
      { email: "johan.westman@altron.com", certifications: ["Pure Platform Positioning Exam"] },
      { email: "williamrobert.souter@altron.com", certifications: ["Pure Platform Positioning Certificate"] },
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
    }));
}

export function getFilteredEnablementDistribution(filtered: Partner[]): StatusCategory[] {
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
}

export function getFilteredKPIs(filtered: Partner[]): KPIMetric[] {
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
  { id: "partners", label: "Partners", icon: "Building2", badge: totalPartnersCount },
  { id: "tiers", label: "Tier Compliance", icon: "Shield" },
  { id: "progression", label: "Tier Progression", icon: "TrendingUp" },
  { id: "gaps", label: "Gap Analysis", icon: "AlertTriangle" },
  { id: "certs", label: "Certifications", icon: "Award", badge: totalExamsPassedCount },
  { id: "activity", label: "Activity Tracer", icon: "Activity" },
  { id: "asp", label: "ASP Tracker", icon: "ShieldAlert" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
