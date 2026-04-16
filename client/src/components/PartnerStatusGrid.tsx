import { Partner, TIER_DEFINITIONS, PROGRAM_TIERS, generateRecommendedAction, formatCurrency } from "@/lib/data";
import { AlertCircle, CheckCircle2, ChevronRight, TrendingUp, Award, Building2 } from "lucide-react";

interface PartnerStatusGridProps {
  partners: Partner[];
  onNavigateToPartner?: (partnerName: string) => void;
}

export default function PartnerStatusGrid({ partners, onNavigateToPartner }: PartnerStatusGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {partners.map((partner) => {
        const currentTierDef = TIER_DEFINITIONS[partner.programTier];
        const tierIndex = PROGRAM_TIERS.indexOf(partner.programTier);
        const nextTierId = tierIndex < PROGRAM_TIERS.length - 1 ? PROGRAM_TIERS[tierIndex + 1] : null;
        const nextTierDef = nextTierId ? TIER_DEFINITIONS[nextTierId] : null;
        
        const actionText = generateRecommendedAction(partner);
        const isCompliant = actionText.includes("requirements met");

        // Simple parse to separate Enablement and Business strings (just for visual rendering)
        let enablementPart = "";
        let businessPart = "";
        
        if (actionText.includes("Enablement outstanding")) {
          const eMatch = actionText.match(/Enablement outstanding — complete: ([^.]+)\./);
          if (eMatch) enablementPart = eMatch[1];
        }
        if (actionText.includes("Business criteria outstanding")) {
          const bMatch = actionText.match(/Business criteria outstanding — close: ([^.]+)\./);
          if (bMatch) businessPart = bMatch[1];
        }

        return (
          <div 
            key={partner.id} 
            className="flex flex-col bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            style={{ borderColor: "var(--color-stone-gray)" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b flex-none" style={{ borderColor: "var(--color-stone-gray)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate" title={partner.name}>
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span className="text-[11px] truncate">{partner.domain || "No domain"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progression Bar */}
            <div className="px-5 py-3 flex-none" style={{ background: "var(--color-cloud-white)" }}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Tier</span>
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold"
                    style={{ background: currentTierDef.bg, color: currentTierDef.color }}
                  >
                    <Award className="w-3 h-3" />
                    {currentTierDef.label}
                  </div>
                </div>
                
                {nextTierDef ? (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Next Tier</span>
                      <div className="text-[11px] font-bold text-slate-400">
                        {nextTierDef.label}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</span>
                    <div className="text-[11px] font-bold text-teal-600">
                      Top Tier Reached
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gaps / Status Body */}
            <div className="p-5 flex-1 flex flex-col gap-3">
              {isCompliant ? (
                <div className="flex items-start gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="text-[12px] font-medium leading-relaxed">
                    All current <span className="font-bold">{currentTierDef.label}</span> requirements met! 
                    {nextTierDef ? " Ready to advance towards " + nextTierDef.label + "." : " Sustaining pinnacle status."}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="text-[12px] font-medium text-slate-700 leading-relaxed">
                    To maintain <strong style={{ color: currentTierDef.color }}>{currentTierDef.label}</strong> status, resolve the following gaps:
                  </div>
                  
                  {enablementPart && (
                    <div className="flex items-start gap-2 text-[12px] bg-red-50 text-red-900 p-2.5 rounded border border-red-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <span className="font-bold text-[11px] uppercase tracking-wider text-red-700 block mb-1">Training Gaps</span>
                        <span className="leading-snug">{enablementPart}</span>
                      </div>
                    </div>
                  )}

                  {businessPart && (
                    <div className="flex items-start gap-2 text-[12px] bg-amber-50 text-amber-900 p-2.5 rounded border border-amber-100">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 block mb-1">Business Gaps</span>
                        <span className="leading-snug">{businessPart}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t bg-slate-50 flex-none">
              <button 
                onClick={() => onNavigateToPartner && onNavigateToPartner(partner.name)}
                className="w-full flex items-center justify-center gap-1 py-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                title="View Detailed Compliance Tracking"
              >
                Open Compliance Breakdown
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
