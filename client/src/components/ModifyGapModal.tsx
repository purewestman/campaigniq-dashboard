/*
 * Modify Gap Modal — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Admin modal to update partner gap counts with justification comments.
 * Shows current vs new values, requires a comment, and saves via ModificationContext.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModifications } from "@/contexts/ModificationContext";
import { ELITE_ZONE_B, type Partner } from "@/lib/data";
import {
  X,
  Pencil,
  Save,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  History,
  Undo2,
} from "lucide-react";

interface ModifyGapModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { key: "salesPro" as const, label: "Sales Pro", required: ELITE_ZONE_B.salesPro, color: "oklch(0.60 0.12 175)" },
  { key: "techPro" as const, label: "Tech Pro", required: ELITE_ZONE_B.techPro, color: "oklch(0.58 0.16 290)" },
  { key: "bootcamp" as const, label: "Bootcamp", required: ELITE_ZONE_B.bootcamp, color: "oklch(0.75 0.14 75)" },
  { key: "implSpec" as const, label: "Impl Specialist", required: ELITE_ZONE_B.implSpec, color: "oklch(0.62 0.19 15)" },
];

export default function ModifyGapModal({ partner, isOpen, onClose }: ModifyGapModalProps) {
  const { addModification, removeModification, getModification, getModificationHistory } = useModifications();

  const existingMod = getModification(partner.id);
  const modHistory = getModificationHistory(partner.id);

  const [values, setValues] = useState({
    salesPro: partner.requirements.salesPro.obtained,
    techPro: partner.requirements.techPro.obtained,
    bootcamp: partner.requirements.bootcamp.obtained,
    implSpec: partner.requirements.implSpec.obtained,
  });
  const [comment, setComment] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  // Reset form when partner changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingMod) {
        setValues({
          salesPro: existingMod.salesPro,
          techPro: existingMod.techPro,
          bootcamp: existingMod.bootcamp,
          implSpec: existingMod.implSpec,
        });
      } else {
        setValues({
          salesPro: partner.requirements.salesPro.obtained,
          techPro: partner.requirements.techPro.obtained,
          bootcamp: partner.requirements.bootcamp.obtained,
          implSpec: partner.requirements.implSpec.obtained,
        });
      }
      setComment("");
      setError("");
      setShowHistory(false);
    }
  }, [isOpen, partner.id]);

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
      comment: comment.trim(),
      modifiedBy: "Admin",
    });

    onClose();
  };

  const handleRevert = () => {
    removeModification(partner.id);
    setValues({
      salesPro: partner.requirements.salesPro.obtained,
      techPro: partner.requirements.techPro.obtained,
      bootcamp: partner.requirements.bootcamp.obtained,
      implSpec: partner.requirements.implSpec.obtained,
    });
    setComment("");
    setError("");
  };

  const hasChanges =
    values.salesPro !== partner.requirements.salesPro.obtained ||
    values.techPro !== partner.requirements.techPro.obtained ||
    values.bootcamp !== partner.requirements.bootcamp.obtained ||
    values.implSpec !== partner.requirements.implSpec.obtained;

  // Compute new score preview
  const newObtained =
    Math.min(values.salesPro, ELITE_ZONE_B.salesPro) +
    Math.min(values.techPro, ELITE_ZONE_B.techPro) +
    Math.min(values.bootcamp, ELITE_ZONE_B.bootcamp) +
    Math.min(values.implSpec, ELITE_ZONE_B.implSpec);
  const newScore = Math.round((newObtained / ELITE_ZONE_B.total) * 100);
  const newGaps =
    Math.max(0, ELITE_ZONE_B.salesPro - values.salesPro) +
    Math.max(0, ELITE_ZONE_B.techPro - values.techPro) +
    Math.max(0, ELITE_ZONE_B.bootcamp - values.bootcamp) +
    Math.max(0, ELITE_ZONE_B.implSpec - values.implSpec);

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
                    <h3 className="text-[15px] font-bold text-white">Modify Gaps</h3>
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
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              SP:{h.salesPro} TP:{h.techPro} BC:{h.bootcamp} IS:{h.implSpec}
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
                      <p className="text-[12px] font-medium" style={{ color: "oklch(0.38 0.16 290)" }}>
                        This partner has been previously modified
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Last modified by {existingMod.modifiedBy} on{" "}
                        {new Date(existingMod.modifiedAt).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <button
                      onClick={handleRevert}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                      style={{
                        background: "oklch(0.62 0.19 15 / 0.08)",
                        color: "oklch(0.50 0.19 15)",
                      }}
                    >
                      <Undo2 className="w-3 h-3" />
                      Revert
                    </button>
                  </div>
                )}

                {/* Gap Category Editors */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                    Update Obtained Counts
                  </p>
                  <div className="space-y-3">
                    {categories.map(({ key, label, required, color }) => {
                      const original = partner.requirements[key].obtained;
                      const current = values[key];
                      const changed = current !== original;
                      const met = current >= required;

                      return (
                        <div
                          key={key}
                          className="px-4 py-3 rounded-xl transition-all"
                          style={{
                            background: changed
                              ? "oklch(0.60 0.12 175 / 0.04)"
                              : "oklch(0.97 0.005 85)",
                            border: changed
                              ? "1px solid oklch(0.60 0.12 175 / 0.20)"
                              : "1px solid oklch(0.94 0.008 85)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: color }}
                              />
                              <span className="text-[13px] font-semibold text-foreground">
                                {label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                (req: {required})
                              </span>
                            </div>
                            {met && (
                              <CheckCircle2
                                className="w-4 h-4"
                                style={{ color: "oklch(0.50 0.12 175)" }}
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="text-muted-foreground w-12">Original:</span>
                              <span className="font-mono font-bold text-foreground/60">
                                {original}
                              </span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="text-muted-foreground w-8">New:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setValues((v) => ({
                                      ...v,
                                      [key]: Math.max(0, v[key] - 1),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] font-bold transition-colors"
                                  style={{
                                    background: "oklch(0.94 0.008 85)",
                                    color: "oklch(0.40 0.02 200)",
                                  }}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={current}
                                  onChange={(e) =>
                                    setValues((v) => ({
                                      ...v,
                                      [key]: Math.max(0, Math.min(20, parseInt(e.target.value) || 0)),
                                    }))
                                  }
                                  className="w-12 h-7 text-center text-[14px] font-mono font-bold rounded-lg outline-none"
                                  style={{
                                    background: changed
                                      ? "oklch(0.60 0.12 175 / 0.08)"
                                      : "oklch(0.96 0.005 85)",
                                    color: changed
                                      ? "oklch(0.35 0.12 175)"
                                      : "oklch(0.30 0.02 200)",
                                    border: changed
                                      ? "1px solid oklch(0.60 0.12 175 / 0.30)"
                                      : "1px solid oklch(0.92 0.01 85)",
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    setValues((v) => ({
                                      ...v,
                                      [key]: Math.min(20, v[key] + 1),
                                    }))
                                  }
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] font-bold transition-colors"
                                  style={{
                                    background: "oklch(0.94 0.008 85)",
                                    color: "oklch(0.40 0.02 200)",
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            {changed && (
                              <span
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto"
                                style={{
                                  background:
                                    current > original
                                      ? "oklch(0.60 0.12 175 / 0.10)"
                                      : "oklch(0.62 0.19 15 / 0.10)",
                                  color:
                                    current > original
                                      ? "oklch(0.45 0.12 175)"
                                      : "oklch(0.50 0.19 15)",
                                }}
                              >
                                {current > original ? "+" : ""}
                                {current - original}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                {hasChanges && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{
                      background: "oklch(0.60 0.12 175 / 0.05)",
                      border: "1px solid oklch(0.60 0.12 175 / 0.15)",
                    }}
                  >
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-muted-foreground">New Score</p>
                      <p
                        className="text-lg font-bold"
                        style={{
                          color:
                            newScore >= 80
                              ? "oklch(0.45 0.12 175)"
                              : newScore >= 40
                              ? "oklch(0.58 0.14 75)"
                              : "oklch(0.50 0.19 15)",
                        }}
                      >
                        {newScore}%
                      </p>
                    </div>
                    <div
                      className="w-px h-8"
                      style={{ background: "oklch(0.60 0.12 175 / 0.20)" }}
                    />
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-muted-foreground">Remaining Gaps</p>
                      <p className="text-lg font-bold text-foreground">{newGaps}</p>
                    </div>
                    <div
                      className="w-px h-8"
                      style={{ background: "oklch(0.60 0.12 175 / 0.20)" }}
                    />
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-muted-foreground">New Tier</p>
                      <p
                        className="text-[12px] font-bold"
                        style={{
                          color:
                            newScore >= 80
                              ? "oklch(0.45 0.12 175)"
                              : newScore >= 40
                              ? "oklch(0.58 0.14 75)"
                              : "oklch(0.50 0.19 15)",
                        }}
                      >
                        {newScore >= 80
                          ? "Top Performer"
                          : newScore >= 40
                          ? "Mid-Tier"
                          : "Falling Behind"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Comment Section */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Justification Comment <span style={{ color: "oklch(0.62 0.19 15)" }}>*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Explain why these gaps are being updated (e.g., 'Partner completed 2 additional Sales Pro certifications verified via LMS report dated 28 Mar 2026')"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none transition-all"
                    style={{
                      background: "oklch(0.97 0.005 85)",
                      border: error
                        ? "1px solid oklch(0.62 0.19 15 / 0.50)"
                        : "1px solid oklch(0.92 0.01 85)",
                    }}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] mt-1.5 flex items-center gap-1"
                      style={{ color: "oklch(0.50 0.19 15)" }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t rounded-b-2xl"
                style={{
                  background: "oklch(0.98 0.003 85)",
                  borderColor: "oklch(0.92 0.01 85)",
                }}
              >
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
                  style={{
                    background: "oklch(0.94 0.008 85)",
                    color: "oklch(0.40 0.02 200)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges && !existingMod}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      hasChanges || existingMod
                        ? "oklch(0.50 0.12 175)"
                        : "oklch(0.80 0.04 175)",
                    color: "white",
                    boxShadow:
                      hasChanges || existingMod
                        ? "0 4px 12px oklch(0.50 0.12 175 / 0.30)"
                        : "none",
                  }}
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
