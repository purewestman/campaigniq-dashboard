/*
 * Enablement Plan PDF Generator — CampaignIQ Dashboard
 * Opens a styled, print-ready HTML page in a new tab and triggers window.print().
 * Layout mirrors the dashboard's orange/dark-neutral palette.
 */

import type { Partner } from "./data";
import { TIER_DEFINITIONS, generateRecommendedAction, formatCurrency } from "./data";
import { trainingData } from "./trainingData";
import { aspData } from "./aspData";
import { TRAINING_LINKS } from "./trainingLinks";
import type { AspOverride } from "@/contexts/OverrideContext";

// ─── Helpers ──────────────────────────────────────────────────

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function progressBar(obtained: number, required: number, color = "#e8571a") {
  if (required === 0) return `<span style="color:#888;font-size:11px;">N/A</span>`;
  const pct = Math.min(100, Math.round((obtained / required) * 100));
  const met = obtained >= required;
  const barColor = met ? "#16a34a" : color;
  return `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;"></div>
      </div>
      <span style="font-size:11px;font-weight:700;color:${met ? "#16a34a" : "#374151"};min-width:36px;text-align:right;">
        ${obtained}/${required}
      </span>
    </div>`;
}

function pill(text: string, bg: string, color: string) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:100px;background:${bg};color:${color};font-size:10px;font-weight:700;margin:2px;">${escHtml(text)}</span>`;
}

// ─── Section: Header ──────────────────────────────────────────

function sectionHeader(partner: Partner) {
  const tierDef = TIER_DEFINITIONS[partner.programTier];
  const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  const tierColors: Record<string, string> = {
    ambassador: "#7c3aed",
    elite: "#0d9488",
    preferred: "#d97706",
    authorized: "#2563eb",
  };
  const tc = tierColors[partner.programTier] ?? "#374151";

  return `
    <div style="background:#18181b;padding:28px 36px;border-radius:12px 12px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="color:#e8571a;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
            Pure Storage · FY27 Partner Enablement Plan
          </div>
          <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 4px;">${escHtml(partner.name)}</h1>
          <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
            <span style="background:${tc}22;color:${tc};border:1px solid ${tc}44;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;">
              ${tierDef.label}
            </span>
            ${partner.meta?.region ? `<span style="color:#9ca3af;font-size:11px;">📍 ${escHtml(partner.meta.region)}${partner.meta.subRegion ? " · " + escHtml(partner.meta.subRegion) : ""}</span>` : ""}
            ${partner.meta?.pam ? `<span style="color:#9ca3af;font-size:11px;">👤 PAM: ${escHtml(partner.meta.pam)}</span>` : ""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:#6b7280;font-size:10px;">Generated</div>
          <div style="color:#d1d5db;font-size:12px;font-weight:600;">${now}</div>
          <div style="margin-top:8px;">
            <span style="font-size:18px;font-weight:900;color:${
              partner.enablementScore >= 80 ? "#22c55e" : partner.enablementScore >= 40 ? "#f59e0b" : "#ef4444"
            };">${partner.enablementScore}%</span>
            <span style="color:#6b7280;font-size:10px;margin-left:4px;">Enablement Score</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── Section: Recommended Action ─────────────────────────────

function sectionAction(partner: Partner) {
  const action = generateRecommendedAction(partner);
  const allMet = partner.enablementCompliant && partner.businessCompliant;
  return `
    <div class="section-wrap" style="margin-top:20px;">
      <div class="section-title">📋 Recommended Action</div>
      <div class="card" style="background:${allMet ? "#f0fdf4" : "#fff7ed"};border-left:4px solid ${allMet ? "#16a34a" : "#e8571a"};padding:14px 18px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;color:#1f2937;">
        ${escHtml(action)}
      </div>
    </div>`;
}

// ─── Section: Enablement Progress ────────────────────────────

function sectionEnablementProgress(partner: Partner) {
  const reqs = partner.requirements;
  const td = trainingData[partner.id];

  function categoryBlock(
    label: string,
    key: "salesPro" | "techPro" | "bootcamp" | "implSpec",
    linkKey: string,
    icon: string,
  ) {
    const req = reqs[key];
    const people = td ? td[key] : [];
    const met = req.obtained >= req.required;
    const link = TRAINING_LINKS[linkKey];

    return `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fafafa;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-weight:700;font-size:13px;color:#111827;">${icon} ${label}</div>
          <span style="font-size:10px;padding:2px 8px;border-radius:100px;font-weight:700;
            background:${met ? "#dcfce7" : "#fee2e2"};color:${met ? "#16a34a" : "#dc2626"};">
            ${met ? "✓ MET" : "OPEN GAP"}
          </span>
        </div>
        ${progressBar(req.obtained, req.required)}
        ${people.length > 0 ? `
        <div style="margin-top:10px;">
          <div style="font-size:10px;font-weight:600;color:#6b7280;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;">Completed by</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${people.map(p => pill(`${p.firstName} ${p.lastName}`, "#f3f4f6", "#374151")).join("")}
          </div>
        </div>` : ""}
        ${!met ? `
        <div style="margin-top:10px;padding:8px;background:#fff7ed;border-radius:6px;">
          <div style="font-size:10px;font-weight:700;color:#e8571a;margin-bottom:3px;">📚 Training Resource</div>
          <a href="${escHtml(link.url)}" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">${escHtml(link.title)}</a>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;">${escHtml(link.audience)}</div>
        </div>` : ""}
      </div>`;
  }

  return `
    <div style="margin-top:20px;">
      <div class="section-title">📊 Enablement Progress</div>
      <div class="grid-2">
        ${categoryBlock("Sales Professional", "salesPro", "salesPro", "💼")}
        ${categoryBlock("Technical Sales Pro", "techPro", "techPro", "🔧")}
        ${categoryBlock("SE Bootcamp", "bootcamp", "bootcamp", "🏕️")}
        ${categoryBlock("Implementation Specialist", "implSpec", "implSpec", "⚙️")}
      </div>
    </div>`;
}

// ─── Section: Recommended Training Candidates ─────────────────

function sectionCandidates(partner: Partner) {
  const td = trainingData[partner.id];
  const reqs = partner.requirements;

  // All people who appear in any category for this partner
  const allPeopleMap = new Map<string, { email: string; firstName: string; lastName: string }>();
  if (td) {
    [...td.salesPro, ...td.techPro, ...td.bootcamp, ...td.implSpec].forEach((p) => {
      allPeopleMap.set(p.email, p);
    });
  }

  interface Gap {
    category: string;
    linkKey: string;
    still: number;
    completedEmails: Set<string>;
  }

  const gaps: Gap[] = [];
  if (td) {
    const cats: { key: "salesPro" | "techPro" | "bootcamp" | "implSpec"; label: string; linkKey: string }[] = [
      { key: "salesPro", label: "Sales Professional", linkKey: "salesPro" },
      { key: "techPro", label: "Technical Sales Pro", linkKey: "techPro" },
      { key: "bootcamp", label: "SE Bootcamp", linkKey: "bootcamp" },
      { key: "implSpec", label: "Implementation Specialist", linkKey: "implSpec" },
    ];
    cats.forEach(({ key, label, linkKey }) => {
      const req = reqs[key];
      if (req.obtained < req.required) {
        gaps.push({
          category: label,
          linkKey,
          still: req.required - req.obtained,
          completedEmails: new Set(td[key].map((p) => p.email)),
        });
      }
    });
  }

  if (gaps.length === 0) {
    return `
      <div style="margin-top:20px;">
        <div class="section-title">🎯 Recommended Training Candidates</div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;color:#15803d;font-size:13px;font-weight:600;">
          ✅ All enablement requirements met. No additional training candidates required.
        </div>
      </div>`;
  }

  // Target emails from partner.targetEmails or all known people not yet completed
  const targetSet = new Set(partner.targetEmails);
  // allPeopleMap.values() used inline below

  const rows = gaps.map((gap) => {
    const link = TRAINING_LINKS[gap.linkKey];
    // Candidates: people not in the completed set; prioritise targetEmails
    const candidates = Array.from(allPeopleMap.values()).filter((p) => !gap.completedEmails.has(p.email));
    const prioritised = candidates.sort((a) => (targetSet.has(a.email) ? -1 : 1));

    return `
      <div style="border:1px solid #fde68a;border-radius:8px;padding:16px;background:#fffbeb;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div>
            <div style="font-weight:700;font-size:13px;color:#92400e;">${escHtml(gap.category)}</div>
            <div style="font-size:10px;color:#b45309;margin-top:2px;">Need ${gap.still} more completion${gap.still !== 1 ? "s" : ""}</div>
          </div>
          <a href="${escHtml(link.url)}" style="font-size:10px;color:#2563eb;font-weight:700;text-decoration:none;background:#eff6ff;padding:4px 10px;border-radius:6px;">
            📖 Access Training →
          </a>
        </div>
        <div style="font-size:10px;font-weight:600;color:#78350f;margin-bottom:6px;text-transform:uppercase;">Suggested Candidates</div>
        ${prioritised.length > 0
          ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${prioritised.slice(0, 10).map((p) =>
                pill(
                  `${p.firstName} ${p.lastName}${targetSet.has(p.email) ? " ★" : ""}`,
                  targetSet.has(p.email) ? "#fef3c7" : "#f3f4f6",
                  targetSet.has(p.email) ? "#92400e" : "#374151"
                )
              ).join("")}
              ${prioritised.length > 10 ? `<span style="font-size:10px;color:#6b7280;padding:4px;">+${prioritised.length - 10} more</span>` : ""}
            </div>`
          : `<div style="font-size:11px;color:#6b7280;font-style:italic;">No existing contacts identified — recruit new individuals for this path.</div>`}
        <div style="margin-top:8px;font-size:10px;color:#6b7280;line-height:1.5;">${escHtml(link.description)}</div>
      </div>`;
  });

  return `
    <div style="margin-top:20px;">
      <div class="section-title">🎯 Recommended Training Candidates</div>
      <div class="grid-2">${rows.join("")}</div>
      <div style="margin-top:8px;font-size:10px;color:#6b7280;">★ = Priority contact (listed in partner target contacts)</div>
    </div>`;
}

// ─── Section: Online Course Summary ──────────────────────────

function sectionCourseSummary(partner: Partner) {
  const td = trainingData[partner.id];
  if (!td) {
    return `
      <div style="margin-top:20px;">
        <div class="section-title">📚 Online Course Summary</div>
        <div style="color:#6b7280;font-size:13px;font-style:italic;">No online training data available for this partner.</div>
      </div>`;
  }

  interface CourseRow {
    label: string;
    icon: string;
    people: { email: string; firstName: string; lastName: string }[];
    link: { title: string; url: string };
  }

  const courses: CourseRow[] = [
    { label: "Sales Professional Learning Path FY27", icon: "💼", people: td.salesPro, link: TRAINING_LINKS.salesPro },
    { label: "Technical Sales Professional Learning Path FY27", icon: "🔧", people: td.techPro, link: TRAINING_LINKS.techPro },
    { label: "SE Bootcamp FY27", icon: "🏕️", people: td.bootcamp, link: TRAINING_LINKS.bootcamp },
    { label: "Implementation / Support Specialist", icon: "⚙️", people: td.implSpec, link: TRAINING_LINKS.implSpec },
  ].filter((c) => c.people.length > 0);

  if (courses.length === 0) {
    return `
      <div style="margin-top:20px;">
        <div class="section-title">📚 Online Course Summary</div>
        <div style="color:#6b7280;font-size:13px;font-style:italic;">No course completions recorded yet for this partner.</div>
      </div>`;
  }

  const rows = courses.map((c) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fafafa;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div>
          <div style="font-weight:700;font-size:13px;color:#111827;">${c.icon} ${escHtml(c.label)}</div>
          <a href="${escHtml(c.link.url)}" style="font-size:10px;color:#2563eb;text-decoration:none;">View Course →</a>
        </div>
        <span style="background:#e8571a18;color:#e8571a;font-size:18px;font-weight:900;padding:4px 12px;border-radius:8px;">
          ${c.people.length}
        </span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${c.people.map((p) => pill(`${p.firstName} ${p.lastName}`, "#f3f4f6", "#374151")).join("")}
      </div>
    </div>`);

  return `
    <div style="margin-top:20px;">
      <div class="section-title">📚 Online Course Summary</div>
      <div class="grid-2">${rows.join("")}</div>
    </div>`;
}

// ─── Section: ASP Eligibility ─────────────────────────────────

function sectionAsp(partner: Partner, aspOverride: AspOverride | undefined) {
  const asp = aspData[partner.id];
  const isManual = !!aspOverride;
  const isEligible = asp?.eligible || isManual;

  function aspStepBlock(
    step: number,
    label: string,
    sublabel: string,
    people: { email: string; firstName: string; lastName: string }[],
    linkKey: string,
  ) {
    const met = people.length >= 2;
    const link = TRAINING_LINKS[linkKey];
    return `
      <div style="flex:1;border:1px solid ${met ? "#bbf7d0" : "#e5e7eb"};border-radius:8px;padding:14px;background:${met ? "#f0fdf4" : "#fafafa"};">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0;
            background:${met ? "#e8571a" : "#e5e7eb"};color:${met ? "#fff" : "#9ca3af"};">
            ${step}
          </div>
          <div>
            <div style="font-weight:700;font-size:12px;color:#111827;">${escHtml(label)}</div>
            <div style="font-size:10px;color:#6b7280;">${escHtml(sublabel)}</div>
          </div>
        </div>
        ${progressBar(people.length, 2, "#e8571a")}
        ${people.length > 0 ? `
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:3px;">
          ${people.map((p) => pill(`${p.firstName} ${p.lastName}`, "#fff7ed", "#92400e")).join("")}
        </div>` : ""}
        ${!met ? `
        <div style="margin-top:8px;">
          <a href="${escHtml(link.url)}" style="font-size:10px;color:#2563eb;font-weight:600;text-decoration:none;">
            📖 ${escHtml(link.title)} →
          </a>
        </div>` : ""}
      </div>`;
  }

  const gapParts = asp ? [
    asp.foundations.length < 2 && `ASP Foundations (${asp.foundations.length}/2)`,
    asp.storageProCert.length < 2 && `Storage Pro Cert (${asp.storageProCert.length}/2)`,
    asp.supportSpecCert.length < 2 && `Support Spec Cert (${asp.supportSpecCert.length}/2)`,
  ].filter(Boolean) : ["No ASP training data recorded"];

  return `
    <div style="margin-top:20px;">
      <div class="section-title">🛠️ ASP Eligibility — Authorized Support Partner</div>
      <div style="border:2px solid ${isEligible ? "#e8571a" : "#e5e7eb"};border-radius:12px;padding:20px;background:${isEligible ? "#fff7f3" : "#fafafa"};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:#111827;">ASP Programme Status</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">Requires ≥2 individuals in each of 3 qualification steps</div>
          </div>
          <div>
            ${isEligible
              ? `<span style="background:#e8571a18;color:#e8571a;font-size:12px;font-weight:800;padding:6px 14px;border-radius:100px;display:flex;align-items:center;gap:6px;">
                  ✅ ${isManual ? "APPROVED (Manual)" : "ELIGIBLE"}
                </span>`
              : `<span style="background:#f3f4f6;color:#6b7280;font-size:12px;font-weight:700;padding:6px 14px;border-radius:100px;">
                  ⏳ NOT YET ELIGIBLE
                </span>`}
          </div>
        </div>
        <div class="asp-steps">
          ${aspStepBlock(1, "ASP Foundations", "FlashArray/FlashBlade Foundations Training & Assessment", asp?.foundations ?? [], "aspFoundations")}
          ${aspStepBlock(2, "Storage Pro Cert", "Storage Professional Certification", asp?.storageProCert ?? [], "aspStoragePro")}
          ${aspStepBlock(3, "Support Spec Cert", "Support Specialist Certification", asp?.supportSpecCert ?? [], "aspSupportSpec")}
        </div>
        ${!isEligible && gapParts.length > 0 ? `
        <div style="margin-top:14px;padding:10px 14px;background:#fff3cd;border-radius:6px;font-size:11px;color:#92400e;">
          <strong>Outstanding gaps to close:</strong> ${gapParts.join(" · ")}
        </div>` : ""}
        ${isManual ? `
        <div style="margin-top:10px;padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:11px;color:#9a3412;">
          <strong>⚡ Manually Approved</strong> — This partner has been granted ASP status by override on ${fmtDate(aspOverride!.approvedAt)}.
          ${aspOverride?.note ? ` Note: ${escHtml(aspOverride.note)}` : ""}
        </div>` : ""}
      </div>
    </div>`;
}

// ─── Section: Business Metrics ────────────────────────────────

function sectionBusiness(partner: Partner) {
  const bm = partner.businessMetrics;
  const tierDef = TIER_DEFINITIONS[partner.programTier];
  const thresholds = tierDef.businessMetrics;

  function metricCard(label: string, value: number | null, threshold: number | null, fmt: (v: number) => string) {
    if (threshold === null) {
      return `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center;background:#fafafa;">
        <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
        <div style="font-size:14px;font-weight:700;color:#111827;margin-top:4px;">${value !== null ? fmt(value) : "—"}</div>
        <div style="font-size:9px;color:#d1d5db;margin-top:2px;">N/A for ${tierDef.shortLabel}</div>
      </div>`;
    }
    const current = value ?? 0;
    const met = current >= threshold;
    return `<div style="border:1px solid ${met ? "#bbf7d0" : "#fecaca"};border-radius:8px;padding:12px;text-align:center;background:${met ? "#f0fdf4" : "#fff5f5"};">
      <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:14px;font-weight:700;color:${met ? "#16a34a" : "#dc2626"};margin-top:4px;">${value !== null ? fmt(value) : "—"}</div>
      <div style="font-size:9px;color:#6b7280;margin-top:2px;">Req: ${fmt(threshold)} ${met ? "✓" : `· Gap: ${fmt(threshold - current)}`}</div>
    </div>`;
  }

  return `
    <div style="margin-top:20px;">
      <div class="section-title">💰 Business Metrics</div>
      <div class="grid-3">
        ${metricCard("Bookings (USD)", bm.bookingsUSD, thresholds.bookingsUSD, (v) => formatCurrency(v, true))}
        ${metricCard("Unique Customers", bm.uniqueCustomers, thresholds.uniqueCustomers, (v) => String(v))}
        ${metricCard("Partner-Delivered Services", bm.partnerDeliveredServices, thresholds.partnerDeliveredServices, (v) => String(v))}
      </div>
    </div>`;
}

// ─── Main Generator ───────────────────────────────────────────

export function generateEnablementPlanHtml(
  partner: Partner,
  aspOverride: AspOverride | undefined,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Enablement Plan — ${escHtml(partner.name)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f9fafb;
    color: #111827;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
  .page-wrap {
    max-width: 960px;
    margin: 0 auto;
    background: #fff;
    box-shadow: 0 0 40px rgba(0,0,0,0.08);
  }
  .body-pad { padding: 28px 36px 40px; }
  .section-title {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #6b7280;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #f3f4f6;
  }
  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #9ca3af;
    display: flex;
    justify-content: space-between;
  }
  /* ── Layout helpers ────────────────────────────────── */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .asp-steps { display: flex; gap: 12px; }
  .asp-steps > div { flex: 1; }

  /* ── Page-break control ─────────────────────────────── */
  /* Titles always stay with the content that follows */
  .section-title { break-after: avoid; page-break-after: avoid; }
  /* Every direct child card of a grid must not split */
  .grid-2 > div,
  .grid-3 > div,
  .asp-steps > div,
  .section-wrap { break-inside: avoid; page-break-inside: avoid; }

  @media print {
    body { background: #fff; }
    .page-wrap { box-shadow: none; max-width: 100%; }
    .no-print { display: none; }
    @page { margin: 1.2cm 1.5cm; size: A4; }
    .section-title { break-after: avoid !important; page-break-after: avoid !important; }
    .grid-2 > div,
    .grid-3 > div,
    .asp-steps > div,
    .section-wrap { break-inside: avoid !important; page-break-inside: avoid !important; }
  }
</style>
</head>
<body>
<div class="page-wrap">
  ${sectionHeader(partner)}
  <div class="body-pad">
    ${sectionAction(partner)}
    ${sectionEnablementProgress(partner)}
    ${sectionCandidates(partner)}
    ${sectionCourseSummary(partner)}
    ${sectionBusiness(partner)}
    ${sectionAsp(partner, aspOverride)}
    <div class="footer">
      <span>Pure Storage FY27 Global Reseller Program · CampaignIQ Dashboard</span>
      <span>Confidential — For internal use only</span>
    </div>
  </div>
</div>
<script>
  window.addEventListener("load", function() {
    setTimeout(function() { window.print(); }, 600);
  });
<\/script>
</body>
</html>`;
}

export function openEnablementPlan(partner: Partner, aspOverride: AspOverride | undefined) {
  const html = generateEnablementPlanHtml(partner, aspOverride);
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to export the plan.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
