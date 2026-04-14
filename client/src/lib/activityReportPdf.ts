/*
 * Activity Report PDF Generator — CampaignIQ Dashboard
 * Opens a styled, print-ready HTML page in a new tab and triggers window.print().
 * Layout mirrors the Enablement Plan's premium design.
 */

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Stat {
  label: string;
  value: string | number;
}

interface RowData {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

export function generateActivityReportHtml(
  title: string,
  subtitle: string,
  stats: Stat[],
  headers: string[],
  rows: RowData[]
): string {
  const now = new Date().toLocaleDateString("en-ZA", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  const headerHtml = `
    <div style="background:#5A6359;padding:28px 36px;border-radius:12px 12px 0 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <svg width="48" height="48" viewBox="0 0 88.7 79.6" fill="none" style="flex-shrink:0;margin-top:2px;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="#FF7023"/>
          </svg>
          <div>
            <div style="color:#FF7023;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              Pure Storage · Activity Tracer Report
            </div>
            <h1 style="color:#FFF5E3;font-size:26px;font-weight:800;margin:0 0 4px;">${escHtml(title)}</h1>
            <div style="color:#e5e7eb;font-size:11px;margin-top:4px;font-weight:500;">
              ${escHtml(subtitle)}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="color:#e5e7eb;font-size:10px;">Exported On</div>
          <div style="color:#fff;font-size:12px;font-weight:600;">${now}</div>
        </div>
      </div>
    </div>`;

  const statsHtml = `
    <div class="section-block">
      <div class="section-title">📊 Report Summary</div>
      <div style="display:grid;grid-template-columns:repeat(${stats.length}, 1fr);gap:12px;">
        ${stats.map(s => `
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#fafafa;text-align:center;">
            <div style="font-size:9px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;">${escHtml(s.label)}</div>
            <div style="font-size:20px;font-weight:800;color:#111827;">${s.value}</div>
          </div>
        `).join('')}
      </div>
    </div>`;

  const tableHtml = `
    <div class="section-block">
      <div class="section-title">📝 Activity Roster</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#5A6359;">
            ${headers.map(h => `
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">${escHtml(h)}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, i) => `
            <tr style="border-bottom:1px solid #e5e7eb;background:${i % 2 === 0 ? '#fff' : '#fcfcfc'}">
              <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#111827;">${escHtml(row.col1)}</td>
              <td style="padding:10px 12px;font-size:11px;color:#374151;">${escHtml(row.col2)}</td>
              <td style="padding:10px 12px;font-size:11px;color:#374151;">${escHtml(row.col3)}</td>
              <td style="padding:10px 12px;font-size:11px;color:#374151;">${escHtml(row.col4)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Activity Report — ${escHtml(title)}</title>
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
    margin-top: 24px;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #9ca3af;
    display: flex;
    justify-content: space-between;
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
    ${statsHtml}
    ${tableHtml}
    <div class="footer">
      <span>PEI · FY27 Global Reseller Program · Activity Tracer Report</span>
      <span>Confidential — For internal use only</span>
    </div>
  </div>
</div>
<div class="no-print" style="text-align:center;padding:16px 0 32px;">
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>
</body>
</html>`;
}
