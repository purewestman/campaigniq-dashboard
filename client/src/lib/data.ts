/*
 * CampaignIQ Dashboard — FY27 Partner SE Journey Compliance & Gap Analysis
 * Real data from the FY27 Partner SE Journey document
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
  // ✅ Compliant (Goal Met)
  {
    id: 1,
    name: "AXIZ (PTY) LTD",
    compliantSEs: 3,
    seGap: 0,
    spSEs: 3,
    tspSEs: 3,
    gapType: "None",
    action: "Fully compliant. Advance SEs to Step 3 (Bootcamp) and beyond.",
    targetEmails: ["adolph.strydom@axiz.com", "jen.gouws@axiz.com", "leriza.debruyn@axiz.com"],
    status: "compliant",
    journeyStep: 2,
  },
  // 🟡 Partial Progress (1 or 2 SEs Compliant)
  {
    id: 2,
    name: "Data Sciences Corporation",
    compliantSEs: 2,
    seGap: 1,
    spSEs: 4,
    tspSEs: 2,
    gapType: "Need TSP",
    action: "Target morne.groenewald or rudolf.vandergryp to take TSP FY27.",
    targetEmails: ["morne.groenewald@datasciences.co.za", "rudolf.vandergryp@datasciences.co.za"],
    status: "partial",
    journeyStep: 5,
  },
  {
    id: 3,
    name: "NEC XON SYSTEMS",
    compliantSEs: 2,
    seGap: 1,
    spSEs: 3,
    tspSEs: 2,
    gapType: "Need TSP",
    action: "One more SE needs to complete TSP FY27 to reach compliance.",
    targetEmails: ["peter.mcguigan@nec.xon.co.za", "conrad.vanniekerk@nec.xon.co.za"],
    status: "partial",
    journeyStep: 2,
  },
  {
    id: 4,
    name: "FIRST TECHNOLOGY KZN",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 3,
    tspSEs: 1,
    gapType: "Need TSP",
    action: "Target ramiror and nonjabulot to take TSP FY27.",
    targetEmails: ["ramiror@ftechkzn.co.za", "nonjabulot@ftechkzn.co.za"],
    status: "partial",
    journeyStep: 5,
  },
  {
    id: 5,
    name: "NTT DATA South Africa",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 2,
    tspSEs: 1,
    gapType: "Need TSP",
    action: "Two more SEs need both SP and TSP FY27 overlap.",
    targetEmails: ["riaan.taylor@global.ntt"],
    status: "partial",
    journeyStep: 2,
  },
  {
    id: 6,
    name: "iOCO Infrastructure Services",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 3,
    tspSEs: 1,
    gapType: "Need TSP",
    action: "Target johan.grove or jacques.dejager to take TSP FY27.",
    targetEmails: ["johan.grove@ioco.tech", "jacques.dejager@ioco.tech"],
    status: "partial",
    journeyStep: 5,
  },
  {
    id: 7,
    name: "ITgility",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Need both",
    action: "Two more SEs need to complete both SP and TSP FY27.",
    targetEmails: ["jamesb@itgility.co.za", "envorp@itgility.co.za"],
    status: "partial",
    journeyStep: 2,
  },
  {
    id: 8,
    name: "Global Indirect Markets",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Need both",
    action: "Two more SEs need to complete both SP and TSP FY27.",
    targetEmails: ["dylan.leeming@globalindirectmarkets.com", "eric.corbin@globalindirectmarkets.com"],
    status: "partial",
    journeyStep: 2,
  },
  {
    id: 9,
    name: "Netsync Network Solutions",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Need both",
    action: "Two more SEs need to complete both SP and TSP FY27.",
    targetEmails: ["david.goss@netsync.com"],
    status: "partial",
    journeyStep: 2,
  },
  {
    id: 10,
    name: "Technology Corporate Mgmt",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Need both",
    action: "Two more SEs need both courses. Dierk Lobbecke and Vishnu Naidoo have advanced certs.",
    targetEmails: ["dierk.lobbecke@tcm.co.za", "vishnu.naidoo@tcm.co.za"],
    status: "partial",
    journeyStep: 6,
  },
  {
    id: 11,
    name: "Triple H Technology Group",
    compliantSEs: 1,
    seGap: 2,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Need both",
    action: "Two more SEs need to complete both SP and TSP FY27.",
    targetEmails: ["justined@triplehgroup.co.za", "roxyk@triplehgroup.co.za"],
    status: "partial",
    journeyStep: 2,
  },
  // 🔴 High Gap (0 SEs Compliant)
  {
    id: 12,
    name: "Netstream Technology",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 9,
    tspSEs: 0,
    gapType: "Need TSP",
    action: "Heavy SP bench — 9 SEs have Simply Pure but 0 have TSP. Assign TSP FY27 immediately.",
    targetEmails: ["molivere@netstreamtechinc.com", "jcannon@netstreamtechinc.com"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 13,
    name: "AltronDigital Business",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 3,
    tspSEs: 0,
    gapType: "Need TSP",
    action: "Target zane.maphalle and mpho.mpya to take TSP FY27.",
    targetEmails: ["zane.maphalle@altron.com", "mpho.mpya@altron.com"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 14,
    name: "Storage Technology / Nexio",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 3,
    tspSEs: 0,
    gapType: "Need TSP",
    action: "3 SEs have SP but 0 have TSP. Assign TSP FY27 to close the gap.",
    targetEmails: ["rvanstaden@nexio.co.za", "cbaptiste@nexio.co.za"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 15,
    name: "NetStor",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 2,
    tspSEs: 0,
    gapType: "Need TSP",
    action: "2 SEs have SP but 0 have TSP. Assign TSP FY27.",
    targetEmails: ["bellini@netstor.com.br", "rodolpho@netstor.com.br"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 16,
    name: "SITHABILE",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 0,
    gapType: "Need TSP",
    action: "1 SE has SP but 0 have TSP. Assign TSP FY27.",
    targetEmails: ["damon.engelsman@sithabile.co.za", "bryce.tatham@sithabile.co.za"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 17,
    name: "FIRST TECHNOLOGY GROUP",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 1,
    gapType: "Cross-train",
    action: "Simone has SP, Calvin has TSP — cross-train each to achieve overlap.",
    targetEmails: ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 18,
    name: "INTELLITECH SYSTEMS",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 1,
    tspSEs: 2,
    gapType: "Cross-train",
    action: "Shahirah has SP, Kavi and Collen have TSP — cross-train to achieve overlap.",
    targetEmails: ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"],
    status: "high-gap",
    journeyStep: 1,
  },
  {
    id: 19,
    name: "ETS INNOVATIONS",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
  },
  {
    id: 20,
    name: "Lekonakonetsi",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
  },
  {
    id: 21,
    name: "Netsource One",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
  },
  {
    id: 22,
    name: "BCX",
    compliantSEs: 0,
    seGap: 3,
    spSEs: 0,
    tspSEs: 0,
    gapType: "No progress",
    action: "Zero completions. Start with Simply Pure FY27 and TSP FY27 immediately.",
    targetEmails: [],
    status: "high-gap",
    journeyStep: 0,
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
  const required = total * 3;
  const rate = required > 0 ? Math.round((compliantSEs / required) * 100) : 0;

  return [
    {
      id: "partners",
      label: "Total Partners",
      value: total.toString(),
      change: 4,
      changeLabel: "new this FY",
      trend: "up",
      sparkline: [16, 17, 18, 19, 20, 21, total],
    },
    {
      id: "compliant-ses",
      label: "Compliant SEs",
      value: compliantSEs.toString(),
      change: 15,
      changeLabel: `of ${required} required`,
      trend: "up",
      sparkline: [5, 7, 9, 10, 12, 13, compliantSEs],
    },
    {
      id: "se-gap",
      label: "SE Gap (Needed)",
      value: seGap.toString(),
      change: -6,
      changeLabel: "vs last month",
      trend: "down",
      sparkline: [60, 58, 56, 55, 53, 52, seGap],
    },
    {
      id: "compliance",
      label: "Compliance Rate",
      value: `${rate}%`,
      change: 5,
      changeLabel: "vs last quarter",
      trend: rate >= 50 ? "up" : "down",
      sparkline: [12, 14, 16, 18, 20, 21, rate],
    },
  ];
}

// ─── KPI Cards (unfiltered defaults) ────────────────────────

const totalPartners = partners.length;
const compliantPartners = partners.filter((p) => p.status === "compliant").length;
const totalSEGap = partners.reduce((s, p) => s + p.seGap, 0);
const totalCompliantSEs = partners.reduce((s, p) => s + p.compliantSEs, 0);
const requiredSEs = totalPartners * 3;
const complianceRate = Math.round((totalCompliantSEs / requiredSEs) * 100);

export const kpiMetrics: KPIMetric[] = [
  {
    id: "partners",
    label: "Total Partners",
    value: totalPartners.toString(),
    change: 4,
    changeLabel: "new this FY",
    trend: "up",
    sparkline: [16, 17, 18, 19, 20, 21, 22],
  },
  {
    id: "compliant-ses",
    label: "Compliant SEs",
    value: totalCompliantSEs.toString(),
    change: 15,
    changeLabel: "of 66 required",
    trend: "up",
    sparkline: [5, 7, 9, 10, 12, 13, 15],
  },
  {
    id: "se-gap",
    label: "SE Gap (Needed)",
    value: totalSEGap.toString(),
    change: -6,
    changeLabel: "vs last month",
    trend: "down",
    sparkline: [60, 58, 56, 55, 53, 52, 51],
  },
  {
    id: "compliance",
    label: "Compliance Rate",
    value: `${complianceRate}%`,
    change: 5,
    changeLabel: "vs last quarter",
    trend: "up",
    sparkline: [12, 14, 16, 18, 20, 21, 23],
  },
];

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
    category: "Need TSP",
    total: partners.filter((p) => p.gapType === "Need TSP").length,
    partnersAffected: partners.filter((p) => p.gapType === "Need TSP").length,
  },
  {
    category: "No Progress",
    total: partners.filter((p) => p.gapType === "No progress" || p.gapType === "Cross-train").length,
    partnersAffected: partners.filter((p) => p.gapType === "No progress" || p.gapType === "Cross-train").length,
  },
];

// ─── Gap by partner (for stacked bar chart) ─────────────────

export const partnerGapBreakdown = partners
  .filter((p) => p.seGap > 0)
  .sort((a, b) => b.seGap - a.seGap)
  .map((p) => ({
    partner: p.name.length > 22 ? p.name.substring(0, 20) + "…" : p.name,
    fullName: p.name,
    "SE Gap": p.seGap,
    "Has SP Only": Math.max(p.spSEs - p.compliantSEs, 0),
    "Has TSP Only": Math.max(p.tspSEs - p.compliantSEs, 0),
  }));

// ─── SE Journey Step Distribution (donut) ───────────────────

const stepCounts = [0, 1, 2, 3, 4, 5, 6].map(
  (step) => partners.filter((p) => p.journeyStep === step).length
);

export const certCategories: StatusCategory[] = [
  { category: "Not Started (Step 0)", count: stepCounts[0], percentage: Math.round((stepCounts[0] / totalPartners) * 100), color: "oklch(0.62 0.19 15)" },
  { category: "Simply Pure (Step 1)", count: stepCounts[1], percentage: Math.round((stepCounts[1] / totalPartners) * 100), color: "oklch(0.75 0.14 75)" },
  { category: "SP + TSP (Step 2)", count: stepCounts[2], percentage: Math.round((stepCounts[2] / totalPartners) * 100), color: "oklch(0.58 0.16 290)" },
  { category: "Electives (Step 5)", count: stepCounts[5], percentage: Math.round((stepCounts[5] / totalPartners) * 100), color: "oklch(0.60 0.12 175)" },
  { category: "Certifications (Step 6)", count: stepCounts[6], percentage: Math.round((stepCounts[6] / totalPartners) * 100), color: "oklch(0.55 0.08 200)" },
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
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
