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

function progressBar(obtained: number, required: number, color = "#FF7023") {
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
    <div style="background:#5A6359;padding:28px 36px;border-radius:12px 12px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style="flex-shrink:0;margin-top:2px;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="#FF7023"/>
          </svg>
          <div>
            <div style="color:#FF7023;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              Pure Storage · FY27 Partner Enablement Plan
            </div>
            <h1 style="color:#FFF5E3;font-size:26px;font-weight:800;margin:0 0 4px;">${escHtml(partner.name)}</h1>
            <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
            <span style="background:${tc}22;color:${tc};border:1px solid ${tc}44;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;">
              ${tierDef.label}
            </span>
            ${partner.meta?.region ? `<span style="color:#4b5563;font-size:11px;">📍 ${escHtml(partner.meta.region)}${partner.meta.subRegion ? " · " + escHtml(partner.meta.subRegion) : ""}</span>` : ""}
            ${partner.meta?.pam ? `<span style="color:#4b5563;font-size:11px;">👤 PAM: ${escHtml(partner.meta.pam)}</span>` : ""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:#e5e7eb;font-size:10px;">Generated</div>
          <div style="color:#fff;font-size:12px;font-weight:600;">${now}</div>
          <div style="margin-top:8px;">
            <span style="font-size:18px;font-weight:900;color:${
              partner.enablementScore >= 80 ? "#22c55e" : partner.enablementScore >= 40 ? "#f59e0b" : "#ef4444"
            };">${partner.enablementScore}%</span>
            <span style="color:#374151;font-size:10px;margin-left:4px;">Enablement Score</span>
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
    <div class="section-block">
      <div class="section-title">📋 Recommended Action</div>
      <div style="background:${allMet ? "#f0fdf4" : "#fff7ed"};border-left:4px solid ${allMet ? "#16a34a" : "#FF7023"};padding:14px 18px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;color:#1f2937;">
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
          <div style="font-size:10px;font-weight:600;color:#374151;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;">Completed by</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${people.map(p => pill(`${p.firstName} ${p.lastName}`, "#f3f4f6", "#374151")).join("")}
          </div>
        </div>` : ""}
        ${!met ? `
        <div style="margin-top:10px;padding:8px;background:#fff7ed;border-radius:6px;">
          <div style="font-size:10px;font-weight:700;color:#FF7023;margin-bottom:3px;">📚 Training Resource</div>
          <a href="${escHtml(link.url)}" style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:600;">${escHtml(link.title)}</a>
          <div style="font-size:10px;color:#374151;margin-top:2px;">${escHtml(link.audience)}</div>
        </div>` : ""}
      </div>`;
  }

  return `
    <div class="section-block">
      <div class="section-title">📊 Enablement Progress</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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
      <div class="section-block">
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
              ${prioritised.length > 10 ? `<span style="font-size:10px;color:#374151;padding:4px;">+${prioritised.length - 10} more</span>` : ""}
            </div>`
          : `<div style="font-size:11px;color:#374151;font-style:italic;">No existing contacts identified — recruit new individuals for this path.</div>`}
        <div style="margin-top:8px;font-size:10px;color:#374151;line-height:1.5;">${escHtml(link.description)}</div>
      </div>`;
  });

  return `
    <div class="section-block">
      <div class="section-title">🎯 Recommended Training Candidates</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${rows.join("")}</div>
      <div style="margin-top:8px;font-size:10px;color:#374151;">★ = Priority contact (listed in partner target contacts)</div>
    </div>`;
}

// ─── Section: Online Course Summary ──────────────────────────

function sectionCourseSummary(partner: Partner) {
  const td = trainingData[partner.id];
  if (!td) {
    return `
      <div class="section-block">
        <div class="section-title">📚 Online Course Summary</div>
        <div style="color:#374151;font-size:13px;font-style:italic;">No online training data available for this partner.</div>
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
      <div class="section-block">
        <div class="section-title">📚 Online Course Summary</div>
        <div style="color:#374151;font-size:13px;font-style:italic;">No course completions recorded yet for this partner.</div>
      </div>`;
  }

  const rows = courses.map((c) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fafafa;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div>
          <div style="font-weight:700;font-size:13px;color:#111827;">${c.icon} ${escHtml(c.label)}</div>
          <a href="${escHtml(c.link.url)}" style="font-size:10px;color:#2563eb;text-decoration:none;">View Course →</a>
        </div>
        <span style="background:#FF702318;color:#FF7023;font-size:18px;font-weight:900;padding:4px 12px;border-radius:8px;">
          ${c.people.length}
        </span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${c.people.map((p) => pill(`${p.firstName} ${p.lastName}`, "#f3f4f6", "#374151")).join("")}
      </div>
    </div>`);

  return `
    <div class="section-block">
      <div class="section-title">📚 Online Course Summary</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${rows.join("")}</div>
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
      <div style="flex:1;min-width:0;border:1px solid ${met ? "#bbf7d0" : "#e5e7eb"};border-radius:8px;padding:14px;background:${met ? "#f0fdf4" : "#fafafa"};">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0;
            background:${met ? "#FF7023" : "#e5e7eb"};color:${met ? "#fff" : "#4b5563"};">
            ${step}
          </div>
          <div>
            <div style="font-weight:700;font-size:12px;color:#111827;">${escHtml(label)}</div>
            <div style="font-size:10px;color:#374151;">${escHtml(sublabel)}</div>
          </div>
        </div>
        ${progressBar(people.length, 2, "#FF7023")}
        ${people.length > 0 ? `
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:3px;">
          ${people.map((p) => pill(`${p.firstName} ${p.lastName}`, "#fff7ed", "#92400e")).join("")}
        </div>` : ""}
        ${!met ? `
        <div style="margin-top:8px;">
          <a href="${escHtml(link.url)}" style="font-size:10px;color:#2563eb;font-weight:600;text-decoration:none;display:block;word-wrap:break-word;">
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
    <div class="section-block">
      <div class="section-title">🛠️ ASP Eligibility — Authorized Support Partner</div>
      <div style="border:2px solid ${isEligible ? "#FF7023" : "#e5e7eb"};border-radius:12px;padding:20px;background:${isEligible ? "#fff7f3" : "#fafafa"};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:#111827;">ASP Programme Status</div>
            <div style="font-size:11px;color:#374151;margin-top:2px;">Requires ≥2 individuals in each of 3 qualification steps</div>
          </div>
          <div>
            ${isEligible
              ? `<span style="background:#FF702318;color:#FF7023;font-size:12px;font-weight:800;padding:6px 14px;border-radius:100px;display:flex;align-items:center;gap:6px;">
                  ✅ ${isManual ? "APPROVED (Manual)" : "ELIGIBLE"}
                </span>`
              : `<span style="background:#f3f4f6;color:#374151;font-size:12px;font-weight:700;padding:6px 14px;border-radius:100px;">
                  ⏳ NOT YET ELIGIBLE
                </span>`}
          </div>
        </div>
        <div style="display:flex;gap:12px;">
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
        <div style="font-size:10px;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
        <div style="font-size:14px;font-weight:700;color:#111827;margin-top:4px;">${value !== null ? fmt(value) : "—"}</div>
        <div style="font-size:9px;color:#e5e7eb;margin-top:2px;">N/A for ${tierDef.shortLabel}</div>
      </div>`;
    }
    const current = value ?? 0;
    const met = current >= threshold;
    return `<div style="border:1px solid ${met ? "#bbf7d0" : "#fecaca"};border-radius:8px;padding:12px;text-align:center;background:${met ? "#f0fdf4" : "#fff5f5"};">
      <div style="font-size:10px;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:14px;font-weight:700;color:${met ? "#16a34a" : "#dc2626"};margin-top:4px;">${value !== null ? fmt(value) : "—"}</div>
      <div style="font-size:9px;color:#374151;margin-top:2px;">Req: ${fmt(threshold)} ${met ? "✓" : `· Gap: ${fmt(threshold - current)}`}</div>
    </div>`;
  }

  return `
    <div class="section-block">
      <div class="section-title">💰 Business Metrics</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
        ${metricCard("Bookings (USD)", bm.bookingsUSD, thresholds.bookingsUSD, (v) => formatCurrency(v, true))}
        ${metricCard("Unique Customers", bm.uniqueCustomers, thresholds.uniqueCustomers, (v) => String(v))}
        ${metricCard("Partner-Delivered Services", bm.partnerDeliveredServices, thresholds.partnerDeliveredServices, (v) => String(v))}
      </div>
    </div>`;
}

// ─── Section: Timeline & Sign-off ────────────────────────────

function sectionTimeline(partner: Partner) {
  const reqs = partner.requirements;

  // Build milestone rows from open gaps + ASP requirement
  interface Milestone {
    icon: string;
    label: string;
    description: string;
    suggestedDate: string;
    id: string;
  }

  const today = new Date();
  function addMonths(m: number) {
    const d = new Date(today);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().substring(0, 10);
  }

  const milestones: Milestone[] = [];
  let offset = 1;

  if (reqs.salesPro.obtained < reqs.salesPro.required) {
    milestones.push({
      icon: "💼", id: "ms-salespro",
      label: "Complete Sales Professional Learning Path",
      description: `Need ${reqs.salesPro.required - reqs.salesPro.obtained} more completion(s) — ${reqs.salesPro.obtained}/${reqs.salesPro.required} achieved.`,
      suggestedDate: addMonths(offset++),
    });
  }
  if (reqs.techPro.obtained < reqs.techPro.required) {
    milestones.push({
      icon: "🔧", id: "ms-techpro",
      label: "Complete Technical Sales Pro Learning Path",
      description: `Need ${reqs.techPro.required - reqs.techPro.obtained} more completion(s) — ${reqs.techPro.obtained}/${reqs.techPro.required} achieved.`,
      suggestedDate: addMonths(offset++),
    });
  }
  if (reqs.bootcamp.obtained < reqs.bootcamp.required) {
    milestones.push({
      icon: "🏕️", id: "ms-bootcamp",
      label: "Attend SE Bootcamp FY27",
      description: `Need ${reqs.bootcamp.required - reqs.bootcamp.obtained} more completion(s) — ${reqs.bootcamp.obtained}/${reqs.bootcamp.required} achieved.`,
      suggestedDate: addMonths(offset++),
    });
  }
  if (reqs.implSpec.obtained < reqs.implSpec.required) {
    milestones.push({
      icon: "⚙️", id: "ms-implspec",
      label: "Complete Implementation Specialist Certification",
      description: `Need ${reqs.implSpec.required - reqs.implSpec.obtained} more completion(s) — ${reqs.implSpec.obtained}/${reqs.implSpec.required} achieved.`,
      suggestedDate: addMonths(offset++),
    });
  }

  if (milestones.length === 0) {
    return `
    <div class="section-block">
      <div class="section-title">📅 Enablement Timeline &amp; Commitment</div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;color:#15803d;font-size:13px;font-weight:600;">
        ✅ All enablement requirements met — no outstanding milestones. Partner is in good standing.
      </div>
      ${signatureBlock()}
    </div>`;
  }

  const rows = milestones.map((m, i) => `
    <tr class="timeline-row" data-id="${m.id}" data-label="${escHtml(m.label)}" style="border-bottom:1px solid #e5e7eb;background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#111827;width:32px;">${i + 1}</td>
      <td style="padding:10px 12px;">
        <div style="font-size:13px;font-weight:700;color:#111827;">${m.icon} ${escHtml(m.label)}</div>
        <div style="font-size:11px;color:#111827;margin-top:2px;">${escHtml(m.description)}</div>
      </td>
      <td style="padding:10px 12px;white-space:nowrap;">
        <input class="date-field" type="date" id="${m.id}-suggested" value="${m.suggestedDate}" />
      </td>
      <td style="padding:10px 12px;white-space:nowrap;">
        <input class="date-field editable" type="date" id="${m.id}-partner" />
      </td>
      <td style="padding:10px 12px;text-align:center;">
        <input type="checkbox" id="${m.id}-agreed" class="agree-box" />
      </td>
    </tr>`);

  return `
    <div class="section-block">
      <div class="section-title">📅 Enablement Timeline &amp; Commitment</div>
      <p style="font-size:12px;color:#111827;margin-bottom:12px;">
        The following milestone schedule has been proposed by Pure Storage to bring this partner to full ${escHtml(TIER_DEFINITIONS[partner.programTier].label)} tier compliance.
        Partners may adjust any proposed date in the <strong style="color:#FF7023;">Partner Proposed</strong> column. Both parties agree to this plan by signing below.
      </p>
      <table id="timeline-table" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#5A6359;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#fff;width:32px;">#</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#fff;">Milestone</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;">Suggested Date</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#FF7023;white-space:nowrap;">Partner Proposed</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:#fff;">Agreed ✓</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      <div class="no-print" style="display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap;">
        <p style="font-size:11px;color:#111827;font-style:italic;flex:1;">💡 Fill in your preferred dates in the <strong style="color:#FF7023;">Partner Proposed</strong> column, tick Agreed, then submit or print.</p>
        <button id="submit-commitment-btn" style="background:#5A6359;color:#fff;font-size:12px;font-weight:700;padding:8px 18px;border-radius:8px;border:none;cursor:pointer;">📤 Submit to Dashboard</button>
      </div>
      <div id="submit-success" style="display:none;margin-top:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:12px;font-weight:600;color:#15803d;">
        ✅ Commitment submitted to the dashboard successfully!
      </div>
      ${signatureBlock()}
    </div>`;
}

function signatureBlock() {
  return `
    <div class="section-block" style="break-before:avoid;">
      <div class="section-title">✍️ Sign-off &amp; Acceptance</div>
      <p style="font-size:12px;color:#111827;margin-bottom:20px;">By signing below, both parties confirm acceptance of the enablement plan and the milestone dates outlined above.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">
        <div>
          <div style="font-size:11px;font-weight:700;color:#111827;margin-bottom:4px;">Partner Representative</div>
          <div class="sig-line"></div>
          <div style="display:flex;gap:24px;margin-top:14px;">
            <div style="flex:1;">
              <div style="font-size:10px;color:#111827;">Name</div>
              <div class="sig-line" style="margin-top:2px;"></div>
            </div>
            <div style="flex:1;">
              <div style="font-size:10px;color:#111827;">Date</div>
              <div class="sig-line" style="margin-top:2px;"></div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:10px;color:#111827;">Title / Role</div>
          <div class="sig-line" style="margin-top:2px;"></div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#111827;margin-bottom:4px;">Pure Storage — Partner Account Manager</div>
          <div class="sig-line"></div>
          <div style="display:flex;gap:24px;margin-top:14px;">
            <div style="flex:1;">
              <div style="font-size:10px;color:#111827;">Name</div>
              <div class="sig-line" style="margin-top:2px;"></div>
            </div>
            <div style="flex:1;">
              <div style="font-size:10px;color:#111827;">Date</div>
              <div class="sig-line" style="margin-top:2px;"></div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:10px;color:#111827;">Title / Role</div>
          <div class="sig-line" style="margin-top:2px;"></div>
        </div>
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
    color: #1f2937;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #e5e7eb;
  }
  .section-block {
    margin-top: 20px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sig-line {
    height: 1px;
    background: #374151;
    margin-top: 32px;
    width: 100%;
  }
  .date-field {
    font-size: 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 3px 6px;
    color: #374151;
    background: #fff;
    width: 130px;
  }
  .date-field.editable {
    border-color: #FF7023;
    background: #fff7ed;
  }
  .agree-box {
    width: 16px;
    height: 16px;
    accent-color: #FF7023;
  }
  .print-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #FF7023;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    margin: 20px 0 0;
  }
  .print-btn:hover { opacity: 0.9; }
  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #4b5563;
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { background: #fff; }
    .page-wrap { box-shadow: none; max-width: 100%; }
    .no-print { display: none; }
    .date-field {
      border: none;
      border-bottom: 1px solid #374151;
      border-radius: 0;
      background: transparent;
      padding: 0;
    }
    .agree-box { appearance: auto; }
    @page { margin: 1cm 1.5cm; size: A4; }
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
    ${sectionTimeline(partner)}
    <div class="footer no-print">
      <span>Pure Storage FY27 Global Reseller Program · CampaignIQ Dashboard</span>
      <span>Confidential — For internal use only</span>
    </div>
  </div>
</div>
<div class="no-print" style="text-align:center;padding:16px 0 32px;">
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <p style="font-size:11px;color:#111827;margin-top:8px;">Review and adjust timeline dates, then submit to dashboard before or after printing.</p>
</div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('submit-commitment-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var rows = document.querySelectorAll('.timeline-row');
      var commitments = [];
      rows.forEach(function(row) {
        var id = row.getAttribute('data-id');
        var label = row.getAttribute('data-label');
        var suggested = document.getElementById(id + '-suggested');
        var partner = document.getElementById(id + '-partner');
        var agreed = document.getElementById(id + '-agreed');
        commitments.push({
          id: id,
          label: label,
          suggestedDate: suggested ? suggested.value : '',
          partnerDate: partner ? partner.value : '',
          agreed: agreed ? agreed.checked : false
        });
      });
      var payload = {
        type: 'PEI_COMMITMENT_SUBMIT',
        partnerId: ${partner.id},
        partnerName: '${escHtml(partner.name)}',
        submittedAt: new Date().toISOString(),
        commitments: commitments
      };
      try {
        if (window.opener) {
          window.opener.postMessage(payload, '*');
          document.getElementById('submit-success').style.display = 'block';
          btn.textContent = '✅ Submitted!';
          btn.style.background = '#16a34a';
        } else {
          alert('Dashboard window not found. Make sure the dashboard tab is still open.');
        }
      } catch(e) {
        alert('Could not submit: ' + e.message);
      }
    });
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
