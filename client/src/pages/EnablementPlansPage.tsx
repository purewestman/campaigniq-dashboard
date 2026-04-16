/**
 * EnablementPlansPage.tsx
 * Dedicated page: partner cards + compact 12-Month roadmap per partner.
 * Each card has a plan-level assignee picker (domain-filtered, manual entry allowed).
 */

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, ChevronRight, Download, DownloadCloud,
  CheckCircle2, AlertTriangle, Target, BarChart3,
  Calendar, UserPlus, X, Users, PenTool,
} from "lucide-react";
import { useModifications } from "@/contexts/ModificationContext";
import { type TimelineItem, partners, isLinkedDomain } from "@/lib/data";
import { trainingData } from "@/lib/trainingData";
import { exportPartnerPptx, exportAllPartnersPptx } from "@/lib/pptxExport";
import EnablementTimeline from "@/components/EnablementTimeline";
import { toast } from "sonner";
import type { Partner } from "@/lib/data";

type FilterMode = "all" | "has_gaps" | "has_plan" | "no_plan" | "compliant";

const TIER_COLOR: Record<string, string> = {
  Elite:   "var(--color-pure-orange)",
  Premier: "var(--color-basil-green)",
  Select:  "var(--color-quartz-pink)",
  Partner: "var(--color-ash-gray)",
};

// ── Per-card assignee picker ──────────────────────────────────────────────────
function AssigneePicker({
  partnerId,
  domain,
}: {
  partnerId: number;
  domain: string;
}) {
  const { getModification, addModification } = useModifications();
  const inputRef = useRef<HTMLInputElement>(null);

  // Store plan-level assignees under addedEmails.plan
  const mod = getModification(partnerId);
  const assignees: string[] = (mod?.addedEmails as any)?.plan ?? [];

  const domainEmails = useMemo(() => {
    return Array.from(new Set(
      Object.values(trainingData).flatMap(ptd =>
        Object.values(ptd as any).flatMap((arr: any) => (arr as any[]).map((p: any) => p.email))
      )
    )).filter(e => isLinkedDomain(domain, e.split('@')[1]));
  }, [domain]);

  const datalistId = `plan-emails-${partnerId}`;

  const addAssignee = (email: string) => {
    const val = email.trim();
    if (!val || !val.includes("@")) return;
    const emailDomain = val.split('@')[1];
    if (!isLinkedDomain(domain, emailDomain)) {
      toast.error(`Only compliant domains can be added.`);
      return;
    }
    if (assignees.includes(val)) return; // dedupe
    const newList = [...assignees, val];
    addModification({
      ...(mod || {
        partnerId,
        salesPro: 0, techPro: 0, bootcamp: 0, implSpec: 0, simplyPure: 0,
        aspFoundations: 0, aspStoragePro: 0, aspSupportSpec: 0,
        bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null,
        addedEmails: {}, removedEmails: {},
        comment: "", modifiedBy: "Enablement Plan",
      }),
      addedEmails: { ...(mod?.addedEmails ?? {}), plan: newList },
      comment: `Assigned ${val} to plan`,
      modifiedBy: "Enablement Plan",
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAssignee = (email: string) => {
    const newList = assignees.filter(e => e !== email);
    addModification({
      ...(mod!),
      addedEmails: { ...(mod?.addedEmails ?? {}), plan: newList },
      comment: `Removed ${email} from plan`,
      modifiedBy: "Enablement Plan",
    });
  };

  return (
    <div className="px-4 pb-3 pt-2 border-t border-slate-100">
      <datalist id={datalistId}>
        {domainEmails.map(e => <option key={e} value={e} />)}
      </datalist>

      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
        <Users className="w-3 h-3" /> Plan Assignees
      </p>

      {/* Existing assignee pills */}
      {assignees.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {assignees.map(em => (
            <span
              key={em}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-100"
            >
              {em.split("@")[0]}
              <button
                type="button"
                onClick={() => removeAssignee(em)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input row: dropdown + add button */}
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          list={datalistId}
          placeholder={`name@${domain}`}
          className="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--color-pure-orange)] transition-colors placeholder:text-slate-300"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addAssignee((e.target as HTMLInputElement).value);
            }
          }}
          onChange={(e) => {
            // Auto-add when user picks from datalist (exact match)
            const val = e.target.value.trim();
            if (domainEmails.includes(val)) {
              addAssignee(val);
            }
          }}
        />
        <button
          type="button"
          onClick={() => addAssignee(inputRef.current?.value ?? "")}
          className="shrink-0 flex items-center gap-1 bg-slate-900 hover:bg-[var(--color-pure-orange)] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
          title="Add assignee"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
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

  const [signModal, setSignModal] = useState<{ type: 'none' | 'one' | 'all', partnerId?: number }>({ type: 'none' });
  const [signData, setSignData] = useState({ name: '', date: new Date().toISOString().split('T')[0] });

  const handleExportOneClick = (partnerId: number) => {
    setSignModal({ type: 'one', partnerId });
  };

  const handleExportAllClick = () => {
    setSignModal({ type: 'all' });
  };

  const executeExport = async () => {
    if (!signData.name) {
      toast.error("Authorized Signatory Name is required");
      return;
    }
    const signatureInfo = { name: signData.name, date: signData.date };

    if (signModal.type === 'one' && signModal.partnerId) {
      const partner = modifiedPartners.find(p => p.id === signModal.partnerId);
      if (!partner) return;
      
      setSignModal({ type: 'none' });
      setExportingId(signModal.partnerId);
      try {
        await exportPartnerPptx(partner as any, partnerTimelines[signModal.partnerId] ?? [], signatureInfo);
        toast.success(`${partner.name} deck exported!`);
      } catch (e) {
        console.error(e);
        toast.error("Export failed — see console for details");
      } finally {
        setExportingId(null);
      }
    } else if (signModal.type === 'all') {
      setSignModal({ type: 'none' });
      setExportingAll(true);
      try {
        await exportAllPartnersPptx(modifiedPartners as any[], partnerTimelines, signatureInfo);
        toast.success("All partners deck exported!");
      } catch (e) {
        console.error(e);
        toast.error("Export failed — see console for details");
      } finally {
        setExportingAll(false);
      }
    }
  };

  const counts = {
    all:       modifiedPartners.length,
    has_gaps:  modifiedPartners.filter(p => p.totalGaps > 0).length,
    has_plan:  modifiedPartners.filter(p => (partnerTimelines[p.id]?.length ?? 0) > 0).length,
    no_plan:   modifiedPartners.filter(p => (partnerTimelines[p.id]?.length ?? 0) === 0 && p.totalGaps > 0).length,
    compliant: modifiedPartners.filter(p => p.overallCompliant).length,
  };

  const filterBtns: { id: FilterMode; label: string }[] = [
    { id: "all",       label: `All (${counts.all})` },
    { id: "has_gaps",  label: `Has Gaps (${counts.has_gaps})` },
    { id: "has_plan",  label: `Has Plan (${counts.has_plan})` },
    { id: "no_plan",   label: `Needs Plan (${counts.no_plan})` },
    { id: "compliant", label: `Compliant (${counts.compliant})` },
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
              Gap allocation, 12-month roadmap, plan assignees and PPTX export — per partner.
            </p>
          </div>
          <button
            onClick={handleExportAllClick}
            disabled={exportingAll || signModal.type !== 'none'}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-60"
          >
            <DownloadCloud className="w-4 h-4" />
            {exportingAll ? "Generating…" : "Export All (PPTX)"}
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
          <input
            type="text"
            placeholder="Search partner name or domain…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-pure-orange)] transition-colors"
          />
          {filterBtns.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                filter === f.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Partner cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(partner => {
              const timeline = partnerTimelines[partner.id] ?? [];
              const isExpanded = expandedId === partner.id;
              const tierColor = TIER_COLOR[partner.programTier] || "var(--color-ash-gray)";
              const req = partner.requirements;

              const gapRows = [
                { label: "Sales Pro",   gap: Math.max(0, req.salesPro.required  - req.salesPro.obtained) },
                { label: "Tech Pro",    gap: Math.max(0, req.techPro.required   - req.techPro.obtained) },
                { label: "Bootcamp",    gap: Math.max(0, req.bootcamp.required  - req.bootcamp.obtained) },
                { label: "Impl Spec",   gap: Math.max(0, req.implSpec.required  - req.implSpec.obtained) },
                { label: "Simply Pure", gap: Math.max(0, req.simplyPure.required - req.simplyPure.obtained) },
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
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-black text-slate-900 truncate">{partner.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{partner.domain}</p>
                      </div>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
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
                        <span className="text-[11px] font-bold text-slate-700">
                          {timeline.length} plan item{timeline.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Gap pills — always visible */}
                    {gapRows.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {gapRows.map(g => (
                          <span key={g.label} className="text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                            -{g.gap} {g.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Roadmap toggle ─────────────────────────────────── */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                    className="tour-expand-card flex items-center justify-between px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-[var(--color-pure-orange)] hover:bg-orange-50/50 transition-colors border-t border-slate-100 w-full"
                  >
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      12-Month Enablement Roadmap
                    </span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Roadmap — compact */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        {/* Plan-level assignees sit inside the roadmap section */}
                        <div className="border-b border-slate-100">
                          <AssigneePicker partnerId={partner.id} domain={partner.domain} />
                        </div>
                        <div className="px-3 py-3 bg-slate-50/60 text-[11px] scale-[0.94] origin-top-left w-[106%]">
                          <EnablementTimeline partner={partner as Partner} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer — export */}
                  <div className="px-4 pb-4 pt-2 mt-auto border-t border-slate-100">
                    <button
                      onClick={() => handleExportOneClick(partner.id)}
                      disabled={exportingId === partner.id || signModal.type !== 'none'}
                      className="tour-step-5 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-[var(--color-pure-orange)] hover:text-white border border-slate-200 text-slate-700 text-[12px] font-bold px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-60"
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

      {/* Signature Modal Overlay */}
      {signModal.type !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-pure-orange" />
                  Sign & Commit
                </h3>
                <p className="text-[13px] text-slate-500 mt-1 font-medium">
                  Electronically sign and seal this document before exporting.
                </p>
              </div>
              <button 
                onClick={() => setSignModal({ type: 'none' })}
                className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-slate-50">
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={signData.name}
                    onChange={(e) => setSignData(prev => ({...prev, name: e.target.value}))}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-[14px] font-bold text-slate-900 focus:outline-none focus:border-pure-orange transition-all"
                  />
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Commitment Date</label>
                  <input
                    type="date"
                    value={signData.date}
                    onChange={(e) => setSignData(prev => ({...prev, date: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-[14px] font-bold text-slate-900 focus:outline-none focus:border-pure-orange transition-all"
                  />
               </div>
            </div>

            <div className="p-5 bg-white flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100">
              <button
                onClick={() => setSignModal({ type: 'none' })}
                className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeExport}
                disabled={!signData.name}
                className="px-6 py-2.5 bg-pure-orange text-white rounded-xl shadow-md font-bold text-[13px] hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Confirm & Export PPTX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
