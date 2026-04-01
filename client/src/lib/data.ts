/*
 * CampaignIQ Dashboard — FY27 Global Reseller Program Tier Compliance
 * Elite Zone B (South Africa) enablement requirements vs obtained
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

// ─── Types ──────────────────────────────────────────────────

export type ComplianceFilter = "all" | "tier1" | "tier2" | "tier3";

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

/** Elite Zone B requirements: 5 SP, 3 TSP, 2 Bootcamp, 1 Impl Spec */
export interface EliteRequirements {
  salesPro: { required: number; obtained: number };
  techPro: { required: number; obtained: number };
  bootcamp: { required: number; obtained: number };
  implSpec: { required: number; obtained: number };
}

export interface Partner {
  id: number;
  name: string;
  tier: "tier1" | "tier2" | "tier3";
  tierLabel: string;
  requirements: EliteRequirements;
  totalGaps: number;
  enablementScore: number; // percentage of requirements met
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

// ─── Elite Zone B Requirements ──────────────────────────────

export const ELITE_ZONE_B = {
  salesPro: 5,
  techPro: 3,
  bootcamp: 2,
  implSpec: 1,
  total: 11,
};

// ─── Tier Definitions ───────────────────────────────────────

export const TIER_CONFIG = {
  tier1: {
    label: "Top Performers",
    description: "Met Course & Cert Baseline; Only Missing Bootcamp",
    bg: "oklch(0.60 0.12 175 / 0.10)",
    color: "oklch(0.45 0.12 175)",
    gradient: "linear-gradient(135deg, oklch(0.60 0.12 175 / 0.06), oklch(0.60 0.12 175 / 0.01))",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
    iconColor: "oklch(0.50 0.12 175)",
    activeRing: "oklch(0.55 0.12 175)",
  },
  tier2: {
    label: "Mid-Tier",
    description: "Missing Implementation Specialist & Bootcamp",
    bg: "oklch(0.75 0.14 75 / 0.12)",
    color: "oklch(0.58 0.14 75)",
    gradient: "linear-gradient(135deg, oklch(0.75 0.14 75 / 0.06), oklch(0.75 0.14 75 / 0.01))",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
    iconColor: "oklch(0.60 0.14 75)",
    activeRing: "oklch(0.65 0.14 75)",
  },
  tier3: {
    label: "Falling Behind",
    description: "Heavy Course & Certification Gaps",
    bg: "oklch(0.62 0.19 15 / 0.10)",
    color: "oklch(0.50 0.19 15)",
    gradient: "linear-gradient(135deg, oklch(0.62 0.19 15 / 0.06), oklch(0.62 0.19 15 / 0.01))",
    iconBg: "oklch(0.62 0.19 15 / 0.12)",
    iconColor: "oklch(0.52 0.19 15)",
    activeRing: "oklch(0.57 0.19 15)",
  },
};

// ─── Helper to compute gaps ─────────────────────────────────

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

function makePartner(
  id: number,
  name: string,
  tier: Partner["tier"],
  sp: number,
  tsp: number,
  boot: number,
  impl: number,
  action: string,
  emails: string[],
  exams: ExamRecord[] = []
): Partner {
  const requirements: EliteRequirements = {
    salesPro: { required: ELITE_ZONE_B.salesPro, obtained: sp },
    techPro: { required: ELITE_ZONE_B.techPro, obtained: tsp },
    bootcamp: { required: ELITE_ZONE_B.bootcamp, obtained: boot },
    implSpec: { required: ELITE_ZONE_B.implSpec, obtained: impl },
  };
  const totalExams = exams.reduce((s, e) => s + e.certifications.length, 0);
  return {
    id,
    name,
    tier,
    tierLabel: TIER_CONFIG[tier].label,
    requirements,
    totalGaps: computeGaps(requirements),
    enablementScore: computeScore(requirements),
    action,
    targetEmails: emails,
    exams,
    totalExams,
  };
}

// ─── Partners Data ──────────────────────────────────────────

export const partners: Partner[] = [
  // 🌟 Tier 1: Top Performers (4 partners) — Only missing Bootcamp
  makePartner(1, "Data Sciences Corporation", "tier1", 6, 5, 0, 2, "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and >1 Implementation Specialists. Send 2 engineers to in-person SE Bootcamp.", ["morne.groenewald@datasciences.co.za", "rudolf.vandergryp@datasciences.co.za"], [
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
  makePartner(2, "AXIZ (PTY) LTD", "tier1", 6, 3, 0, 1, "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and 1 Implementation Specialist.", ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"], [
    { email: "lerato.mabunda@axiz.com", certifications: ["Platform Positioning Certificate"] },
    { email: "adolph.strydom@axiz.com", certifications: ["Platform Positioning Exam", "Certified Architect Associate FlashArray", "FlashArray Implementation Specialist", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
    { email: "oscar.ronander@axiz.com", certifications: ["Platform Positioning Exam"] },
  ]),
  makePartner(3, "NTT DATA / Dimension Data", "tier1", 6, 4, 0, 2, "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, >3 Tech Pros, and >1 Implementation Specialists.", ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"], [
    { email: "kayode.fatoki@global.ntt", certifications: ["Certified FlashArray Support Specialist", "Certified FlashArray Implementation Specialist"] },
    { email: "angelo.campbell@global.ntt", certifications: ["Certified FlashArray Support Specialist", "FlashArray Implementation Specialist"] },
    { email: "mannes.nijeboer@global.ntt", certifications: ["Certified FlashBlade Implementation Specialist"] },
    { email: "kamalan.naraidoo@global.ntt", certifications: ["Certified FlashBlade Implementation Specialist"] },
    { email: "morne.frans@dimensiondata.com", certifications: ["FlashBlade Architect Associate"] },
  ]),
  makePartner(4, "Technology Corporate Mgmt (TCM)", "tier1", 5, 3, 0, 1, "Gap of 2 Bootcamp Attendees only. Compliant with >5 Sales Pros, 3 Tech Pros, and 1 Implementation Specialist.", ["colin.smith@tcm.co.za", "vishnu.naidoo@tcm.co.za"], [
    { email: "dierk.lobbecke@tcm.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
    { email: "vishnu.naidoo@tcm.co.za", certifications: ["Platform Positioning Certificate", "Platform Solutions Associate"] },
  ]),

  // 🟡 Tier 2: Mid-Tier (4 partners) — Missing Impl Specialist & Bootcamp
  makePartner(5, "iOCO Infrastructure Services", "tier2", 6, 4, 0, 0, "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have a top engineer pass the Implementation Specialist exam.", ["jacques.dejager@ioco.tech", "johan.grove@ioco.tech"]),
  makePartner(6, "FIRST TECHNOLOGY KZN", "tier2", 6, 4, 0, 0, "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have a top engineer pass the Implementation Specialist exam.", ["nonjabulot@ftechkzn.co.za", "steliosk@ftechkzn.co.za"]),
  makePartner(7, "Netsync Network Solutions", "tier2", 6, 3, 0, 0, "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Several engineers have taken prep courses; push them to pass the exam.", ["bbeggs@netsync.com", "lovalles@netsync.com"]),
  makePartner(8, "NEC XON SYSTEMS", "tier2", 5, 3, 0, 0, "Need 1 Implementation Specialist and 2 Bootcamp Attendees. Have Merwe Erasmus or Peter McGuigan pass the exam.", ["monique.pretorius@nec.xon.co.za", "peter.mcguigan@nec.xon.co.za"], [
    { email: "merwe.erasmus@nec.xon.co.za", certifications: ["FlashArray Architect Associate", "FlashArray Architect Professional", "FlashBlade Architect Associate"] },
  ]),

  // 🔴 Tier 3: Falling Behind (15 partners) — Heavy Course & Cert Gaps
  makePartner(9, "Altron Digital Business", "tier3", 1, 2, 0, 0, "Gap of 4 Sales Pros, 1 Tech Pro, 1 Impl Specialist, 2 Bootcamp. Push more engineers through Sales Pro and Tech Pro paths.", ["robert.mlombile@altron.com", "zane.maphalle@altron.com"], [
    { email: "williamrobert.souter@altron.com", certifications: ["Platform Positioning Certificate"] },
    { email: "zane.maphalle@altron.com", certifications: ["Platform Positioning Exam", "FlashArray Architect Associate", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
  ]),
  makePartner(10, "ITgility", "tier3", 2, 1, 0, 0, "Gap of 3 Sales Pros, 2 Tech Pros, 1 Impl Specialist, 2 Bootcamp.", ["envorp@itgility.co.za", "feliciat@itgility.co.za"], [
    { email: "jamesb@itgility.co.za", certifications: ["Platform Positioning Certificate"] },
  ]),
  makePartner(11, "Global Indirect Markets", "tier3", 1, 1, 0, 0, "Gap of 4 Sales Pros, 2 Tech Pros, 1 Impl Specialist, 2 Bootcamp.", ["eric.corbin@globalindirectmarkets.com"]),
  makePartner(12, "Triple H Technology Group", "tier3", 2, 0, 0, 0, "Gap of 3 Sales Pros, 3 Tech Pros, 1 Impl Specialist, 2 Bootcamp. Cross-train Justine, Kiewiet, and Frederik.", ["frederiks@triplehgroup.co.za"], [
    { email: "frederiks@triplehgroup.co.za", certifications: ["FlashArray Architect Associate"] },
  ]),
  makePartner(13, "Netstream Technology", "tier3", 0, 0, 0, 0, "Gap of 5 Sales Pros, 3 Tech Pros, 1 Impl Specialist, 2 Bootcamp. Zero recorded FY27 completions.", ["jcannon@netstreamtechinc.com", "dbrandt@netstreamtechinc.com"]),
  makePartner(14, "INTELLITECH SYSTEMS", "tier3", 0, 0, 0, 0, "High gap across all metrics. Require total enablement plan addressing the 5 Sales Pro and 3 Tech Pro minimums.", ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"]),
  makePartner(15, "FIRST TECHNOLOGY GROUP", "tier3", 0, 0, 0, 0, "High gap across all metrics. Cross-train Simone and Calvin to start the FY27 path.", ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"]),
  makePartner(16, "Storage Technology Svcs (Nexio)", "tier3", 0, 0, 0, 0, "High gap across all metrics. Have Charmaine and Tinyiko complete the Tech Pro path.", []),
  makePartner(17, "SITHABILE TECHNOLOGY SERVICES", "tier3", 0, 0, 0, 0, "High gap across all metrics. Zero completions — start from scratch.", []),
  makePartner(18, "NetStor", "tier3", 0, 0, 0, 0, "High gap across all metrics. Zero completions — start from scratch.", []),
  makePartner(19, "ETS INNOVATIONS", "tier3", 0, 0, 0, 0, "High gap across all metrics. Target engineers to start the FY27 path from scratch.", []),
  makePartner(20, "Lekonakonetsi Consulting", "tier3", 0, 0, 0, 0, "High gap across all metrics. Target engineers to start the FY27 path from scratch.", []),
  makePartner(21, "BCX", "tier3", 0, 0, 0, 0, "Gap of 5 Sales Pros, 3 Tech Pros, 1 Impl Specialist, 2 Bootcamp. Only Carla Clara has minor progress (Module 1 and Partner Program Training).", []),
  makePartner(22, "Netsource One", "tier3", 0, 0, 0, 0, "Gap of 5 Sales Pros, 3 Tech Pros, 1 Impl Specialist, 2 Bootcamp. Only Jacob Beck and Conner Williams have started minor modules.", []),
  makePartner(23, "NEXION Networks Pty Ltd", "tier3", 0, 0, 0, 0, "Gap of 5 Sales Pros, 3 Tech Pros, 1 Impl Specialist, 2 Bootcamp. Only Rex Tan has taken the Simply Pure course.", []),
];

// ─── Filter helpers ─────────────────────────────────────────

export function filterPartners(filter: ComplianceFilter): Partner[] {
  if (filter === "all") return partners;
  return partners.filter((p) => p.tier === filter);
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
    { category: "Sales Pro (5 req)", count: spMet, percentage: Math.round((spMet / total) * 100), color: "oklch(0.60 0.12 175)" },
    { category: "Tech Pro (3 req)", count: tspMet, percentage: Math.round((tspMet / total) * 100), color: "oklch(0.58 0.16 290)" },
    { category: "Bootcamp (2 req)", count: bootMet, percentage: Math.round((bootMet / total) * 100), color: "oklch(0.75 0.14 75)" },
    { category: "Impl Specialist (1 req)", count: implMet, percentage: Math.round((implMet / total) * 100), color: "oklch(0.62 0.19 15)" },
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
  const totalRequired = total * ELITE_ZONE_B.total;
  const avgScore = total > 0 ? Math.round(filtered.reduce((s, p) => s + p.enablementScore, 0) / total) : 0;
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
}

// ─── Computed Aggregates ────────────────────────────────────

const totalPartners = partners.length;
const totalExamsPassed = partners.reduce((s, p) => s + p.totalExams, 0);

// ─── Tier Distribution (for summary cards) ──────────────────

export const tierDistribution = [
  {
    tier: "tier1" as const,
    label: "Top Performers",
    count: partners.filter((p) => p.tier === "tier1").length,
    description: "Only missing Bootcamp",
  },
  {
    tier: "tier2" as const,
    label: "Mid-Tier",
    count: partners.filter((p) => p.tier === "tier2").length,
    description: "Missing Impl Spec + Bootcamp",
  },
  {
    tier: "tier3" as const,
    label: "Falling Behind",
    count: partners.filter((p) => p.tier === "tier3").length,
    description: "Heavy course & cert gaps",
  },
];

// ─── Sidebar Navigation ────────────────────────────────────

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "partners", label: "Partners", icon: "Building2", badge: totalPartners },
  { id: "tiers", label: "Tier Compliance", icon: "Shield" },
  { id: "gaps", label: "Gap Analysis", icon: "AlertTriangle" },
  { id: "certs", label: "Certifications", icon: "Award", badge: totalExamsPassed },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
