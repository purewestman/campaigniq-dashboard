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
} from "lucide-react";

interface ModifyGapModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModifyGapModal({ partner, isOpen, onClose }: ModifyGapModalProps) {
  const { addModification, removeModification, getModification, getModificationHistory } = useModifications();

  const existingMod = getModification(partner.id);
  const modHistory = getModificationHistory(partner.id);

  // Enablement state
  const [values, setValues] = useState({
    salesPro: partner.requirements.salesPro.obtained,
    techPro: partner.requirements.techPro.obtained,
    bootcamp: partner.requirements.bootcamp.obtained,
    implSpec: partner.requirements.implSpec.obtained,
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
        });
        setBookingsUSD(existingMod.bookingsUSD != null ? existingMod.bookingsUSD.toString() : "");
        setUniqueCustomers(existingMod.uniqueCustomers != null ? existingMod.uniqueCustomers.toString() : "");
        setPds(existingMod.partnerDeliveredServices != null ? existingMod.partnerDeliveredServices.toString() : "");
      } else {
        setValues({
          salesPro: partner.requirements.salesPro.obtained,
          techPro: partner.requirements.techPro.obtained,
          bootcamp: partner.requirements.bootcamp.obtained,
          implSpec: partner.requirements.implSpec.obtained,
        });
        setBookingsUSD(partner.businessMetrics.bookingsUSD != null ? partner.businessMetrics.bookingsUSD.toString() : "");
        setUniqueCustomers(partner.businessMetrics.uniqueCustomers != null ? partner.businessMetrics.uniqueCustomers.toString() : "");
        setPds(partner.businessMetrics.partnerDeliveredServices != null ? partner.businessMetrics.partnerDeliveredServices.toString() : "");
      }
      setComment("");
      setError("");
      setShowHistory(false);
    }
  }, [isOpen, partner.id]);

  const tierDef = TIER_DEFINITIONS[selectedTier];

  const categories = [
    { key: "salesPro" as const, label: "Sales Pro", required: tierDef.enablement.salesPro, color: "oklch(0.60 0.12 175)" },
    { key: "techPro" as const, label: "Tech Pro", required: tierDef.enablement.techPro, color: "oklch(0.58 0.16 290)" },
    { key: "bootcamp" as const, label: "Bootcamp", required: tierDef.enablement.bootcamp, color: "oklch(0.75 0.14 75)" },
    { key: "implSpec" as const, label: "Impl Specialist", required: tierDef.enablement.implSpec, color: "oklch(0.62 0.19 15)" },
  ];

  // Preview computations
  const preview = useMemo(() => {
    const reqs = {
      salesPro: { required: tierDef.enablement.salesPro, obtained: values.salesPro },
      techPro: { required: tierDef.enablement.techPro, obtained: values.techPro },
      bootcamp: { required: tierDef.enablement.bootcamp, obtained: values.bootcamp },
      implSpec: { required: tierDef.enablement.implSpec, obtained: values.implSpec },
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
    });
    setBookingsUSD(partner.businessMetrics.bookingsUSD != null ? partner.businessMetrics.bookingsUSD.toString() : "");
    setUniqueCustomers(partner.businessMetrics.uniqueCustomers != null ? partner.businessMetrics.uniqueCustomers.toString() : "");
    setPds(partner.businessMetrics.partnerDeliveredServices != null ? partner.businessMetrics.partnerDeliveredServices.toString() : "");
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
            style={{ background: "oklch(0.15 0.02 200 / 0.5)", backdropFilter: "blur(4px)" }}
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
                background: "oklch(0.99 0.003 85)",
                border: "1px solid oklch(0.92 0.01 85)",
              }}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b rounded-t-2xl"
                style={{
                  background: "oklch(0.22 0.04 200)",
                  borderColor: "oklch(0.30 0.04 200)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.60 0.12 175 / 0.20)" }}
                  >
                    <Pencil className="w-4 h-4" style={{ color: "oklch(0.80 0.10 175)" }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Modify Partner</h3>
                    <p className="text-[11px]" style={{ color: "oklch(0.75 0.02 200)" }}>
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
                        background: showHistory ? "oklch(0.60 0.12 175 / 0.20)" : "transparent",
                        color: "oklch(0.75 0.02 200)",
                      }}
                      title="View modification history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: "oklch(0.75 0.02 200)" }}
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
                    style={{ borderColor: "oklch(0.92 0.01 85)" }}
                  >
                    <div className="px-6 py-4 space-y-3" style={{ background: "oklch(0.97 0.005 85)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Modification History ({modHistory.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {modHistory.map((h, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg text-[11px]"
                            style={{ background: "oklch(0.99 0.003 85)", border: "1px solid oklch(0.94 0.008 85)" }}
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
                      background: "oklch(0.58 0.16 290 / 0.06)",
                      border: "1px solid oklch(0.58 0.16 290 / 0.15)",
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.48 0.16 290)" }} />
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "oklch(0.38 0.16 290)" }}>
                        Previously Modified
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.48 0.10 290)" }}>
                        Last modified by {existingMod.modifiedBy} on{" "}
                        {new Date(existingMod.modifiedAt).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <button
                      onClick={handleRevert}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors hover:bg-white/60"
                      style={{ color: "oklch(0.48 0.16 290)" }}
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
                    <h4 className="text-[13px] font-semibold" style={{ color: "oklch(0.30 0.02 260)" }}>
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
                            borderColor: isActive ? td.color : "oklch(0.92 0.004 286)",
                            backgroundColor: isActive ? td.bg : "transparent",
                            color: isActive ? td.color : "oklch(0.55 0.02 260)",
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
                  <h4 className="text-[13px] font-semibold mb-3" style={{ color: "oklch(0.30 0.02 260)" }}>
                    Enablement & Certifications
                  </h4>
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const val = values[cat.key];
                      const met = val >= cat.required;
                      const gap = Math.max(0, cat.required - val);
                      return (
                        <div key={cat.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-medium" style={{ color: "oklch(0.40 0.02 260)" }}>
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px]" style={{ color: "oklch(0.55 0.02 260)" }}>
                                {partner.requirements[cat.key].obtained}
                              </span>
                              <ArrowRight className="w-3 h-3" style={{ color: "oklch(0.65 0.02 260)" }} />
                              <span
                                className="text-[12px] font-bold"
                                style={{ color: met ? "oklch(0.45 0.15 160)" : cat.color }}
                              >
                                {val}
                              </span>
                              <span className="text-[11px]" style={{ color: "oklch(0.60 0.02 260)" }}>
                                / {cat.required}
                              </span>
                              {met ? (
                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.15 160)" }} />
                              ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                  style={{ background: `${cat.color}15`, color: cat.color }}>
                                  -{gap}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setValues((v) => ({ ...v, [cat.key]: Math.max(0, v[cat.key] - 1) }))}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                              style={{
                                background: "oklch(0.97 0.005 85)",
                                border: "1px solid oklch(0.92 0.01 85)",
                                color: "oklch(0.45 0.02 260)",
                              }}
                            >
                              −
                            </button>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.94 0.005 85)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: met ? "oklch(0.55 0.15 160)" : cat.color }}
                                initial={false}
                                animate={{ width: cat.required > 0 ? `${Math.min(100, (val / cat.required) * 100)}%` : "100%" }}
                                transition={{ type: "spring", damping: 20 }}
                              />
                            </div>
                            <button
                              onClick={() => setValues((v) => ({ ...v, [cat.key]: v[cat.key] + 1 }))}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                              style={{
                                background: "oklch(0.97 0.005 85)",
                                border: "1px solid oklch(0.92 0.01 85)",
                                color: "oklch(0.45 0.02 260)",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Business Metrics */}
                <div>
                  <h4 className="text-[13px] font-semibold mb-3" style={{ color: "oklch(0.30 0.02 260)" }}>
                    Business Metrics (Manual Entry)
                  </h4>
                  <div className="space-y-3">
                    {/* Bookings USD */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.60 0.12 175 / 0.10)" }}>
                        <DollarSign className="w-4 h-4" style={{ color: "oklch(0.50 0.12 175)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "oklch(0.45 0.02 260)" }}>
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
                            borderColor: "oklch(0.92 0.01 85)",
                            background: tierDef.businessMetrics.bookingsUSD === null ? "oklch(0.97 0.001 286)" : "white",
                          }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "oklch(0.60 0.02 260)" }}>
                        {tierDef.businessMetrics.bookingsUSD !== null ? `≥ ${formatCurrency(tierDef.businessMetrics.bookingsUSD)}` : "N/A"}
                      </div>
                    </div>

                    {/* Unique Customers */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.58 0.16 290 / 0.10)" }}>
                        <Users className="w-4 h-4" style={{ color: "oklch(0.48 0.16 290)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "oklch(0.45 0.02 260)" }}>
                          Unique Customers (Non-Renewal)
                        </label>
                        <input
                          type="number"
                          value={uniqueCustomers}
                          onChange={(e) => setUniqueCustomers(e.target.value)}
                          placeholder={tierDef.businessMetrics.uniqueCustomers !== null ? `Target: ${tierDef.businessMetrics.uniqueCustomers}` : "N/A"}
                          disabled={tierDef.businessMetrics.uniqueCustomers === null}
                          className="w-full px-3 py-2 rounded-xl text-[12px] border focus:outline-none focus:ring-2 disabled:opacity-50"
                          style={{ borderColor: "oklch(0.92 0.01 85)" }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "oklch(0.60 0.02 260)" }}>
                        {tierDef.businessMetrics.uniqueCustomers !== null ? `≥ ${tierDef.businessMetrics.uniqueCustomers}` : "N/A"}
                      </div>
                    </div>

                    {/* PDS */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.75 0.14 75 / 0.10)" }}>
                        <Wrench className="w-4 h-4" style={{ color: "oklch(0.60 0.14 75)" }} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "oklch(0.45 0.02 260)" }}>
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
                            borderColor: "oklch(0.92 0.01 85)",
                            background: tierDef.businessMetrics.partnerDeliveredServices === null ? "oklch(0.97 0.001 286)" : "white",
                          }}
                        />
                      </div>
                      <div className="text-[10px] w-16 text-right" style={{ color: "oklch(0.60 0.02 260)" }}>
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
                      ? "oklch(0.60 0.12 175 / 0.06)"
                      : "oklch(0.75 0.14 75 / 0.06)",
                    border: `1px solid ${preview.overall ? "oklch(0.60 0.12 175 / 0.15)" : "oklch(0.75 0.14 75 / 0.15)"}`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "oklch(0.50 0.02 260)" }}>
                    Compliance Preview
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.enableComp ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)" }}>
                        {preview.score}%
                      </div>
                      <div className="text-[10px]" style={{ color: "oklch(0.55 0.02 260)" }}>Enablement</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.enableComp ? "oklch(0.50 0.15 160)" : "oklch(0.55 0.20 50)" }}>
                        {preview.enableComp ? "✓ Met" : `${preview.gaps} gaps`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.bizComp ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)" }}>
                        {preview.bizComp ? "Met" : "—"}
                      </div>
                      <div className="text-[10px]" style={{ color: "oklch(0.55 0.02 260)" }}>Business</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.bizComp ? "oklch(0.50 0.15 160)" : "oklch(0.55 0.20 50)" }}>
                        {preview.bizComp ? "✓ Met" : "Pending"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: preview.overall ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)" }}>
                        {preview.overall ? "✓" : "✗"}
                      </div>
                      <div className="text-[10px]" style={{ color: "oklch(0.55 0.02 260)" }}>Overall</div>
                      <div className="text-[10px] mt-0.5" style={{ color: preview.overall ? "oklch(0.50 0.15 160)" : "oklch(0.55 0.20 50)" }}>
                        {preview.overall ? "Compliant" : "Not met"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-[12px] font-semibold block mb-2" style={{ color: "oklch(0.30 0.02 260)" }}>
                    Justification Comment <span style={{ color: "oklch(0.62 0.19 15)" }}>*</span>
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
                    style={{ borderColor: error ? "oklch(0.62 0.19 15)" : "oklch(0.92 0.01 85)" }}
                  />
                  {error && (
                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "oklch(0.55 0.19 15)" }}>
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
                  background: "oklch(0.99 0.003 85)",
                  borderColor: "oklch(0.92 0.01 85)",
                }}
              >
                <button
                  onClick={handleRevert}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors hover:bg-gray-100"
                  style={{ color: "oklch(0.50 0.02 260)" }}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Revert to Base
                </button>
                <button
                  onClick={handleSave}
                  disabled={!comment.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: "oklch(0.50 0.12 175)" }}
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
