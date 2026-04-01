/*
 * CampaignIQ Dashboard — FY27 Partner SE Journey Gap Analysis & Training Roadmap
 * Updated data from the comprehensive FY27 document with exam records
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

// ─── Types ──────────────────────────────────────────────────

export type ComplianceFilter = "all" | "compliant" | "partial" | "high-gap";

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
  compliantSEs: number;
  seGap: number;
  spSEs: number; // Simply Pure completions
  tspSEs: number; // TSP completions
  gapType: string;
  action: string;
  targetEmails: string[];
  status: "compliant" | "partial" | "high-gap";
  journeyStep: number; // furthest step reached (1-6)
  exams: ExamRecord[]; // NEW: certification exam records
  totalExams: number; // NEW: total exams passed
}

export interface GapCategory {
  category: string;
  count: number;
  color: string;
  partnersAffected: number;
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

// ─── Partners Data ──────────────────────────────────────────

export const partners: Partner[] = [
  // ✅ Tier 1: Goal Met (Compliant)
  {
    id: 1,
    name: "AXIZ (PTY) LTD",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 3,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant. Register SEs for SE Bootcamp (Step 3) to continue the journey.",
    targetEmails: ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"],
    status: "compliant",
    journeyStep: 2,
    exams: [
      { email: "lerato.mabunda@axiz.com", certifications: ["Pure Platform Positioning Certificate"] },
      { email: "adolph.strydom@axiz.com", certifications: ["Pure Platform Positioning Exam", "Certified Architect Associate FlashArray", "FlashArray Implementation Specialist", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
      { email: "oscar.ronander@axiz.com", certifications: ["Pure Platform Positioning Exam"] },
    ],
    totalExams: 7,
  },

  // ⚠️ Tier 2: Partial Progress
  {
    id: 2,
    name: "Data Sciences Corporation",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 18,
    tspSEs: 3,
    gapType: "Need TSP overlap",
    action: "18 SEs have Simply Pure but only 1 (Freddie Kgari) has both. Target morne.groenewald and rudolf.vandergryp to complete TSP FY27.",
    targetEmails: ["morne.groenewald@datasciences.co.za", "rudolf.vandergryp@datasciences.co.za"],
    status: "partial",
    journeyStep: 6,
    exams: [
      { email: "jp.marais@datasciences.co.za", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "enrico.vanniekerk@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "antony@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "mekeal.beepath@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "irtond@datasciences.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "rudolf.vandergryp@datasciences.co.za", certifications: ["Platform Positioning Certificate", "FlashArray Architect Associate", "FlashArray Architect Professional", "FlashBlade Architect Associate", "FlashBlade Architect Professional", "Platform Solutions Associate"] },
      { email: "koos.hattingh@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "mndeni.msibi@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "rukaya.najam@datasciences.co.za", certifications: ["FlashArray Architect Associate"] },
      { email: "nelson.lopes@datasciences.co.za", certifications: ["FlashArray Architect Professional"] },
      { email: "kenny.thiart@datasciences.co.za", certifications: ["FlashArray Architect Professional", "FlashBlade Architect Professional"] },
    ],
    totalExams: 17,
  },
  {
    id: 3,
    name: "FIRST TECHNOLOGY KZN",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 11,
    tspSEs: 1,
    gapType: "Need TSP",
    action: "11 SEs have Simply Pure but only 1 (Stelios Kyriakides) has TSP. Target ramiror and nonjabulot to complete TSP FY27.",
    targetEmails: ["ramiror@ftechkzn.co.za", "nonjabulot@ftechkzn.co.za"],
    status: "partial",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },
  {
    id: 4,
    name: "Netsync Network Solutions",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 30,
    tspSEs: 2,
    gapType: "Need TSP overlap",
    action: "30 SEs have Simply Pure but only 1 (David Goss) has both. Mandate 2 more SP-trained engineers to finish the 6-hour TSP FY27 course.",
    targetEmails: ["bbeggs@netsync.com", "lovalles@netsync.com"],
    status: "partial",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },
  {
    id: 5,
    name: "NTT DATA South Africa",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 6,
    tspSEs: 2,
    gapType: "Need TSP overlap",
    action: "6 SEs have Simply Pure, 2 have TSP, but only 1 (Riaan Taylor) has both. Cross-train existing completers.",
    targetEmails: ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"],
    status: "partial",
    journeyStep: 6,
    exams: [
      { email: "kayode.fatoki@global.ntt", certifications: ["Certified FlashArray Support Specialist", "FlashArray Implementation Specialist"] },
      { email: "angelo.campbell@global.ntt", certifications: ["Certified FlashArray Support Specialist", "FlashArray Implementation Specialist"] },
      { email: "thulani.kunene@global.ntt", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "peetri.riekert@global.ntt", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "mannes.nijeboer@global.ntt", certifications: ["Certified FlashArray Implementation Specialist", "FlashBlade Implementation Specialist"] },
      { email: "kamalan.naraidoo@global.ntt", certifications: ["Certified FlashArray Implementation Specialist", "FlashBlade Implementation Specialist"] },
      { email: "lourens.jvrensburg@nttdata.com", certifications: ["Certified Architect Associate FlashBlade", "FlashArray Architect Associate"] },
      { email: "morne.frans@dimensiondata.com", certifications: ["FlashArray Architect Associate", "FlashArray Implementation Specialist", "FlashBlade Architect Associate"] },
    ],
    totalExams: 13,
  },
  {
    id: 6,
    name: "ITgility",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 2,
    tspSEs: 1,
    gapType: "Need TSP + new SE",
    action: "2 SEs need TSP FY27 plus 1 new SE needs both courses. Only James Barnardt has both.",
    targetEmails: ["envorp@itgility.co.za", "feliciat@itgility.co.za"],
    status: "partial",
    journeyStep: 2,
    exams: [
      { email: "jamesb@itgility.co.za", certifications: ["Pure Platform Positioning Certificate"] },
    ],
    totalExams: 1,
  },
  {
    id: 7,
    name: "Global Indirect Markets",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 2,
    tspSEs: 1,
    gapType: "Need TSP overlap",
    action: "2 SEs have Simply Pure, only Dylan Leeming has both. Target eric.corbin to complete TSP FY27.",
    targetEmails: ["eric.corbin@globalindirectmarkets.com"],
    status: "partial",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },

  // 🛑 Tier 3: Heavy Gaps / No Progress
  {
    id: 8,
    name: "INTELLITECH SYSTEMS",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 2,
    gapType: "Cross-train",
    action: "Shahirah has SP, Kavi and Collen have TSP — cross-train each to achieve the SP+TSP overlap.",
    targetEmails: ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"],
    status: "high-gap",
    journeyStep: 1,
    exams: [],
    totalExams: 0,
  },
  {
    id: 9,
    name: "FIRST TECHNOLOGY GROUP",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Cross-train + new SE",
    action: "Simone has SP, Calvin has TSP — cross-train each. Plus 1 brand new SE needs both courses.",
    targetEmails: ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"],
    status: "high-gap",
    journeyStep: 1,
    exams: [],
    totalExams: 0,
  },
  {
    id: 10,
    name: "ETS INNOVATIONS",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions for both courses. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: ["deon.van.vuuren@ets.group"],
    status: "high-gap",
    journeyStep: 0,
    exams: [],
    totalExams: 0,
  },
  {
    id: 11,
    name: "Lekonakonetsi Consulting",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions for both courses. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: ["nokulunga@lcsholdings.co.za"],
    status: "high-gap",
    journeyStep: 0,
    exams: [],
    totalExams: 0,
  },
];

// ─── Filter helpers ─────────────────────────────────────────

export function filterPartners(filter: ComplianceFilter): Partner[] {
  if (filter === "all") return partners;
  return partners.filter((p) => p.status === filter);
}

export function getFilteredGapBreakdown(filtered: Partner[]) {
  return filtered
    .filter((p) => p.seGap > 0)
    .sort((a, b) => b.seGap - a.seGap)
    .map((p) => ({
      partner: p.name.length > 22 ? p.name.substring(0, 20) + "…" : p.name,
      fullName: p.name,
      "SE Gap": p.seGap,
      "Has SP Only": Math.max(p.spSEs - p.compliantSEs, 0),
      "Has TSP Only": Math.max(p.tspSEs - p.compliantSEs, 0),
    }));
}

export function getFilteredJourneySteps(filtered: Partner[]): StatusCategory[] {
  const total = filtered.length;
  if (total === 0) return [];
  const stepCounts = [0, 1, 2, 3, 4, 5, 6].map(
    (step) => filtered.filter((p) => p.journeyStep === step).length
  );
  return [
    { category: "Not Started (Step 0)", count: stepCounts[0], percentage: Math.round((stepCounts[0] / total) * 100), color: "oklch(0.62 0.19 15)" },
    { category: "Simply Pure (Step 1)", count: stepCounts[1], percentage: Math.round((stepCounts[1] / total) * 100), color: "oklch(0.75 0.14 75)" },
    { category: "SP + TSP (Step 2)", count: stepCounts[2], percentage: Math.round((stepCounts[2] / total) * 100), color: "oklch(0.58 0.16 290)" },
    { category: "Electives (Step 5)", count: stepCounts[5], percentage: Math.round((stepCounts[5] / total) * 100), color: "oklch(0.60 0.12 175)" },
    { category: "Certifications (Step 6)", count: stepCounts[6], percentage: Math.round((stepCounts[6] / total) * 100), color: "oklch(0.55 0.08 200)" },
  ];
}

export function getFilteredKPIs(filtered: Partner[]): KPIMetric[] {
  const total = filtered.length;
  const compliantSEs = filtered.reduce((s, p) => s + p.compliantSEs, 0);
  const seGap = filtered.reduce((s, p) => s + p.seGap, 0);
  const totalExams = filtered.reduce((s, p) => s + p.totalExams, 0);
  const required = total * 3;
  const rate = required > 0 ? Math.round((compliantSEs / required) * 100) : 0;

  return [
    {
      id: "partners",
      label: "Total Partners",
      value: total.toString(),
      change: 0,
      changeLabel: "in ecosystem",
      trend: "flat",
      sparkline: [8, 9, 9, 10, 10, 11, total],
    },
    {
      id: "compliant-ses",
      label: "Compliant SEs",
      value: compliantSEs.toString(),
      change: compliantSEs,
      changeLabel: `of ${required} required`,
      trend: compliantSEs > 0 ? "up" : "down",
      sparkline: [2, 3, 4, 5, 6, 7, compliantSEs],
    },
    {
      id: "se-gap",
      label: "SE Gap (Needed)",
      value: seGap.toString(),
      change: -4,
      changeLabel: "vs last month",
      trend: "down",
      sparkline: [32, 30, 29, 28, 27, 26, seGap],
    },
    {
      id: "exams",
      label: "Exams Passed",
      value: totalExams.toString(),
      change: 12,
      changeLabel: "certifications earned",
      trend: "up",
      sparkline: [15, 20, 25, 28, 32, 35, totalExams],
    },
  ];
}

// ─── Computed Aggregates ────────────────────────────────────

const totalPartners = partners.length;
const compliantPartners = partners.filter((p) => p.status === "compliant").length;
const totalSEGap = partners.reduce((s, p) => s + p.seGap, 0);
const totalCompliantSEs = partners.reduce((s, p) => s + p.compliantSEs, 0);
const totalExamsPassed = partners.reduce((s, p) => s + p.totalExams, 0);
const requiredSEs = totalPartners * 3;
const complianceRate = Math.round((totalCompliantSEs / requiredSEs) * 100);

// ─── Compliance Status Distribution (for summary cards) ─────

export const gapDistribution = [
  {
    category: "Compliant",
    total: compliantPartners,
    partnersAffected: compliantPartners,
  },
  {
    category: "Partial Progress",
    total: partners.filter((p) => p.status === "partial").length,
    partnersAffected: partners.filter((p) => p.status === "partial").length,
  },
  {
    category: "Cross-Train",
    total: partners.filter((p) => p.gapType.includes("Cross-train")).length,
    partnersAffected: partners.filter((p) => p.gapType.includes("Cross-train")).length,
  },
  {
    category: "No Progress",
    total: partners.filter((p) => p.gapType === "No progress").length,
    partnersAffected: partners.filter((p) => p.gapType === "No progress").length,
  },
];

// ─── Status Distribution ────────────────────────────────────

export const statusCounts = {
  compliant: partners.filter((p) => p.status === "compliant").length,
  partial: partners.filter((p) => p.status === "partial").length,
  "high-gap": partners.filter((p) => p.status === "high-gap").length,
};

// ─── Sidebar Navigation ────────────────────────────────────

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "partners", label: "Partners", icon: "Building2", badge: totalPartners },
  { id: "journey", label: "SE Journey", icon: "Route" },
  { id: "gaps", label: "Gap Analysis", icon: "AlertTriangle" },
  { id: "certs", label: "Certifications", icon: "Award", badge: totalExamsPassed },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
