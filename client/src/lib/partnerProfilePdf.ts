/*
 * Partner Profile PDF Generator — CampaignIQ Dashboard
 * Opens a styled, print-ready HTML page in a new tab and triggers window.print().
 * This is the premium, high-fidelity replacement for the legacy Capture-based ExportButton.
 */

import { type Partner, TIER_DEFINITIONS, formatCurrency, formatPercent, getRevenueAttainment, generateRecommendedAction } from "./data";
import { trainingData } from "./trainingData";
import { getResolvedTimeline } from "./timelineDefaults";

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
  const attainment = getRevenueAttainment(partner);
  const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  
  // ─── Status Identifiers ────────────────────────────────────
  const isEnablementMet = partner.enablementCompliant;
  const isBusinessMet = partner.businessCompliant;

  const dedupe = (list: any[]) => {
    const seen = new Set();
    return list.filter(p => {
      if (seen.has(p.email)) return false;
      seen.add(p.email);
      return true;
    });
  };

  // ─── Header ────────────────────────────────────────────────
  const headerHtml = (page: number) => `
    <div style="background:#5A6359; padding:40px 48px; position:relative; overflow:hidden; border-radius:16px 16px 0 0;">
      <!-- Decorative Honeycomb Pattern -->
      <div style="position:absolute; right:-20px; top:-20px; opacity:0.1;">
        <svg width="240" height="240" viewBox="0 0 88.7 79.6" fill="none">
          <path d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="#fff"/>
        </svg>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1;">
        <div style="display:flex; gap:24px; align-items:center;">
          <div style="width:72px; height:72px; background:rgba(255,255,255,0.1); border-radius:16px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.15);">
             <svg width="42" height="42" viewBox="0 0 88.7 79.6" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="#FF7023"/>
             </svg>
          </div>
          <div>
            <div style="color:#FF7023; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">
              Pure Storage · FY27 Partner Profile · Page ${page}
            </div>
            <h1 style="color:#fff; font-size:42px; font-weight:800; margin:0; line-height:1;">${escHtml(partner.name)}</h1>
            <div style="display:flex; gap:12px; margin-top:16px; align-items:center;">
              <span style="background:#FF7023; color:#fff; padding:4px 14px; border-radius:100px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                ${def.label}
              </span>
              <span style="color:rgba(255,255,255,0.5); font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">Enablement Dashboard</span>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:72px; font-weight:900; color:#FF7023; line-height:0.8;">${partner.enablementScore}%</div>
          <div style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:2px; margin-top:8px;">Enablement Achievement</div>
        </div>
      </div>
    </div>`;

  // ─── Metric Cards ──────────────────────────────────────────
  const metricCard = (label: string, icon: any, children: string) => `
    <div style="background:#fff; border-radius:24px; border:1px solid #f1f5f9; padding:32px; flex:1; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02);">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
        <div style="color:#94a3b8;">${icon}</div>
        <div style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1px;">${label}</div>
      </div>
      ${children}
    </div>`;

  const statusSubCard = (label: string, met: boolean, color: string) => `
    <div style="background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:20px 24px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
      <div style="width:48px; height:48px; background:${met ? '#ecfdf5' : '#f8fafc'}; border:1px solid ${met ? '#10b98122' : '#e2e8f0'}; border-radius:12px; display:flex; align-items:center; justify-content:center; color:${met ? '#10b981' : '#94a3b8'};">
        ${met ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17L4 12"/></svg>' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'}
      </div>
      <div style="font-size:14px; font-weight:800; color:${met ? '#065f46' : '#64748b'};">${label}</div>
    </div>`;

  const targetMetricRow = (label: string, value: string, target: string) => `
    <div style="background:#fff; border:1px solid #f1f5f9; border-radius:20px; padding:20px 24px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
       <div>
         <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:2px;">${label}</div>
         <div style="font-size:28px; font-weight:900; color:#1e293b;">${value}</div>
       </div>
       <div style="text-align:right;">
         <div style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:2px;">Target</div>
         <div style="font-size:14px; font-weight:800; color:#475569;">${target}</div>
       </div>
    </div>`;

  // ─── First Page Content ────────────────────────────────────
  const page1Content = `
    <div style="display:flex; gap:24px; margin:32px 0;">
      <!-- Program Compliance -->
      ${metricCard("Program Compliance", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', `
        <div style="display:flex; gap:16px;">
          ${statusSubCard("Enablement", isEnablementMet, "#10b981")}
          ${statusSubCard("Business", isBusinessMet, "#3b82f6")}
        </div>
      `)}
      
      <!-- Business Metrics -->
      ${metricCard("Business Metrics", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>', `
        ${targetMetricRow("Bookings USD", formatCurrency(partner.businessMetrics.bookingsUSD, true), formatCurrency(def.businessMetrics.bookingsUSD, true))}
        ${targetMetricRow("Unique Customers", String(partner.businessMetrics.uniqueCustomers || 0), String(def.businessMetrics.uniqueCustomers || 0))}
        ${targetMetricRow("Partner Installs", String(partner.businessMetrics.partnerDeliveredServices || 0), String(def.businessMetrics.partnerDeliveredServices || 0))}
      `)}
    </div>

    <!-- ASP Path Section -->
    <div style="background:#fff; border-radius:24px; border:1px solid #f1f5f9; padding:32px; margin-bottom:24px; display:flex; gap:24px; align-items:center;">
      <div style="width:24px; color:#94a3b8;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
      <div style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:1px; flex-shrink:0;">Advanced Services (ASP)</div>
      <div style="flex:1; background:#fff7ed; border:1px solid #ffedd5; border-radius:20px; padding:24px; display:flex; align-items:center; gap:24px;">
        <div style="width:48px; height:48px; background:#fff; border-radius:12px; border:1px solid #ffedd5; display:flex; align-items:center; justify-content:center; color:#FF7023;">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
           <div style="font-size:18px; font-weight:800; color:#c2410c;">ASP Path Active</div>
           <div style="font-size:12px; font-weight:600; color:#9a3412;">0 of 2 required certified individuals identified.</div>
        </div>
      </div>
    </div>

    <!-- Recommended Action Plan -->
    <div style="border-left:8px solid #FF7023; background:#fff; border-radius:0 24px 24px 0; padding:40px; margin-bottom:32px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border-top:1px solid #f1f5f9; border-right:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9;">
       <div style="display:flex; items-center; gap:12px; margin-bottom:16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF7023" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <div style="font-size:12px; font-weight:900; color:#FF7023; text-transform:uppercase; letter-spacing:1.5px;">Recommended Action Plan</div>
       </div>
       <div style="font-size:20px; font-weight:800; color:#1e293b; line-height:1.4; font-style:italic;">
          "${escHtml(generateRecommendedAction(partner))}"
       </div>
    </div>

    <!-- Bottom Distribution and Experts Row -->
    <div style="display:flex; gap:24px; margin-bottom:48px;">
       ${metricCard("Primary Distribution List", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>', `
         <div style="display:flex; flex-direction:column; gap:8px;">
           ${partner.targetEmails.map(e => `
             <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:12px 16px; font-size:12px; font-weight:700; color:#475569;">${escHtml(e)}</div>
           `).join('')}
         </div>
       `)}
       
       ${metricCard("Lead Technical Experts", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path d="M12 14l9-5-9-5-9 5 9 5z" fill="none"/></svg>', `
         <div style="display:flex; flex-wrap:wrap; gap:8px;">
           ${(training?.salesPro?.[0] ? [{email: training.salesPro[0].email, name: training.salesPro[0].firstName + ' ' + training.salesPro[0].lastName, count: 3}] : []).map(p => `
             <div style="background:#f0f9ff; border:1px solid #e0f2fe; border-radius:100px; padding:8px 16px; font-size:12px; font-weight:800; color:#0369a1;">
                ${escHtml(p.name)} <span style="opacity:0.5; margin-left:4px; font-size:11px;">x${p.count}</span>
             </div>
           `).join('')}
         </div>
       `)}
    </div>`;

  // ─── Enablement Details (Page 2) ───────────────────────────
  const enablementRow = (key: string, title: string, required: number, certified: any[], nominees: any[], subCounts?: { fa: number, fb: number }) => {
    const current = certified.length;
    const met = current >= required;
    const gapCount = Math.max(0, required - current);
    
    let subDisplay = '';
    if (subCounts) {
       subDisplay = `
         <div style="display:flex; gap:16px; margin-top:12px;">
            <div style="font-size:11px; font-weight:700; color:#64748b;">FA: <span style="color:#1e293b;">${subCounts.fa}</span></div>
            <div style="font-size:11px; font-weight:700; color:#64748b;">FB: <span style="color:#1e293b;">${subCounts.fb}</span></div>
         </div>
       `;
    }

    return `
    <div style="background:#fff; border-radius:24px; border:1px solid #f1f5f9; padding:40px; margin-bottom:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02);">
       <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px;">
          <div>
             <h3 style="font-size:20px; font-weight:800; color:#1e293b; margin-bottom:4px;">${title}</h3>
             ${subDisplay}
             <div style="display:flex; gap:12px; align-items:center; margin-top:8px;">
                <span style="background:${met ? '#dcfce7' : '#fee2e2'}; color:${met ? '#16a34a' : '#dc2626'}; padding:2px 10px; border-radius:100px; font-size:10px; font-weight:900; letter-spacing:1px; text-transform:uppercase;">${met ? 'Met' : 'Gap'}</span>
                <span style="color:#94a3b8; font-size:14px; font-weight:700;">${current} / ${required}</span>
             </div>
          </div>
       </div>
       
       <div style="display:grid; grid-template-columns:1fr 1fr; gap:48px;">
          <!-- Certified Column -->
          <div>
             <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                <div style="width:20px; height:20px; background:#ecfdf5; border-radius:100%; display:flex; align-items:center; justify-content:center; color:#10b981;">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17L4 12"/></svg>
                </div>
                <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Certified</div>
             </div>
             <div style="display:flex; flex-direction:column; gap:8px;">
                ${certified.map(p => `
                   <div style="display:flex; items-center; gap:10px; font-size:13px; font-weight:700; color:#475569;">
                      <div style="width:6px; height:6px; background:#10b981; border-radius:100%; margin-top:6px;"></div>
                      ${escHtml(p.firstName)} ${escHtml(p.lastName)}
                   </div>
                `).join('')}
             </div>
          </div>
          
          <!-- Nominees Column -->
          <div>
             <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                <div style="width:20px; height:20px; background:#fff7ed; border-radius:100%; display:flex; align-items:center; justify-content:center; color:#FF7023;">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Active Nominees</div>
             </div>
             ${nominees.length > 0 ? `
               <div style="display:flex; flex-direction:column; gap:12px;">
                  ${nominees.map(p => `
                     <div>
                        <div style="font-size:13px; font-weight:800; color:#1e293b;">${escHtml(p.name)}</div>
                        <div style="font-size:10px; color:#94a3b8; font-weight:600;">Active: Pure Storage Architect Associate - {archive}</div>
                     </div>
                  `).join('')}
               </div>
             ` : '<div style="font-size:12px; color:#94a3b8; font-style:italic;">No candidates found in activity data</div>'}
          </div>
       </div>

       ${!met ? `
       <div style="margin-top:32px; padding-top:24px; border-top:1px dashed #e2e8f0;" class="no-print">
          <div style="font-size:11px; font-weight:900; color:#FF7023; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">🎯 Fill ${gapCount} Gap${gapCount > 1 ? 's' : ''}</div>
          <div style="display:flex; flex-direction:column; gap:16px;">
             ${partner.targetEmails.length > 0 ? `
               <div>
                  <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Suggested Candidates</div>
                  <div style="display:flex; flex-wrap:wrap; gap:8px;">
                     ${partner.targetEmails.map(email => `
                        <label style="display:flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 12px; border-radius:100px; cursor:pointer; font-size:11px; font-weight:700; color:#475569;">
                           <input type="checkbox" class="email-checkbox" data-track="${key}" value="${escHtml(email)}" style="accent-color:#FF7023;" />
                           ${escHtml(email)}
                        </label>
                     `).join('')}
                  </div>
               </div>
             ` : ''}
             <div>
                <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:8px;">Manual Nominees</div>
                <input type="text" class="manual-input" data-track="${key}" placeholder="Enter emails separated by commas..." style="width:100%; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px 16px; font-size:12px; font-weight:600; outline:none;" />
             </div>
          </div>
       </div>
       ` : ''}
    </div>`;
  };

  const page2Content = `
    <div style="margin:32px 0;">
       <div style="display:flex; items-center; gap:12px; margin-bottom:24px; padding-left:8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7023" stroke-width="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <div style="font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:1.5px;">Enablement Path Achievement</div>
       </div>

       ${enablementRow("salesPro", "Sales Professional", partner.requirements.salesPro.required, training?.salesPro || [], [])}
       ${enablementRow("techPro", "Technical Sales Pro", partner.requirements.techPro.required, training?.techPro || [], [])}
       ${enablementRow("bootcamp", "Partner Architect Bootcamp", partner.requirements.bootcamp.required, training?.bootcamp || [], [])}
       ${enablementRow("simplyPure", "Simply Pure for Partners", partner.requirements.simplyPure.required, training?.simplyPure || [], [])}
       
       <!-- ASP Status Section -->
       <div style="margin-top:40px; border-top:2px solid #f1f5f9; padding-top:40px;">
         <h2 style="font-size:24px; font-weight:900; color:#1e293b; margin-bottom:24px; letter-spacing:-0.03em;">Authorized Support Partner (ASP) Status</h2>
         ${enablementRow("aspFoundations", "ASP Foundations", partner.requirements.aspFoundations.required, dedupe([...(training?.aspFoundationsFA || []), ...(training?.aspFoundationsFB || [])]), [], { fa: training?.aspFoundationsFA?.length || 0, fb: training?.aspFoundationsFB?.length || 0 })}
         ${enablementRow("aspStoragePro", "Storage Professional", partner.requirements.aspStoragePro.required, dedupe([...(training?.aspStorageProFA || []), ...(training?.aspStorageProFB || [])]), [], { fa: training?.aspStorageProFA?.length || 0, fb: training?.aspStorageProFB?.length || 0 })}
         ${enablementRow("aspSupportSpec", "Support Specialist", partner.requirements.aspSupportSpec.required, dedupe([...(training?.supportSpecFA || []), ...(training?.supportSpecFB || [])]), [], { fa: training?.supportSpecFA?.length || 0, fb: training?.supportSpecFB?.length || 0 })}
       </div>
    </div>`;

  // ─── Interaction Blocks (Sign / Gaps) ──────────────────────
  const hasGaps = partner.totalGaps > 0;
  const assignmentsHtml = hasGaps ? `
    <div style="background:#fff; border-radius:24px; border:2px dashed #e2e8f0; padding:32px; margin-top:40px; margin-bottom:32px;" class="no-print">
       <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:32px; height:32px; background:#f8fafc; border-radius:100%; display:flex; align-items:center; justify-content:center; color:#475569;">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div style="font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:1.5px;">Action Plan Assignments</div>
       </div>
       <p style="font-size:13px; color:#64748b; margin-bottom:24px; font-weight:600;">Nominate individuals to fulfill outstanding gaps. Select from recommended contacts or enter manually.</p>
       
       ${partner.targetEmails.length > 0 ? `
         <div style="margin-bottom:20px;">
           <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:12px;">Recommended Contacts</div>
           <div style="display:flex; flex-wrap:wrap; gap:10px;">
             ${partner.targetEmails.map(email => `
               <label style="display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; padding:8px 16px; border-radius:12px; cursor:pointer; font-size:12px; font-weight:700; color:#475569; transition:all 0.2s;" onmouseover="this.style.borderColor='#FF7023'" onmouseout="this.style.borderColor='#e2e8f0'">
                  <input type="checkbox" class="email-checkbox" value="${escHtml(email)}" style="accent-color:#FF7023; width:16px; height:16px;" />
                  ${escHtml(email)}
               </label>
             `).join('')}
           </div>
         </div>
       ` : ''}
       
       <div>
         <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:12px;">Additional Nominations (comma-separated)</div>
         <input id="manual-emails" type="text" placeholder="e.g. employee@partner.com, manager@partner.com" style="width:100%; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 20px; font-size:14px; font-weight:600; color:#1e293b; outline:none; transition:all 0.2s;" onfocus="this.style.borderColor='#FF7023'; this.style.background='#fff'" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc'" />
       </div>
    </div>` : '';

  const signatureBlockHtml = `
    <div style="margin-top:48px; break-inside:avoid;">
       <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7023" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <div style="font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:1.5px;">Execution & Verification</div>
       </div>
       <p style="font-size:13px; color:#64748b; line-height:1.6; margin-bottom:32px;">By signing this report, both parties confirm the accuracy of the FY27 enablement standing and commit to the recommended action plan outlined above.</p>
       
       <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px;">
          <!-- Partner Side -->
          <div style="background:#fff; border-radius:24px; border:1px solid #f1f5f9; padding:32px;">
             <div style="font-size:11px; font-weight:900; color:#FF7023; text-transform:uppercase; letter-spacing:1px; margin-bottom:24px;">Partner Acceptance</div>
             <div style="margin-bottom:20px;">
                <input id="sig-name" type="text" placeholder="Print Name" style="width:100%; border:none; border-bottom:2px solid #f1f5f9; padding:8px 0; font-size:16px; font-weight:800; color:#1e293b; outline:none;" />
                <div style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-top:6px;">Auth. Signature / Name</div>
             </div>
             <div style="display:flex; gap:20px;">
                <div style="flex:1;">
                   <input id="sig-date" type="text" value="${new Date().toLocaleDateString()}" style="width:100%; border:none; border-bottom:1px solid #f1f5f9; padding:8px 0; font-size:14px; font-weight:700; color:#475569; outline:none;" />
                   <div style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-top:6px;">Date</div>
                </div>
                <div style="flex:1;">
                   <input id="sig-role" type="text" placeholder="Title" style="width:100%; border:none; border-bottom:1px solid #f1f5f9; padding:8px 0; font-size:14px; font-weight:700; color:#475569; outline:none;" />
                   <div style="font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-top:6px;">Title</div>
                </div>
             </div>
          </div>
          
          <!-- Pure Side -->
          <div style="background:#5A6359; border-radius:24px; border:1px solid #5A6359; padding:32px; color:#fff;">
             <div style="font-size:11px; font-weight:900; color:#FF7023; text-transform:uppercase; letter-spacing:1px; margin-bottom:24px;">Pure Storage Verification</div>
             <div style="margin-bottom:20px;">
                <div style="width:100%; border-bottom:2px solid rgba(255,255,255,0.1); padding:8px 0; font-size:16px; font-weight:800; color:#fff;">E. M. Pure Account Manager</div>
                <div style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:6px;">PAM Signature</div>
             </div>
             <div style="display:flex; gap:20px;">
                <div style="flex:1;">
                   <div style="width:100%; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0; font-size:14px; font-weight:700; color:rgba(255,255,255,0.7);">${new Date().toLocaleDateString()}</div>
                   <div style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:6px;">Date</div>
                </div>
                <div style="flex:1;">
                   <div style="width:100%; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0; font-size:14px; font-weight:700; color:rgba(255,255,255,0.7);">Partner Account Manager</div>
                   <div style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:6px;">Title</div>
                </div>
             </div>
          </div>
       </div>

       <div class="no-print" style="margin-top:40px; text-align:center; padding:32px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:24px;">
          <p style="font-size:13px; color:#64748b; margin-bottom:16px; font-weight:700;">✅ Review the enablement metrics above. Once confirmed, finalize with the button below.</p>
          <button id="commit-btn" style="background:#16a34a; color:#fff; font-size:15px; font-weight:900; padding:16px 48px; border-radius:16px; border:none; cursor:pointer; box-shadow:0 10px 15px -3px rgba(22,163,74,0.3); transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 20px -3px rgba(22,163,74,0.4)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 10px 15px -3px rgba(22,163,74,0.3)'">
             🚀 Submit Signature & Commit to Dashboard
          </button>
          <div id="status-msg" style="display:none; margin-top:16px; font-weight:900; color:#16a34a; font-size:16px;">✨ Signed & Committed to Dashboard!</div>
       </div>
    </div>`;

  // ─── 12-Month Strategic Roadmap (Page 3) ──────────────────────
  const timelineData = getResolvedTimeline(partner);
  
  const renderQuarter = (q: string) => {
     const quarterItems = timelineData.filter((i: any) => i.quarter === q);
     if (quarterItems.length === 0) return '';
     
     return `
       <div style="margin-bottom:32px;">
         <h3 style="font-size:16px; font-weight:800; color:#FF7023; text-transform:uppercase; margin-bottom:16px;">${q} Focus Period</h3>
         <div style="padding-left:24px; border-left:2px solid #e2e8f0; display:flex; flex-direction:column; gap:16px;">
            ${quarterItems.map((item: any) => `
               <div style="position:relative; background:#fff; border:1px solid #f1f5f9; border-radius:12px; padding:16px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                 <div style="position:absolute; left:-33px; top:12px; width:16px; height:16px; background:${escHtml(item.color)}; border-radius:50%; border:4px solid #fff; box-shadow:0 0 0 1px #e2e8f0;"></div>
                 <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div>
                       <span contenteditable="true" style="font-size:14px; font-weight:800; color:#1e293b; outline:none; border-bottom:1px solid transparent; transition:border-color 0.2s;" onfocus="this.style.borderColor='#FF7023'" onblur="this.style.borderColor='transparent'">${escHtml(item.label)}</span>
                       <span contenteditable="true" style="background:#f8fafc; color:#64748b; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:800; margin-left:8px; text-transform:uppercase; outline:none;">${escHtml(item.monthRange)}</span>
                    </div>
                 </div>
                 <p contenteditable="true" style="font-size:12px; font-weight:600; color:#64748b; line-height:1.5; margin:0; outline:none; border-bottom:1px solid transparent; transition:border-color 0.2s;" onfocus="this.style.borderColor='#FF7023'" onblur="this.style.borderColor='transparent'">${escHtml(item.description)}</p>
               </div>
            `).join('')}
         </div>
       </div>
     `;
  };

  const page3Content = `
    <div style="margin:32px 0;">
       <div style="display:flex; items-center; gap:12px; margin-bottom:32px; padding-left:8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF7023" stroke-width="2.5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <div style="font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:1.5px;">12-Month Strategic Roadmap</div>
       </div>
       <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px;">
          <div>
            ${renderQuarter("Q1")}
            ${renderQuarter("Q2")}
          </div>
          <div>
            ${renderQuarter("Q3")}
            ${renderQuarter("Q4")}
          </div>
       </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Partner Profile — ${escHtml(partner.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f1f5f9;
    color: #1e293b;
    padding: 60px 0;
  }
  .page {
    max-width: 1000px;
    margin: 0 auto 40px;
    background: #fff;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
    position: relative;
    border-radius: 24px;
    min-height: 1200px;
  }
  .page-inner { padding: 48px; }
  .footer {
    position: absolute;
    bottom: 40px;
    left: 48px;
    right: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 24px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .no-print-area { text-align: center; margin-bottom: 40px; }
  .print-btn {
    background: #FF7023;
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    padding: 16px 40px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(255,112,35,0.3);
    transition: all 0.2s;
  }
  .print-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(255,112,35,0.4); }
  
  @media print {
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; margin: 0; border-radius: 0; width: 100%; min-height: 100vh; }
    .no-print { display: none !important; }
    .page-inner { padding: 0; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
  <div class="no-print-area no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Export as PDF</button>
  </div>

  <div class="page">
    ${headerHtml(1)}
    <div class="page-inner">
      ${page1Content}
      ${signatureBlockHtml}
    </div>
    <div class="footer">
      <span>Everpure &middot; FY27 Global Reseller Program Report</span>
      <span>Confidential &middot; ${now}</span>
    </div>
  </div>

  <div class="page no-print">
    ${headerHtml(2)}
    <div class="page-inner">
       ${page2Content}
    </div>
    <div class="footer">
      <span>Everpure &middot; FY27 Global Reseller Program Report</span>
      <span>Confidential &middot; ${now}</span>
    </div>
  </div>

  <div class="page no-print">
    ${headerHtml(3)}
    <div class="page-inner">
       ${page3Content}
    </div>
    <div class="footer">
      <span>Everpure &middot; Strategic Roadmap</span>
      <span>Confidential &middot; ${now}</span>
    </div>
  </div>

<script>
  document.getElementById('commit-btn').addEventListener('click', function() {
    const name = document.getElementById('sig-name').value;
    const role = document.getElementById('sig-role').value;
    const date = document.getElementById('sig-date').value;

    if (!name || !role) {
      alert('Please enter your Name and Role before committing.');
      return;
    }

    const commitments = [];
    
    // Add the main signed plan commitment
    commitments.push({
      id: 'signed_plan',
      label: 'Partner Status Report Signed by ' + name + ' (' + role + ')',
      suggestedDate: date,
      partnerDate: date,
      agreed: true
    });

    // Add commitments for each track that has a gap filled
    ['salesPro', 'techPro', 'bootcamp', 'simplyPure', 'aspFoundations', 'aspStoragePro', 'aspSupportSpec'].forEach(track => {
      let assignedEmployees = [];
      const checkboxes = document.querySelectorAll('.email-checkbox[data-track="' + track + '"]');
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) assignedEmployees.push(checkboxes[i].value);
      }
      const manualInput = document.querySelector('.manual-input[data-track="' + track + '"]');
      if (manualInput) {
        const manualVals = manualInput.value.split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e; });
        assignedEmployees = assignedEmployees.concat(manualVals);
      }

      if (assignedEmployees.length > 0) {
        commitments.push({
           id: track + '_assignment',
           label: 'GAP FILLER: ' + track + ' nominated ' + assignedEmployees.length + ' user(s)',
           suggestedDate: date,
           partnerDate: date,
           agreed: true,
           assignedEmployees: assignedEmployees
        });
      }
    });

    const payload = {
      type: 'PEI_COMMITMENT_SUBMIT',
      partnerId: ${partner.id},
      partnerName: ${JSON.stringify(partner.name)},
      submittedAt: new Date().toISOString(),
      commitments: commitments
    };

    if (window.opener) {
      window.opener.postMessage(payload, '*');
      document.getElementById('commit-btn').style.display = 'none';
      document.getElementById('status-msg').style.display = 'block';
    } else {
      alert('Dashboard window not found. Please keep the dashboard open while signing.');
    }
  });
</script>
</body>
</html>`;
}

