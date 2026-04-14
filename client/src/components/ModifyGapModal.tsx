/*
 * Modify Gap Modal — PEI Dashboard
 * "Soft Terrain" design
 * Admin modal to update partner enablement gaps, business metrics, and tier assignment.
 * Supports 4-tier architecture: Authorized → Preferred → Elite (Zone B) → Ambassador
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModifications } from "@/contexts/ModificationContext";
import {
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  computeEnablementScore,
  computeEnablementGaps,
  isEnablementCompliant,
  isBusinessCompliant,
  type Partner,
  type ProgramTier,
} from "@/lib/data";
import {
  X,
  Pencil,
  Save,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  History,
  Undo2,
  Shield,
  DollarSign,
  Users,
  Wrench,
  Trash2,
  Plus,
} from "lucide-react";
import { trainingData } from "@/lib/trainingData";

interface ModifyGapModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModifyGapModal({ partner, isOpen, onClose }: ModifyGapModalProps) {
  const { addModification, removeModification, getModification, getModificationHistory } = useModifications();

  const existingMod = getModification(partner.id);
  const modHistory = getModificationHistory(partner.id);

  const [values, setValues] = useState({
    salesPro: partner.requirements.salesPro.obtained,
    techPro: partner.requirements.techPro.obtained,
    bootcamp: partner.requirements.bootcamp.obtained,
    implSpec: partner.requirements.implSpec.obtained,
    simplyPure: partner.requirements.simplyPure.obtained,
    aspFoundations: partner.requirements.aspFoundations.totalObtained,
    aspFoundationsFA: partner.requirements.aspFoundations.obtainedFA,
    aspFoundationsFB: partner.requirements.aspFoundations.obtainedFB,
    aspStoragePro: partner.requirements.aspStoragePro.totalObtained,
    aspStorageProFA: partner.requirements.aspStoragePro.obtainedFA,
    aspStorageProFB: partner.requirements.aspStoragePro.obtainedFB,
    aspSupportSpec: partner.requirements.aspSupportSpec.totalObtained,
    aspSupportSpecFA: partner.requirements.aspSupportSpec.obtainedFA,
    aspSupportSpecFB: partner.requirements.aspSupportSpec.obtainedFB,
  });

  const [addedEmails, setAddedEmails] = useState<Record<string, string[]>>({});
  const [removedEmails, setRemovedEmails] = useState<Record<string, string[]>>({});

  const [nomineeInput, setNomineeInput] = useState<Record<string, string>>({
    salesPro: "",
    techPro: "",
    bootcamp: "",
    implSpec: "",
    simplyPure: "",
    aspFoundations: "",
    aspFoundationsFA: "",
    aspFoundationsFB: "",
    aspStoragePro: "",
    aspStorageProFA: "",
    aspStorageProFB: "",
    aspSupportSpec: "",
    aspSupportSpecFA: "",
    aspSupportSpecFB: "",
  });

  // Business metrics state
  const [bookingsUSD, setBookingsUSD] = useState("");
  const [uniqueCustomers, setUniqueCustomers] = useState("");
  const [pds, setPds] = useState("");

  // Tier assignment
  const [selectedTier, setSelectedTier] = useState<ProgramTier>(partner.programTier);

  const [comment, setComment] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  // Reset form when partner changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const tier = existingMod?.programTier || partner.programTier;
      setSelectedTier(tier);

      if (existingMod) {
        setValues({
          salesPro: existingMod.salesPro,
          techPro: existingMod.techPro,
          bootcamp: existingMod.bootcamp,
          implSpec: existingMod.implSpec,
          simplyPure: existingMod.simplyPure,
          aspFoundations: existingMod.aspFoundations,
          aspFoundationsFA: existingMod.aspFoundationsFA ?? partner.requirements.aspFoundations.obtainedFA,
          aspFoundationsFB: existingMod.aspFoundationsFB ?? partner.requirements.aspFoundations.obtainedFB,
          aspStoragePro: existingMod.aspStoragePro,
          aspStorageProFA: existingMod.aspStorageProFA ?? partner.requirements.aspStoragePro.obtainedFA,
          aspStorageProFB: existingMod.aspStorageProFB ?? partner.requirements.aspStoragePro.obtainedFB,
          aspSupportSpec: existingMod.aspSupportSpec,
          aspSupportSpecFA: existingMod.aspSupportSpecFA ?? partner.requirements.aspSupportSpec.obtainedFA,
          aspSupportSpecFB: existingMod.aspSupportSpecFB ?? partner.requirements.aspSupportSpec.obtainedFB,
        });
        setAddedEmails(existingMod.addedEmails || {});
        setRemovedEmails(existingMod.removedEmails || {});
      } else {
        setValues({
          salesPro: partner.requirements.salesPro.obtained,
          techPro: partner.requirements.techPro.obtained,
          bootcamp: partner.requirements.bootcamp.obtained,
          implSpec: partner.requirements.implSpec.obtained,
          simplyPure: partner.requirements.simplyPure.obtained,
          aspFoundations: partner.requirements.aspFoundations.totalObtained,
          aspFoundationsFA: partner.requirements.aspFoundations.obtainedFA,
          aspFoundationsFB: partner.requirements.aspFoundations.obtainedFB,
          aspStoragePro: partner.requirements.aspStoragePro.totalObtained,
          aspStorageProFA: partner.requirements.aspStoragePro.obtainedFA,
          aspStorageProFB: partner.requirements.aspStoragePro.obtainedFB,
          aspSupportSpec: partner.requirements.aspSupportSpec.totalObtained,
          aspSupportSpecFA: partner.requirements.aspSupportSpec.obtainedFA,
          aspSupportSpecFB: partner.requirements.aspSupportSpec.obtainedFB,
        });
        setBookingsUSD(partner.businessMetrics.bookingsUSD != null ? partner.businessMetrics.bookingsUSD.toString() : "");
        setUniqueCustomers(partner.businessMetrics.uniqueCustomers != null ? partner.businessMetrics.uniqueCustomers.toString() : "");
        setPds(partner.businessMetrics.partnerDeliveredServices != null ? partner.businessMetrics.partnerDeliveredServices.toString() : "");
        setAddedEmails({});
        setRemovedEmails({});
      }
      setComment("");
      setError("");
      setShowHistory(false);
    }
  }, [isOpen, partner.id]);

  const tierDef = TIER_DEFINITIONS[selectedTier];

  const categories = [
    { key: "salesPro" as const, label: "Sales Pro", required: tierDef.enablement.salesPro, color: "var(--color-pure-orange)" },
    { key: "techPro" as const, label: "Tech Pro", required: tierDef.enablement.techPro, color: "var(--color-basil-green)" },
    { key: "bootcamp" as const, label: "Bootcamp", required: tierDef.enablement.bootcamp, color: "var(--color-moss-green)" },
    { key: "implSpec" as const, label: "Impl Specialist", required: tierDef.enablement.implSpec, color: "var(--color-cinnamon-brown)" },
    { key: "simplyPure" as const, label: "Simply Pure", required: tierDef.enablement.simplyPure, color: "var(--color-pure-orange)" },
    { key: "aspFoundations" as const, label: "ASP Foundations", required: tierDef.enablement.aspFoundations, color: "var(--color-basil-green)" },
    { key: "aspStoragePro" as const, label: "Storage Pro", required: tierDef.enablement.aspStoragePro, color: "var(--color-moss-green)" },
    { key: "aspSupportSpec" as const, label: "Support Spec", required: tierDef.enablement.aspSupportSpec, color: "var(--color-ash-gray)" },
  ];

  // Preview computations
  const preview = useMemo(() => {
    const getCount = (key: string, auto: any[]) => {
      const removed = removedEmails[key] || [];
      const added = addedEmails[key] || [];
      return auto.filter(p => !removed.includes(p.email)).length + added.length;
    };

    const sp = getCount('salesPro', trainingData[partner.id]?.salesPro || []);
    const tp = getCount('techPro', trainingData[partner.id]?.techPro || []);
    const bc = getCount('bootcamp', (trainingData[partner.id]?.bootcamp || []).filter(p => !!p.date && p.date >= '2026-02-02'));
    const is = getCount('implSpec', trainingData[partner.id]?.implSpec || []);
    const sm = getCount('simplyPure', trainingData[partner.id]?.simplyPure || []);

    const afFA = getCount('aspFoundationsFA', trainingData[partner.id]?.aspFoundationsFA || []);
    const afFB = getCount('aspFoundationsFB', trainingData[partner.id]?.aspFoundationsFB || []);
    const asFA = getCount('storageProFA', trainingData[partner.id]?.storageProFA || []);
    const asFB = getCount('storageProFB', trainingData[partner.id]?.storageProFB || []);
    const auFA = getCount('supportSpecFA', trainingData[partner.id]?.supportSpecFA || []);
    const auFB = getCount('supportSpecFB', trainingData[partner.id]?.supportSpecFB || []);

    const foundationsTotal = getCount('aspFoundations', []) + Math.max(0, afFA + afFB); // Simple appox for preview
    const storageTotal = getCount('aspStoragePro', []) + Math.max(0, asFA + asFB);
    const supportTotal = getCount('aspSupportSpec', []) + Math.max(0, auFA + auFB);

    const reqs = {
      salesPro: { required: tierDef.enablement.salesPro, obtained: sp },
      techPro: { required: tierDef.enablement.techPro, obtained: tp },
      bootcamp: { required: tierDef.enablement.bootcamp, obtained: bc },
      implSpec: { required: tierDef.enablement.implSpec, obtained: is },
      simplyPure: { required: tierDef.enablement.simplyPure, obtained: sm },
      aspFoundations: { required: tierDef.enablement.aspFoundations, obtainedFA: afFA, obtainedFB: afFB, totalObtained: foundationsTotal },
      aspStoragePro: { required: tierDef.enablement.aspStoragePro, obtainedFA: asFA, obtainedFB: asFB, totalObtained: storageTotal },
      aspSupportSpec: { required: tierDef.enablement.aspSupportSpec, obtainedFA: auFA, obtainedFB: auFB, totalObtained: supportTotal },
    };
    const bm = {
      bookingsUSD: bookingsUSD ? parseFloat(bookingsUSD) : null,
      uniqueCustomers: uniqueCustomers ? parseInt(uniqueCustomers) : null,
      partnerDeliveredServices: pds ? parseInt(pds) : null,
    };
    const score = computeEnablementScore(reqs);
    const gaps = computeEnablementGaps(reqs);
    const enableComp = isEnablementCompliant(reqs);
    const bizComp = isBusinessCompliant(bm, tierDef.businessMetrics);
    return { score, gaps, enableComp, bizComp, overall: enableComp && bizComp };
  }, [values, bookingsUSD, uniqueCustomers, pds, selectedTier, tierDef]);

  const handleSave = () => {
    if (!comment.trim()) {
      setError("A justification comment is required to save changes.");
      return;
    }

    addModification({
      partnerId: partner.id,
      salesPro: values.salesPro,
      techPro: values.techPro,
      bootcamp: values.bootcamp,
      implSpec: values.implSpec,
      simplyPure: values.simplyPure,
      aspFoundations: Math.max(values.aspFoundations, values.aspFoundationsFA + values.aspFoundationsFB),
      aspStoragePro: Math.max(values.aspStoragePro, values.aspStorageProFA + values.aspStorageProFB),
      aspSupportSpec: Math.max(values.aspSupportSpec, values.aspSupportSpecFA + values.aspSupportSpecFB),
      aspFoundationsFA: values.aspFoundationsFA,
      aspFoundationsFB: values.aspFoundationsFB,
      aspStorageProFA: values.aspStorageProFA,
      aspStorageProFB: values.aspStorageProFB,
      aspSupportSpecFA: values.aspSupportSpecFA,
      aspSupportSpecFB: values.aspSupportSpecFB,
      // Granular overrides
      addedEmails,
      removedEmails,
      bookingsUSD: bookingsUSD ? parseFloat(bookingsUSD) : null,
      uniqueCustomers: uniqueCustomers ? parseInt(uniqueCustomers) : null,
      partnerDeliveredServices: pds ? parseInt(pds) : null,
      programTier: selectedTier,
      comment: comment.trim(),
      modifiedBy: "Admin",
    });

    onClose();
  };

  const handleRevert = () => {
    removeModification(partner.id);
    setSelectedTier(partner.programTier);
    setValues({
      salesPro: partner.requirements.salesPro.obtained,
      techPro: partner.requirements.techPro.obtained,
      bootcamp: partner.requirements.bootcamp.obtained,
      implSpec: partner.requirements.implSpec.obtained,
      simplyPure: partner.requirements.simplyPure.obtained,
      aspFoundations: partner.requirements.aspFoundations.totalObtained,
      aspFoundationsFA: partner.requirements.aspFoundations.obtainedFA,
      aspFoundationsFB: partner.requirements.aspFoundations.obtainedFB,
      aspStoragePro: partner.requirements.aspStoragePro.totalObtained,
      aspStorageProFA: partner.requirements.aspStoragePro.obtainedFA,
      aspStorageProFB: partner.requirements.aspStoragePro.obtainedFB,
      aspSupportSpec: partner.requirements.aspSupportSpec.totalObtained,
      aspSupportSpecFA: partner.requirements.aspSupportSpec.obtainedFA,
      aspSupportSpecFB: partner.requirements.aspSupportSpec.obtainedFB,
    });
    setBookingsUSD(partner.businessMetrics.bookingsUSD != null ? partner.businessMetrics.bookingsUSD.toString() : "");
    setUniqueCustomers(partner.businessMetrics.uniqueCustomers != null ? partner.businessMetrics.uniqueCustomers.toString() : "");
    setPds(partner.businessMetrics.partnerDeliveredServices != null ? partner.businessMetrics.partnerDeliveredServices.toString() : "");
    setAddedEmails({});
    setRemovedEmails({});
    setComment("");
    setError("");
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return "N/A";
    return val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "color-mix(in srgb, var(--color-ash-gray) 50%, transparent)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{
                background: "var(--color-cloud-white)",
                border: "1px solid var(--color-stone-gray)",
              }}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b rounded-t-2xl"
                style={{
                  background: "var(--color-ash-gray)",
                  borderColor: "var(--color-ash-gray)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "color-mix(in srgb, var(--color-pure-orange) 20%, transparent)" }}
                  >
                    <Pencil className="w-4 h-4" style={{ color: "var(--color-pure-orange)" }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Modify Partner</h3>
                    <p className="text-[11px]" style={{ color: "var(--color-ash-gray)" }}>
                      {partner.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {modHistory.length > 0 && (
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        background: showHistory ? "color-mix(in srgb, var(--color-pure-orange) 20%, transparent)" : "transparent",
                        color: "var(--color-ash-gray)",
                      }}
                      title="View modification history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: "var(--color-ash-gray)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && modHistory.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b"
                    style={{ borderColor: "var(--color-stone-gray)" }}
                  >
                    <div className="px-6 py-4 space-y-3" style={{ background: "var(--color-cloud-white)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Modification History ({modHistory.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {modHistory.map((h, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg text-[11px]"
                            style={{ background: "var(--color-cloud-white)", border: "1px solid var(--color-stone-gray)" }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-foreground">{h.modifiedBy}</span>
                              <span className="text-muted-foreground">
                                {new Date(h.modifiedAt).toLocaleDateString("en-ZA", {
                                  day: "numeric", month: "short", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              SP:{h.salesPro} TP:{h.techPro} BC:{h.bootcamp} IS:{h.implSpec}
                              {h.programTier && ` | Tier: ${TIER_DEFINITIONS[h.programTier].label}`}
                            </p>
                            <p className="text-foreground/80 mt-1 italic">"{h.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Existing modification indicator */}
                {existingMod && (
                  <div
                    className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "color-mix(in srgb, var(--color-basil-green) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--color-basil-green) 15%, transparent)",
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-basil-green)" }} />
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--color-basil-green)" }}>
                        Previously Modified
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--color-basil-green)" }}>
                        Last modified by {existingMod.modifiedBy} on{" "}
                        {new Date(existingMod.modifiedAt).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <button
                      onClick={handleRevert}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors hover:bg-white/60"
                      style={{ color: "var(--color-basil-green)" }}
                    >
                      <Undo2 className="w-3 h-3" />
                      Revert
                    </button>
                  </div>
                )}

                {/* Tier Assignment */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4" style={{ color: tierDef.color }} />
                    <h4 className="text-[13px] font-semibold" style={{ color: "var(--color-basil-green)" }}>
                      Program Tier
                    </h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PROGRAM_TIERS.map((t) => {
                      const td = TIER_DEFINITIONS[t];
                      const isActive = selectedTier === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTier(t)}
                          className="relative px-2 py-2 rounded-xl text-[11px] font-semibold transition-all border-2"
                          style={{
                            borderColor: isActive ? td.color : "var(--color-basil-green)",
                            backgroundColor: isActive ? td.bg : "transparent",
                            color: isActive ? td.color : "var(--color-basil-green)",
                          }}
                        >
                          {td.shortLabel}
                          {isActive && (
                            <span
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: td.color }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Enablement Categories */}
                <div>
                  <h4 className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-basil-green)" }}>
                    Enablement & Certifications
                  </h4>
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const val = preview.reqs[cat.key as keyof typeof preview.reqs].totalObtained ?? (preview.reqs[cat.key as keyof typeof preview.reqs] as any).obtained;
                      const met = val >= cat.required;
                      const gap = Math.max(0, cat.required - val);
                      return (
                        <div key={cat.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-medium" style={{ color: "var(--color-basil-green)" }}>
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px]" style={{ color: "var(--color-basil-green)" }}>
                                {partner.requirements[cat.key as 'salesPro']?.obtained ?? 0}
                              </span>
                              <ArrowRight className="w-3 h-3" style={{ color: "var(--color-basil-green)" }} />
                              <span
                                className="text-[12px] font-bold"
                                style={{ color: met ? "var(--color-pure-orange)" : cat.color }}
                              >
                                {val}
                              </span>
                              <span className="text-[11px]" style={{ color: "var(--color-basil-green)" }}>
                                / {cat.required}
                              </span>
                              {met ? (
                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--color-pure-orange)" }} />
                              ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                  style={{ background: `${cat.color}15`, color: cat.color }}>
                                  -{gap}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-stone-gray)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: met ? "var(--color-pure-orange)" : cat.color }}
                                initial={false}
                                animate={{ width: cat.required > 0 ? `${Math.min(100, (val / cat.required) * 100)}%` : "100%" }}
                                transition={{ type: "spring", damping: 20 }}
                              />
                            </div>
                          </div>
                          
                          {/* Granular ASP Breakdown for manual entry */}
                          {(cat.key === 'aspFoundations' || cat.key === 'aspStoragePro' || cat.key === 'aspSupportSpec') && (
                            <div className="mt-2 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 block mb-1">FLASHARRAY</label>
                                <div className="flex flex-col gap-1">
                                  {/* List management for FA */}
                                  <EmailListManager 
                                    cat={`${cat.key}FA`}
                                    autoList={trainingData[partner.id]?.[`${cat.key}FA` as keyof typeof trainingData[9]] || []}
                                    added={addedEmails[`${cat.key}FA`] || []}
                                    removed={removedEmails[`${cat.key}FA`] || []}
                                    onAdd={(email) => setAddedEmails(prev => ({ ...prev, [`${cat.key}FA`]: [...(prev[`${cat.key}FA`] || []), email] }))}
                                    onRemove={(email, isAuto) => {
                                      if (isAuto) setRemovedEmails(prev => ({ ...prev, [`${cat.key}FA`]: [...(prev[`${cat.key}FA`] || []), email] }));
                                      else setAddedEmails(prev => ({ ...prev, [`${cat.key}FA`]: (prev[`${cat.key}FA`] || []).filter(e => e !== email) }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 block mb-1">FLASHBLADE</label>
                                <div className="flex flex-col gap-1">
                                  {/* List management for FB */}
                                  <EmailListManager 
                                    cat={`${cat.key}FB`}
                                    autoList={trainingData[partner.id]?.[`${cat.key}FB` as keyof typeof trainingData[9]] || []}
                                    added={addedEmails[`${cat.key}FB`] || []}
                                    removed={removedEmails[`${cat.key}FB`] || []}
                                    onAdd={(email) => setAddedEmails(prev => ({ ...prev, [`${cat.key}FB`]: [...(prev[`${cat.key}FB`] || []), email] }))}
                                    onRemove={(email, isAuto) => {
                                      if (isAuto) setRemovedEmails(prev => ({ ...prev, [`${cat.key}FB`]: [...(prev[`${cat.key}FB`] || []), email] }));
                                      else setAddedEmails(prev => ({ ...prev, [`${cat.key}FB`]: (prev[`${cat.key}FB`] || []).filter(e => e !== email) }));
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Standard List Management */}
                          {!(cat.key === 'aspFoundations' || cat.key === 'aspStoragePro' || cat.key === 'aspSupportSpec') && (
                            <div className="mt-2">
                              <EmailListManager 
                                cat={cat.key}
                                autoList={trainingData[partner.id]?.[cat.key as keyof typeof trainingData[9]] || []}
                                added={addedEmails[cat.key] || []}
                                removed={removedEmails[cat.key] || []}
                                onAdd={(email) => setAddedEmails(prev => ({ ...prev, [cat.key]: [...(prev[cat.key] || []), email] }))}
                                onRemove={(email, isAuto) => {
                                  if (isAuto) setRemovedEmails(prev => ({ ...prev, [cat.key]: [...(prev[cat.key] || []), email] }));
                                  else setAddedEmails(prev => ({ ...prev, [cat.key]: (prev[cat.key] || []).filter(e => e !== email) }));
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Business Metrics */}
                <div>
                  <h4 className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-basil-green)" }}>
                    Business Metrics (Manual Entry)
                  </h4>
                  <div className="space-y-3">
                    {/* Bookings USD */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)" }}>
                        <DollarSign className="w-4 h-4" style={{ color: "var(--color-pure-orange)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--color-basil-green)" }}>
                          Bookings USD (Non-Renewal)
                        </label>
                        <input
                          type="number"
                          value={bookingsUSD}
                          onChange={(e) => setBookingsUSD(e.target.value)}
                          placeholder={tierDef.businessMetrics.bookingsUSD !== null ? `Target: ${formatCurrency(tierDef.businessMetrics.bookingsUSD)}` : "N/A for this tier"}
                          disabled={tierDef.businessMetrics.bookingsUSD === null}
                          className="w-full px-3 py-2 rounded-xl text-[12px] border focus:outline-none focus:ring-2 disabled:opacity-50"
                          style={{
                            borderColor: "var(--color-stone-gray)",
                            background: tierDef.businessMetrics.bookingsUSD === null ? "var(--color-basil-green)" : "white",
                          }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "var(--color-basil-green)" }}>
                        {tierDef.businessMetrics.bookingsUSD !== null ? `≥ ${formatCurrency(tierDef.businessMetrics.bookingsUSD)}` : "N/A"}
                      </div>
                    </div>

                    {/* Unique Customers */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-basil-green) 10%, transparent)" }}>
                        <Users className="w-4 h-4" style={{ color: "var(--color-basil-green)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--color-basil-green)" }}>
                          Unique Customers (Non-Renewal)
                        </label>
                        <input
                          type="number"
                          value={uniqueCustomers}
                          onChange={(e) => setUniqueCustomers(e.target.value)}
                          placeholder={tierDef.businessMetrics.uniqueCustomers !== null ? `Target: ${tierDef.businessMetrics.uniqueCustomers}` : "N/A"}
                          disabled={tierDef.businessMetrics.uniqueCustomers === null}
                          className="w-full px-3 py-2 rounded-xl text-[12px] border focus:outline-none focus:ring-2 disabled:opacity-50"
                          style={{ borderColor: "var(--color-stone-gray)" }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "var(--color-basil-green)" }}>
                        {tierDef.businessMetrics.uniqueCustomers !== null ? `≥ ${tierDef.businessMetrics.uniqueCustomers}` : "N/A"}
                      </div>
                    </div>

                    {/* PDS */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-moss-green) 10%, transparent)" }}>
                        <Wrench className="w-4 h-4" style={{ color: "var(--color-moss-green)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--color-basil-green)" }}>
                          Partner Delivered Services (Installations)
                        </label>
                        <input
                          type="number"
                          value={pds}
                          onChange={(e) => setPds(e.target.value)}
                          placeholder={tierDef.businessMetrics.partnerDeliveredServices !== null ? `Target: ${tierDef.businessMetrics.partnerDeliveredServices}` : "N/A for this tier"}
                          disabled={tierDef.businessMetrics.partnerDeliveredServices === null}
                          className="w-full px-3 py-2 rounded-xl text-[12px] border focus:outline-none focus:ring-2 disabled:opacity-50"
                          style={{
                            borderColor: "var(--color-stone-gray)",
                            background: tierDef.businessMetrics.partnerDeliveredServices === null ? "var(--color-basil-green)" : "white",
                          }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "var(--color-basil-green)" }}>
                        {tierDef.businessMetrics.partnerDeliveredServices !== null ? `≥ ${tierDef.businessMetrics.partnerDeliveredServices}` : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Preview */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: preview.overall
                      ? "color-mix(in srgb, var(--color-pure-orange) 6%, transparent)"
                      : "color-mix(in srgb, var(--color-moss-green) 6%, transparent)",
                    border: `1px solid ${preview.overall ? "color-mix(in srgb, var(--color-pure-orange) 15%, transparent)" : "color-mix(in srgb, var(--color-moss-green) 15%, transparent)"}`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--color-basil-green)" }}>
                    Compliance Preview
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.enableComp ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)" }}>
                        {preview.score}%
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--color-basil-green)" }}>Enablement</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.enableComp ? "var(--color-pure-orange)" : "var(--color-ash-gray)" }}>
                        {preview.enableComp ? "✓ Met" : `${preview.gaps} gaps`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.bizComp ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)" }}>
                        {preview.bizComp ? "Met" : "—"}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--color-basil-green)" }}>Business</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.bizComp ? "var(--color-pure-orange)" : "var(--color-ash-gray)" }}>
                        {preview.bizComp ? "✓ Met" : "Pending"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.overall ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)" }}>
                        {preview.overall ? "✓" : "✗"}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--color-basil-green)" }}>Overall</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.overall ? "var(--color-pure-orange)" : "var(--color-ash-gray)" }}>
                        {preview.overall ? "Compliant" : "Not met"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-basil-green)" }}>
                    Justification Comment <span style={{ color: "var(--color-cinnamon-brown)" }}>*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Explain the reason for this modification..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-[12px] border focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: error ? "var(--color-cinnamon-brown)" : "var(--color-stone-gray)" }}
                  />
                  {error && (
                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--color-cinnamon-brown)" }}>
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t rounded-b-2xl"
                style={{
                  background: "var(--color-cloud-white)",
                  borderColor: "var(--color-stone-gray)",
                }}
              >
                <button
                  onClick={handleRevert}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors hover:bg-gray-100"
                  style={{ color: "var(--color-basil-green)" }}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Revert to Base
                </button>
                <button
                  onClick={handleSave}
                  disabled={!comment.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: "var(--color-pure-orange)" }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Helper Components ──────────────────────────────────────

function EmailListManager({ 
  cat, 
  autoList, 
  added, 
  removed, 
  onAdd, 
  onRemove 
}: { 
  cat: string; 
  autoList: any[]; 
  added: string[]; 
  removed: string[]; 
  onAdd: (email: string) => void;
  onRemove: (email: string, isAuto: boolean) => void;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input && input.includes("@")) {
      onAdd(input.trim().toLowerCase());
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-100/50 rounded-lg border border-slate-200">
        {autoList.filter(p => !removed.includes(p.email)).map(p => (
          <EmailTag 
            key={p.email} 
            email={p.email} 
            isAuto 
            onRemove={() => onRemove(p.email, true)} 
          />
        ))}
        {added.map(email => (
          <EmailTag 
            key={email} 
            email={email} 
            onRemove={() => onRemove(email, false)} 
          />
        ))}
        {(autoList.length === 0 && added.length === 0) && (
          <span className="text-[10px] text-slate-400 italic">No emails listed</span>
        )}
      </div>
      <div className="flex gap-1">
        <input 
          placeholder="Add email..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 px-2 py-1 text-[11px] rounded border border-slate-200 focus:outline-none focus:border-pure-orange"
        />
        <button 
          onClick={handleAdd}
          className="p-1 rounded bg-pure-orange text-white hover:bg-pure-orange/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmailTag({ 
  email, 
  isAuto = false, 
  onRemove 
}: { 
  email: string; 
  isAuto?: boolean; 
  onRemove: () => void;
}) {
  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-all"
      style={{
        background: isAuto ? "white" : "color-mix(in srgb, var(--color-pure-orange) 10%, white)",
        borderColor: isAuto ? "var(--color-stone-gray)" : "color-mix(in srgb, var(--color-pure-orange) 20%, transparent)",
        color: isAuto ? "var(--color-basil-green)" : "var(--color-pure-orange)",
      }}
    >
      <span className="truncate max-w-[120px]">{email}</span>
      <button 
        onClick={(e) => { e.preventDefault(); onRemove(); }}
        className="hover:text-red-500 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

