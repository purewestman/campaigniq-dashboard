/*
 * ASP Gap Report PDF Generator — CampaignIQ Dashboard
 * Opens a styled, print-ready HTML page in a new tab and triggers window.print().
 * Focuses on ASP Qualification tracking (Foundations, Storage Pro, Support Spec).
 */

import { type Partner, TIER_DEFINITIONS } from "./data";
import { activityData } from "./activityData";

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Candidate {
  name: string;
  email: string;
  hasFoundations: boolean;
  hasStoragePro: boolean;
  hasSupportSpec: boolean;
  isFullyQualified: boolean;
  missingTags: string[];
}

export function generateAspReportHtml(partnerName: string, candidates: Candidate[]): string {
  const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  const fullyQualifiedCount = candidates.filter(c => c.isFullyQualified).length;
  const isCompliant = fullyQualifiedCount >= 2;

  const headerHtml = `
    <div style="background:#5A6359;padding:28px 36px;border-radius:12px 12px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <svg width="48" height="48" viewBox="0 0 88.7 79.6" fill="none" style="flex-shrink:0;margin-top:2px;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="#22d3ee"/>
          </svg>
          <div>
            <div style="color:#22d3ee;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              Pure Storage · ASP Qualification Tracking
            </div>
            <h1 style="color:#FFF5E3;font-size:26px;font-weight:800;margin:0 0 4px;">${escHtml(partnerName)}</h1>
            <div style="color:#e5e7eb;font-size:11px;margin-top:4px;opacity:0.8;">
              Status: ${isCompliant ? "✅ QUALIFIED" : "⏳ GAP IDENTIFIED"}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:#e5e7eb;font-size:10px;">Generated</div>
          <div style="color:#fff;font-size:12px;font-weight:600;">${now}</div>
          <div style="margin-top:12px;">
            <span style="font-size:20px;font-weight:900;color:${isCompliant ? "#22c55e" : "#f59e0b"};">${fullyQualifiedCount}/2</span>
            <span style="color:#fff;font-size:10px;margin-left:4px;opacity:0.6;">Qualified Individuals</span>
          </div>
        </div>
      </div>
    </div>`;

  const summaryHtml = `
    <div class="section-block">
      <div class="section-title">🛡️ ASP Programme Requirements</div>
      <div style="background:${isCompliant ? "#f0fdf4" : "#fffbeb"};border:1px solid ${isCompliant ? "#bbf7d0" : "#fef3c7"};padding:16px;border-radius:12px;font-size:13px;line-height:1.6;color:#1f2937;">
        <p><strong>Requirement:</strong> To maintain Authorized Support Partner (ASP) status, a partner must have at least <strong>two (2) unique individuals</strong> who have completed the full qualification track:</p>
        <ul style="margin-top:8px;margin-bottom:8px;margin-left:20px;">
          <li>ASP Foundations (FlashArray or FlashBlade)</li>
          <li>FlashBlade Storage Professional Certification</li>
          <li>FlashBlade Support Specialist cert or certification</li>
        </ul>
        <p style="margin-bottom:8px;">If one user has completed FlashArray or FlashBlade ASP Foundations and the same person completed FlashBlade Storage Professional Certification, the partner will be issued with ASP Partner Badge while pursuing FlashBlade Support Specialist cert or certification.</p>
        <p style="color:#e11d48;font-weight:700;font-size:12px;">** Individual must earn the FlashBlade Support Specialist cert or certification within 12 months of the FlashBlade Storage Professional certification.</p>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid ${isCompliant ? "#bbf7d0" : "#fcd34d"};font-weight:700;color:${isCompliant ? "#16a34a" : "#92400e"};">
          ${isCompliant ? "✅ This partner currently meets the minimum ASP qualification requirement." : `⚠️ ACTION REQUIRED: ${2 - fullyQualifiedCount} additional individual(s) must complete the remaining certifications.`}
        </div>
      </div>
    </div>`;

  const tableHtml = `
    <div class="section-block">
      <div class="section-title">👥 Individual Progress Tracking</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#5A6359;">
            <th style="padding:12px;text-align:left;font-size:11px;font-weight:700;color:#fff;">Individual</th>
            <th style="padding:12px;text-align:center;font-size:11px;font-weight:700;color:#fff;">Foundations</th>
            <th style="padding:12px;text-align:left;font-size:11px;font-weight:700;color:#fff;">FlashBlade Storage Pro</th>
            <th style="padding:12px;text-align:center;font-size:11px;font-weight:700;color:#fff;">Support Spec</th>
            <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#fff;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${candidates.length > 0 ? candidates.map((c, i) => `
            <tr style="border-bottom:1px solid #f1f5f9;background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
              <td style="padding:12px;">
                <div style="font-size:13px;font-weight:700;color:#1e293b;">${escHtml(c.name)}</div>
                <div style="font-size:10px;color:#64748b;">${escHtml(c.email)}</div>
              </td>
              <td style="padding:12px;text-align:center;font-size:18px;">${c.hasFoundations ? '✅' : '❌'}</td>
              <td style="padding:12px;text-align:center;font-size:18px;">${c.hasStoragePro ? '✅' : '❌'}</td>
              <td style="padding:12px;text-align:center;font-size:18px;">${c.hasSupportSpec ? '✅' : '❌'}</td>
              <td style="padding:12px;text-align:right;">
                ${c.isFullyQualified 
                  ? '<span style="color:#16a34a;font-size:11px;font-weight:700;background:#dcfce7;padding:2px 8px;border-radius:100px;">QUALIFIED</span>' 
                  : `<span style="color:#64748b;font-size:10px;font-weight:500;">Missing ${c.missingTags.length} step${c.missingTags.length !== 1 ? 's' : ''}</span>`}
              </td>
            </tr>
          `).join('') : `<tr><td colspan="5" style="padding:32px;text-align:center;color:#94a3b8;font-style:italic;">No individuals identified in ASP training tracks.</td></tr>`}
        </tbody>
      </table>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ASP Gap Report — ${escHtml(partnerName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #f8fafc;
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
  .body-pad { padding: 32px 40px 48px; }
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
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
    font-size: 10px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }
  .no-print { text-align: center; padding: 32px 0; }
  .print-btn {
    background: #22d3ee;
    color: #083344;
    font-size: 13px;
    font-weight: 800;
    padding: 12px 32px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(34,211,238,0.3);
  }
  @media print {
    body { background: #fff; }
    .page-wrap { box-shadow: none; max-width: 100%; }
    .no-print { display: none; }
    @page { margin: 1cm 1.5cm; size: A4; }
  }
</style>
</head>
<body>
<div class="page-wrap">
  ${headerHtml}
  <div class="body-pad">
    ${summaryHtml}
    ${tableHtml}
    <div class="footer">
      <span>PEI &middot; ASP Programme Intelligence &middot; FY27 Global Reseller Program</span>
      <span>Confidential &middot; Internal Export &middot; Generated ${now}</span>
    </div>
  </div>
</div>
<div class="no-print">
  <button class="print-btn" onclick="window.print()">🖨️ Export as PDF</button>
</div>
</body>
</html>`;
}
