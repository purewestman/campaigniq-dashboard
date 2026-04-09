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
} from "@/lib/data";
import { useOverrides, type GapCategory, type GapOverride } from "@/contexts/OverrideContext";
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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SortKey = "name" | "totalGaps" | "enablementScore" | "totalExams";

interface PartnerTableProps {
  partners: Partner[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
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
};

/** Progress bar with override toggle for a single requirement category */
function RequirementBarWithOverride({
  label,
  category,
  obtained,
  required,
  partnerId,
}: {
  label: string;
  category: GapCategory;
  obtained: number;
  required: number;
  partnerId: number;
  partnerName: string;
  onNavigateToActivity?: (partner: string, course?: string, search?: string) => void;
}) {
  const { getOverride, addOverride, removeOverride } = useOverrides();
  const override = getOverride(partnerId, category);
  const gap = Math.max(0, required - obtained);
  const pct = required > 0 ? Math.min(100, Math.round((obtained / required) * 100)) : 100;
  const isComplete = obtained >= required || !!override;

  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  const handleMarkComplete = () => {
    addOverride({ partnerId, category, comment: comment.trim(), completedBy: "Admin" });
    setShowComment(false);
    setComment("");
    toast.success(`${label} marked as complete`);
  };

  const handleUndo = () => {
    removeOverride(partnerId, category);
    toast.info(`${label} override removed`);
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
                background: "oklch(0.62 0.19 15 / 0.10)",
                color: "oklch(0.50 0.19 15)",
              }}
            >
              {gap} gap{gap !== 1 ? "s" : ""}
            </span>
          )}
          {override && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              style={{
                background: "oklch(0.60 0.12 175 / 0.10)",
                color: "oklch(0.45 0.12 175)",
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
          style={{ background: "oklch(0.93 0.008 85)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${override ? 100 : pct}%`,
              background: isComplete
                ? "oklch(0.60 0.12 175)"
                : pct >= 50
                ? "oklch(0.75 0.14 75)"
                : "oklch(0.62 0.19 15)",
            }}
          />
        </div>
        
        {/* Navigation link to activity tracker */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToActivity?.(partnerName, undefined, label);
          }}
          className="text-[9px] font-medium px-2 py-1 rounded-lg transition-all hover:bg-black/10 active:scale-95 shrink-0"
          style={{
            background: "oklch(0.58 0.16 290 / 0.08)",
            color: "oklch(0.48 0.16 290)",
          }}
          title={`View ${label} details`}
        >
          View Individuals
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
              background: "oklch(0.60 0.12 175 / 0.08)",
              color: "oklch(0.45 0.12 175)",
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
              background: "oklch(0.62 0.19 15 / 0.08)",
              color: "oklch(0.50 0.19 15)",
            }}
            title="Undo override"
          >
            <Undo2 className="w-3 h-3" />
          </button>
        )}
      </div>

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
                background: "oklch(0.99 0.003 85)",
                borderColor: "oklch(0.92 0.01 85)",
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
                  background: "oklch(0.60 0.12 175 / 0.12)",
                  color: "oklch(0.45 0.12 175)",
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

/** Expanded detail row for a partner */
function ExpandedRow({ partner, onNavigateToActivity }: { partner: Partner, onNavigateToActivity?: (partner: string, course?: string, search?: string) => void }) {
  const { getPartnerOverrides } = useOverrides();
  const partnerOverrides = getPartnerOverrides(partner.id);
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
            background: "linear-gradient(135deg, oklch(0.97 0.01 85), oklch(0.98 0.005 200 / 0.3))",
            borderTop: "1px solid oklch(0.92 0.01 85)",
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
                    background: "oklch(0.60 0.12 175 / 0.10)",
                    color: "oklch(0.45 0.12 175)",
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
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Tech Pro"
                category="techPro"
                obtained={reqs.techPro.obtained}
                required={reqs.techPro.required}
                partnerId={partner.id}
                partnerName={partner.name}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Bootcamp"
                category="bootcamp"
                obtained={reqs.bootcamp.obtained}
                required={reqs.bootcamp.required}
                partnerId={partner.id}
                partnerName={partner.name}
                onNavigateToActivity={onNavigateToActivity}
              />
              <RequirementBarWithOverride
                label="Impl Spec"
                category="implSpec"
                obtained={reqs.implSpec.obtained}
                required={reqs.implSpec.required}
                partnerId={partner.id}
                partnerName={partner.name}
                onNavigateToActivity={onNavigateToActivity}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Overall:</span>
              <span
                className="text-[12px] font-bold"
                style={{
                  color: partner.enablementScore >= 80
                    ? "oklch(0.45 0.12 175)"
                    : partner.enablementScore >= 40
                    ? "oklch(0.58 0.14 75)"
                    : "oklch(0.50 0.19 15)",
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
            <p className="text-[13px] text-foreground leading-relaxed mb-3">{partner.action}</p>

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
                      background: "oklch(0.58 0.16 290 / 0.08)",
                      color: "oklch(0.48 0.16 290)",
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
                  style={{ background: "oklch(0.99 0.003 85)", borderColor: "oklch(0.93 0.01 85)" }}
                >
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className="text-[13px] font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Training Contacts (Consolidated P-T) */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Training Contacts (P-T)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Unique Customers", value: partner.businessMetrics.uniqueCustomers, icon: Users },
                { label: "Partner Installations", value: partner.businessMetrics.partnerDeliveredServices, icon: Shield },
                { label: "Sales Pro Contacts", value: partner.trainingContacts.salesProContacts, icon: Award },
                { label: "Tech Sales Pro Contacts", value: partner.trainingContacts.techSalesProContacts, icon: Award },
                { label: "SE Bootcamp Contacts", value: partner.trainingContacts.seBootcampContacts, icon: GraduationCap },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2 border"
                    style={{ background: "oklch(0.99 0.003 85)", borderColor: "oklch(0.93 0.01 85)" }}
                  >
                    <div className="flex items-center gap-2">
                      <ItemIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground">
                      {item.value !== null ? item.value : "\u2014"}
                    </span>
                  </div>
                );
              })}
            </div>
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
                      background: "oklch(0.99 0.003 85)",
                      borderColor: "oklch(0.93 0.01 85)",
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                      style={{ color: "oklch(0.48 0.16 290)" }}
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
                            background: "oklch(0.75 0.14 75 / 0.10)",
                            color: "oklch(0.55 0.14 75)",
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
                style={{ background: "oklch(0.96 0.005 85)" }}
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
  const { getOverrideCount } = useOverrides();

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
            <h3 className="text-[15px] font-bold text-foreground">Partner Certification Compliance</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {partners.length} partner{partners.length !== 1 ? "s" : ""}
              {searchQuery ? ` matching "${searchQuery}"` : ""} — click a row to see breakdown &amp; override gaps
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
                      ? tierStyle ? tierStyle.bg : "oklch(0.22 0.02 200 / 0.10)"
                      : "transparent",
                    color: isActive
                      ? tierStyle ? tierStyle.color : "oklch(0.22 0.02 200)"
                      : "oklch(0.55 0.02 55)",
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
            <tr style={{ background: "oklch(0.97 0.005 85)" }}>
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
                          ? { background: "oklch(0.99 0.003 85)" }
                          : { background: "oklch(0.975 0.006 85)" }
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
                                background: "oklch(0.60 0.12 175 / 0.10)",
                                color: "oklch(0.45 0.12 175)",
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
                                ? "oklch(0.45 0.12 175)"
                                : partner.enablementScore >= 40
                                ? "oklch(0.58 0.14 75)"
                                : "oklch(0.50 0.19 15)",
                          }}
                        >
                          {partner.enablementScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.93 0.008 85)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${partner.enablementScore}%`,
                                background:
                                  partner.enablementScore >= 80
                                    ? "oklch(0.60 0.12 175)"
                                    : partner.enablementScore >= 40
                                    ? "oklch(0.75 0.14 75)"
                                    : "oklch(0.62 0.19 15)",
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
                                ? "oklch(0.48 0.12 175)"
                                : partner.totalGaps <= 3
                                ? "oklch(0.55 0.02 55)"
                                : "oklch(0.50 0.19 15)",
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
                              background: "oklch(0.75 0.14 75 / 0.12)",
                              color: "oklch(0.55 0.14 75)",
                            }}
                          >
                            <Award className="w-3 h-3" />
                            {partner.totalExams}
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">—</span>
                        )}
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
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-[13px]">
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
