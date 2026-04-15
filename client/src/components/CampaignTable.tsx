/*
 * Partner Tier Compliance Table — "Soft Terrain" design
 * FY27 Global Reseller Program — 4-tier architecture
 * Shows obtained vs required for each enablement category
 * Sortable columns, expandable detail rows with exams
 * Gap override: mark individual gaps as manually complete with comments
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Partner,
  type ComplianceFilter,
  type ProgramTier,
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  formatCurrency,
  formatPercent,
  getRevenueAttainment,
  generateRecommendedAction,
} from "@/lib/data";
import { trainingData, type TrainingPerson } from "@/lib/trainingData";
import { activityData } from "@/lib/activityData";
import { aspData, type AspPerson } from "@/lib/aspData";
import { useOverrides, type GapCategory, type GapOverride } from "@/contexts/OverrideContext";
import { useModifications } from "@/contexts/ModificationContext";
import ExportButton from "./ExportButton";
import EnablementTimeline from "./EnablementTimeline";
import {
  ArrowUpDown,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  Award,
  Minus,
  ChevronDown,
  ChevronUp,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Undo2,
  MessageSquare,
  Send,
  Clock,
  DollarSign,
  Users,
  GraduationCap,
  Wrench,
  BadgeCheck,
  CircleAlert,
  FileDown,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SortKey = "name" | "totalGaps" | "enablementScore" | "totalExams";

interface PartnerTableProps {
  partners: Partner[];
  activeFilter: string;
  onFilterChange: (filter: ComplianceFilter) => void;
  searchQuery: string;
  onNavigateToActivity?: (partner: string, course?: string, search?: string) => void;
}

const tierIconMap: Record<ProgramTier, React.ElementType> = {
  ambassador: Crown,
  elite: Shield,
  preferred: Star,
  authorized: Award,
};

const categoryLabels: Record<GapCategory, string> = {
  salesPro: "Sales Pro",
  techPro: "Tech Pro",
  bootcamp: "Bootcamp",
  implSpec: "Impl Spec",
  simplyPure: "Simply Pure",
  aspFoundations: "ASP Fnd",
  aspStoragePro: "ASP Storage",
  aspSupportSpec: "ASP Support",
};

/** Progress bar with override toggle for a single requirement category */
function RequirementBarWithOverride({
  label,
  category,
  obtained,
  required,
  partnerId,
  partnerName,
  manualEmails,
  onNavigateToActivity,
}: {
  label: string;
  category: GapCategory;
  obtained: number;
  required: number;
  partnerId: number;
  partnerName: string;
  manualEmails?: string[];
  onNavigateToActivity?: (partner: string, course?: string, search?: string) => void;
}) {
  const { getOverride, addOverride, removeOverride } = useOverrides();
  const { getModification, addModification } = useModifications();
  const override = getOverride(partnerId, category);
  const gap = Math.max(0, required - obtained);
  const pct = required > 0 ? Math.min(100, Math.round((obtained / required) * 100)) : (obtained > 0 || !!override ? 100 : 0);
  const isComplete = (required > 0 ? (obtained >= required || !!override) : (obtained > 0 || !!override));

  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [showPeople, setShowPeople] = useState(false);
  
  // Handle ASP and other training categories
  const getTrainingPeople = () => {
    const dedupe = (list: any[]) => {
      const seen = new Set();
      return list.filter(p => {
        if (seen.has(p.email)) return false;
        seen.add(p.email);
        return true;
      });
    };

    const manualPeople = (manualEmails || []).map(email => ({
      email,
      firstName: email.split('@')[0],
      lastName: '(Nominated)',
      isNominated: true
    }));

    let sources: any[] = [];

    if (category === 'aspFoundations') {
      sources = [...(trainingData[partnerId]?.aspFoundationsFA ?? []), ...(trainingData[partnerId]?.aspFoundationsFB ?? [])];
    } else if (category === 'aspStoragePro') {
      sources = [...(trainingData[partnerId]?.aspStorageProFA ?? []), ...(trainingData[partnerId]?.aspStorageProFB ?? [])];
    } else if (category === 'aspSupportSpec') {
      sources = [...(trainingData[partnerId]?.supportSpecFB ?? [])];
    } else {
      sources = (trainingData[partnerId] as any)?.[category] ?? [];
    }

    // FALLBACK logic: if no specific trainingData, try parsing activityData
    if (sources.length === 0 && activityData[partnerName]) {
      const rawActivity = activityData[partnerName];
      const categoryKeywords: Record<string, string[]> = {
        salesPro: ['Sales', 'Positioning', 'Business'],
        techPro: ['Technical', 'Architect', 'Solution', 'Pre-Sales', 'Modernization'],
        bootcamp: ['Bootcamp'],
        implSpec: ['Implementation'],
        simplyPure: ['Simply Pure'],
        aspFoundations: ['Foundations', 'ASP'],
        aspStoragePro: ['Storage Pro'],
        aspSupportSpec: ['FlashBlade Support Specialist cert', 'FlashBlade Support Specialist Certification']
      };
      const keywords = categoryKeywords[category] || [];
      sources = rawActivity
        .filter(a => {
          if (keywords.length === 0) return true;
          const matchesKw = keywords.some(k => a.activity.toLowerCase().includes(k.toLowerCase()));
          if (category === 'aspSupportSpec') {
            const raw = a.activity.toLowerCase();
            return matchesKw && !raw.includes('prep') && !raw.includes('introduction') && !raw.includes('next steps');
          }
          return matchesKw;
        })
        .map(a => ({
          email: a.email,
          firstName: a.name.split(' ')[0],
          lastName: a.name.split(' ').slice(1).join(' '),
        }));
    }
    
    let people = [...manualPeople, ...sources];
    
    // Bootcamp: ONLY count post-cutoff dates. Undated records from activityData are excluded.
      if (category === 'bootcamp') {
        const BOOTCAMP_CUTOFF = '2026-02-02';
        people = people.filter((p: any) => p.isNominated || (!!p.date && p.date.substring(0, 10) >= BOOTCAMP_CUTOFF));
      }
    
    return dedupe(people);
  };
  
  const trainingPeople: TrainingPerson[] = getTrainingPeople();

  const handleMarkComplete = () => {
    const mod = getModification(partnerId) || { partnerId, addedEmails: {}, removedEmails: {}, salesPro: 0, techPro: 0, bootcamp: 0, implSpec: 0, simplyPure: 0, aspFoundations: 0, aspStoragePro: 0, aspSupportSpec: 0, comment: "", modifiedBy: "Admin", bookingsUSD: null, uniqueCustomers: null, partnerDeliveredServices: null };
    
    // Map base ASP categories to their FB/FA counterparts for manual entry
    let targetKey = category as string;
    if (category === 'aspFoundations') targetKey = 'aspFoundationsFA';
    else if (category === 'aspStoragePro') targetKey = 'storageProFA';
    else if (category === 'aspSupportSpec') targetKey = 'supportSpecFB';

    // Create a readable nominated name
    const timestamp = Date.now().toString().slice(-4);
    const placeholderEmail = `manual.${category}.${timestamp}@partner-nominated.com`;
    
    const existingAdded = mod.addedEmails[targetKey] || [];
    
    addModification({
      ...mod,
      addedEmails: {
        ...mod.addedEmails,
        [targetKey]: [...existingAdded, placeholderEmail]
      },
      comment: comment.trim() || `Incremental completion of ${label} requirement`,
      modifiedBy: "Admin"
    });

    setShowComment(false);
    setComment("");
    toast.success(`One ${label} requirement added`);
  };

  const handleUndo = () => {
    // If it's a binary override, remove it
    if (override) {
      removeOverride(partnerId, category);
      toast.info(`${label} override removed`);
    } else {
      let targetKey = category as string;
      if (category === 'aspFoundations') targetKey = 'aspFoundationsFA';
      else if (category === 'aspStoragePro') targetKey = 'storageProFA';
      else if (category === 'aspSupportSpec') targetKey = 'supportSpecFB';

      const mod = getModification(partnerId);
      if (mod && mod.addedEmails[targetKey] && mod.addedEmails[targetKey].length > 0) {
        const newList = [...mod.addedEmails[targetKey]];
        newList.pop();
        addModification({
          ...mod,
          addedEmails: { ...mod.addedEmails, [targetKey]: newList },
          comment: "Removed last manual requirement"
        });
        toast.info(`Last ${label} manual completion removed`);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {obtained}/{required}
          </span>
          {gap > 0 && !override && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--color-cinnamon-brown) 10%, transparent)",
                color: "var(--color-cinnamon-brown)",
              }}
            >
              {gap} gap{gap !== 1 ? "s" : ""}
            </span>
          )}
          {override && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              style={{
                background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)",
                color: "var(--color-pure-orange)",
              }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              Overridden
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: "var(--color-stone-gray)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${override ? 100 : pct}%`,
              background: isComplete
                ? "var(--color-pure-orange)"
                : pct >= 50
                ? "var(--color-moss-green)"
                : "var(--color-cinnamon-brown)",
            }}
          />
        </div>
        
        {/* Toggle certified people */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowPeople((p) => !p); }}
          className="text-[9px] font-medium px-2 py-1 rounded-lg transition-all hover:bg-black/10 active:scale-95 shrink-0"
          style={{
            background: showPeople ? "color-mix(in srgb, var(--color-basil-green) 16%, transparent)" : "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
            color: "var(--color-basil-green)",
          }}
          title={`View ${label} certified individuals`}
        >
          {showPeople ? "Hide" : "Who?"}
        </button>
        {/* Override / Undo buttons */}
        {gap > 0 && !override && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComment(!showComment);
            }}
            className="text-[9px] font-medium px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: "color-mix(in srgb, var(--color-pure-orange) 8%, transparent)",
              color: "var(--color-pure-orange)",
            }}
            title="Mark as complete"
          >
            <CheckCircle2 className="w-3 h-3" />
          </button>
        )}
        {override && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUndo();
            }}
            className="text-[9px] font-medium px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
              color: "var(--color-cinnamon-brown)",
            }}
            title="Undo override"
          >
            <Undo2 className="w-3 h-3" />
          </button>
        )}
        {!override && (() => {
          let tKey = category as string;
          if (category === 'aspFoundations') tKey = 'aspFoundationsFA';
          else if (category === 'aspStoragePro') tKey = 'storageProFA';
          else if (category === 'aspSupportSpec') tKey = 'supportSpecFB';
          const m = getModification(partnerId);
          return m && m.addedEmails?.[tKey] && m.addedEmails[tKey].length > 0;
        })() && (
           <button
            onClick={(e) => {
              e.stopPropagation();
              handleUndo();
            }}
            className="text-[9px] font-medium px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
              color: "var(--color-cinnamon-brown)",
            }}
            title="Undo last manual addition"
          >
            <Undo2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Certified individuals panel */}
      <AnimatePresence>
        {showPeople && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div
              className="rounded-lg px-3 py-2.5 border shadow-sm"
              style={{ background: "#ffffff", borderColor: "var(--color-stone-gray)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-basil-green)" }}>
                {label} — Completed ({trainingPeople.length})
              </p>
              <div className="space-y-4">
                  {(category === 'aspFoundations' || category === 'aspStoragePro' || category === 'aspSupportSpec') ? (
                    <>
                      {/* FA Section */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> FlashArray
                        </p>
                        <div className="space-y-1 pl-1">
                          <InlineEmailManager partnerId={partnerId} categoryKey={category === 'aspFoundations' ? 'aspFoundationsFA' : category === 'aspStoragePro' ? 'storageProFA' : 'supportSpecFA'} autoList={(() => {
                            const td = trainingData[partnerId];
                            if (!td) return [];
                            return category === 'aspFoundations' ? td.aspFoundationsFA : category === 'aspStoragePro' ? td.storageProFA : td.supportSpecFA;
                          })() || []} />
                        </div>
                      </div>

                      {/* FB Section */}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> FlashBlade
                        </p>
                        <div className="space-y-1 pl-1">
                          <InlineEmailManager partnerId={partnerId} categoryKey={category === 'aspFoundations' ? 'aspFoundationsFB' : category === 'aspStoragePro' ? 'storageProFB' : 'supportSpecFB'} autoList={(() => {
                            const td = trainingData[partnerId];
                            if (!td) return [];
                            return category === 'aspFoundations' ? td.aspFoundationsFB : category === 'aspStoragePro' ? td.storageProFB : td.supportSpecFB;
                          })() || []} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <InlineEmailManager 
                        partnerId={partnerId} 
                        categoryKey={category} 
                        autoList={trainingPeople.filter((p: any) => !p.isNominated)} 
                      />
                    </div>
                  )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input for override */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div
              className="flex items-center gap-2 p-2 rounded-lg border"
              style={{
                background: "var(--color-cloud-white)",
                borderColor: "var(--color-stone-gray)",
              }}
            >
              <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Justification (optional)..."
                className="flex-1 text-[11px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMarkComplete();
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkComplete();
                }}
                className="p-1 rounded-md transition-colors"
                style={{
                  background: "color-mix(in srgb, var(--color-pure-orange) 12%, transparent)",
                  color: "var(--color-pure-orange)",
                }}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            {override && override.comment && (
              <div className="mt-1 flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  Overridden {new Date(override.completedAt).toLocaleDateString()} — {override.comment}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show existing override comment */}
      {override && override.comment && !showComment && (
        <div className="mt-1 flex items-start gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3 mt-0.5 shrink-0" />
          <span>
            Overridden {new Date(override.completedAt).toLocaleDateString()} — {override.comment}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── ASP Eligibility Panel ───────────────────────────────────────────────────

const ASP_ORANGE = "#e8571a"; // Pure Storage brand orange

interface AspStepProps {
  step: number;
  label: string;
  sublabel: string;
  required: number;
  people: AspPerson[];
}

function AspStep({ step, label, sublabel, required, people }: AspStepProps) {
  const [open, setOpen] = useState(false);
  const met = people.length >= required;
  return (
    <div className="flex-1 min-w-0">
      {/* Step pill */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2"
          style={met
            ? { background: ASP_ORANGE, borderColor: ASP_ORANGE, color: "#fff" }
            : { background: "#fff", borderColor: "#d1d5db", color: "#6b7280" }}
        >
          {met ? "✓" : step}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold leading-tight text-foreground truncate">{label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{sublabel}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-black/[0.06] mb-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (people.length / required) * 100)}%`,
            background: met ? ASP_ORANGE : "#d1d5db",
          }}
        />
      </div>
      <p className="text-[10px] font-semibold mb-2" style={{ color: met ? ASP_ORANGE : "#6b7280" }}>
        {people.length}/{required} individuals
      </p>

      {/* Who? popover */}
      {people.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="text-[10px] font-medium underline underline-offset-2 transition-colors"
            style={{ color: ASP_ORANGE }}
          >
            {open ? "Hide" : "Who?"}
          </button>
          {open && (
            <div
              className="absolute z-30 left-0 top-6 w-64 rounded-xl shadow-xl border p-3 space-y-1.5"
              style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
            >
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: ASP_ORANGE }}>
                {label.toUpperCase()} — {people.length} INDIVIDUAL{people.length !== 1 ? "S" : ""}
              </p>
              {people.map(p => (
                <div key={p.email} className="flex items-center gap-1.5 text-[11px]">
                  <GraduationCap className="w-3 h-3 shrink-0" style={{ color: ASP_ORANGE }} />
                  <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                  <span className="text-slate-500 truncate text-[10px]">{p.email}</span>
                </div>
              ))}
              {people.length < required && (
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-black/10">
                  Need {required - people.length} more to qualify.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AspEligibilityPanel({ partnerId }: { partnerId: number }) {
  const asp = aspData[partnerId];
  const { getAspOverride, setAspOverride, removeAspOverride } = useOverrides();
  const aspOverride = getAspOverride(partnerId);
  const isManuallyApproved = !!aspOverride;
  const isEligible = asp?.eligible || isManuallyApproved;

  const [noteInput, setNoteInput] = useState("");
  const [showNoteField, setShowNoteField] = useState(false);

  // No ASP data at all for this partner
  const hasAnyData = asp && (
    asp.foundations.length > 0 || asp.storageProCert.length > 0 || asp.supportSpecCert.length > 0
  );

  const handleToggleOverride = () => {
    if (isManuallyApproved) {
      removeAspOverride(partnerId);
      toast.success("ASP manual approval removed");
      setShowNoteField(false);
      setNoteInput("");
    } else {
      if (!showNoteField) {
        setShowNoteField(true);
      } else {
        setAspOverride(partnerId, noteInput.trim());
        toast.success("Partner marked as ASP — approval saved");
        setShowNoteField(false);
        setNoteInput("");
      }
    }
  };

  return (
    <div
      className="rounded-xl border-2 p-4"
      style={{
        borderColor: isEligible ? ASP_ORANGE : "#e5e7eb",
        background: isEligible ? `${ASP_ORANGE}08` : "var(--color-cloud-white)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${ASP_ORANGE}18` }}
          >
            <Wrench className="w-4 h-4" style={{ color: ASP_ORANGE }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">ASP Eligibility</p>
            <p className="text-[10px] text-muted-foreground">Authorized Support Partner — requires ≥2 individuals per step</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEligible ? (
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${ASP_ORANGE}18`, color: ASP_ORANGE }}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              {isManuallyApproved ? "APPROVED (Manual)" : "ELIGIBLE"}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-black/[0.05] text-muted-foreground">
              <CircleAlert className="w-3.5 h-3.5" />
              NOT YET
            </span>
          )}
          {/* Manual override toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleOverride(); }}
            title={isManuallyApproved ? "Remove manual ASP approval" : "Manually approve as ASP"}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all"
            style={{
              background: isManuallyApproved ? "#fef2f2" : "var(--color-cloud-white)",
              borderColor: isManuallyApproved ? "#fca5a5" : "#e5e7eb",
              color: isManuallyApproved ? "#dc2626" : "var(--color-walnut-brown)",
            }}
          >
            {isManuallyApproved
              ? <><ToggleRight className="w-3.5 h-3.5" /> Remove Override</>
              : <><ToggleLeft className="w-3.5 h-3.5" /> Mark as ASP</>}
          </button>
        </div>
      </div>

      {/* Note input when approving */}
      {showNoteField && !isManuallyApproved && (
        <div
          className="mb-4 p-3 rounded-lg border flex gap-2"
          style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            placeholder="Optional note (reason for approval)…"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleToggleOverride(); if (e.key === "Escape") setShowNoteField(false); }}
            className="flex-1 bg-transparent outline-none text-[12px] text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleToggleOverride}
            className="text-[11px] font-bold px-3 py-1 rounded-lg text-white"
            style={{ background: ASP_ORANGE }}
          >
            Confirm
          </button>
          <button
            onClick={() => setShowNoteField(false)}
            className="text-[11px] px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Manual approval note display */}
      {isManuallyApproved && aspOverride.note && (
        <div
          className="mb-4 p-2.5 rounded-lg text-[11px]"
          style={{ background: `${ASP_ORANGE}10`, color: "var(--color-cinnamon-brown)" }}
        >
          <span className="font-bold">Approval note:</span> {aspOverride.note}
          <span className="ml-2 text-muted-foreground">
            · {new Date(aspOverride.approvedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Process steps — horizontal timeline */}
      <div className="flex items-stretch gap-3 relative">
        {/* Connecting line */}
        <div
          className="absolute top-3 left-4 right-4 h-px"
          style={{ background: "#e5e7eb", zIndex: 0 }}
        />
        <AspStep
          step={1}
          label="ASP Foundations"
          sublabel="FlashArray / FlashBlade Foundations Training & Assessment"
          required={2}
          people={asp?.foundations ?? []}
        />
        <div className="w-px self-stretch" style={{ background: "#e5e7eb" }} />
        <AspStep
          step={2}
          label="Storage Pro Cert"
          sublabel="FlashArray / FlashBlade Storage Professional Certification"
          required={2}
          people={asp?.storageProCert ?? []}
        />
        <div className="w-px self-stretch" style={{ background: "#e5e7eb" }} />
        <AspStep
          step="3"
          label="Support Specialist"
          sublabel="FlashBlade Support Specialist cert or certification"
          required={2}
          people={asp?.supportSpecCert ?? []}
        />
      </div>

      {/* Gap summary when not eligible */}
      {!isEligible && (
        <div className="mt-3 pt-3 border-t border-black/[0.06]">
          {!hasAnyData ? (
            <p className="text-[11px] text-muted-foreground italic">
              No ASP training or certification activity recorded for this partner yet.
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Gaps: </span>
              {[
                asp && asp.foundations.length < 2 && `Foundations (${asp.foundations.length}/2)`,
                asp && asp.storageProCert.length < 2 && `Storage Pro Cert (${asp.storageProCert.length}/2)`,
                asp && asp.supportSpecCert.length < 2 && `Support Spec Cert (${asp.supportSpecCert.length}/2)`,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Expanded detail row for a partner */
function ExpandedRow({ partner, onNavigateToActivity }: { partner: Partner, onNavigateToActivity?: (partner: string, course?: string, search?: string) => void }) {
  const { getPartnerOverrides, getAspOverride } = useOverrides();
  const partnerOverrides = getPartnerOverrides(partner.id);
  const aspOverride = getAspOverride(partner.id);
  const reqs = partner.requirements;

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <td colSpan={9} className="px-0 py-0">
        <div
          className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{
            background: "color-mix(in srgb, var(--color-cloud-white) 90%, var(--color-stone-gray))",
            borderTop: "1px solid var(--color-stone-gray)",
          }}
        >
          {/* Enablement Requirements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Enablement Requirements ({TIER_DEFINITIONS[partner.programTier].label})
              </p>
              {partnerOverrides.length > 0 && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)",
                    color: "var(--color-pure-orange)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {partnerOverrides.length} override{partnerOverrides.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <RequirementBarWithOverride
                label="Sales Pro"
                category="salesPro"
                obtained={reqs.salesPro.obtained}
                required={reqs.salesPro.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.salesPro.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Tech Pro"
                category="techPro"
                obtained={reqs.techPro.obtained}
                required={reqs.techPro.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.techPro.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Bootcamp"
                category="bootcamp"
                obtained={reqs.bootcamp.obtained}
                required={reqs.bootcamp.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.bootcamp.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Impl Spec"
                category="implSpec"
                obtained={reqs.implSpec.obtained}
                required={reqs.implSpec.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.implSpec.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Simply Pure"
                category="simplyPure"
                obtained={reqs.simplyPure.obtained}
                required={reqs.simplyPure.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.simplyPure.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="ASP Foundations"
                category="aspFoundations"
                obtained={reqs.aspFoundations.totalObtained}
                required={reqs.aspFoundations.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.aspFoundations.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="ASP Storage Pro"
                category="aspStoragePro"
                obtained={reqs.aspStoragePro.totalObtained}
                required={reqs.aspStoragePro.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.aspStoragePro.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="ASP Support Spec"
                category="aspSupportSpec"
                obtained={reqs.aspSupportSpec.totalObtained}
                required={reqs.aspSupportSpec.required}
                partnerId={partner.id}
                partnerName={partner.name}
                manualEmails={reqs.aspSupportSpec.manualEmails}
                onNavigateToActivity={onNavigateToActivity}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Overall:</span>
              <span
                className="text-[12px] font-bold"
                style={{
                  color: partner.enablementScore >= 80
                    ? "var(--color-pure-orange)"
                    : partner.enablementScore >= 40
                    ? "var(--color-moss-green)"
                    : "var(--color-cinnamon-brown)",
                }}
              >
                {partner.enablementScore}% compliant
              </span>
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Recommended Action
            </p>
            <p className="text-[13px] text-foreground leading-relaxed mb-3">{generateRecommendedAction(partner)}</p>

            {/* Target Contacts */}
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Target Contacts
            </p>
            <div className="flex flex-wrap gap-2">
              {partner.targetEmails.length > 0 ? (
                partner.targetEmails.map((email) => (
                  <span
                    key={email}
                    className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)",
                      color: "var(--color-basil-green)",
                    }}
                  >
                    {email}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic">
                  No contacts available
                </span>
              )}
            </div>
          </div>

          {/* FY27 Revenue & Business Performance */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              FY27 Revenue & Business
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "FY27 Revenue", value: formatCurrency(partner.revenueData.revenueFY27, true) },
                { label: "FY27 Target", value: formatCurrency(partner.revenueData.targetFY27, true) },
                { label: "Attainment", value: (() => { const a = getRevenueAttainment(partner); return a !== null ? `${a}%` : "\u2014"; })() },
                { label: "Pipeline", value: formatCurrency(partner.revenueData.pipelineFY27, true) },
                { label: "Contribution", value: formatPercent(partner.revenueData.contributionFY27) },
                { label: "DR (P-S)", value: formatCurrency(partner.revenueData.drFY27, true) },
                { label: "FY26 Rev", value: formatCurrency(partner.revenueData.revenueFY26, true) },
                { label: "FY25 Rev", value: formatCurrency(partner.revenueData.revenueFY25, true) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg px-3 py-2 border"
                  style={{ background: "var(--color-cloud-white)", borderColor: "var(--color-stone-gray)" }}
                >
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="text-[13px] font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 12-Month Strategic Roadmap ───────────────────────── */}
          <div className="md:col-span-2 pt-4 border-t border-slate-200">
            <EnablementTimeline partner={partner} />
          </div>

          {/* ── ASP Eligibility Panel ──────────────────────────────── */}
          <div className="md:col-span-2">
            <AspEligibilityPanel partnerId={partner.id} />
          </div>

          {/* ── Export Enablement Plan ──────────────────────────────── */}
          <div className="md:col-span-2 flex justify-end pt-1">
            <ExportButton partner={partner} />
          </div>

          {/* Exam/Certification Records */}
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Certifications Earned ({partner.totalExams})
            </p>
            {partner.exams.length > 0 ? (
              <div className="space-y-2.5">
                {partner.exams.map((exam) => (
                  <div
                    key={exam.email}
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      background: "var(--color-cloud-white)",
                      borderColor: "var(--color-stone-gray)",
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                      style={{ color: "var(--color-basil-green)" }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {exam.email}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.certifications.map((cert) => (
                        <span
                          key={`${exam.email}-${cert}`}
                          className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--color-moss-green) 10%, transparent)",
                            color: "var(--color-moss-green)",
                          }}
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl px-4 py-3 text-[12px] text-muted-foreground italic"
                style={{ background: "var(--color-stone-gray)" }}
              >
                No certifications recorded yet. Encourage SEs to pursue FlashArray/FlashBlade exams.
              </div>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
}


export default function PartnerTable({ partners, activeFilter, onFilterChange, searchQuery, onNavigateToActivity }: PartnerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalGaps");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { getOverrideCount, isAspEligible } = useOverrides();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...partners].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const filterButtons: { key: ComplianceFilter; label: string }[] = [
    { key: "all", label: "All" },
    ...PROGRAM_TIERS.map((tier) => ({
      key: tier as ComplianceFilter,
      label: TIER_DEFINITIONS[tier].shortLabel,
    })),
  ];

  const SortHeader = ({
    label,
    sortKeyName,
    align = "left",
  }: {
    label: string;
    sortKeyName: SortKey;
    align?: "left" | "right";
  }) => (
    <th
      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`w-3 h-3 ${sortKey === sortKeyName ? "opacity-100" : "opacity-30"}`}
        />
      </span>
    </th>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="terrain-card overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-foreground">Partner Certification Compliance & Enablement Plans</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {partners.length} partner{partners.length !== 1 ? "s" : ""}
              {searchQuery ? ` matching "${searchQuery}"` : ""} — expand rows to export & sign enablement documentation
            </p>
          </div>

          {/* Filter pill buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            {filterButtons.map((btn) => {
              const isActive = activeFilter === btn.key;
              const tierStyle = btn.key !== "all" ? TIER_DEFINITIONS[btn.key as ProgramTier] : null;

              return (
                <button
                  key={btn.key}
                  onClick={() => onFilterChange(btn.key)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive
                      ? tierStyle ? tierStyle.bg : "color-mix(in srgb, var(--color-ash-gray) 10%, transparent)"
                      : "transparent",
                    color: isActive
                      ? tierStyle ? tierStyle.color : "var(--color-ash-gray)"
                      : "var(--color-walnut-brown)",
                    border: isActive ? "1px solid currentColor" : "1px solid transparent",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--color-cloud-white)" }}>
              <th className="px-4 py-3 w-8" />
              <SortHeader label="Partner" sortKeyName="name" />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Tier
              </th>
              <SortHeader label="Score" sortKeyName="enablementScore" align="right" />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Obtained / Required
              </th>
              <SortHeader label="Gaps" sortKeyName="totalGaps" align="right" />
              <SortHeader label="Exams" sortKeyName="totalExams" align="right" />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "#e8571a" }}>
                ASP
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                FY27 Revenue
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((partner, i) => {
                const tierDef = TIER_DEFINITIONS[partner.programTier];
                const TierIcon = tierIconMap[partner.programTier];
                const isExpanded = expandedId === partner.id;
                const overrideCount = getOverrideCount(partner.id);
                const totalRequired =
                  partner.requirements.salesPro.required +
                  partner.requirements.techPro.required +
                  partner.requirements.bootcamp.required +
                  partner.requirements.implSpec.required;
                const totalObtained =
                  Math.min(partner.requirements.salesPro.obtained, partner.requirements.salesPro.required) +
                  Math.min(partner.requirements.techPro.obtained, partner.requirements.techPro.required) +
                  Math.min(partner.requirements.bootcamp.obtained, partner.requirements.bootcamp.required) +
                  Math.min(partner.requirements.implSpec.obtained, partner.requirements.implSpec.required);

                return (
                  <React.Fragment key={partner.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i + 0.5, duration: 0.3 }}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                      style={
                        i % 2 === 0
                          ? { background: "var(--color-cloud-white)" }
                          : { background: "var(--color-stone-gray)" }
                      }
                      onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                    >
                      <td className="px-4 py-3.5 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">
                            {partner.name}
                          </span>
                          {overrideCount > 0 && (
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)",
                                color: "var(--color-pure-orange)",
                              }}
                              title={`${overrideCount} manual override${overrideCount !== 1 ? "s" : ""}`}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {overrideCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: tierDef.bg, color: tierDef.color }}
                        >
                          <TierIcon className="w-3 h-3" />
                          {tierDef.shortLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="text-[13px] font-bold"
                          style={{
                            color:
                              partner.enablementScore >= 80
                                ? "var(--color-pure-orange)"
                                : partner.enablementScore >= 40
                                ? "var(--color-moss-green)"
                                : "var(--color-cinnamon-brown)",
                          }}
                        >
                          {partner.enablementScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-stone-gray)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${partner.enablementScore}%`,
                                background:
                                  partner.enablementScore >= 80
                                    ? "var(--color-pure-orange)"
                                    : partner.enablementScore >= 40
                                    ? "var(--color-moss-green)"
                                    : "var(--color-cinnamon-brown)",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {totalObtained}/{totalRequired}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="text-[13px] font-bold"
                          style={{
                            color:
                              partner.totalGaps === 0
                                ? "var(--color-pure-orange)"
                                : partner.totalGaps <= 3
                                ? "var(--color-walnut-brown)"
                                : "var(--color-cinnamon-brown)",
                          }}
                        >
                          {partner.totalGaps}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {partner.totalExams > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "color-mix(in srgb, var(--color-moss-green) 12%, transparent)",
                              color: "var(--color-moss-green)",
                            }}
                          >
                            <Award className="w-3 h-3" />
                            {partner.totalExams}
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isAspEligible(partner.id, !!aspData[partner.id]?.eligible) ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#e8571a18", color: "#e8571a" }}
                            title={aspData[partner.id]?.eligible ? "Auto-eligible" : "Manually approved"}
                          >
                            <BadgeCheck className="w-3 h-3" />
                            ASP{!aspData[partner.id]?.eligible ? " ★" : ""}
                          </span>
                        ) : aspData[partner.id] && (aspData[partner.id].foundations.length > 0 || aspData[partner.id].storageProCert.length > 0 || aspData[partner.id].supportSpecCert.length > 0) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-muted-foreground">
                            <Wrench className="w-3 h-3" />
                            Prog.
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[12px] font-semibold text-foreground">
                          {formatCurrency(partner.revenueData.revenueFY27, true)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          className="p-1 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                    {isExpanded && <ExpandedRow key={`exp-${partner.id}`} partner={partner} onNavigateToActivity={onNavigateToActivity} />}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground text-[13px]">
                  {searchQuery
                    ? `No partners matching "${searchQuery}" found.`
                    : "No partners match the current filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function InlineEmailManager({ partnerId, categoryKey, autoList }: { partnerId: number, categoryKey: string, autoList: any[] }) {
  const { getModification, addModification } = useModifications();
  const mod = getModification(partnerId) || { partnerId, addedEmails: {}, removedEmails: {} };
  
  const [newEmail, setNewEmail] = useState("");

  const added = mod.addedEmails?.[categoryKey] || [];
  const removed = mod.removedEmails?.[categoryKey] || [];

  const handleAdd = () => {
    if (newEmail && newEmail.includes("@") && !added.includes(newEmail)) {
      addModification({
        ...mod,
        addedEmails: { ...mod.addedEmails, [categoryKey]: [...added, newEmail.toLowerCase()] }
      });
      setNewEmail("");
    }
  };

  const handleRemove = (email: string, isAuto: boolean) => {
    if (isAuto) {
      if (!removed.includes(email)) {
        addModification({
          ...mod,
          removedEmails: { ...mod.removedEmails, [categoryKey]: [...removed, email] }
        });
      }
    } else {
      addModification({
        ...mod,
        addedEmails: { ...mod.addedEmails, [categoryKey]: added.filter(e => e !== email) }
      });
    }
  };

  const combinedList = [
    // Auto List omitting removed
    ...autoList.filter(p => !removed.includes(p.email)).map(p => ({ ...p, isNominated: false })),
    // Manual List
    ...added.map(email => ({
      email,
      firstName: email.split('@')[0],
      lastName: '(Nominated)',
      isNominated: true
    }))
  ];

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {combinedList.map((person) => (
          <div key={person.email} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3 h-3 shrink-0" style={{ color: person.isNominated ? "var(--color-pure-orange)" : "var(--color-moss-green)" }} />
              <span className="text-[11px] font-bold text-slate-900">
                {person.firstName} {person.lastName}
              </span>
              <span className="text-[10px] text-muted-foreground">{person.email}</span>
            </div>
            <div className="flex items-center gap-2">
              {person.isNominated && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FF702315] text-[#FF7023]">
                  Nominated
                </span>
              )}
              <button 
                onClick={() => handleRemove(person.email, !person.isNominated)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                title="Remove person"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {combinedList.length === 0 && (
          <p className="text-[10px] text-slate-400 italic">No people listed</p>
        )}
      </div>
      <div className="flex gap-1 mt-2">
        <input 
          placeholder="Add email..." 
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-2 py-1 text-[11px] rounded border border-slate-200 focus:outline-none focus:border-pure-orange min-w-0"
        />
        <button 
          onClick={handleAdd}
          disabled={!newEmail.includes("@")}
          className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-pure-orange hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
