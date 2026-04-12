import { TIER_DEFINITIONS, type Partner, PROGRAM_TIERS, generateRecommendedAction, formatCurrency } from "@/lib/data";
import { CheckCircle2, XCircle, Shield, Award, Star, Crown, Target, Mail, Activity, GraduationCap } from "lucide-react";
import { activityData } from "@/lib/activityData";
import { trainingData } from "@/lib/trainingData";

interface PartnerReportProps {
  partner: Partner;
}

const tierIcons: Record<string, React.ElementType> = {
  authorized: Shield,
  preferred: Star,
  elite: Award,
  ambassador: Crown,
};

const BRAND_ORANGE = "#FF7023";
const BRAND_DARK = "#5A6359";
const BRAND_GREEN = "#16a34a";
const BRAND_CREAM = "#FFF5E3";

export default function PartnerReport({ partner }: PartnerReportProps) {
  const def = TIER_DEFINITIONS[partner.programTier];
  const TierIcon = tierIcons[partner.programTier];
  const tierReq = def.enablement;
  const training = trainingData[partner.id];
  
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

  // Contacts Logic: Primary + Top 3 Certified
  const certCounts: Record<string, { name: string; count: number; email: string }> = {};
  if (training) {
    Object.entries(training).forEach(([key, peopleList]) => {
      peopleList.forEach(p => {
        if (!certCounts[p.email]) certCounts[p.email] = { name: `${p.firstName} ${p.lastName}`, count: 0, email: p.email };
        certCounts[p.email].count++;
      });
    });
  }
  const topCertified = Object.values(certCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const tierColors: Record<string, string> = {
    ambassador: "#7c3aed",
    elite: "#0d9488",
    preferred: "#d97706",
    authorized: "#2563eb",
  };
  const tc = tierColors[partner.programTier] ?? "#374151";

  return (
    <div className="w-[800px] bg-white font-sans text-slate-900 border overflow-hidden" id={`report-${partner.id}`}>
      {/* Header - Brand Aligned */}
      <div style={{ background: BRAND_DARK }} className="p-10 pb-12">
        <div className="flex justify-between items-start">
          <div className="flex gap-5">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="shrink-0">
              <path fillRule="evenodd" clipRule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill={BRAND_ORANGE}/>
            </svg>
            <div>
              <div style={{ color: BRAND_ORANGE }} className="text-[10px] font-bold tracking-[2.5px] uppercase mb-2">
                Pure Storage · Partner Directory Profile
              </div>
              <h1 style={{ color: BRAND_CREAM }} className="text-3xl font-extrabold mb-3">{partner.name}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${tc}22`, color: tc, border: `1px solid ${tc}44` }}>
                  <TierIcon className="w-4 h-4" />
                  {def.label}
                </span>
                <span className="text-white/40 text-xs font-medium">FY27 Global Reseller Program</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div style={{ color: BRAND_ORANGE }} className="text-5xl font-black leading-tight">{partner.enablementScore}%</div>
            <div className="text-white/30 text-[9px] font-bold uppercase tracking-[2px]">Enablement Score</div>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-8 -mt-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Status & Compliance */}
          <section className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Program Compliance
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center ${partner.enablementCompliant ? 'bg-white border-green-100 text-green-700' : 'bg-white border-red-100 text-red-700'}`}>
                  {partner.enablementCompliant ? <CheckCircle2 className="w-5 h-5 mb-2 text-green-600" /> : <XCircle className="w-5 h-5 mb-2 text-red-600" />}
                  <span className="text-xs font-bold">Enablement</span>
                  <p className="text-[10px] font-medium opacity-60 mt-0.5">{partner.enablementCompliant ? 'Compliant' : 'Gap Exists'}</p>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col items-center text-center ${partner.businessCompliant ? 'bg-white border-blue-100 text-blue-700' : 'bg-white border-red-100 text-red-700'}`}>
                  {partner.businessCompliant ? <CheckCircle2 className="w-5 h-5 mb-2 text-blue-600" /> : <XCircle className="w-5 h-5 mb-2 text-red-600" />}
                  <span className="text-xs font-bold">Business</span>
                  <p className="text-[10px] font-medium opacity-60 mt-0.5">{partner.businessCompliant ? 'Meeting Targets' : 'Gap Exists'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> ASP Status
              </h2>
              <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${fullyQualifiedAspCount >= 2 ? 'bg-white border-blue-500/20' : 'bg-white border-orange-500/20'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${fullyQualifiedAspCount >= 2 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                   {fullyQualifiedAspCount >= 2 ? <Shield className="w-6 h-6 text-blue-600" /> : <Shield className="w-6 h-6 text-orange-500" />}
                </div>
                <div>
                  <p className={`text-sm font-black ${fullyQualifiedAspCount >= 2 ? 'text-blue-700' : 'text-orange-600'}`}>
                    {fullyQualifiedAspCount >= 2 ? "Qualified Partner" : "In Progress"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {fullyQualifiedAspCount} of 2 required certified individuals met
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Business Performance */}
          <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Business Metrics
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Bookings USD", value: partner.businessMetrics.bookingsUSD, threshold: def.businessMetrics.bookingsUSD, format: (v: number) => `$${v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : (v / 1000).toFixed(0) + "K"}` },
                  { label: "Unique Customers", value: partner.businessMetrics.uniqueCustomers, threshold: def.businessMetrics.uniqueCustomers, format: (v: number) => v.toString() },
                  { label: "PDS (Installs)", value: partner.businessMetrics.partnerDeliveredServices, threshold: def.businessMetrics.partnerDeliveredServices, format: (v: number) => v.toString() },
                ].map(({ label, value, threshold, format }) => {
                  const met = value !== null && threshold !== null && value >= threshold;
                  const na = threshold === null;
                  return (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/50 shadow-sm">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
                        <p className={`text-lg font-black ${na ? 'text-slate-300' : met ? 'text-slate-900' : 'text-red-500'}`}>
                          {value !== null ? format(value) : "Not Set"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Required</p>
                        <p className="text-xs font-bold text-slate-700">{na ? "N/A" : format(threshold)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
          </section>
        </div>

        {/* Enablement Detail & Certified Professionals */}
        <section className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award className="w-3.5 h-3.5" /> Enablement Path Achievement
          </h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {[
              { label: "Sales Professional", key: "salesPro" as const },
              { label: "Technical Sales Pro", key: "techPro" as const },
              { label: "Partner Architect Bootcamp", key: "bootcamp" as const },
              { label: "Implementation Specialist", key: "implSpec" as const },
            ].map(({ label, key }) => {
              const req = partner.requirements[key];
              const met = req.obtained >= req.required;
              const people = training?.[key] ?? [];
              
              return (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between items-end pb-1 border-b border-slate-200">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700">{label}</h3>
                      <p className="text-[10px] font-semibold" style={{ color: met ? BRAND_GREEN : req.required === 0 ? "#94a3b8" : "#ef4444" }}>
                         {met ? "Requirement Met" : req.required === 0 ? "Not Applicable" : "Gap identified"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">{req.obtained}</span>
                      <span className="text-[10px] font-bold text-slate-400"> / {req.required}</span>
                    </div>
                  </div>
                  
                  {people.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                      {people.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                          <span className="text-[10px] font-bold">{p.firstName} {p.lastName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-10 flex items-center text-[10px] text-slate-400 italic">No completions recorded</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommended Action */}
        <section style={{ borderColor: BRAND_ORANGE }} className="border-l-4 bg-[#FFFAF0] p-6 rounded-r-2xl">
          <h2 style={{ color: BRAND_ORANGE }} className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Recommended Action Plan
          </h2>
          <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
            "{generateRecommendedAction(partner)}"
          </p>
        </section>

        {/* Contact Intelligence */}
        <div className="flex justify-between items-end pt-4 border-t border-slate-100">
          <div className="space-y-4">
             {partner.targetEmails.length > 0 && (
               <div>
                 <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <Mail className="w-3 h-3" /> Primary Contacts
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {partner.targetEmails.map(email => (
                     <span key={email} className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                       {email}
                     </span>
                   ))}
                 </div>
               </div>
             )}
             {topCertified.length > 0 && (
               <div>
                 <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <GraduationCap className="w-3 h-3" /> Key Certified Professionals
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {topCertified.map(p => (
                     <span key={p.email} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                       {p.name} <span className="opacity-50 font-normal">({p.count})</span>
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>
          <div className="text-right">
             <div className="mb-4">
                <svg width="80" height="20" viewBox="0 0 100 25" fill="none">
                  <path d="M0 0H100V25H0V0Z" fill="transparent" />
                  <text x="0" y="18" fill={BRAND_DARK} className="text-[14px] font-black italic">Everpure</text>
                </svg>
             </div>
             <p className="text-[9px] text-slate-400 font-medium">
               PEI FY27 Dashboard &middot; Partner Directory Card &middot; {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

