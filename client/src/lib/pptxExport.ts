/**
 * pptxExport.ts — Everpure Branded PowerPoint Generator
 * Uses pptxgenjs (pure client-side, no server required)
 * Brand palette extracted from: "Everpure Brand Presentation Template.pptx"
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

// Lazy-load pptxgenjs to avoid SSR issues
async function getPptxgen() {
  const mod = await import("pptxgenjs");
  return mod.default ?? mod;
}

// ─── Brand colours ────────────────────────────────────────────────────────────
const B = {
  dark:       "2D2A27", // Slide text / dark BG
  orange:     "FF7023", // Pure Storage / Everpure primary accent
  cream:      "FFF5E3", // Main slide background
  sand:       "D0C8BA", // Dividers / secondary fills
  moss:       "5A6359", // Secondary label colour
  peach:      "F2CDC4", // Alternate BG
  white:      "FFFFFF",
  black:      "1C1C1C",
  lightGreen: "C5E4CC",
} as const;

const FONT = "Calibri"; // Closest to Grotesk available in PPTX

// ─── Slide helpers ────────────────────────────────────────────────────────────

function addStyledTitle(
  slide: any,
  title: string,
  subtitle?: string
) {
  // Orange accent bar at top
  slide.addShape("rect", {
    x: 0, y: 0, w: "100%", h: 0.07,
    fill: { color: B.orange },
    line: { type: "none" },
  });
  slide.addText(title, {
    x: 0.5, y: 0.15, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: B.dark,
    fontFace: FONT,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.85, w: 9, h: 0.35,
      fontSize: 13, color: B.moss,
      fontFace: FONT,
    });
  }
  // Bottom accent bar
  slide.addShape("rect", {
    x: 0, y: 7.38, w: "100%", h: 0.12,
    fill: { color: B.sand },
    line: { type: "none" },
  });
  slide.addText("Everpure | FY27 Partner Enablement", {
    x: 0.5, y: 7.35, w: 8, h: 0.18,
    fontSize: 8, color: B.moss, fontFace: FONT,
  });
}

function hexagon(slide: any, x: number, y: number, size: number, color: string) {
  // Pure Storage style hex accent (approximated as diamond)
  slide.addShape("hexagon", {
    x, y, w: size, h: size,
    fill: { color },
    line: { type: "none" },
  });
}

function statusBadge(prs: any, slide: any, label: string, value: string | number, x: number, y: number, color: string) {
  slide.addShape("roundRect", {
    x, y, w: 2.1, h: 0.9,
    fill: { color: B.cream },
    line: { color: B.sand, pt: 1 },
    rectRadius: 0.08,
  });
  slide.addText(String(value), {
    x, y: y + 0.05, w: 2.1, h: 0.5,
    fontSize: 22, bold: true, color, align: "center", fontFace: FONT,
  });
  slide.addText(label, {
    x, y: y + 0.55, w: 2.1, h: 0.3,
    fontSize: 9, color: B.moss, align: "center", fontFace: FONT,
  });
}

// ─── Main export function ─────────────────────────────────────────────────────

export interface PartnerForExport {
  id: number;
  name: string;
  domain: string;
  programTier: string;
  enablementScore: number;
  totalGaps: number;
  totalExams: number;
  enablementCompliant: boolean;
  overallCompliant: boolean;
  requirements: {
    salesPro:      { obtained: number; required: number };
    techPro:       { obtained: number; required: number };
    bootcamp:      { obtained: number; required: number };
    implSpec:      { obtained: number; required: number };
    simplyPure:    { obtained: number; required: number };
    aspFoundations:  { totalObtained: number; required: number };
    aspStoragePro:   { totalObtained: number; required: number };
    aspSupportSpec:  { totalObtained: number; required: number };
  };
  revenueData: { revenueFY27: number; targetFY27: number };
}

export interface TimelineItem {
  id: string;
  label: string;
  month?: string;
  category?: string;
  description?: string;
  status?: string;
}

export async function exportPartnerPptx(
  partner: PartnerForExport,
  timeline: TimelineItem[],
  filename?: string
) {
  const PptxGenJS = await getPptxgen();
  const prs = new PptxGenJS();

  prs.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
  prs.author = "Everpure CampaignIQ";
  prs.company = "Pure Storage";
  prs.subject = `Partner Enablement Report — ${partner.name}`;

  // ── SLIDE 1: Cover ──────────────────────────────────────────────────────────
  const cover = prs.addSlide();
  cover.background = { color: B.dark };

  hexagon(cover, 8.5, 0.3, 1.2, B.orange);

  cover.addText("Partner Enablement Report", {
    x: 0.6, y: 1.8, w: 8, h: 0.6,
    fontSize: 14, color: B.sand, bold: false, fontFace: FONT,
  });
  cover.addText(partner.name, {
    x: 0.6, y: 2.35, w: 9, h: 1.1,
    fontSize: 38, bold: true, color: B.white, fontFace: FONT,
  });
  cover.addText(`${partner.programTier} Tier  |  FY27 Q2`, {
    x: 0.6, y: 3.55, w: 7, h: 0.45,
    fontSize: 16, color: B.orange, fontFace: FONT,
  });
  cover.addText(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, {
    x: 0.6, y: 6.8, w: 6, h: 0.3,
    fontSize: 10, color: B.moss, fontFace: FONT,
  });

  // ── SLIDE 2: Partner Overview ───────────────────────────────────────────────
  const overview = prs.addSlide();
  overview.background = { color: B.cream };
  addStyledTitle(overview, "Partner Overview", partner.domain);

  const revenueAtt = partner.revenueData.targetFY27 > 0
    ? Math.round((partner.revenueData.revenueFY27 / partner.revenueData.targetFY27) * 100)
    : 0;

  statusBadge(prs, overview, "Enablement Score", `${partner.enablementScore}%`, 0.5, 1.3, B.orange);
  statusBadge(prs, overview, "Open Gaps", partner.totalGaps, 2.75, 1.3, partner.totalGaps > 0 ? "C0392B" : "27AE60");
  statusBadge(prs, overview, "Certs Obtained", partner.totalExams, 5.0, 1.3, B.dark);
  statusBadge(prs, overview, "Revenue Attainment", `${revenueAtt}%`, 7.25, 1.3, revenueAtt >= 70 ? "27AE60" : B.orange);

  overview.addText("Program Status", {
    x: 0.5, y: 2.45, w: 4, h: 0.3,
    fontSize: 11, bold: true, color: B.moss, fontFace: FONT,
  });
  const statusRows = [
    ["Tier", partner.programTier],
    ["Enablement Compliant", partner.enablementCompliant ? "✓ Yes" : "✗ No"],
    ["Overall Compliant", partner.overallCompliant ? "✓ Yes" : "✗ No"],
    ["FY27 Revenue", `$${(partner.revenueData.revenueFY27 / 1e6).toFixed(2)}M`],
    ["FY27 Target", `$${(partner.revenueData.targetFY27 / 1e6).toFixed(2)}M`],
  ];
  overview.addTable(statusRows, {
    x: 0.5, y: 2.8, w: 5.5,
    colW: [2.5, 3],
    border: { color: B.sand, pt: 1 },
    fill: { color: B.white },
    fontSize: 11, fontFace: FONT, color: B.dark,
  });

  // ── SLIDE 3: Certification Status ───────────────────────────────────────────
  const certs = prs.addSlide();
  certs.background = { color: B.cream };
  addStyledTitle(certs, "Certification & Enablement Status");

  const req = partner.requirements;
  const certData = [
    ["Requirement", "Obtained", "Required", "Gap", "Status"],
    ["Sales Professional",        String(req.salesPro.obtained),            String(req.salesPro.required),            String(Math.max(0, req.salesPro.required - req.salesPro.obtained)),        req.salesPro.obtained >= req.salesPro.required ? "✓ Met" : "✗ Gap"],
    ["Technical Professional",    String(req.techPro.obtained),             String(req.techPro.required),             String(Math.max(0, req.techPro.required - req.techPro.obtained)),           req.techPro.obtained >= req.techPro.required ? "✓ Met" : "✗ Gap"],
    ["SE Bootcamp",               String(req.bootcamp.obtained),            String(req.bootcamp.required),            String(Math.max(0, req.bootcamp.required - req.bootcamp.obtained)),          req.bootcamp.obtained >= req.bootcamp.required ? "✓ Met" : "✗ Gap"],
    ["Implementation Specialist", String(req.implSpec.obtained),            String(req.implSpec.required),            String(Math.max(0, req.implSpec.required - req.implSpec.obtained)),          req.implSpec.obtained >= req.implSpec.required ? "✓ Met" : "✗ Gap"],
    ["Simply Pure",               String(req.simplyPure.obtained),          String(req.simplyPure.required),          String(Math.max(0, req.simplyPure.required - req.simplyPure.obtained)),       req.simplyPure.obtained >= req.simplyPure.required ? "✓ Met" : "✗ Gap"],
    ["ASP Foundations",           String(req.aspFoundations.totalObtained), String(req.aspFoundations.required),      String(Math.max(0, req.aspFoundations.required - req.aspFoundations.totalObtained)), req.aspFoundations.totalObtained >= req.aspFoundations.required ? "✓ Met" : "✗ Gap"],
    ["ASP Storage Pro",           String(req.aspStoragePro.totalObtained),  String(req.aspStoragePro.required),       String(Math.max(0, req.aspStoragePro.required - req.aspStoragePro.totalObtained)),  req.aspStoragePro.totalObtained >= req.aspStoragePro.required ? "✓ Met" : "✗ Gap"],
    ["ASP Support Specialist",    String(req.aspSupportSpec.totalObtained), String(req.aspSupportSpec.required),      String(Math.max(0, req.aspSupportSpec.required - req.aspSupportSpec.totalObtained)), req.aspSupportSpec.totalObtained >= req.aspSupportSpec.required ? "✓ Met" : "✗ Gap"],
  ];

  certs.addTable(certData, {
    x: 0.5, y: 1.3, w: 12.3,
    colW: [3.5, 1.5, 1.5, 1.5, 1.5],
    border: { color: B.sand, pt: 1 },
    fill: { color: B.white },
    fontSize: 11, fontFace: FONT, color: B.dark,
    autoPage: false,
  });

  // ── SLIDE 4: Gap Analysis ───────────────────────────────────────────────────
  const gaps = prs.addSlide();
  gaps.background = { color: B.cream };
  addStyledTitle(gaps, "Gap Analysis", `${partner.totalGaps} open gap(s) identified`);

  const gapItems = [
    { label: "Sales Pro Gap",   val: Math.max(0, req.salesPro.required - req.salesPro.obtained) },
    { label: "Tech Pro Gap",    val: Math.max(0, req.techPro.required - req.techPro.obtained) },
    { label: "Bootcamp Gap",    val: Math.max(0, req.bootcamp.required - req.bootcamp.obtained) },
    { label: "Impl Spec Gap",   val: Math.max(0, req.implSpec.required - req.implSpec.obtained) },
    { label: "Simply Pure Gap", val: Math.max(0, req.simplyPure.required - req.simplyPure.obtained) },
  ].filter(g => g.val > 0);

  if (gapItems.length === 0) {
    gaps.addText("✓ No open gaps — Partner is fully enablement-compliant!", {
      x: 0.5, y: 2.5, w: 12, h: 1,
      fontSize: 18, bold: true, color: "27AE60", align: "center", fontFace: FONT,
    });
  } else {
    const maxVal = Math.max(...gapItems.map(g => g.val), 1);
    gapItems.forEach((g, i) => {
      const barW = (g.val / maxVal) * 9;
      const y = 1.4 + i * 0.9;
      gaps.addText(g.label, { x: 0.5, y, w: 3, h: 0.35, fontSize: 11, color: B.dark, fontFace: FONT });
      gaps.addShape("rect", { x: 3.7, y: y + 0.03, w: barW, h: 0.3, fill: { color: B.orange }, line: { type: "none" } });
      gaps.addShape("rect", { x: 3.7, y: y + 0.03, w: 9, h: 0.3, fill: { color: B.sand + "30" }, line: { type: "none" } });
      gaps.addText(String(g.val), { x: 3.7 + barW + 0.15, y, w: 0.5, h: 0.35, fontSize: 11, bold: true, color: B.orange, fontFace: FONT });
    });
  }

  // ── SLIDE 5: Enablement Plan ────────────────────────────────────────────────
  const plan = prs.addSlide();
  plan.background = { color: B.cream };
  addStyledTitle(plan, "12-Month Enablement Plan", `${timeline.length} milestone(s) planned`);

  if (timeline.length === 0) {
    plan.addText("No plan items have been defined for this partner yet.\nUse the Enablement Plans page to add milestones.", {
      x: 0.5, y: 2.5, w: 12, h: 1.5,
      fontSize: 14, color: B.moss, align: "center", fontFace: FONT,
    });
  } else {
    const planData = [
      ["Period", "Item", "Category", "Status"],
      ...timeline.slice(0, 14).map(item => [
        item.month || "—",
        item.label,
        item.category || "—",
        item.status || "planned",
      ])
    ];
    plan.addTable(planData, {
      x: 0.5, y: 1.3, w: 12.3,
      colW: [1.5, 5.5, 2.5, 1.5],
      border: { color: B.sand, pt: 1 },
      fill: { color: B.white },
      fontSize: 10, fontFace: FONT, color: B.dark,
      autoPage: true,
    });
  }

  // ── SLIDE 6: Next Steps ─────────────────────────────────────────────────────
  const next = prs.addSlide();
  next.background = { color: B.dark };

  hexagon(next, 11.5, 0.3, 1.4, B.orange);

  next.addText("Next Steps", {
    x: 0.6, y: 1.5, w: 10, h: 0.7,
    fontSize: 30, bold: true, color: B.white, fontFace: FONT,
  });

  const steps: string[] = [];
  if (req.salesPro.obtained < req.salesPro.required)     steps.push(`Enrol ${req.salesPro.required - req.salesPro.obtained} additional Sales-Pro candidates`);
  if (req.techPro.obtained < req.techPro.required)        steps.push(`Enrol ${req.techPro.required - req.techPro.obtained} additional Tech-Pro candidates`);
  if (req.bootcamp.obtained < req.bootcamp.required)      steps.push(`Register ${req.bootcamp.required - req.bootcamp.obtained} SE(s) for upcoming Bootcamp`);
  if (req.implSpec.obtained < req.implSpec.required)      steps.push(`Target ${req.implSpec.required - req.implSpec.obtained} Implementation Specialist certification(s)`);
  if (steps.length === 0) steps.push("All core enablement requirements are met — maintain programme currency");
  if (timeline.length === 0) steps.push("Create a 12-month enablement roadmap via the CampaignIQ platform");

  steps.slice(0, 6).forEach((s, i) => {
    next.addShape("ellipse", { x: 0.5, y: 2.5 + i * 0.7 + 0.12, w: 0.25, h: 0.25, fill: { color: B.orange }, line: { type: "none" } });
    next.addText(s, { x: 0.95, y: 2.5 + i * 0.7, w: 11.5, h: 0.5, fontSize: 13, color: B.cream, fontFace: FONT });
  });

  next.addText("Everpure | FY27 Partner Enablement", {
    x: 0.6, y: 7.1, w: 8, h: 0.25,
    fontSize: 9, color: B.moss, fontFace: FONT,
  });

  // ── Write file ──────────────────────────────────────────────────────────────
  const fname = filename ?? `${partner.name.replace(/[^a-zA-Z0-9]/g, "_")}_Enablement_Report.pptx`;
  await prs.writeFile({ fileName: fname });
}

// Global export: all partners in one deck (one partner per section)
export async function exportAllPartnersPptx(
  partners: PartnerForExport[],
  timelines: Record<number, TimelineItem[]>
) {
  const PptxGenJS = await getPptxgen();
  const prs = new PptxGenJS();

  prs.layout = "LAYOUT_WIDE";
  prs.author = "Everpure CampaignIQ";
  prs.company = "Pure Storage";
  prs.subject = "FY27 Partner Enablement Consolidated Report";

  // Cover
  const cover = prs.addSlide();
  cover.background = { color: B.dark };
  hexagon(cover, 8.5, 0.3, 1.2, B.orange);
  cover.addText("FY27 Partner Enablement", { x: 0.6, y: 1.8, w: 8, h: 0.6, fontSize: 14, color: B.sand, fontFace: FONT });
  cover.addText("Consolidated Report", { x: 0.6, y: 2.35, w: 9, h: 1.0, fontSize: 38, bold: true, color: B.white, fontFace: FONT });
  cover.addText(`${partners.length} Partners  |  Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, { x: 0.6, y: 3.45, w: 9, h: 0.45, fontSize: 14, color: B.orange, fontFace: FONT });

  // Summary table
  const sumSlide = prs.addSlide();
  sumSlide.background = { color: B.cream };
  addStyledTitle(sumSlide, "Partner Summary");
  const rows = [
    ["Partner", "Tier", "Score", "Gaps", "Compliant"],
    ...partners.map(p => [p.name, p.programTier, `${p.enablementScore}%`, String(p.totalGaps), p.overallCompliant ? "✓" : "✗"]),
  ];
  sumSlide.addTable(rows, {
    x: 0.5, y: 1.3, w: 12.3,
    colW: [4.5, 2, 1.5, 1.5, 1.5],
    border: { color: B.sand, pt: 1 },
    fill: { color: B.white },
    fontSize: 11, fontFace: FONT, color: B.dark,
    autoPage: true,
  });

  await prs.writeFile({ fileName: "All_Partners_Enablement_Report.pptx" });
}
