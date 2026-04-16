/**
 * EnablementPlansPage.tsx
 * Dedicated page showing each partner's enablement gap plan as small cards.
 * Extracted from the Overview tab.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, ChevronRight, Download, DownloadCloud,
  CheckCircle2, AlertTriangle, Clock, Target, BarChart3,
  Calendar, Users
} from "lucide-react";
import { useModifications } from "@/contexts/ModificationContext";
import { partners, TIER_DEFINITIONS, type ProgramTier } from "@/lib/data";
import { exportPartnerPptx, exportAllPartnersPptx } from "@/lib/pptxExport";
import { toast } from "sonner";

type FilterMode = "all" | "has_gaps" | "has_plan" | "no_plan" | "compliant";

const TIER_COLOR: Record<string, string> = {
  Elite:   "var(--color-pure-orange)",
  Premier: "var(--color-basil-green)",
  Select:  "var(--color-quartz-pink)",
  Partner: "var(--color-ash-gray)",
};

export default function EnablementPlansPage() {
  const { modifiedPartners, partnerTimelines } = useModifications();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [exportingAll, setExportingAll] = useState(false);

  const filtered = useMemo(() => {
    let list = modifiedPartners;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q));
    }
    switch (filter) {
      case "has_gaps":   return list.filter(p => p.totalGaps > 0);
      case "has_plan":   return list.filter(p => (partnerTimelines[p.id]?.length ?? 0) > 0);
      case "no_plan":    return list.filter(p => (partnerTimelines[p.id]?.length ?? 0) === 0 && p.totalGaps > 0);
      case "compliant":  return list.filter(p => p.overallCompliant);
      default:           return list;
    }
  }, [modifiedPartners, partnerTimelines, filter, search]);

  const handleExportOne = async (partnerId: number) => {
    const partner = modifiedPartners.find(p => p.id === partnerId);
    if (!partner) return;
    setExportingId(partnerId);
    try {
      await exportPartnerPptx(partner as any, partnerTimelines[partnerId] ?? []);
      toast.success(`${partner.name} deck exported!`);
    } catch (e) {
      console.error(e);
      toast.error("Export failed — see console for details");
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      await exportAllPartnersPptx(
        modifiedPartners as any[],
        partnerTimelines
      );
      toast.success("All partners deck exported!");
    } catch (e) {
      console.error(e);
      toast.error("Export failed — see console for details");
    } finally {
      setExportingAll(false);
    }
  };

  const filters: { id: FilterMode; label: string }[] = [
    { id: "all",       label: `All (${modifiedPartners.length})` },
    { id: "has_gaps",  label: `Has Gaps (${modifiedPartners.filter(p => p.totalGaps > 0).length})` },
    { id: "has_plan",  label: `Has Plan (${modifiedPartners.filter(p => (partnerTimelines[p.id]?.length ?? 0) > 0).length})` },
    { id: "no_plan",   label: `Needs Plan (${modifiedPartners.filter(p => (partnerTimelines[p.id]?.length ?? 0) === 0 && p.totalGaps > 0).length})` },
    { id: "compliant", label: `Compliant (${modifiedPartners.filter(p => p.overallCompliant).length})` },
  ];

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <ClipboardList className="w-7 h-7" style={{ color: "var(--color-pure-orange)" }} />
              Partner Enablement Plans
            </h1>
            <p className="text-[14px] text-slate-500 mt-1">
              Individual gap allocation and 12-month roadmap planning per partner.
            </p>
          </div>
          <button
            onClick={handleExportAll}
            disabled={exportingAll}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-60"
          >
            <DownloadCloud className="w-4 h-4" />
            {exportingAll ? "Generating…" : "Export All (PPTX)"}
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
          <div className="flex-1 min-w-0 relative mr-2">
            <input
              type="text"
              placeholder="Search partner name or domain…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-pure-orange)] transition-colors"
            />
          </div>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                filter === f.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Partner cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(partner => {
              const timeline = partnerTimelines[partner.id] ?? [];
              const isExpanded = expandedId === partner.id;
              const tierColor = TIER_COLOR[partner.programTier] || "var(--color-ash-gray)";
              const req = partner.requirements;

              const gapRows = [
                { label: "Sales Pro",  gap: Math.max(0, req.salesPro.required - req.salesPro.obtained) },
                { label: "Tech Pro",   gap: Math.max(0, req.techPro.required - req.techPro.obtained) },
                { label: "Bootcamp",   gap: Math.max(0, req.bootcamp.required - req.bootcamp.obtained) },
                { label: "Impl Spec",  gap: Math.max(0, req.implSpec.required - req.implSpec.obtained) },
                { label: "Simply Pure",gap: Math.max(0, req.simplyPure.required - req.simplyPure.obtained) },
              ].filter(r => r.gap > 0);

              return (
                <motion.div
                  key={partner.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                >
                  {/* Card header */}
                  <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-black text-slate-900 truncate">{partner.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{partner.domain}</p>
                      </div>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1"
                        style={{ background: `color-mix(in srgb, ${tierColor} 12%, transparent)`, color: tierColor }}
                      >
                        {partner.programTier}
                      </span>
                    </div>

                    {/* KPI chips */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <BarChart3 className="w-3 h-3" style={{ color: "var(--color-pure-orange)" }} />
                        <span className="text-[11px] font-bold text-slate-700">{partner.enablementScore}%</span>
                      </div>
                      <div className={`flex items-center gap-1 rounded-lg px-2 py-1 ${partner.totalGaps > 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                        {partner.totalGaps > 0
                          ? <AlertTriangle className="w-3 h-3 text-red-500" />
                          : <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        <span className={`text-[11px] font-bold ${partner.totalGaps > 0 ? "text-red-600" : "text-green-600"}`}>
                          {partner.totalGaps > 0 ? `${partner.totalGaps} gap${partner.totalGaps !== 1 ? "s" : ""}` : "No Gaps"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span className="text-[11px] font-bold text-slate-700">{timeline.length} plan item{timeline.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                    className="flex items-center justify-between px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{isExpanded ? "Hide details" : "View plan & gaps"}</span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="px-4 py-3 space-y-4">
                          {/* Gaps */}
                          {gapRows.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Open Gaps</p>
                              <div className="space-y-1.5">
                                {gapRows.map(g => (
                                  <div key={g.label} className="flex items-center justify-between">
                                    <span className="text-[12px] text-slate-600">{g.label}</span>
                                    <span className="text-[11px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                      -{g.gap}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timeline items */}
                          {timeline.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Plan Items</p>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {timeline.map(item => (
                                  <div key={item.id} className="flex items-start gap-2 text-[11px]">
                                    <Clock className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                                    <div>
                                      <span className="font-bold text-slate-700">{item.label}</span>
                                      {item.month && <span className="text-slate-400 ml-1">· {item.month}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {gapRows.length === 0 && timeline.length === 0 && (
                            <p className="text-[12px] text-slate-400 italic text-center py-2">
                              No gaps or plan items — partner is on track.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer: export button */}
                  <div className="px-4 pb-4 pt-2 mt-auto border-t border-slate-100">
                    <button
                      onClick={() => handleExportOne(partner.id)}
                      disabled={exportingId === partner.id}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-[var(--color-pure-orange)] hover:text-white border border-slate-200 text-slate-700 text-[12px] font-bold px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {exportingId === partner.id ? "Generating PPTX…" : "Export PPTX"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-medium">No partners match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
