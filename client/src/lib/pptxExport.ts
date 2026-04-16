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
  dark:       "1C1918", // Charcoal Black (NotebookLM replica)
  orange:     "F15C22", // Vibrant Orange (NotebookLM replica)
  cream:      "F6F0E6", // Sand/Beige Background (NotebookLM replica)
  sand:       "DCD4C7", // Dividers / secondary fills
  moss:       "5A6359", // Secondary label colour
  peach:      "F2CDC4", // Alternate BG
  white:      "FFFFFF",
  black:      "000000",
  lightGreen: "C5E4CC",
} as const;

const FONT = "Familjen Grotesk"; // Official template font

// ─── Slide helpers ────────────────────────────────────────────────────────────

function addStyledTitle(
  slide: any,
  title: string,
  subtitle?: string
) {
  // Thick Charcoal Header Base
  slide.addShape("rect", {
    x: 0, y: 0, w: "100%", h: 1.1,
    fill: { color: B.dark },
    line: { type: "none" },
  });
  // Orange geometric accent cut in header
  slide.addShape("rect", {
    x: 12.8, y: -0.5, w: 1, h: 2,
    fill: { color: B.orange },
    line: { type: "none" },
    rotate: 25
  });
  
  slide.addText(title, {
    x: 0.5, y: 0.2, w: 9, h: 0.6,
    fontSize: 28, bold: true, color: B.cream,
    fontFace: FONT,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.75, w: 9, h: 0.3,
      fontSize: 12, color: B.sand,
      fontFace: FONT,
    });
  }
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
  month?: string;        // short code e.g. "M1-3"
  monthRange?: string;   // display string e.g. "Month 1-2"
  quarter?: string;
  category?: string;
  description?: string;
  status?: string;
  emails?: string[];
}

export interface ExportSignature {
  name: string;
  date: string;
}

export async function exportPartnerPptx(
  partner: PartnerForExport,
  timeline: TimelineItem[],
  signature?: ExportSignature,
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
  cover.background = { color: B.cream };

  // 1. Charcoal Backplate (Right side swoop)
  cover.addShape("rect", {
    x: 6.5, y: -2, w: 9, h: 12,
    fill: { color: B.dark },
    line: { type: "none" },
    rotate: 18
  });

  // 2. Vibrant Orange Main Block (Left side swoop)
  cover.addShape("rect", {
    x: -1.5, y: -2, w: 7.8, h: 12,
    fill: { color: B.orange },
    line: { type: "none" },
    rotate: 15
  });

  // Partner Enablement Main Title (Left over Orange)
  cover.addText(`${partner.name} Partner\nEnablement:\nThe Path to 1000%`, {
    x: 0.6, y: 2.8, w: 6.5, h: 2.5,
    fontSize: 52, bold: true, color: B.cream, fontFace: FONT,
  });

  // Subtitle (Right over Charcoal)
  cover.addText(`${partner.programTier} Tier Diagnostic &\nExecution Roadmap`, {
    x: 7.5, y: 2.8, w: 5, h: 1.5,
    fontSize: 24, bold: false, color: B.cream, fontFace: FONT, align: "right"
  });

  // Date metadata (Bottom Right)
  cover.addText(`Prepared for ${partner.name} | ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, {
    x: 6.5, y: 6.8, w: 6.5, h: 0.3,
    fontSize: 11, color: B.dark, fontFace: FONT, align: "right"
  });

  if (signature) {
    cover.addText(`Electronically Signed By: ${signature.name}\nCommitment Date: ${signature.date}`, {
      x: 0.6, y: 6.5, w: 5, h: 0.8,
      fontSize: 11, bold: true, color: B.cream, fontFace: FONT, align: "left"
    });
  }

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
    // Draw a clean table-style bar chart — label | track | value
    gapItems.forEach((g, i) => {
      const trackX = 3.8;
      const trackW = 8.0;
      const barW   = Math.max(0.15, (g.val / maxVal) * trackW);
      const y      = 1.5 + i * 1.0;

      // Row background (alternating)
      if (i % 2 === 0) {
        gaps.addShape("rect", { x: 0.3, y: y - 0.05, w: 12.7, h: 0.85,
          fill: { color: "F7F3EE" }, line: { type: "none" } });
      }

      // Label
      gaps.addText(g.label, {
        x: 0.5, y: y + 0.1, w: 3.1, h: 0.4,
        fontSize: 12, color: B.dark, fontFace: FONT, bold: false,
      });

      // Track background (light sand)
      gaps.addShape("rect", {
        x: trackX, y: y + 0.18, w: trackW, h: 0.28,
        fill: { color: B.sand }, line: { type: "none" },
      });

      // Orange fill bar (drawn ON TOP of track)
      gaps.addShape("rect", {
        x: trackX, y: y + 0.18, w: barW, h: 0.28,
        fill: { color: B.orange }, line: { type: "none" },
      });

      // Value label — placed AFTER the track, always on cream
      gaps.addText(`${g.val} missing`, {
        x: trackX + trackW + 0.2, y: y + 0.1, w: 1.5, h: 0.4,
        fontSize: 11, bold: true, color: B.orange, fontFace: FONT,
      });
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
    // Header row — styled separately
    const headerCells = [
      { text: "Period / Month",   options: { bold: true, color: B.white, fill: { color: B.dark } } },
      { text: "Milestone",        options: { bold: true, color: B.white, fill: { color: B.dark } } },
      { text: "Category",         options: { bold: true, color: B.white, fill: { color: B.dark } } },
      { text: "Assignees",        options: { bold: true, color: B.white, fill: { color: B.dark } } },
      { text: "Status",           options: { bold: true, color: B.white, fill: { color: B.dark } } },
    ];

    const dataRows = timeline.slice(0, 16).map((item, idx) => {
      const periodLabel = item.monthRange || item.month || item.quarter || "—";
      const assignees   = (item as any).emails?.join(", ") || (item as any).email || "—";
      const statusLabel = item.status === "completed" ? "✓ Done"
                        : item.status === "gap"       ? "⚠ Urgent"
                        : "Planned";
      const rowFill = idx % 2 === 0 ? B.cream : "F7F3EE";
      const statusColor = item.status === "completed" ? "27AE60"
                        : item.status === "gap"       ? "E67E22"
                        : B.moss;

      return [
        { text: periodLabel, options: { color: B.dark,   fill: { color: rowFill }, bold: true } },
        { text: item.label,  options: { color: B.dark,   fill: { color: rowFill } } },
        { text: item.category || "enablement", options: { color: B.moss, fill: { color: rowFill } } },
        { text: assignees,   options: { color: B.moss,   fill: { color: rowFill }, fontSize: 9 } },
        { text: statusLabel, options: { color: statusColor, fill: { color: rowFill }, bold: true } },
      ];
    });

    plan.addTable([headerCells, ...dataRows], {
      x: 0.4, y: 1.25, w: 12.5,
      colW: [1.8, 4.5, 1.8, 2.4, 1.2],
      border: { color: B.sand, pt: 0.5 },
      fontSize: 10, fontFace: FONT,
      autoPage: true,
      autoPageRepeatHeader: true,
    });
  }

  // ── SLIDE 6: Next Steps ─────────────────────────────────────────────────────
  const next = prs.addSlide();
  next.background = { color: B.cream };

  // Charcoal block on the left
  next.addShape("rect", {
    x: -2, y: -2, w: 6, h: 12,
    fill: { color: B.dark },
    line: { type: "none" },
    rotate: -15
  });

  // Orange block pushing in
  next.addShape("rect", {
    x: 10.5, y: -2, w: 6, h: 12,
    fill: { color: B.orange },
    line: { type: "none" },
    rotate: -15
  });

  next.addText("Next Steps", {
    x: 4.5, y: 1.0, w: 6, h: 0.7,
    fontSize: 32, bold: true, color: B.dark, fontFace: FONT,
  });

  const steps: string[] = [];
  if (req.salesPro.obtained < req.salesPro.required)      steps.push(`Enrol ${req.salesPro.required - req.salesPro.obtained} additional Sales-Pro candidates`);
  if (req.techPro.obtained < req.techPro.required)         steps.push(`Enrol ${req.techPro.required - req.techPro.obtained} additional Tech-Pro candidates`);
  if (req.bootcamp.obtained < req.bootcamp.required)       steps.push(`Register ${req.bootcamp.required - req.bootcamp.obtained} SE(s) for upcoming Bootcamp`);
  if (req.implSpec.obtained < req.implSpec.required)       steps.push(`Target ${req.implSpec.required - req.implSpec.obtained} Implementation Specialist certification(s)`);
  if (steps.length === 0) steps.push("All core enablement requirements are met — maintain programme currency");
  if (timeline.length === 0) steps.push("Create a 12-month enablement roadmap via the CampaignIQ platform");

  steps.slice(0, 6).forEach((s, i) => {
    next.addShape("rect", { x: 4.5, y: 2.2 + i * 0.8 + 0.15, w: 0.2, h: 0.2, fill: { color: B.orange }, line: { type: "none" } });
    next.addText(s, { x: 4.8, y: 2.2 + i * 0.8, w: 6, h: 0.5, fontSize: 13, color: B.dark, fontFace: FONT });
  });

  next.addText("Everpure | FY27 Partner Enablement", {
    x: 4.5, y: 7.1, w: 8, h: 0.25,
    fontSize: 9, color: B.moss, fontFace: FONT,
  });

  // ── Write file ──────────────────────────────────────────────────────────────
  const fname = filename ?? `${partner.name.replace(/[^a-zA-Z0-9]/g, "_")}_Enablement_Report.pptx`;
  await prs.writeFile({ fileName: fname });
}

// Global export: all partners in one deck (one partner per section)
export async function exportAllPartnersPptx(
  partners: PartnerForExport[],
  timelines: Record<number, TimelineItem[]>,
  signature?: ExportSignature
) {
  const PptxGenJS = await getPptxgen();
  const prs = new PptxGenJS();

  prs.layout = "LAYOUT_WIDE";
  prs.author = "Everpure CampaignIQ";
  prs.company = "Pure Storage";
  prs.subject = "FY27 Partner Enablement Consolidated Report";

  // Cover
  const cover = prs.addSlide();
  cover.background = { color: B.cream };

  // 1. Charcoal Backplate (Right side swoop)
  cover.addShape("rect", {
    x: 6.5, y: -2, w: 9, h: 12,
    fill: { color: B.dark },
    line: { type: "none" },
    rotate: 18
  });

  // 2. Vibrant Orange Main Block (Left side swoop)
  cover.addShape("rect", {
    x: -1.5, y: -2, w: 7.8, h: 12,
    fill: { color: B.orange },
    line: { type: "none" },
    rotate: 15
  });

  cover.addText("FY27 Portfolio\nConsolidated Report", {
    x: 0.6, y: 2.8, w: 6.5, h: 2.5,
    fontSize: 48, bold: true, color: B.cream, fontFace: FONT,
  });

  cover.addText(`Aggregated Enablement &\nRoadmap Data`, {
    x: 7.5, y: 2.8, w: 5, h: 1.5,
    fontSize: 24, bold: false, color: B.cream, fontFace: FONT, align: "right"
  });

  cover.addText(`Prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} | ${partners.length} Partners`, {
    x: 6.5, y: 6.8, w: 6.5, h: 0.3,
    fontSize: 11, color: B.dark, fontFace: FONT, align: "right"
  });

  if (signature) {
    cover.addText(`Electronically Signed By: ${signature.name}\nCommitment Date: ${signature.date}`, {
      x: 0.6, y: 6.5, w: 5, h: 0.8,
      fontSize: 11, bold: true, color: B.cream, fontFace: FONT, align: "left"
    });
  }

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
