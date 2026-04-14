import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  type ProgramTier,
  type ComplianceFilter,
  generateRecommendedAction,
} from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import PartnerTable from "@/components/CampaignTable";
import GlobalRoadmapView from "@/components/GlobalRoadmapView";
import {
  FileCheck,
  Download,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Shield,
  Users,
  Target,
  Award,
  Printer,
  Pencil,
  DollarSign,
  Search,
  Filter,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { overrides } = useOverrides();
  const { modifiedPartners, modifications, allModificationHistory } = useModifications();
  const [exporting, setExporting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"compliance" | "roadmap">("compliance");
  
  // Table state
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Executive Summary Data
  const summary = useMemo(() => {
    const total = modifiedPartners.length;
    const tierCounts = PROGRAM_TIERS.reduce((acc, tier) => {
      acc[tier] = modifiedPartners.filter((p) => p.programTier === tier).length;
      return acc;
    }, {} as Record<ProgramTier, number>);

    const totalGaps = modifiedPartners.reduce((s, p) => s + p.totalGaps, 0);
    const totalExams = modifiedPartners.reduce((s, p) => s + p.totalExams, 0);
    const enabledCount = modifiedPartners.filter((p) => p.enablementCompliant).length;
    const bizCount = modifiedPartners.filter((p) => p.businessCompliant).length;
    const overallCount = modifiedPartners.filter((p) => p.overallCompliant).length;
    const avgScore = total > 0 ? Math.round(modifiedPartners.reduce((s, p) => s + p.enablementScore, 0) / total) : 0;

    return { total, tierCounts, totalGaps, totalExams, enabledCount, bizCount, overallCount, avgScore };
  }, [modifiedPartners]);

  // Category gaps
  const categoryGaps = useMemo(() => {
    return [
      {
        label: "Sales Pro",
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.salesPro.obtained >= p.requirements.salesPro.required).length,
      },
      {
        label: "Tech Pro",
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.techPro.obtained >= p.requirements.techPro.required).length,
      },
      {
        label: "Bootcamp",
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.bootcamp.obtained >= p.requirements.bootcamp.required).length,
      },
      {
        label: "Impl Specialist",
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.implSpec.obtained >= p.requirements.implSpec.required).length,
      },
    ];
  }, [modifiedPartners]);

  // Override audit log
  const auditLog = useMemo(() => {
    return overrides
      .map((o) => {
        const partner = modifiedPartners.find((p) => p.id === o.partnerId);
        return { ...o, partnerName: partner?.name || `Partner #${o.partnerId}` };
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [overrides, modifiedPartners]);

  // Modification audit log
  const modificationLog = useMemo(() => {
    return allModificationHistory
      .map((mod) => {
        const partner = modifiedPartners.find((p) => p.id === mod.partnerId);
        return { ...mod, partnerName: partner?.name || `Partner #${mod.partnerId}` };
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  }, [allModificationHistory, modifiedPartners]);

  // Export CSV
  const exportCSV = (type: string) => {
    setExporting(type);
    let csv = "";
    let filename = "";

    if (type === "partners") {
      csv = "Partner,Program Tier,Enablement Score,Total Gaps,Enablement Compliant,Business Compliant,Overall Compliant,Sales Pro (Obt/Req),Tech Pro (Obt/Req),Bootcamp (Obt/Req),Impl Spec (Obt/Req),Bookings USD,Unique Customers,PDS,Exams Passed,Action,Contact Emails,Modified\n";
      modifiedPartners.forEach((p) => {
        const def = TIER_DEFINITIONS[p.programTier];
        const isModified = modifications.some((m) => m.partnerId === p.id) ? "Yes" : "No";
        const bk = p.businessMetrics.bookingsUSD !== null ? `$${p.businessMetrics.bookingsUSD}` : "N/A";
        const uc = p.businessMetrics.uniqueCustomers !== null ? p.businessMetrics.uniqueCustomers : "N/A";
        const pds = p.businessMetrics.partnerDeliveredServices !== null ? p.businessMetrics.partnerDeliveredServices : "N/A";
        csv += `"${p.name}","${def.label}",${p.enablementScore}%,${p.totalGaps},${p.enablementCompliant ? "Yes" : "No"},${p.businessCompliant ? "Yes" : "No"},${p.overallCompliant ? "Yes" : "No"},${p.requirements.salesPro.obtained}/${p.requirements.salesPro.required},${p.requirements.techPro.obtained}/${p.requirements.techPro.required},${p.requirements.bootcamp.obtained}/${p.requirements.bootcamp.required},${p.requirements.implSpec.obtained}/${p.requirements.implSpec.required},${bk},${uc},${pds},${p.totalExams},"${generateRecommendedAction(p)}","${p.targetEmails.join("; ")}","${isModified}"\n`;
      });
      filename = "fy27-partner-compliance-report.csv";
    } else if (type === "gaps") {
      csv = "Partner,Program Tier,Sales Pro Gap,Tech Pro Gap,Bootcamp Gap,Impl Spec Gap,Total Gaps,Modified\n";
      [...modifiedPartners]
        .sort((a, b) => b.totalGaps - a.totalGaps)
        .forEach((p) => {
          const def = TIER_DEFINITIONS[p.programTier];
          const isModified = modifications.some((m) => m.partnerId === p.id) ? "Yes" : "No";
          csv += `"${p.name}","${def.label}",${Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained)},${Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained)},${Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained)},${Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained)},${p.totalGaps},"${isModified}"\n`;
        });
      filename = "fy27-gap-analysis-report.csv";
    } else if (type === "certs") {
      csv = "Partner,Program Tier,Email,Certification\n";
      modifiedPartners.forEach((p) => {
        const def = TIER_DEFINITIONS[p.programTier];
        p.exams.forEach((e) => {
          e.certifications.forEach((cert) => {
            csv += `"${p.name}","${def.label}","${e.email}","${cert}"\n`;
          });
        });
      });
      filename = "fy27-certification-records.csv";
    } else if (type === "overrides") {
      csv = "Partner,Category,Comment,Completed By,Completed At\n";
      auditLog.forEach((o) => {
        csv += `"${o.partnerName}","${o.category}","${o.comment || ""}","${o.completedBy}","${o.completedAt}"\n`;
      });
      filename = "fy27-override-audit-log.csv";
    } else if (type === "modifications") {
      csv = "Partner,Sales Pro (New),Tech Pro (New),Bootcamp (New),Impl Spec (New),Comment,Modified By,Modified At\n";
      modificationLog.forEach((m) => {
        csv += `"${m.partnerName}",${m.salesPro},${m.techPro},${m.bootcamp},${m.implSpec},"${m.comment}","${m.modifiedBy}","${m.modifiedAt}"\n`;
      });
      filename = "fy27-modification-audit-log.csv";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setExporting(null);
      toast.success(`Exported ${filename}`, { description: "CSV file downloaded successfully." });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="w-5 h-5" style={{ color: "var(--color-pure-orange)" }} />
            Partner Certification Compliance
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Executive summary, gap analysis, and enablement plan exports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("compliance")}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === "compliance" ? "border-pure-orange text-pure-orange" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Compliance Overview
        </button>
        <button
          onClick={() => setActiveTab("roadmap")}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === "roadmap" ? "border-pure-orange text-pure-orange" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Enablement Roadmap
        </button>
      </div>

      {activeTab === "roadmap" && (
        <GlobalRoadmapView />
      )}

      {activeTab === "compliance" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="terrain-card p-6"
            style={{ borderLeft: "3px solid var(--color-pure-orange)" }}
          >
            <h3 className="text-[15px] font-bold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" style={{ color: "var(--color-pure-orange)" }} />
              Executive Summary — FY27 Global Reseller Program Compliance
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Partners", value: summary.total, icon: Users, color: "var(--color-pure-orange)" },
                { label: "Avg Enablement", value: `${summary.avgScore}%`, icon: TrendingUp, color: "var(--color-basil-green)" },
                { label: "Enablement OK", value: summary.enabledCount, icon: CheckCircle2, color: "var(--color-pure-orange)" },
                { label: "Overall Compliant", value: summary.overallCount, icon: Shield, color: "var(--color-pure-orange)" },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}08` }}>
                  <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Tier Distribution */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Program Tier Distribution
              </p>
              <div className="flex items-center gap-1 h-6 rounded-full overflow-hidden mb-2">
                {PROGRAM_TIERS.map((tier, i) => {
                  const count = summary.tierCounts[tier];
                  const def = TIER_DEFINITIONS[tier];
                  if (count === 0) return null;
                  return (
                    <div
                      key={tier}
                      className={`h-full flex items-center justify-center text-[9px] font-bold text-white ${i === 0 ? "rounded-l-full" : ""} ${i === PROGRAM_TIERS.length - 1 ? "rounded-r-full" : ""}`}
                      style={{
                        width: `${(count / summary.total) * 100}%`,
                        background: def.color,
                        minWidth: 40,
                      }}
                    >
                      {count}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-[10px] flex-wrap">
                {PROGRAM_TIERS.map((tier) => {
                  const def = TIER_DEFINITIONS[tier];
                  return (
                    <span key={tier} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: def.color }} />
                      {def.label} ({summary.tierCounts[tier]})
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Business vs Enablement Compliance */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Compliance Dimensions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Enablement Compliant", value: summary.enabledCount, total: summary.total, color: "var(--color-pure-orange)", icon: Award },
                  { label: "Business Compliant", value: summary.bizCount, total: summary.total, color: "var(--color-basil-green)", icon: DollarSign },
                  { label: "Overall Compliant", value: summary.overallCount, total: summary.total, color: "var(--color-pure-orange)", icon: Shield },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 rounded-xl" style={{ background: "color-mix(in srgb, var(--color-cloud-white) 60%, transparent)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                      <span className="text-[11px] font-semibold text-foreground">{dim.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-stone-gray)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(dim.value / dim.total) * 100}%`, background: dim.color }}
                        />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: dim.color }}>
                        {dim.value}/{dim.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Compliance */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Enablement Category Status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryGaps.map((cat) => (
                  <div
                    key={cat.label}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "color-mix(in srgb, var(--color-cloud-white) 60%, transparent)" }}
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {cat.met}/{summary.total} partners compliant · {cat.totalGap} total gaps
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-[14px] font-bold"
                        style={{
                          color: cat.met === summary.total
                            ? "var(--color-pure-orange)"
                            : cat.met > summary.total / 2
                            ? "var(--color-moss-green)"
                            : "var(--color-cinnamon-brown)",
                        }}
                      >
                        {summary.total > 0 ? Math.round((cat.met / summary.total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="terrain-card p-5"
          >
            <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
              <Download className="w-4 h-4" style={{ color: "var(--color-pure-orange)" }} />
              Data Exports
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">
              Download compliance data as CSV files for offline analysis and reporting
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: "partners", label: "Partner Compliance", description: "Full partner data with tier, enablement scores, business metrics, and contact info", icon: Users, color: "var(--color-pure-orange)" },
                { id: "gaps", label: "Gap Analysis", description: "Detailed gap breakdown by category for all partners", icon: AlertTriangle, color: "var(--color-cinnamon-brown)" },
                { id: "certs", label: "Certification Records", description: "All exam records with partner, email, and certification name", icon: Award, color: "var(--color-basil-green)" },
                { id: "overrides", label: "Override Audit Log", description: `${overrides.length} manual overrides with comments and timestamps`, icon: CheckCircle2, color: "var(--color-moss-green)" },
                { id: "modifications", label: "Modification Log", description: `${modificationLog.length} admin gap modifications with justifications`, icon: Pencil, color: "var(--color-ash-gray)" },
              ].map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => exportCSV(exp.id)}
                  disabled={exporting !== null}
                  className="text-left p-4 rounded-xl border transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                  style={{ background: "color-mix(in srgb, var(--color-cloud-white) 95%, transparent)", borderColor: "var(--color-stone-gray)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <exp.icon className="w-4 h-4" style={{ color: exp.color }} />
                    <span className="text-[12px] font-bold text-foreground">{exp.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{exp.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] font-medium" style={{ color: exp.color }}>
                    <Download className="w-3 h-3" />
                    {exporting === exp.id ? "Exporting..." : "Download CSV"}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Partner Compliance Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
              <div>
                <h3 className="text-[15px] font-bold text-foreground">Partner Compliance Detail</h3>
                <p className="text-[11px] text-muted-foreground">Detailed gap analysis per partner</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white/50 border border-border rounded-xl text-xs w-64 focus:ring-2 focus:ring-pure-orange/20"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white/50 border border-border rounded-xl p-1">
                  {(["all", "authorized", "preferred", "elite", "ambassador"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setComplianceFilter(tier)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        complianceFilter === tier ? "bg-pure-orange text-white shadow-sm" : "text-muted-foreground hover:bg-black/5"
                      }`}
                    >
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <PartnerTable
              partners={modifiedPartners}
              activeFilter={complianceFilter}
              onFilterChange={setComplianceFilter}
              searchQuery={searchQuery}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
