/*
 * Partner Profile PDF Generator — CampaignIQ Dashboard
 * Opens a styled, print-ready HTML page in a new tab and triggers window.print().
 * This is the premium, high-fidelity replacement for the legacy Capture-based ExportButton.
 */

import { type Partner, TIER_DEFINITIONS, formatCurrency, formatPercent, getRevenueAttainment, generateRecommendedAction } from "./data";
import { trainingData } from "./trainingData";

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generatePartnerProfileHtml(partner: Partner): string {
  const def = TIER_DEFINITIONS[partner.programTier];
  const training = trainingData[partner.id];
  const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  
  const tierColors: Record<string, string> = {
    ambassador: "#7c3aed",
    elite: "#0d9488",
    preferred: "#d97706",
    authorized: "#2563eb",
  };
  const tc = tierColors[partner.programTier] ?? "#374151";

  // ─── Header ────────────────────────────────────────────────
  const headerHtml = `
    <div style="background:#5A6359;padding:28px 36px;border-radius:12px 12px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style="flex-shrink:0;margin-top:2px;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="#FF7023"/>
          </svg>
          <div>
            <div style="color:#FF7023;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              Pure Storage · FY27 Partner Status Report
            </div>
            <h1 style="color:#FFF5E3;font-size:26px;font-weight:800;margin:0 0 4px;">${escHtml(partner.name)}</h1>
            <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
              <span style="background:${tc}22;color:${tc};border:1px solid ${tc}44;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;">
                ${def.label}
              </span>
              ${partner.meta?.region ? `<span style="color:#e5e7eb;font-size:11px;opacity:0.8;">📍 ${escHtml(partner.meta.region)}</span>` : ""}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:#e5e7eb;font-size:10px;">Exported On</div>
          <div style="color:#fff;font-size:12px;font-weight:600;">${now}</div>
          <div style="margin-top:8px;">
            <span style="font-size:18px;font-weight:900;color:${
              partner.enablementScore >= 80 ? "#22c55e" : partner.enablementScore >= 40 ? "#f59e0b" : "#ef4444"
            };">${partner.enablementScore}%</span>
            <span style="color:#fff;font-size:10px;margin-left:4px;opacity:0.6;">Enablement Score</span>
          </div>
        </div>
      </div>
    </div>`;

  // ─── Business Metrics Card ─────────────────────────────────
  const bm = partner.businessMetrics;
  const thresholds = def.businessMetrics;
  
  function metricRow(label: string, value: number | null, threshold: number | null, fmt: (v: number) => string) {
    const current = value ?? 0;
    const met = threshold === null || current >= threshold;
    const na = threshold === null;
    
    return `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#fafafa;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${label}</div>
          <div style="font-size:18px;font-weight:800;color:${na ? "#374151" : met ? "#16a34a" : "#dc2626"};margin-top:2px;">
            ${value !== null ? fmt(value) : "—"}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;">Program Req.</div>
          <div style="font-size:11px;font-weight:700;color:#374151;">${na ? "N/A" : fmt(threshold)}</div>
        </div>
      </div>`;
  }

  const businessMetricsHtml = `
    <div class="section-block">
      <div class="section-title">💰 Business Metrics Achievement</div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;">
        ${metricRow("Bookings (USD)", bm.bookingsUSD, thresholds.bookingsUSD, (v) => formatCurrency(v, true))}
        ${metricRow("Unique Customers", bm.uniqueCustomers, thresholds.uniqueCustomers, (v) => String(v))}
        ${metricRow("Partner Services", bm.partnerDeliveredServices, thresholds.partnerDeliveredServices, (v) => String(v))}
      </div>
    </div>`;

  // ─── Enablement Grid ───────────────────────────────────────
  const reqs = partner.requirements;
  function enablementBlock(label: string, key: "salesPro" | "techPro" | "bootcamp" | "implSpec") {
    const req = reqs[key];
    const people = training ? training[key] : [];
    const met = req.obtained >= req.required;
    const pct = req.required > 0 ? Math.min(100, (req.obtained / req.required) * 100) : 0;
    
    return `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-weight:700;font-size:13px;color:#111827;">${label}</div>
          <span style="font-size:9px;padding:2px 8px;border-radius:100px;font-weight:700;background:${met ? "#dcfce7" : "#fee2e2"};color:${met ? "#16a34a" : "#dc2626"};">
            ${met ? "✓ MET" : "GAP"}
          </span>
        </div>
        <div style="height:6px;background:#f3f4f6;border-radius:100px;overflow:hidden;margin-bottom:8px;">
           <div style="width:${pct}%;height:100%;background:${met ? "#16a34a" : "#FF7023"};"></div>
        </div>
        <div style="text-align:right;font-size:11px;font-weight:700;color:#374151;margin-bottom:10px;">${req.obtained} / ${req.required}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${people.slice(0, 3).map(p => `
            <span style="font-size:9px;background:#f9fafb;border:1px solid #e5e7eb;padding:2px 6px;border-radius:4px;color:#4b5563;">${escHtml(p.firstName)} ${escHtml(p.lastName)}</span>
          `).join('')}
          ${people.length > 3 ? `<span style="font-size:9px;color:#9ca3af;padding-top:2px;">+${people.length - 3} more</span>` : ""}
        </div>
      </div>`;
  }

  const enablementHtml = `
    <div class="section-block">
      <div class="section-title">📊 Technical Enablement Breakdown</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${enablementBlock("Sales Professional", "salesPro")}
        ${enablementBlock("Technical Sales Pro", "techPro")}
        ${enablementBlock("SE Bootcamp", "bootcamp")}
        ${enablementBlock("Implementation Specialist", "implSpec")}
      </div>
    </div>`;

  // ─── Revenue & Compliance ──────────────────────────────────
  const attainment = getRevenueAttainment(partner);
  const revenueHtml = `
    <div class="section-block">
      <div class="section-title">📈 FY27 Revenue & PIPELINE</div>
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;background:#fafafa;padding:16px;border-radius:12px;border:1px solid #e5e7eb;">
        <div>
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;">Revenue</div>
          <div style="font-size:16px;font-weight:800;color:#111827;">${formatCurrency(partner.revenueData.revenueFY27, true)}</div>
        </div>
        <div>
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;">Target</div>
          <div style="font-size:16px;font-weight:800;color:#111827;">${formatCurrency(partner.revenueData.targetFY27, true)}</div>
        </div>
        <div>
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;">Attainment</div>
          <div style="font-size:16px;font-weight:800;color:${attainment && attainment >= 100 ? "#16a34a" : "#374151"};">${attainment !== null ? attainment + "%" : "—"}</div>
        </div>
        <div>
          <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;">Pipeline</div>
          <div style="font-size:16px;font-weight:800;color:#111827;">${formatCurrency(partner.revenueData.pipelineFY27, true)}</div>
        </div>
      </div>
    </div>`;

  const actionHtml = `
    <div class="section-block">
      <div class="section-title">📋 Recommended Strategic Action</div>
      <div style="background:#fff7ed;border-left:4px solid #FF7023;padding:16px;border-radius:0 12px 12px 0;font-size:13px;line-height:1.6;color:#1f2937;font-style:italic;">
        "${escHtml(generateRecommendedAction(partner))}"
      </div>
    </div>`;

  // ─── Signature Block ───────────────────────────────────────
  const signatureBlockHtml = `
    <div class="section-block" style="page-break-before:auto; break-before:auto;">
      <div class="section-title">✍️ Execution & Verification</div>
      <p style="font-size:12px;color:#374151;margin-bottom:24px;">By signing this profile, both parties confirm the accuracy of the FY27 enablement standing and commit to the recommended action plan for tier maintenance or advancement.</p>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
        <div style="background:#fcfcfc;padding:20px;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="font-size:10px;font-weight:800;color:#FF7023;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px;">Partner Acceptance</div>
          <div style="margin-bottom:16px;">
            <input class="sig-input" type="text" placeholder="Print Name" />
            <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-top:4px;">Signature / Name</div>
          </div>
          <div style="display:flex;gap:12px;">
            <div style="flex:1;">
               <input class="sig-input" type="text" value="${new Date().toLocaleDateString()}" />
               <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-top:4px;">Date</div>
            </div>
            <div style="flex:1;">
               <input class="sig-input" type="text" placeholder="Title" />
               <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-top:4px;">Title</div>
            </div>
          </div>
        </div>

        <div style="background:#5A6359;padding:20px;border-radius:12px;color:#fff;">
          <div style="font-size:10px;font-weight:800;color:#FF7023;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px;">Pure Storage Verification</div>
          <div style="margin-bottom:16px;">
            <input class="sig-input" style="border-bottom-color:rgba(255,255,255,0.2);color:#fff;" type="text" placeholder="PAM Name" />
            <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-top:4px;">PAM Signature</div>
          </div>
          <div style="display:flex;gap:12px;">
            <div style="flex:1;">
               <input class="sig-input" style="border-bottom-color:rgba(255,255,255,0.2);color:#fff;" type="text" value="${new Date().toLocaleDateString()}" />
               <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-top:4px;">Date</div>
            </div>
            <div style="flex:1;">
               <input class="sig-input" style="border-bottom-color:rgba(255,255,255,0.2);color:#fff;" type="text" value="Partner Account Manager" />
               <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-top:4px;">Title</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Partner Profile — ${escHtml(partner.name)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #f1f5f9;
    color: #1e293b;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
  .page-wrap {
    max-width: 900px;
    margin: 0 auto;
    background: #fff;
    box-shadow: 0 0 50px rgba(0,0,0,0.1);
  }
  .body-pad { padding: 28px 40px 48px; }
  .section-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #475569;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #f1f5f9;
  }
  .section-block {
    margin-top: 28px;
    break-inside: avoid !important;
  }
  .sig-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background: transparent;
    padding: 6px 0;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    outline: none;
  }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
    font-size: 10px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }
  .no-print { text-align: center; padding: 32px 0; }
  .print-btn {
    background: #FF7023;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 32px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255,112,35,0.3);
  }
  @media print {
    body { background: #fff; }
    .page-wrap { box-shadow: none; max-width: 100%; }
    .no-print { display: none; }
    .sig-input { border-bottom-color: #334155; }
    @page { margin: 1cm 1.5cm; size: A4; }
  }
</style>
</head>
<body>
<div class="page-wrap">
  ${headerHtml}
  <div class="body-pad">
    ${actionHtml}
    ${businessMetricsHtml}
    ${revenueHtml}
    ${enablementHtml}
    ${signatureBlockHtml}
    <div class="footer">
      <span>PEI &middot; FY27 Global Reseller Program &middot; Partner Intelligence Dashboard</span>
      <span>Verified Profile &middot; Generated ${now}</span>
    </div>
  </div>
</div>
<div class="no-print">
  <button class="print-btn" onclick="window.print()">🖨️ Sign & Save as PDF</button>
</div>
</body>
</html>`;
}
