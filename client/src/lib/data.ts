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
  bm: BusinessMetrics = { bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null }
): Partner {
  const requirements = buildRequirements(programTier, sp, tsp, boot, impl);
  const totalExams = exams.reduce((s, e) => s + e.certifications.length, 0);
  const tierDef = TIER_DEFINITIONS[programTier];
  const enablementComp = isEnablementCompliant(requirements);
  const businessComp = isBusinessCompliant(bm, tierDef.businessMetrics);

  return {
    id,
    name,
    programTier,
    requirements,
    businessMetrics: bm,
    totalGaps: computeEnablementGaps(requirements),
    enablementScore: computeEnablementScore(requirements),
    enablementCompliant: enablementComp,
    businessCompliant: businessComp,
    overallCompliant: enablementComp && businessComp,
    action,
    targetEmails: emails,
    exams,
    totalExams,
  };
}

// ─── Partners Data ──────────────────────────────────────────
// All 23 SA partners — tagged to their program tier based on FY27 Gap Analysis
// Most are Elite Zone B; partners with minimal enablement are tagged Authorized/Preferred

export const partners: Partner[] = [
  // ── Elite Zone B Partners (8) — Strong enablement, targeting full Elite compliance ──
  makePartner(1, "Data Sciences Corporation", "elite", 6, 5, 0, 2,
    "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and >1 Implementation Specialists. Send 2 engineers to in-person SE Bootcamp.",
    ["morne.groenewald@datasciences.co.za", "rudolf.vandergryp@datasciences.co.za"],
    [
      { email: "jp.marais@datasciences.co.za", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "enrico.vanniekerk@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "antony@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "mekeal.beepath@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "irtond@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "rudolf.vandergryp@datasciences.co.za", certifications: ["Platform Positioning Certificate", "FlashArray Architect Associate", "FlashArray Architect Professional", "FlashBlade Architect Professional", "Platform Solutions Associate"] },
      { email: "koos.hattingh@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "mndeni.msibi@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "rukaya.najam@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "nelson.lopes@datasciences.co.za", certifications: ["FlashArray Architect Professional"] },
      { email: "kenny.thiart@datasciences.co.za", certifications: ["FlashArray Architect Professional", "FlashBlade Architect Professional"] },
    ]),
  makePartner(2, "AXIZ (PTY) LTD", "elite", 6, 3, 0, 1,
    "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and 1 Implementation Specialist.",
    ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"],
    [
      { email: "lerato.mabunda@axiz.com", certifications: ["Platform Positioning Certificate"] },
      { email: "adolph.strydom@axiz.com", certifications: ["Platform Positioning Exam", "Certified Architect Associate FlashArray", "FlashArray Implementation Specialist", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
      { email: "oscar.ronander@axiz.com", certifications: ["Platform Positioning Exam"] },
    ]),
  makePartner(3, "NTT DATA / Dimension Data", "elite", 6, 4, 0, 2,
    "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and >1 Implementation Specialists.",
    ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"],
    [
      { email: "kayode.fatoki@global.ntt", certifications: ["Certified FlashArray Support Specialist", "Certified FlashArray Implementation Specialist"] },
      { email: "angelo.campbell@global.ntt", certifications: ["Certified FlashArray Support Specialist", "FlashArray Implementation Specialist"] },
      { email: "mannes.nijeboer@global.ntt", certifications: ["Certified FlashBlade Implementation Specialist"] },
      { email: "kamalan.naraidoo@global.ntt", certifications: ["Certified FlashBlade Implementation Specialist"] },
      { email: "morne.frans@dimensiondata.com", certifications: ["FlashBlade Architect Associate"] },
    ]),
  makePartner(4, "Technology Corporate Mgmt (TCM)", "elite", 5, 3, 0, 1,
    "Gap of 2 Bootcamp Attendees only. Compliant with 5 Sales Pros, 3 Tech Pros, and 1 Implementation Specialist.",
    ["colin.smith@tcm.co.za", "vishnu.naidoo@tcm.co.za"],
    [
      { email: "dierk.lobbecke@tcm.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "vishnu.naidoo@tcm.co.za", certifications: ["Platform Positioning Certificate", "Platform Solutions Associate"] },
    ]),
  makePartner(5, "iOCO Infrastructure Services", "elite", 6, 4, 0, 0,
    "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have a top engineer pass the Implementation Specialist exam.",
    ["jacques.dejager@ioco.tech", "johan.grove@ioco.tech"]),
  makePartner(6, "FIRST TECHNOLOGY KZN", "elite", 6, 4, 0, 0,
    "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have a top engineer pass the Implementation Specialist exam.",
    ["nonjabulot@ftechkzn.co.za", "steliosk@ftechkzn.co.za"]),
  makePartner(7, "Netsync Network Solutions", "elite", 6, 3, 0, 0,
    "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Several engineers have taken prep courses; push them to pass the exam.",
    ["bbeggs@netsync.com", "lovalles@netsync.com"]),
  makePartner(8, "NEC XON SYSTEMS", "elite", 5, 3, 0, 0,
    "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have Merwe Erasmus or Peter McGuigan pass the exam.",
    ["monique.pretorius@nec.xon.co.za", "peter.mcguigan@nec.xon.co.za"],
    [{ email: "merwe.erasmus@nec.xon.co.za", certifications: ["FlashArray Architect Associate", "FlashArray Architect Professional", "FlashBlade Architect Associate"] }]),

  // ── Preferred Tier Partners (6) — Moderate enablement, building toward Elite ──
  makePartner(9, "Altron Digital Business", "preferred", 1, 2, 0, 0,
    "Gap of 1 Sales Pro. Push more engineers through Sales Pro path. Building toward Elite.",
    ["robert.mlombile@altron.com", "zane.maphalle@altron.com"],
    [
      { email: "williamrobert.souter@altron.com", certifications: ["Platform Positioning Certificate"] },
      { email: "zane.maphalle@altron.com", certifications: ["Platform Positioning Exam", "FlashArray Architect Associate", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
    ]),
  makePartner(10, "ITgility", "preferred", 2, 1, 0, 0,
    "Need 1 more Tech Pro. Push James through the Tech Pro path.",
    ["envorp@itgility.co.za", "feliciat@itgility.co.za"],
    [{ email: "jamesb@itgility.co.za", certifications: ["Platform Positioning Certificate"] }]),
  makePartner(11, "Global Indirect Markets", "preferred", 1, 1, 0, 0,
    "Need 1 more Sales Pro and 1 more Tech Pro. Start with Bootcamp attendance.",
    ["eric.corbin@globalindirectmarkets.com"]),
  makePartner(12, "Triple H Technology Group", "preferred", 2, 0, 0, 0,
    "Need 2 Tech Pros and 1 Bootcamp. Cross-train Justine, Kiewiet, and Frederik.",
    ["frederiks@triplehgroup.co.za"],
    [{ email: "frederiks@triplehgroup.co.za", certifications: ["FlashArray Architect Associate"] }]),
  makePartner(13, "Netstream Technology", "preferred", 0, 0, 0, 0,
    "Zero recorded FY27 completions. Start with Sales Pro and Tech Pro courses.",
    ["jcannon@netstreamtechinc.com", "dbrandt@netstreamtechinc.com"]),
  makePartner(14, "INTELLITECH SYSTEMS", "preferred", 0, 0, 0, 0,
    "High gap across all metrics. Require total enablement plan addressing Sales Pro and Tech Pro minimums.",
    ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"]),

  // ── Authorized Tier Partners (9) — Early-stage, minimal enablement ──
  makePartner(15, "FIRST TECHNOLOGY GROUP", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Cross-train Simone and Calvin to start the FY27 path.",
    ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"]),
  makePartner(16, "Storage Technology Svcs (Nexio)", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Have Charmaine and Tinyiko complete the Tech Pro path.",
    []),
  makePartner(17, "SITHABILE TECHNOLOGY SERVICES", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Zero completions — start from scratch.",
    []),
  makePartner(18, "NetStor", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Zero completions — start from scratch.",
    []),
  makePartner(19, "ETS INNOVATIONS", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Target engineers to start the FY27 path from scratch.",
    []),
  makePartner(20, "Lekonakonetsi Consulting", "authorized", 0, 0, 0, 0,
    "High gap across all metrics. Target engineers to start the FY27 path from scratch.",
    []),
  makePartner(21, "BCX", "authorized", 0, 0, 0, 0,
    "Only Carla Clara has minor progress (Module 1 and Partner Program Training).",
    []),
  makePartner(22, "Netsource One", "authorized", 0, 0, 0, 0,
    "Only Jacob Beck and Conner Williams have started minor modules.",
    []),
  makePartner(23, "NEXION Networks Pty Ltd", "authorized", 0, 0, 0, 0,
    "Only Rex Tan has taken the Simply Pure course.",
    []),
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
  const businessCompliant = filtered.filter((p) => p.businessCompliant).length;

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
      label: "Enablement Gaps",
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
      changeLabel: `${businessCompliant} partners biz-compliant`,
      trend: "up",
      sparkline: [15, 20, 25, 30, 35, 38, totalExams],
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

const totalPartners = partners.length;
const totalExamsPassed = partners.reduce((s, p) => s + p.totalExams, 0);

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "partners", label: "Partners", icon: "Building2", badge: totalPartners },
  { id: "tiers", label: "Tier Compliance", icon: "Shield" },
  { id: "progression", label: "Tier Progression", icon: "TrendingUp" },
  { id: "gaps", label: "Gap Analysis", icon: "AlertTriangle" },
  { id: "certs", label: "Certifications", icon: "Award", badge: totalExamsPassed },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
