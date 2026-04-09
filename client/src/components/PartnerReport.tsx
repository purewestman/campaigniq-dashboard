import { TIER_DEFINITIONS, type Partner, PROGRAM_TIERS } from "@/lib/data";
import { CheckCircle2, XCircle, Shield, Award, Star, Crown, Target, Mail, Activity } from "lucide-react";
import { activityData } from "@/lib/activityData";

interface PartnerReportProps {
  partner: Partner;
}

const tierIcons: Record<string, React.ElementType> = {
  authorized: Shield,
  preferred: Star,
  elite: Award,
  ambassador: Crown,
};

const tierStyles: Record<string, { bg: string, color: string }> = {
  authorized: { bg: "#e0f2fe", color: "#0369a1" },
  preferred: { bg: "#fef3c7", color: "#b45309" },
  elite: { bg: "#ccfbf1", color: "#0f766e" },
  ambassador: { bg: "#f3e8ff", color: "#7e22ce" },
};

export default function PartnerReport({ partner }: PartnerReportProps) {
  const def = TIER_DEFINITIONS[partner.programTier];
  const style = tierStyles[partner.programTier] || tierStyles.authorized;
  const TierIcon = tierIcons[partner.programTier];
  const tierReq = def.enablement;
  
  // ASP Logic derived from activityData
  const partnerRecords = activityData[partner.name] || [];
  const indvMap: Record<string, Set<string>> = {};
  partnerRecords.forEach(r => {
    if (!indvMap[r.email]) indvMap[r.email] = new Set();
    if (r.activity) indvMap[r.email].add(r.activity.toLowerCase());
  });

  let fullyQualifiedAspCount = 0;
  Object.values(indvMap).forEach(courses => {
    let hasFoundations = false;
    let hasStoragePro = false;
    let hasSupportSpec = false;
    courses.forEach(c => {
      if (c.includes("foundations")) hasFoundations = true;
      if (c.includes("storage professional")) hasStoragePro = true;
      if (c.includes("support specialist")) hasSupportSpec = true;
    });
    if (hasFoundations && hasStoragePro && hasSupportSpec) fullyQualifiedAspCount++;
  });

  return (
    <div className="w-[800px] p-10 bg-white font-sans text-slate-900 border" id={`report-${partner.id}`}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{partner.name}</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold" style={{ background: style.bg, color: style.color }}>
              <TierIcon className="w-4 h-4" />
              {def.label}
            </span>
            <span className="text-slate-500 text-sm font-medium">FY27 Global Reseller Program Report</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600 leading-tight">{partner.enablementScore}%</div>
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Enablement Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Compliance Status */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Program Compliance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border-2 ${partner.enablementCompliant ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {partner.enablementCompliant ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="font-bold">Enablement</span>
                </div>
                <p className="text-xs opacity-80">{partner.enablementCompliant ? 'Requirements Met' : 'Action Required'}</p>
              </div>
              <div className={`p-4 rounded-2xl border-2 ${partner.businessCompliant ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {partner.businessCompliant ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="font-bold">Business</span>
                </div>
                <p className="text-xs opacity-80">{partner.businessCompliant ? 'Thresholds Met' : 'Action Required'}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ASP Qualification</h2>
            <div className={`p-4 rounded-2xl border-2 ${fullyQualifiedAspCount >= 2 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
              <div className="flex items-center gap-2 mb-1">
                {fullyQualifiedAspCount >= 2 ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                <span className="font-bold">ASP Status</span>
              </div>
              <p className="text-sm font-medium">{fullyQualifiedAspCount} of 2 required certified individuals</p>
            </div>
          </section>
        </div>

        {/* Enablement Breakdown */}
        <div className="bg-slate-50 rounded-3xl p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enablement Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: "Sales Professional", key: "salesPro" as const },
              { label: "Technical Professional", key: "techPro" as const },
              { label: "Partner Architect Bootcamp", key: "bootcamp" as const },
              { label: "Implementation Specialist", key: "implSpec" as const },
            ].map(({ label, key }) => {
              const req = partner.requirements[key];
              const met = req.obtained >= req.required;
              const percent = req.required > 0 ? (req.obtained / req.required) * 100 : 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">{label}</span>
                    <span className={`font-bold ${met ? 'text-green-600' : req.required === 0 ? 'text-slate-400' : 'text-red-600'}`}>
                      {req.obtained} / {req.required}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: met ? '#10b981' : req.required === 0 ? '#cbd5e1' : '#f43f5e'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      <section className="mb-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Business Performance Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { 
              label: "Bookings USD", 
              value: partner.businessMetrics.bookingsUSD, 
              threshold: def.businessMetrics.bookingsUSD,
              format: (v: number) => `$${v.toLocaleString()}`
            },
            { 
              label: "Unique Customers", 
              value: partner.businessMetrics.uniqueCustomers, 
              threshold: def.businessMetrics.uniqueCustomers,
              format: (v: number) => v.toString()
            },
            { 
              label: "Partner Delivered Services", 
              value: partner.businessMetrics.partnerDeliveredServices, 
              threshold: def.businessMetrics.partnerDeliveredServices,
              format: (v: number) => v.toString()
            },
          ].map(({ label, value, threshold, format }) => {
            const met = value !== null && threshold !== null && value >= threshold;
            const na = threshold === null;
            return (
              <div key={label} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
                <p className={`text-lg font-bold ${na ? 'text-slate-300' : met ? 'text-slate-900' : 'text-red-600'}`}>
                  {value !== null ? format(value) : "N/A"}
                </p>
                {threshold !== null && (
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Target: {format(threshold)}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-blue-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6" />
          <h2 className="text-xl font-bold">Recommended Action Plan</h2>
        </div>
        <p className="text-blue-100 leading-relaxed text-lg">
          {partner.action}
        </p>
      </section>

      {/* Contacts & Footer */}
      <div className="mt-auto pt-10 flex justify-between items-end">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Contacts</h3>
          <div className="flex gap-2">
            {partner.targetEmails.map(email => (
              <span key={email} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                {email}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-slate-300 font-medium">
          Generated via PEI Dashboard &middot; {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
