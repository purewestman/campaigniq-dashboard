import { useMemo } from "react";
import { CheckCircle2, AlertCircle, XCircle, ShieldAlert } from "lucide-react";
import { activityData } from "@/lib/activityData";
import { partners } from "@/lib/data";
import ExportButton from "@/components/ExportButton";
import { useAuth } from "@/contexts/AuthContext";

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

  const resultData = useMemo(() => {
    const results: PartnerAspResult[] = [];

    for (const [partner, records] of Object.entries(activityData)) {
      // Group by email
      const indvMap: Record<string, { name: string; courses: Set<string> }> = {};
      records.forEach((r: any) => {
        if (!indvMap[r.email]) {
          indvMap[r.email] = { name: r.name, courses: new Set() };
        }
        if (r.activity) indvMap[r.email].courses.add(r.activity.toLowerCase());
      });

      const candidates: Candidate[] = [];
      let fullyQualifiedCount = 0;

      for (const [email, data] of Object.entries(indvMap)) {
        let hasFoundations = false;
        let hasStoragePro = false;
        let hasSupportSpec = false;

        data.courses.forEach(c => {
          if (c.includes("foundations")) hasFoundations = true;
          if (c.includes("storage professional")) hasStoragePro = true;
          if (c.includes("support specialist")) hasSupportSpec = true;
        });

        // If they have at least one or are close, consider them a candidate to show in the UI.
        const isFullyQualified = hasFoundations && hasStoragePro && hasSupportSpec;
        if (isFullyQualified) fullyQualifiedCount++;

        if (hasFoundations || hasStoragePro || hasSupportSpec) {
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

    // Sort compliant partners first, then by name
    let sorted = results.sort((a, b) => {
      if (a.isCompliant !== b.isCompliant) return a.isCompliant ? -1 : 1;
      return a.partner.localeCompare(b.partner);
    });

    // ROW-LEVEL SECURITY: if partner login, only show their own row
    if (user?.role === 'partner' && user.domain) {
      const domainPartner = partners.find(p => p.domain === user.domain);
      if (domainPartner) {
        sorted = sorted.filter(r => r.partner === domainPartner.name);
      }
    }

    return sorted;
  }, [user]);

  const totalPartners = resultData.length;
  const compliantPartners = resultData.filter(r => r.isCompliant).length;
  const actionRequiredPartners = totalPartners - compliantPartners;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            ASP Qualification Tracking
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Requirement: 2 individuals with Foundations, Storage Professional, and Support Specialist.
          </p>
        </div>

        <div className="flex gap-3">
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
                         <ExportButton 
                           partner={partners.find(p => p.name === row.partner)!} 
                           variant="ghost" 
                         />
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
