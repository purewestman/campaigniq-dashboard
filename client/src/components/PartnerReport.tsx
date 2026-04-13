import { useMemo } from "react";
import { TIER_DEFINITIONS, type Partner, generateRecommendedAction } from "@/lib/data";
import { CheckCircle2, XCircle, Shield, Award, Star, Crown, Target, Mail, Activity, GraduationCap, Users } from "lucide-react";
import { activityData } from "@/lib/activityData";
import { trainingData } from "@/lib/trainingData";

interface PartnerReportProps {
  partner: Partner;
  signature?: {
    name: string;
    role: string;
    date: string;
  };
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

export default function PartnerReport({ partner, signature }: PartnerReportProps) {
  const def = TIER_DEFINITIONS[partner.programTier];
  const TierIcon = tierIcons[partner.programTier];
  const training = trainingData[partner.id];
  
  // ─── Data Extraction & Processing ───────────────────────────────
  
  const partnerRecords = useMemo(() => activityData[partner.name] || [], [partner.name]);

  const aspCount = useMemo(() => {
    const indvMap: Record<string, Set<string>> = {};
    partnerRecords.forEach(r => {
      if (!indvMap[r.email]) indvMap[r.email] = new Set();
      if (r.activity) indvMap[r.email].add(r.activity.toLowerCase());
    });
    let count = 0;
    Object.values(indvMap).forEach(courses => {
      let hasFoundations = false, hasStoragePro = false, hasSupportSpec = false;
      courses.forEach(c => {
        if (c.includes("foundations")) hasFoundations = true;
        if (c.includes("storage professional")) hasStoragePro = true;
        if (c.includes("support specialist")) hasSupportSpec = true;
      });
      if (hasFoundations && hasStoragePro && hasSupportSpec) count++;
    });
    return count;
  }, [partnerRecords]);

  // Nomination Logic
  const nominations = useMemo(() => {
    if (!partnerRecords) return { salesPro: [], techPro: [], bootcamp: [], implSpec: [] };

    const cats: Record<string, string[]> = {
      salesPro: ["sales professional", "sales pro"],
      techPro: ["technical sales", "architect associate", "technical professional", "solutions associate"],
      bootcamp: ["bootcamp"],
      implSpec: ["implementation specialist", "support specialist"]
    };

    const results: Record<string, { email: string; name: string; activities: string[] }[]> = {
      salesPro: [], techPro: [], bootcamp: [], implSpec: []
    };

    // Helper to check if person already certified in this category
    const isCertified = (email: string, catKey: string) => {
      const list = training?.[catKey as keyof typeof training] as any[] || [];
      return list.some(p => p.email.toLowerCase() === email.toLowerCase());
    };

    Object.entries(cats).forEach(([catKey, keywords]) => {
      const perPerson: Record<string, { name: string, activities: Set<string> }> = {};
      
      partnerRecords.forEach(r => {
        const act = r.activity.toLowerCase();
        if (keywords.some(k => act.includes(k))) {
          if (!perPerson[r.email]) perPerson[r.email] = { name: r.name, activities: new Set() };
          perPerson[r.email].activities.add(r.activity);
        }
      });

      Object.entries(perPerson).forEach(([email, data]) => {
        if (!isCertified(email, catKey)) {
          results[catKey].push({ email, name: data.name, activities: Array.from(data.activities) });
        }
      });
    });

    return results;
  }, [partnerRecords, training]);

  // Contacts Logic
  const certCounts: Record<string, { name: string; count: number; email: string }> = {};
  if (training) {
    Object.entries(training).forEach(([key, peopleList]) => {
      (peopleList as any[]).forEach(p => {
        if (!certCounts[p.email]) certCounts[p.email] = { name: `${p.firstName} ${p.lastName}`, count: 0, email: p.email };
        certCounts[p.email].count++;
      });
    });
  }
  const topCertified = Object.values(certCounts).sort((a, b) => b.count - a.count).slice(0, 3);

  const tierColors: Record<string, string> = { ambassador: "#7c3aed", elite: "#0d9488", preferred: "#d97706", authorized: "#2563eb" };
  const tc = tierColors[partner.programTier] ?? "#374151";

  // ─── Render Helpers ─────────────────────────────────────────────

  const PageHeader = ({ pageNum }: { pageNum: number }) => (
    <div style={{ background: BRAND_DARK }} className="p-10 pb-12 relative overflow-hidden">
      {/* Decorative Brand SVG background */}
      <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
          <path d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="white"/>
        </svg>
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex gap-5">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="shrink-0 bg-white/10 p-2 rounded-xl border border-white/20">
            <path fillRule="evenodd" clipRule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill={BRAND_ORANGE}/>
          </svg>
          <div>
            <div style={{ color: BRAND_ORANGE }} className="text-[10px] font-bold tracking-[2.5px] uppercase mb-2">
              Pure Storage &middot; FY27 Partner Profile &middot; Page {pageNum}
            </div>
            <h1 style={{ color: BRAND_CREAM }} className="text-3xl font-extrabold mb-3 tracking-tight">{partner.name}</h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${tc}22`, color: tc, border: `1px solid ${tc}44` }}>
                <TierIcon className="w-4 h-4" />
                {def.label}
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Enablement Dashboard</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: BRAND_ORANGE }} className="text-5xl font-black leading-tight">{partner.enablementScore}%</div>
          <div className="text-white/30 text-[9px] font-bold uppercase tracking-[2px]">Enablement Achievement</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-[800px] font-sans text-slate-900 bg-[#f8fafc]" id={`report-${partner.id}`}>
      
      {/* ─── PAGE 1: OVERVIEW ────────────────────────────────────────── */}
      <div className="bg-white" style={{ height: '1130px', position: 'relative', borderBottom: '2px dashed #e2e8f0' }}>
        <PageHeader pageNum={1} />
        
        <div className="p-10 pb-0 space-y-8 -mt-6 relative z-20">
          <div className="grid grid-cols-2 gap-8">
            {/* Status & Compliance */}
            <section className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Program Compliance
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border flex flex-col items-center text-center bg-white shadow-sm ${partner.enablementCompliant ? 'border-green-100 text-green-700' : 'border-red-100 text-red-700'}`}>
                    <div className={`p-2 rounded-lg mb-2 ${partner.enablementCompliant ? 'bg-green-50' : 'bg-red-50'}`}>
                      {partner.enablementCompliant ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold">Enablement</span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex flex-col items-center text-center bg-white shadow-sm ${partner.businessCompliant ? 'border-blue-100 text-blue-700' : 'border-red-100 text-red-700'}`}>
                    <div className={`p-2 rounded-lg mb-2 ${partner.businessCompliant ? 'bg-blue-50' : 'bg-red-50'}`}>
                      {partner.businessCompliant ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold">Business</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Advanced Services (ASP)
                </h2>
                <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 bg-white shadow-sm ${aspCount >= 2 ? 'border-blue-500/20' : 'border-orange-500/20'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${aspCount >= 2 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
                     <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${aspCount >= 2 ? 'text-blue-700' : 'text-orange-600'}`}>
                      {aspCount >= 2 ? "Certified ASP Partner" : "ASP Path Active"}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {aspCount} of 2 required certified individuals identified.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Business Metrics */}
            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Business Metrics
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Bookings USD", value: partner.businessMetrics.bookingsUSD, threshold: def.businessMetrics.bookingsUSD, format: (v: number) => `$${v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : (v / 1000).toFixed(0) + "K"}` },
                    { label: "Unique Customers", value: partner.businessMetrics.uniqueCustomers, threshold: def.businessMetrics.uniqueCustomers, format: (v: number) => v.toString() },
                    { label: "Partner Installs", value: partner.businessMetrics.partnerDeliveredServices, threshold: def.businessMetrics.partnerDeliveredServices, format: (v: number) => v.toString() },
                  ].map(({ label, value, threshold, format }) => {
                    const met = value !== null && threshold !== null && value >= threshold;
                    const na = threshold === null;
                    return (
                      <div key={label} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{label}</p>
                          <p className={`text-xl font-black leading-none mt-1 ${na ? 'text-slate-300' : met ? 'text-slate-900' : 'text-red-500'}`}>
                            {value !== null ? format(value) : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Target</p>
                          <p className="text-xs font-bold text-slate-700">{na ? "\u2014" : format(threshold)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </section>
          </div>

          {/* Recommended Action & Contacts */}
          <div className="space-y-8">
            <section style={{ borderColor: BRAND_ORANGE }} className="border-l-4 bg-[#FFFAF0] p-8 rounded-r-3xl shadow-sm border border-orange-200/30">
              <h2 style={{ color: BRAND_ORANGE }} className="text-[11px] font-black uppercase tracking-[2px] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recommended Action Plan
              </h2>
              <p className="text-[15px] font-medium text-slate-800 leading-relaxed italic">
                "{generateRecommendedAction(partner)}"
              </p>
            </section>

            <div className="grid grid-cols-2 gap-8">
              <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Primary Distribution List
                </h3>
                <div className="flex flex-wrap gap-2">
                  {partner.targetEmails.map(email => (
                    <span key={email} className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                      {email}
                    </span>
                  ))}
                  {partner.targetEmails.length === 0 && <p className="text-xs text-slate-400 italic">No primary contacts assigned.</p>}
                </div>
              </section>
              <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Lead Technical Experts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topCertified.map(p => (
                    <span key={p.email} className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200/50 px-3 py-1.5 rounded-xl shadow-sm">
                      {p.name} <span className="text-blue-400 font-medium ml-1">x{p.count}</span>
                    </span>
                  ))}
                  {topCertified.length === 0 && <p className="text-xs text-slate-400 italic">No certifications recorded yet.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end border-t border-slate-100 pt-6">
          <div>
            <div className="text-[16px] font-black italic text-slate-300 tracking-tighter mb-1">Everpure</div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">FY27 Global Reseller Program Report</p>
          </div>
          <p className="text-[9px] text-slate-400 font-medium">
            Confidential &middot; {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* ─── PAGE 2: ENABLEMENT DETAIL ───────────────────────────────── */}
      <div className="bg-white" style={{ minHeight: '1130px', height: '1350px', position: 'relative' }}>
        <PageHeader pageNum={2} />
        
        <div className="p-10 pb-0 space-y-10 -mt-6 relative z-20">
          
          {/* Detailed Progress Table */}
          <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60 shadow-sm">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[2px] mb-8 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" /> Enablement Path Achievement
            </h2>
            
            <div className="space-y-8">
              {[
                { label: "Sales Professional", key: "salesPro" as const },
                { label: "Technical Sales Pro", key: "techPro" as const },
                { label: "Partner Architect Bootcamp", key: "bootcamp" as const },
                { label: "Implementation Specialist", key: "implSpec" as const },
              ].map(({ label, key }) => {
                const req = partner.requirements[key];
                const met = req.obtained >= req.required;
                const people = training?.[key] ?? [];
                const nominees = nominations[key] ?? [];
                
                return (
                  <div key={key} className="grid grid-cols-12 gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    {/* Header Col */}
                    <div className="col-span-4 space-y-2">
                      <h3 className="text-sm font-black text-slate-800">{label}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${met ? 'bg-green-50 text-green-600' : req.required === 0 ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                          {met ? "MET" : req.required === 0 ? "N/A" : "OPEN GAP"}
                        </span>
                        <span className="text-xs font-black text-slate-400">{req.obtained} / {req.required}</span>
                      </div>
                    </div>

                    {/* Certified Col */}
                    <div className="col-span-4 border-l border-slate-100 pl-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Certified
                      </h4>
                      {people.length > 0 ? (
                        <div className="space-y-1.5">
                          {people.map((p, idx) => (
                            <div key={idx} className="text-[11px] font-bold text-slate-700 flex items-center gap-2">
                              <span className="w-1 h-1 bg-green-500 rounded-full shrink-0" />
                              {p.firstName} {p.lastName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">None identified</p>
                      )}
                    </div>

                    {/* Nominated Col */}
                    <div className="col-span-4 border-l border-slate-100 pl-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-orange-500" /> Active Nominees
                      </h4>
                      {nominees.length > 0 ? (
                        <div className="space-y-2">
                          {nominees.slice(0, 4).map((n, idx) => (
                            <div key={idx} className="group">
                              <div className="text-[11px] font-bold text-slate-700 group-hover:text-orange-600 transition-colors cursor-default">
                                {n.name}
                              </div>
                              <p className="text-[8px] text-slate-400 leading-none truncate max-w-full">
                                Active: {n.activities[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No candidates found in activity data</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Training Guidance */}
          <div className="bg-[#5A6359] rounded-3xl p-8 text-white relative shadow-lg overflow-hidden">
             <div className="absolute bottom-0 right-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <GraduationCap className="w-64 h-64" />
             </div>
             <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-500" /> Next Steps for Growth
                </h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
                  Enablement gaps identified on Page 1 represent immediate opportunities for tier advancement. 
                  Leverage the **Active Nominees** identified above as they are already engaged in relevant training 
                  and are the fastest path to closing certification gaps.
                </p>
                <div className="pt-2 flex gap-4">
                   <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                      <p className="text-orange-400 text-[10px] font-black uppercase mb-1">Total Gap Count</p>
                      <p className="text-2xl font-black">{partner.totalGaps}</p>
                   </div>
                   <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                      <p className="text-orange-400 text-[10px] font-black uppercase mb-1">Nominated Reach</p>
                      <p className="text-2xl font-black">
                        {Object.values(nominations).flat().length} Candidates
                      </p>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Electronic Signature Block */}
          {signature && (
            <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-center">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digitally Verified By</p>
                      <p className="text-[18px] font-bold text-slate-900 leading-tight" style={{ fontFamily: '"Alex Brush", cursive, sans-serif' }}>
                        {signature.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</p>
                        <p className="text-xs font-bold text-slate-700">{signature.role}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signature Date</p>
                        <p className="text-xs font-bold text-slate-700">{signature.date}</p>
                     </div>
                  </div>
               </div>
               
               <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">E-Sign Validated</span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-2 font-medium">Verification ID: PEI-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
               </div>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end border-t border-slate-100 pt-6">
          <div>
            <div className="text-[16px] font-black italic text-slate-300 tracking-tighter mb-1">Everpure</div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Technical Enablement Annex</p>
          </div>
          <div className="text-right">
             <p className="text-[9px] text-slate-400 font-medium italic mb-1">"Data-driven enablement intelligence."</p>
             <p className="text-[10px] font-bold text-slate-300">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


