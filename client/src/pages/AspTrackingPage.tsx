import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert } from "lucide-react";
import { activityData } from "@/lib/activityData";
import { trainingData, type TrainingPerson } from "@/lib/trainingData";
import { partners } from "@/lib/data";
import ExportButton from "@/components/ExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { generateAspReportHtml } from "@/lib/aspGapReportPdf";
import { FileDown } from "lucide-react";

interface Candidate {
  name: string;
  email: string;
  hasFoundations: boolean;
  hasStoragePro: boolean;
  hasSupportSpec: boolean;
  isFullyQualified: boolean;
  missingTags: string[];
}

interface PartnerAspResult {
  partner: string;
  candidates: Candidate[];
  fullyQualifiedCount: number;
  isCompliant: boolean;
}

export default function AspTrackingPage() {
  const { user } = useAuth();

  const [partnerFilter, setPartnerFilter] = useState("");
  const [gapFilter, setGapFilter] = useState<"all" | "gaps">("all");

  const resultData = useMemo(() => {
    const results: PartnerAspResult[] = [];

    // Combine both sources using actual Partner names
    const allPartners = new Set([
      ...Object.keys(activityData), 
      ...partners.map(p => p.name)
    ]);

    for (const partner of Array.from(allPartners)) {
      // Group by email
      const indvMap: Record<string, { 
        name: string; 
        hasFoundations: boolean;
        hasStoragePro: boolean;
        hasSupportSpec: boolean;
        courses: Set<string>;
      }> = {};

      const getIndv = (email: string, firstName?: string, lastName?: string) => {
        const lowerEmail = email.toLowerCase();
        if (!indvMap[lowerEmail]) {
          indvMap[lowerEmail] = { 
            name: (firstName && lastName) ? `${firstName} ${lastName}` : email, 
            hasFoundations: false,
            hasStoragePro: false,
            hasSupportSpec: false,
            courses: new Set() 
          };
        }
        return indvMap[lowerEmail];
      };

      // 1. Interpret fuzzy active tracking data from SFDC log
      const records = activityData[partner] || [];
      records.forEach((r: any) => {
        if (!r.email) return;
        const indv = getIndv(r.email, r.name ? r.name.split(' ')[0] : '', r.name ? r.name.split(' ').slice(1).join(' ') : '');
        indv.name = r.name || indv.name;
        if (r.activity) {
          const c = r.activity.toLowerCase();
          indv.courses.add(c);
          if (c.includes("foundations")) indv.hasFoundations = true;
          if (c.includes("storage professional")) indv.hasStoragePro = true;
          if (c.includes("support specialist")) indv.hasSupportSpec = true;
        }
      });

      // 2. Map verified training database completion data
      const partnerObj = partners.find(p => p.name === partner);
      const td = partnerObj ? trainingData[partnerObj.id] : undefined;
      
      if (td) {
        const applyCert = (list: TrainingPerson[], flag: 'hasFoundations' | 'hasStoragePro' | 'hasSupportSpec') => {
          if (!list) return;
          list.forEach(p => {
             const indv = getIndv(p.email, p.firstName, p.lastName);
             if (p.firstName && p.lastName) indv.name = `${p.firstName} ${p.lastName}`;
             indv[flag] = true;
          });
        };
        applyCert(td.aspFoundationsFA, 'hasFoundations');
        applyCert(td.aspFoundationsFB, 'hasFoundations');
        applyCert(td.storageProFA, 'hasStoragePro');
        applyCert(td.storageProFB, 'hasStoragePro');
        applyCert(td.supportSpecFA, 'hasSupportSpec');
        applyCert(td.supportSpecFB, 'hasSupportSpec');
      }

      const candidates: Candidate[] = [];
      let fullyQualifiedCount = 0;

      for (const [email, data] of Object.entries(indvMap)) {
        const hasFoundations = data.hasFoundations;
        const hasStoragePro = data.hasStoragePro;
        const hasSupportSpec = data.hasSupportSpec;

        const isFullyQualified = hasFoundations && hasStoragePro && hasSupportSpec;
        if (isFullyQualified) fullyQualifiedCount++;

        // Add them to the dashboard if they have started the track
        if (hasFoundations || hasStoragePro || hasSupportSpec || Array.from(data.courses).some(c => c.includes("asp") || c.includes("storage"))) {
          const missingTags: string[] = [];
          if (!hasFoundations) missingTags.push("Foundations");
          if (!hasStoragePro) missingTags.push("Storage Pro");
          if (!hasSupportSpec) missingTags.push("Support Spec");

          candidates.push({
            name: data.name,
            email,
            hasFoundations,
            hasStoragePro,
            hasSupportSpec,
            isFullyQualified,
            missingTags,
          });
        }
      }

      // Sort candidates so fully qualified show first
      candidates.sort((a, b) => Number(b.isFullyQualified) - Number(a.isFullyQualified));

      results.push({
        partner,
        candidates,
        fullyQualifiedCount,
        isCompliant: fullyQualifiedCount >= 2,
      });
    }

    let sorted = results.sort((a, b) => {
      if (a.isCompliant !== b.isCompliant) return a.isCompliant ? -1 : 1;
      return a.partner.localeCompare(b.partner);
    });

    // Apply ROW-LEVEL SECURITY
    if (user?.role === 'partner' && user.domain) {
      const domainPartner = partners.find(p => p.domain === user.domain);
      if (domainPartner) {
        sorted = sorted.filter(r => r.partner === domainPartner.name);
      }
    }

    // Apply Filters
    if (partnerFilter.trim()) {
      sorted = sorted.filter(r => r.partner.toLowerCase().includes(partnerFilter.toLowerCase()));
    }

    if (gapFilter === "gaps") {
      sorted = sorted.map(r => ({
        ...r,
        candidates: r.candidates.filter(c => !c.isFullyQualified)
      })).filter(r => r.candidates.length > 0 || !r.isCompliant);
    }

    return sorted;
  }, [user, partnerFilter, gapFilter]);

  const handleGlobalExport = () => {
    // Collect all candidates across all visible partners
    const allCandidates = resultData.flatMap(r => r.candidates);
    const reportTitle = user?.role === 'partner' && user.domain 
      ? `${partners.find(p => p.domain === user?.domain)?.name || 'Domain'} ASP Compliance Audit`
      : "Global ASP Compliance Audit";
      
    const html = generateAspReportHtml(reportTitle, allCandidates);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const totalPartners = resultData.length;
  // Calculate compliant based on original counts (isCompliant is true if >= 2 fully qualified)
  const compliantPartners = resultData.filter(r => r.isCompliant).length;
  const actionRequiredPartners = totalPartners - compliantPartners;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header and KPI Cards */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            ASP Qualification Tracking
          </h2>
          <div className="mt-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4 max-w-4xl">
            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
              <strong className="text-indigo-900">Requirement:</strong> To maintain Authorized Support Partner (ASP) status, a partner must have at least two (2) unique individuals who have completed the full qualification track: 
              <span className="font-semibold"> ASP Foundations</span> (FlashArray or FlashBlade), 
              <span className="font-semibold"> Pure Storage Professional Certification</span> (FlashArray or FlashBlade), and 
              <span className="font-semibold"> Pure Support Specialist Certification</span>.
            </p>
            <p className="text-[13px] text-slate-700 leading-relaxed mt-2 font-medium">
              If one user has completed FlashArray ASP Foundations and the same person completed Pure Storage Professional Certification for FlashArray, the partner will be issued with ASP Partner Badge while pursuing FlashBlade or FlashArray Support Specialist Certification. 
              <strong className="text-rose-600 block mt-1.5">
                ** Individual must earn the Support Specialist certification within 12 months of the Storage Professional certification.
              </strong>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleGlobalExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm shrink-0"
          >
            <FileDown className="w-4 h-4" />
            {user?.role === 'partner' ? 'Export ASP Audit PDF' : 'Global Audit PDF'}
          </button>
          <div className="terrain-card px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Compliant</div>
              <div className="text-[16px] font-bold text-foreground leading-tight">{compliantPartners}</div>
            </div>
          </div>
          <div className="terrain-card px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Action Required</div>
              <div className="text-[16px] font-bold text-foreground leading-tight">{actionRequiredPartners}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Filter by partner name..." 
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-pure-orange w-full sm:w-[250px]"
        />
        <select 
          value={gapFilter}
          onChange={(e) => setGapFilter(e.target.value as "all" | "gaps")}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-pure-orange"
        >
          <option value="all">Show All Candidates</option>
          <option value="gaps">Show Candidates with Gaps</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="terrain-card p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="px-5 py-3 text-[12px] font-semibold text-foreground/80">Partner</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-foreground/80">Status</th>
                <th className="px-5 py-3 text-[12px] font-semibold text-foreground/80">Candidates & Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {resultData.map((row: PartnerAspResult) => (
                <tr key={row.partner} className="hover:bg-black/[0.01] transition-colors">
                  
                  {/* Partner Name */}
                  <td className="px-5 py-4 align-top w-[25%]">
                    <div className="flex items-center justify-between gap-2">
                       <div>
                         <p className="text-[14px] font-semibold text-foreground">{row.partner}</p>
                         <p className="text-[12px] text-muted-foreground mt-1">
                           {row.fullyQualifiedCount} of 2 required full passes
                         </p>
                       </div>
                       {/* Export Button for ASP View */}
                       {partners.find(p => p.name === row.partner) && (
                         <button 
                           onClick={() => {
                             const html = generateAspReportHtml(row.partner, row.candidates);
                             const win = window.open("", "_blank");
                             if (win) {
                               win.document.write(html);
                               win.document.close();
                               win.focus();
                             }
                           }}
                           className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground hover:text-indigo-600 transition-all"
                           title="Export ASP Gap Report"
                         >
                           <FileDown className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4 align-top w-[15%]">
                    {row.isCompliant ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-medium border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Qualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[12px] font-medium border border-amber-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Gap: Need {2 - row.fullyQualifiedCount} more
                      </span>
                    )}
                  </td>

                  {/* Candidates & Gaps */}
                  <td className="px-5 py-4 align-top">
                    {row.candidates.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {row.candidates.map((c: Candidate, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            {c.isFullyQualified ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="text-[13px] font-medium text-foreground">
                                {c.name} <span className="font-normal text-muted-foreground">({c.email})</span>
                              </p>
                              {c.isFullyQualified ? (
                                <p className="text-[11px] text-emerald-600 font-medium">Earned all 3 required certs</p>
                              ) : (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="text-[11px] text-muted-foreground">Missing:</span>
                                  {c.missingTags.map((tag: string) => (
                                    <span key={tag} className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[13px] text-muted-foreground italic">
                        No employees have started ASP tracks.
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {resultData.length === 0 && (
            <div className="p-8 text-center text-[13px] text-muted-foreground">
              No partner activity data available to compute.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
