/*
 * Reports Page — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Executive summary, override audit log, modification audit log, and data export functionality
 * Uses modifiedPartners so admin edits propagate here
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TIER_CONFIG, ELITE_ZONE_B } from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import {
  FileBarChart,
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
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { overrides } = useOverrides();
  const { modifiedPartners, modifications, allModificationHistory } = useModifications();
  const [exporting, setExporting] = useState<string | null>(null);

  // Executive Summary Data — uses modifiedPartners
  const summary = useMemo(() => {
    const total = modifiedPartners.length;
    const tier1 = modifiedPartners.filter((p) => p.tier === "tier1").length;
    const tier2 = modifiedPartners.filter((p) => p.tier === "tier2").length;
    const tier3 = modifiedPartners.filter((p) => p.tier === "tier3").length;
    const totalGaps = modifiedPartners.reduce((s, p) => s + p.totalGaps, 0);
    const totalExams = modifiedPartners.reduce((s, p) => s + p.totalExams, 0);
    const totalRequired = total * ELITE_ZONE_B.total;
    const totalObtained = modifiedPartners.reduce(
      (s, p) =>
        s +
        Math.min(p.requirements.salesPro.obtained, p.requirements.salesPro.required) +
        Math.min(p.requirements.techPro.obtained, p.requirements.techPro.required) +
        Math.min(p.requirements.bootcamp.obtained, p.requirements.bootcamp.required) +
        Math.min(p.requirements.implSpec.obtained, p.requirements.implSpec.required),
      0
    );
    const avgScore = total > 0 ? Math.round(modifiedPartners.reduce((s, p) => s + p.enablementScore, 0) / total) : 0;

    return { total, tier1, tier2, tier3, totalGaps, totalExams, totalRequired, totalObtained, avgScore };
  }, [modifiedPartners]);

  // Category gaps — uses modifiedPartners
  const categoryGaps = useMemo(() => {
    return [
      {
        label: "Sales Pro",
        required: ELITE_ZONE_B.salesPro,
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.salesPro.obtained >= p.requirements.salesPro.required).length,
      },
      {
        label: "Tech Pro",
        required: ELITE_ZONE_B.techPro,
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.techPro.obtained >= p.requirements.techPro.required).length,
      },
      {
        label: "Bootcamp",
        required: ELITE_ZONE_B.bootcamp,
        totalGap: modifiedPartners.reduce((s, p) => s + Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained), 0),
        met: modifiedPartners.filter((p) => p.requirements.bootcamp.obtained >= p.requirements.bootcamp.required).length,
      },
      {
        label: "Impl Specialist",
        required: ELITE_ZONE_B.implSpec,
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
        return {
          ...o,
          partnerName: partner?.name || `Partner #${o.partnerId}`,
        };
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [overrides, modifiedPartners]);

  // Modification audit log — uses allModificationHistory for full chronological record
  const modificationLog = useMemo(() => {
    return allModificationHistory
      .map((mod) => {
        const partner = modifiedPartners.find((p) => p.id === mod.partnerId);
        return {
          ...mod,
          partnerName: partner?.name || `Partner #${mod.partnerId}`,
        };
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  }, [allModificationHistory, modifiedPartners]);

  // Export CSV — uses modifiedPartners
  const exportCSV = (type: string) => {
    setExporting(type);
    let csv = "";
    let filename = "";

    if (type === "partners") {
      csv = "Partner,Tier,Enablement Score,Total Gaps,Sales Pro (Obtained/Required),Tech Pro (Obtained/Required),Bootcamp (Obtained/Required),Impl Spec (Obtained/Required),Exams Passed,Action,Contact Emails,Modified\n";
      modifiedPartners.forEach((p) => {
        const isModified = modifications.some((m) => m.partnerId === p.id) ? "Yes" : "No";
        csv += `"${p.name}","${p.tierLabel}",${p.enablementScore}%,${p.totalGaps},${p.requirements.salesPro.obtained}/${p.requirements.salesPro.required},${p.requirements.techPro.obtained}/${p.requirements.techPro.required},${p.requirements.bootcamp.obtained}/${p.requirements.bootcamp.required},${p.requirements.implSpec.obtained}/${p.requirements.implSpec.required},${p.totalExams},"${p.action}","${p.targetEmails.join("; ")}","${isModified}"\n`;
      });
      filename = "fy27-partner-compliance-report.csv";
    } else if (type === "gaps") {
      csv = "Partner,Tier,Sales Pro Gap,Tech Pro Gap,Bootcamp Gap,Impl Spec Gap,Total Gaps,Modified\n";
      [...modifiedPartners]
        .sort((a, b) => b.totalGaps - a.totalGaps)
        .forEach((p) => {
          const isModified = modifications.some((m) => m.partnerId === p.id) ? "Yes" : "No";
          csv += `"${p.name}","${p.tierLabel}",${Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained)},${Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained)},${Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained)},${Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained)},${p.totalGaps},"${isModified}"\n`;
        });
      filename = "fy27-gap-analysis-report.csv";
    } else if (type === "certs") {
      csv = "Partner,Email,Certification\n";
      modifiedPartners.forEach((p) => {
        p.exams.forEach((e) => {
          e.certifications.forEach((cert) => {
            csv += `"${p.name}","${e.email}","${cert}"\n`;
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
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileBarChart className="w-5 h-5" style={{ color: "oklch(0.50 0.12 175)" }} />
          Reports
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Executive summary, data exports, and audit logs
        </p>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="terrain-card p-6"
        style={{ borderLeft: "3px solid oklch(0.60 0.12 175)" }}
      >
        <h3 className="text-[15px] font-bold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
          Executive Summary — FY27 Elite Zone B Compliance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Partners", value: summary.total, icon: Users, color: "oklch(0.50 0.12 175)" },
            { label: "Avg Enablement", value: `${summary.avgScore}%`, icon: TrendingUp, color: "oklch(0.58 0.16 290)" },
            { label: "Total Gaps", value: summary.totalGaps, icon: Target, color: "oklch(0.62 0.19 15)" },
            { label: "Exams Passed", value: summary.totalExams, icon: Award, color: "oklch(0.75 0.14 75)" },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: `${item.color}08` }}>
              <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tier Breakdown */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Tier Distribution
          </p>
          <div className="flex items-center gap-2 h-6 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-l-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                width: `${(summary.tier1 / summary.total) * 100}%`,
                background: TIER_CONFIG.tier1.color,
                minWidth: summary.tier1 > 0 ? 40 : 0,
              }}
            >
              {summary.tier1}
            </div>
            <div
              className="h-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                width: `${(summary.tier2 / summary.total) * 100}%`,
                background: TIER_CONFIG.tier2.color,
                minWidth: summary.tier2 > 0 ? 40 : 0,
              }}
            >
              {summary.tier2}
            </div>
            <div
              className="h-full rounded-r-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                width: `${(summary.tier3 / summary.total) * 100}%`,
                background: TIER_CONFIG.tier3.color,
                minWidth: summary.tier3 > 0 ? 40 : 0,
              }}
            >
              {summary.tier3}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: TIER_CONFIG.tier1.color }} />
              Top Performers ({summary.tier1})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: TIER_CONFIG.tier2.color }} />
              Mid-Tier ({summary.tier2})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: TIER_CONFIG.tier3.color }} />
              Falling Behind ({summary.tier3})
            </span>
          </div>
        </div>

        {/* Category Compliance */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Requirement Category Status
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryGaps.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "oklch(0.97 0.005 85 / 0.6)" }}
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
                        ? "oklch(0.45 0.12 175)"
                        : cat.met > summary.total / 2
                        ? "oklch(0.58 0.14 75)"
                        : "oklch(0.50 0.19 15)",
                    }}
                  >
                    {Math.round((cat.met / summary.total) * 100)}%
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
          <Download className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
          Data Exports
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Download compliance data as CSV files for offline analysis and reporting
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: "partners",
              label: "Partner Compliance",
              description: "Full partner data with enablement scores, gaps, and contact info",
              icon: Users,
              color: "oklch(0.50 0.12 175)",
            },
            {
              id: "gaps",
              label: "Gap Analysis",
              description: "Detailed gap breakdown by category for all partners",
              icon: AlertTriangle,
              color: "oklch(0.62 0.19 15)",
            },
            {
              id: "certs",
              label: "Certification Records",
              description: "All exam records with partner, email, and certification name",
              icon: Award,
              color: "oklch(0.58 0.16 290)",
            },
            {
              id: "overrides",
              label: "Override Audit Log",
              description: `${overrides.length} manual overrides with comments and timestamps`,
              icon: CheckCircle2,
              color: "oklch(0.75 0.14 75)",
            },
            {
              id: "modifications",
              label: "Modification Log",
              description: `${modificationLog.length} admin gap modifications with justifications`,
              icon: Pencil,
              color: "oklch(0.55 0.14 250)",
            },
          ].map((exp) => (
            <button
              key={exp.id}
              onClick={() => exportCSV(exp.id)}
              disabled={exporting !== null}
              className="text-left p-4 rounded-xl border transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "oklch(0.99 0.003 85 / 0.95)",
                borderColor: "oklch(0.92 0.01 85)",
              }}
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

      {/* Modification Audit Log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <Pencil className="w-4 h-4" style={{ color: "oklch(0.55 0.14 250)" }} />
          Modification Audit Log
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Admin gap modifications made via the Modify button on the Partners tab
        </p>

        {modificationLog.length === 0 ? (
          <div className="py-8 text-center">
            <Pencil className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-[12px] text-muted-foreground">No modifications recorded yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Use the Modify button on the Partners tab to update gap counts with justification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Partner</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "oklch(0.60 0.12 175)" }}>Sales Pro</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "oklch(0.58 0.16 290)" }}>Tech Pro</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "oklch(0.75 0.14 75)" }}>Bootcamp</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "oklch(0.62 0.19 15)" }}>Impl Spec</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Justification</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">By</th>
                </tr>
              </thead>
              <tbody>
                {modificationLog.map((entry) => (
                  <tr key={entry.partnerId} className="border-b border-border/20 hover:bg-black/[0.02] transition-colors">
                    <td className="py-2 px-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.modifiedAt).toLocaleDateString("en-ZA", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-medium text-foreground">{entry.partnerName}</td>
                    <td className="py-2 px-3 text-center font-bold">{entry.salesPro}</td>
                    <td className="py-2 px-3 text-center font-bold">{entry.techPro}</td>
                    <td className="py-2 px-3 text-center font-bold">{entry.bootcamp}</td>
                    <td className="py-2 px-3 text-center font-bold">{entry.implSpec}</td>
                    <td className="py-2 px-3 text-foreground max-w-[250px] truncate">{entry.comment}</td>
                    <td className="py-2 px-3 text-muted-foreground">{entry.modifiedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Override Audit Log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "oklch(0.58 0.16 290)" }} />
          Override Audit Log
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Chronological record of all manual gap overrides from the Overview tab
        </p>

        {auditLog.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-[12px] text-muted-foreground">No overrides recorded yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Overrides can be added from the Overview page by expanding a partner row.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Partner</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Comment</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">By</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry, i) => (
                  <tr key={`${entry.partnerId}-${entry.category}-${i}`} className="border-b border-border/20 hover:bg-black/[0.02] transition-colors">
                    <td className="py-2 px-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.completedAt).toLocaleDateString("en-ZA", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-medium text-foreground">{entry.partnerName}</td>
                    <td className="py-2 px-3">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "oklch(0.60 0.12 175 / 0.10)", color: "oklch(0.45 0.12 175)" }}
                      >
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-foreground max-w-[300px] truncate">
                      {entry.comment || <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{entry.completedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Print Note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-[11px] text-muted-foreground"
        style={{ background: "oklch(0.97 0.005 85 / 0.6)", border: "1px solid oklch(0.92 0.01 85)" }}
      >
        <Printer className="w-3.5 h-3.5 shrink-0" />
        <span>
          For a printable report, use your browser's print function (Ctrl+P / Cmd+P) on any page.
          CSV exports include all data fields for import into Excel, Google Sheets, or BI tools.
        </span>
      </motion.div>
    </div>
  );
}
