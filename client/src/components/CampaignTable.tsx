/*
 * Partner Tier Compliance Table — "Soft Terrain" design
 * FY27 Global Reseller Program — Elite Zone B
 * Shows obtained vs required for each enablement category
 * Sortable columns, expandable detail rows with exams
 */

import React from "react";
import { motion } from "framer-motion";
import { type Partner, type ComplianceFilter, ELITE_ZONE_B, TIER_CONFIG } from "@/lib/data";
import {
  ArrowUpDown,
  MoreHorizontal,
  Trophy,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type SortKey = "name" | "totalGaps" | "enablementScore" | "totalExams";

const tierIconMap: Record<string, React.ElementType> = {
  tier1: Trophy,
  tier2: Minus,
  tier3: AlertTriangle,
};

/** Progress bar showing obtained / required for a single category */
function RequirementBar({
  label,
  obtained,
  required,
}: {
  label: string;
  obtained: number;
  required: number;
}) {
  const pct = Math.min(100, Math.round((obtained / required) * 100));
  const met = obtained >= required;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-14 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.93 0.008 85)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: met ? "oklch(0.60 0.12 175)" : pct > 0 ? "oklch(0.75 0.14 75)" : "oklch(0.62 0.19 15 / 0.3)",
          }}
        />
      </div>
      <span
        className="text-[10px] font-semibold w-10 shrink-0"
        style={{ color: met ? "oklch(0.45 0.12 175)" : "oklch(0.55 0.02 55)" }}
      >
        {obtained}/{required}
      </span>
    </div>
  );
}

function ExpandedRow({ partner }: { partner: Partner }) {
  const reqs = partner.requirements;

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
    >
      <td colSpan={8} className="px-6 py-4" style={{ background: "oklch(0.97 0.01 85)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Obtained vs Required Breakdown */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
              Enablement Progress (Obtained / Required)
            </p>
            <div className="space-y-2.5">
              <RequirementBar label="Sales Pro" obtained={reqs.salesPro.obtained} required={reqs.salesPro.required} />
              <RequirementBar label="Tech Pro" obtained={reqs.techPro.obtained} required={reqs.techPro.required} />
              <RequirementBar label="Bootcamp" obtained={reqs.bootcamp.obtained} required={reqs.bootcamp.required} />
              <RequirementBar label="Impl Spec" obtained={reqs.implSpec.obtained} required={reqs.implSpec.required} />
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

interface PartnerTableProps {
  partners: Partner[];
  activeFilter: ComplianceFilter;
  onFilterChange: (filter: ComplianceFilter) => void;
}

export default function PartnerTable({ partners, activeFilter, onFilterChange }: PartnerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalGaps");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
    { key: "tier1", label: "Top Performers" },
    { key: "tier2", label: "Mid-Tier" },
    { key: "tier3", label: "Falling Behind" },
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
            <h3 className="text-[15px] font-bold text-foreground">Partner Tier Compliance</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {partners.length} partner{partners.length !== 1 ? "s" : ""} — click a row to see obtained vs required breakdown
            </p>
          </div>

          {/* Filter pill buttons */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            {filterButtons.map((btn) => {
              const isActive = activeFilter === btn.key;
              const tierStyle = btn.key !== "all" ? TIER_CONFIG[btn.key as keyof typeof TIER_CONFIG] : null;

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
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((partner, i) => {
                const tierStyle = TIER_CONFIG[partner.tier];
                const TierIcon = tierIconMap[partner.tier] || Minus;
                const isExpanded = expandedId === partner.id;
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
                        <span className="text-[13px] font-semibold text-foreground">
                          {partner.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: tierStyle.bg, color: tierStyle.color }}
                        >
                          <TierIcon className="w-3 h-3" />
                          {partner.tierLabel}
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
                            {totalObtained}/{ELITE_ZONE_B.total}
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
                    {isExpanded && <ExpandedRow key={`exp-${partner.id}`} partner={partner} />}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-[13px]">
                  No partners match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
