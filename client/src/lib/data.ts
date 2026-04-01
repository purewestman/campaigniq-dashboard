/*
 * CampaignIQ Dashboard — FY27 Partner Certification Gap Analysis & Performance Status
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
  spSEs: number;
  tspSEs: number;
  gapType: string;
  action: string;
  targetEmails: string[];
  status: "compliant" | "partial" | "high-gap";
  journeyStep: number;
  exams: ExamRecord[];
  totalExams: number;
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
  // ✅ Tier 1: Goals Met (8 partners)
  {
    id: 1,
    name: "Data Sciences Corporation",
    compliantSEs: 5,
    seGap: 0,
    spSEs: 18,
    tspSEs: 5,
    gapType: "None",
    action: "Fully compliant with 5 SEs. Register SEs for SE Bootcamp (Step 3) to continue the journey.",
    targetEmails: ["morne.groenewald@datasciences.co.za", "rudolf.vandergryp@datasciences.co.za"],
    status: "compliant",
    journeyStep: 6,
    exams: [
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
    ],
    totalExams: 17,
  },
  {
    id: 2,
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
      { email: "lerato.mabunda@axiz.com", certifications: ["Platform Positioning Certificate"] },
      { email: "adolph.strydom@axiz.com", certifications: ["Platform Positioning Exam", "Certified Architect Associate FlashArray", "FlashArray Implementation Specialist", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
      { email: "oscar.ronander@axiz.com", certifications: ["Platform Positioning Exam"] },
    ],
    totalExams: 7,
  },
  {
    id: 3,
    name: "NTT DATA / Dimension Data",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 6,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant via Ryan Daniels, Riaan Taylor, and Rudi Fischer. Proceed to SE Bootcamp.",
    targetEmails: ["lourens.jvrensburg@nttdata.com", "morne.frans@dimensiondata.com"],
    status: "compliant",
    journeyStep: 6,
    exams: [
      { email: "kayode.fatoki@global.ntt", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "angelo.campbell@global.ntt", certifications: ["Certified FlashArray Support Specialist"] },
      { email: "morne.frans@dimensiondata.com", certifications: ["FlashBlade Architect Associate"] },
    ],
    totalExams: 3,
  },
  {
    id: 4,
    name: "NEC XON SYSTEMS",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 4,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant via Peter McGuigan, Merwe Erasmus, and Conrad Van Niekerk. Proceed to SE Bootcamp.",
    targetEmails: ["monique.pretorius@nec.xon.co.za", "peter.mcguigan@nec.xon.co.za"],
    status: "compliant",
    journeyStep: 6,
    exams: [
      { email: "merwe.erasmus@nec.xon.co.za", certifications: ["FlashArray Architect Associate", "FlashArray Architect Professional", "FlashBlade Architect Associate"] },
    ],
    totalExams: 3,
  },
  {
    id: 5,
    name: "FIRST TECHNOLOGY KZN",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 11,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant with 3 SEs. Proceed to SE Bootcamp.",
    targetEmails: ["nonjabulot@ftechkzn.co.za", "steliosk@ftechkzn.co.za"],
    status: "compliant",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },
  {
    id: 6,
    name: "iOCO Infrastructure Services",
    compliantSEs: 6,
    seGap: 0,
    spSEs: 8,
    tspSEs: 6,
    gapType: "None",
    action: "Fully compliant with 6 SEs — highest in the ecosystem. Proceed to SE Bootcamp and certifications.",
    targetEmails: ["jacques.dejager@ioco.tech", "johan.grove@ioco.tech"],
    status: "compliant",
    journeyStep: 6,
    exams: [],
    totalExams: 0,
  },
  {
    id: 7,
    name: "Netsync Network Solutions",
    compliantSEs: 5,
    seGap: 0,
    spSEs: 30,
    tspSEs: 5,
    gapType: "None",
    action: "Fully compliant with 5+ SEs. Proceed to SE Bootcamp.",
    targetEmails: ["bbeggs@netsync.com", "lovalles@netsync.com"],
    status: "compliant",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },
  {
    id: 8,
    name: "Netstream Technology",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 4,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant with 3 SEs. Proceed to SE Bootcamp.",
    targetEmails: ["jcannon@netstreamtechinc.com", "dbrandt@netstreamtechinc.com"],
    status: "compliant",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },

  // ⚠️ Tier 2: Partial Progress (4 partners)
  {
    id: 9,
    name: "Altron Digital Business",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 4,
    tspSEs: 2,
    gapType: "Need TSP overlap",
    action: "Have Mpho Mpya and Paulina Moagi complete the TSP module to close the gap.",
    targetEmails: ["robert.mlombile@altron.com", "zane.maphalle@altron.com"],
    status: "partial",
    journeyStep: 5,
    exams: [
      { email: "williamrobert.souter@altron.com", certifications: ["Platform Positioning Certificate"] },
      { email: "zane.maphalle@altron.com", certifications: ["Platform Positioning Exam", "FlashArray Architect Associate", "FlashBlade Architect Associate", "Platform Solutions Associate"] },
      { email: "johan.westman@altron.com", certifications: ["Platform Positioning Exam"] },
    ],
    totalExams: 6,
  },
  {
    id: 10,
    name: "Technology Corporate Mgmt (TCM)",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 3,
    tspSEs: 2,
    gapType: "Cross-train",
    action: "Have other active engineers cross-train on the FY27 baseline courses to hit the 3-SE compliance metric.",
    targetEmails: ["colin.smith@tcm.co.za", "vishnu.naidoo@tcm.co.za"],
    status: "partial",
    journeyStep: 5,
    exams: [
      { email: "dierk.lobbecke@tcm.co.za", certifications: ["Certified FlashArray Implementation Specialist"] },
      { email: "vishnu.naidoo@tcm.co.za", certifications: ["Platform Positioning Certificate", "Platform Solutions Associate"] },
    ],
    totalExams: 3,
  },
  {
    id: 11,
    name: "Global Indirect Markets",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 2,
    tspSEs: 1,
    gapType: "Need TSP overlap",
    action: "Target eric.corbin to complete TSP FY27 to create the required overlap.",
    targetEmails: ["eric.corbin@globalindirectmarkets.com"],
    status: "partial",
    journeyStep: 2,
    exams: [],
    totalExams: 0,
  },
  {
    id: 12,
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
      { email: "jamesb@itgility.co.za", certifications: ["Platform Positioning Certificate"] },
    ],
    totalExams: 1,
  },

  // 🛑 Tier 3: Stalled / High Gap (7 partners)
  {
    id: 13,
    name: "Triple H Technology Group",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Cross-train",
    action: "Cross-train Justine de Sousa, Kiewiet Kritzinger, and Frederik Strydom to create the required overlap.",
    targetEmails: ["frederiks@triplehgroup.co.za"],
    status: "high-gap",
    journeyStep: 1,
    exams: [
      { email: "frederiks@triplehgroup.co.za", certifications: ["FlashArray Architect Associate"] },
    ],
    totalExams: 1,
  },
  {
    id: 14,
    name: "INTELLITECH SYSTEMS",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 2,
    gapType: "Cross-train",
    action: "Heavy Tech Pro bench — mandate they take Simply Pure. Cross-train to create overlap.",
    targetEmails: ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"],
    status: "high-gap",
    journeyStep: 1,
    exams: [],
    totalExams: 0,
  },
  {
    id: 15,
    name: "FIRST TECHNOLOGY GROUP",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Cross-train",
    action: "Cross-train Simone and Calvin to create the overlap.",
    targetEmails: ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"],
    status: "high-gap",
    journeyStep: 1,
    exams: [],
    totalExams: 0,
  },
  {
    id: 16,
    name: "Storage Technology Services (Nexio)",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 1,
    gapType: "Need SP + cross-train",
    action: "Have Charmaine and Tinyiko complete the Tech Pro path. Start Simply Pure immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 1,
    exams: [],
    totalExams: 0,
  },
  {
    id: 17,
    name: "SITHABILE TECHNOLOGY SERVICES",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
    exams: [],
    totalExams: 0,
  },
  {
    id: 18,
    name: "NetStor",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
    exams: [],
    totalExams: 0,
  },
  {
    id: 19,
    name: "ETS INNOVATIONS & Lekonakonetsi",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Target engineers to start the FY27 path from scratch.",
    targetEmails: [],
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
      change: 8,
      changeLabel: "new since last update",
      trend: "up",
      sparkline: [8, 9, 10, 11, 14, 17, total],
    },
    {
      id: "compliant-ses",
      label: "Compliant SEs",
      value: compliantSEs.toString(),
      change: compliantSEs,
      changeLabel: `of ${required} required`,
      trend: "up",
      sparkline: [5, 9, 14, 18, 22, 27, compliantSEs],
    },
    {
      id: "se-gap",
      label: "SE Gap (Remaining)",
      value: seGap.toString(),
      change: -22,
      changeLabel: "closed since last update",
      trend: "down",
      sparkline: [51, 45, 40, 35, 32, 30, seGap],
    },
    {
      id: "exams",
      label: "Exams Passed",
      value: totalExams.toString(),
      change: 3,
      changeLabel: "new certifications",
      trend: "up",
      sparkline: [15, 20, 25, 28, 32, 36, totalExams],
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
    total: partners.filter((p) => p.gapType.includes("Cross-train") || p.gapType.includes("cross-train")).length,
    partnersAffected: partners.filter((p) => p.gapType.includes("Cross-train") || p.gapType.includes("cross-train")).length,
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
