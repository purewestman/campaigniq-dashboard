/*
 * CampaignIQ Dashboard — Partner Certification Readiness & Training Gap Analysis
 * Real data from the Partner Certification document
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

// ─── Types ──────────────────────────────────────────────────

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
  gaps: {
    salesPro: number;
    techPro: number;
    implementationSpec: number;
    bootcamp: number;
  };
  totalGaps: number;
  examsPassed: number;
  certifiedPeople: number;
  action: string;
  recommendedEmails: string[];
  status: "on-track" | "at-risk" | "critical" | "certified";
}

export interface GapCategory {
  category: string;
  count: number;
  color: string;
  partnersAffected: number;
}

export interface CertCategory {
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
  {
    id: 1,
    name: "Data Sciences Corporation",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 0, bootcamp: 2 },
    totalGaps: 2,
    examsPassed: 19,
    certifiedPeople: 8,
    action: "Target your top Implementation Specialists to attend the Bootcamp.",
    recommendedEmails: ["nelson.lopes@datasciences.co.za", "rukaya.najam@datasciences.co.za"],
    status: "on-track",
  },
  {
    id: 2,
    name: "AXIZ (PTY) LTD",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 0, bootcamp: 2 },
    totalGaps: 2,
    examsPassed: 8,
    certifiedPeople: 3,
    action: "Send your top SEs to the Bootcamp.",
    recommendedEmails: ["adolph.strydom@axiz.com", "jen.gouws@axiz.com"],
    status: "on-track",
  },
  {
    id: 3,
    name: "FIRST TECHNOLOGY KZN",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 0, bootcamp: 2 },
    totalGaps: 2,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Send your top SEs to the Bootcamp.",
    recommendedEmails: ["nonjabulot@ftechkzn.co.za", "steliosk@ftechkzn.co.za"],
    status: "at-risk",
  },
  {
    id: 4,
    name: "Netsync Network Solutions",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 0, bootcamp: 2 },
    totalGaps: 2,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Send your top SEs to the Bootcamp.",
    recommendedEmails: ["bbeggs@netsync.com", "lovalles@netsync.com"],
    status: "at-risk",
  },
  {
    id: 5,
    name: "INTELLITECH SYSTEMS",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 3,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Have your top Tech Pros take the Implementation exam.",
    recommendedEmails: ["collen@intellitechsystems.co.za", "kavi@intellitechsystems.co.za"],
    status: "critical",
  },
  {
    id: 6,
    name: "iOCO Infrastructure Services",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 3,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Many have taken the prep courses; they just need to officially pass the Implementation exam.",
    recommendedEmails: ["jacques.dejager@ioco.tech", "johan.grove@ioco.tech"],
    status: "at-risk",
  },
  {
    id: 7,
    name: "NTT DATA South Africa",
    gaps: { salesPro: 3, techPro: 2, implementationSpec: 0, bootcamp: 2 },
    totalGaps: 7,
    examsPassed: 14,
    certifiedPeople: 8,
    action: "Cross-train current engineers to fill the Sales/Tech Pro gaps and send your top SEs to Bootcamp.",
    recommendedEmails: ["kayode.fatoki@global.ntt", "kagiso.mathuloe@global.ntt", "morne.frans@dimensiondata.com"],
    status: "at-risk",
  },
  {
    id: 8,
    name: "Netstream Technology",
    gaps: { salesPro: 0, techPro: 1, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 4,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Have Mike finish the Tech Pro, and send your top SEs to certify.",
    recommendedEmails: ["molivere@netstreamtechinc.com", "jcannon@netstreamtechinc.com", "dbrandt@netstreamtechinc.com"],
    status: "critical",
  },
  {
    id: 9,
    name: "NEC XON SYSTEMS",
    gaps: { salesPro: 0, techPro: 1, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 4,
    examsPassed: 3,
    certifiedPeople: 1,
    action: "Have Monique take the Tech Pro path. Send top engineers to Bootcamp.",
    recommendedEmails: ["monique.pretorius@nec.xon.co.za", "peter.mcguigan@nec.xon.co.za", "merwe.erasmus@nec.xon.co.za"],
    status: "at-risk",
  },
  {
    id: 10,
    name: "AltronDigital Business",
    gaps: { salesPro: 0, techPro: 1, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 4,
    examsPassed: 6,
    certifiedPeople: 3,
    action: "Have Robert finish the Tech Pro.",
    recommendedEmails: ["robert.mlombile@altron.com", "zane.maphalle@altron.com", "adrian.pillay@altron.com"],
    status: "at-risk",
  },
  {
    id: 11,
    name: "SITHABILE TECHNOLOGY",
    gaps: { salesPro: 0, techPro: 2, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 5,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Target Damon and Bryce for Tech Pro.",
    recommendedEmails: ["damon.engelsman@sithabile.co.za", "bryce.tatham@sithabile.co.za"],
    status: "critical",
  },
  {
    id: 12,
    name: "Lekonakonetsi Consulting",
    gaps: { salesPro: 2, techPro: 0, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 5,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Target Bandile and Siphamandla for the Sales Pro path.",
    recommendedEmails: ["bandile@lcsholdings.co.za", "siphamandla@lcsholdings.co.za"],
    status: "critical",
  },
  {
    id: 13,
    name: "Triple H Technology Group",
    gaps: { salesPro: 0, techPro: 3, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 6,
    examsPassed: 1,
    certifiedPeople: 1,
    action: "Target Justine and Roxy for the Tech Pro path.",
    recommendedEmails: ["justined@triplehgroup.co.za", "roxyk@triplehgroup.co.za"],
    status: "critical",
  },
  {
    id: 14,
    name: "Storage Technology (Nexio)",
    gaps: { salesPro: 1, techPro: 2, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 6,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Fill Sales Pro, Tech Pro, and Implementation gaps. Send SEs to Bootcamp.",
    recommendedEmails: ["rvanstaden@nexio.co.za", "cbaptiste@nexio.co.za"],
    status: "critical",
  },
  {
    id: 15,
    name: "ITgility",
    gaps: { salesPro: 3, techPro: 3, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 9,
    examsPassed: 1,
    certifiedPeople: 1,
    action: "Fill Sales Pro, Tech Pro, and Implementation gaps.",
    recommendedEmails: ["jamesb@itgility.co.za", "envorp@itgility.co.za"],
    status: "critical",
  },
  {
    id: 16,
    name: "FIRST TECHNOLOGY GROUP",
    gaps: { salesPro: 5, techPro: 3, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 11,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Significant gaps across all categories. Prioritize Sales Pro and Tech Pro.",
    recommendedEmails: ["calvinm@firsttech.co.za", "simonevh@firsttech.co.za"],
    status: "critical",
  },
  {
    id: 17,
    name: "Global Indirect Markets",
    gaps: { salesPro: 5, techPro: 3, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 11,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Significant gaps across all categories. Prioritize Sales Pro and Tech Pro.",
    recommendedEmails: ["dylan.leeming@globalindirectmarkets.com", "eric.corbin@globalindirectmarkets.com"],
    status: "critical",
  },
  {
    id: 18,
    name: "NetStor",
    gaps: { salesPro: 3, techPro: 3, implementationSpec: 1, bootcamp: 2 },
    totalGaps: 9,
    examsPassed: 0,
    certifiedPeople: 0,
    action: "Significant gaps across all categories. Prioritize Sales Pro and Tech Pro.",
    recommendedEmails: ["bellini@netstor.com.br", "rodolpho@netstor.com.br"],
    status: "critical",
  },
  {
    id: 19,
    name: "Technology Corporate Mgmt",
    gaps: { salesPro: 0, techPro: 0, implementationSpec: 0, bootcamp: 0 },
    totalGaps: 0,
    examsPassed: 3,
    certifiedPeople: 2,
    action: "Bonus listing — already certified from new exam data.",
    recommendedEmails: ["dierk.lobbecke@tcm.co.za", "vishnu.naidoo@tcm.co.za"],
    status: "certified",
  },
];

// ─── KPI Cards ──────────────────────────────────────────────

const totalPartners = partners.length;
const totalExamsPassed = partners.reduce((s, p) => s + p.examsPassed, 0);
const totalGaps = partners.reduce((s, p) => s + p.totalGaps, 0);
const certifiedPartners = partners.filter((p) => p.status === "on-track" || p.status === "certified").length;
const readinessScore = Math.round((certifiedPartners / totalPartners) * 100);

export const kpiMetrics: KPIMetric[] = [
  {
    id: "partners",
    label: "Total Partners",
    value: totalPartners.toString(),
    change: 3,
    changeLabel: "new this quarter",
    trend: "up",
    sparkline: [14, 15, 15, 16, 17, 18, 19],
  },
  {
    id: "certs-passed",
    label: "Certifications Passed",
    value: totalExamsPassed.toString(),
    change: 12,
    changeLabel: "vs last quarter",
    trend: "up",
    sparkline: [32, 36, 40, 42, 45, 50, 55],
  },
  {
    id: "open-gaps",
    label: "Open Gaps",
    value: totalGaps.toString(),
    change: -8,
    changeLabel: "vs last quarter",
    trend: "down",
    sparkline: [98, 95, 92, 90, 88, 86, 83],
  },
  {
    id: "readiness",
    label: "Readiness Score",
    value: `${readinessScore}%`,
    change: 5,
    changeLabel: "vs last quarter",
    trend: "up",
    sparkline: [10, 11, 12, 13, 14, 15, 16],
  },
];

// ─── Gap Distribution (for bar chart) ───────────────────────

export const gapDistribution = [
  {
    category: "Bootcamp",
    total: partners.reduce((s, p) => s + p.gaps.bootcamp, 0),
    partnersAffected: partners.filter((p) => p.gaps.bootcamp > 0).length,
  },
  {
    category: "Tech Pro",
    total: partners.reduce((s, p) => s + p.gaps.techPro, 0),
    partnersAffected: partners.filter((p) => p.gaps.techPro > 0).length,
  },
  {
    category: "Sales Pro",
    total: partners.reduce((s, p) => s + p.gaps.salesPro, 0),
    partnersAffected: partners.filter((p) => p.gaps.salesPro > 0).length,
  },
  {
    category: "Impl. Specialist",
    total: partners.reduce((s, p) => s + p.gaps.implementationSpec, 0),
    partnersAffected: partners.filter((p) => p.gaps.implementationSpec > 0).length,
  },
];

// ─── Gap by partner (for stacked bar chart) ─────────────────

export const partnerGapBreakdown = partners
  .filter((p) => p.totalGaps > 0)
  .sort((a, b) => b.totalGaps - a.totalGaps)
  .map((p) => ({
    partner: p.name.length > 20 ? p.name.substring(0, 18) + "…" : p.name,
    fullName: p.name,
    Bootcamp: p.gaps.bootcamp,
    "Tech Pro": p.gaps.techPro,
    "Sales Pro": p.gaps.salesPro,
    "Impl. Spec": p.gaps.implementationSpec,
  }));

// ─── Certification Category Breakdown (donut) ───────────────

export const certCategories: CertCategory[] = [
  { category: "FlashArray Architect", count: 14, percentage: 25, color: "oklch(0.60 0.12 175)" },
  { category: "FlashBlade Architect", count: 10, percentage: 18, color: "oklch(0.58 0.16 290)" },
  { category: "Implementation Specialist", count: 12, percentage: 22, color: "oklch(0.75 0.14 75)" },
  { category: "Support Specialist", count: 5, percentage: 9, color: "oklch(0.62 0.19 15)" },
  { category: "Platform Positioning", count: 8, percentage: 15, color: "oklch(0.65 0.10 145)" },
  { category: "Platform Solutions", count: 6, percentage: 11, color: "oklch(0.55 0.08 200)" },
];

// ─── Status Distribution ────────────────────────────────────

export const statusCounts = {
  "on-track": partners.filter((p) => p.status === "on-track").length,
  "at-risk": partners.filter((p) => p.status === "at-risk").length,
  critical: partners.filter((p) => p.status === "critical").length,
  certified: partners.filter((p) => p.status === "certified").length,
};

// ─── Sidebar Navigation ────────────────────────────────────

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "partners", label: "Partners", icon: "Building2", badge: totalPartners },
  { id: "gaps", label: "Gap Analysis", icon: "AlertTriangle" },
  { id: "certifications", label: "Certifications", icon: "Award" },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
