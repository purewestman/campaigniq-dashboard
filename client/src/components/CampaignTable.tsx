/*
 * Partner SE Journey Compliance Table — "Soft Terrain" design
 * Shows partners with SE compliance, gap counts, course progress, status badges
 * Sortable columns, alternating warm rows, expandable detail rows
 * Accepts filtered partners and filter controls from parent
 */

import React from "react";
import { motion } from "framer-motion";
import { type Partner, type ComplianceFilter } from "@/lib/data";
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { useState } from "react";

type SortKey = "name" | "seGap" | "compliantSEs" | "spSEs" | "tspSEs";

const statusConfig: Record<
  Partner["status"],
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  compliant: {
    label: "Compliant",
    bg: "oklch(0.60 0.12 175 / 0.10)",
    color: "oklch(0.45 0.12 175)",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partial",
    bg: "oklch(0.75 0.14 75 / 0.12)",
    color: "oklch(0.58 0.14 75)",
    icon: Clock,
  },
  "high-gap": {
    label: "High Gap",
    bg: "oklch(0.62 0.19 15 / 0.10)",
    color: "oklch(0.50 0.19 15)",
    icon: XCircle,
  },
};

function GapBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-16 h-1.5 rounded-full overflow-hidden"
        style={{ background: "oklch(0.93 0.008 85)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background:
              pct > 60
                ? "oklch(0.62 0.19 15)"
                : pct > 30
                ? "oklch(0.75 0.14 75)"
                : "oklch(0.60 0.12 175)",
          }}
        />
      </div>
      <span className="text-[12px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ComplianceIndicator({ compliant }: { compliant: number }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{
            background:
              i < compliant
                ? "oklch(0.60 0.12 175 / 0.15)"
                : "oklch(0.93 0.008 85)",
            color:
              i < compliant
                ? "oklch(0.45 0.12 175)"
                : "oklch(0.75 0.02 55)",
          }}
        >
          {i < compliant ? "✓" : "·"}
        </div>
      ))}
    </div>
  );
}

function ExpandedRow({ partner }: { partner: Partner }) {
  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
    >
      <td colSpan={8} className="px-6 py-4" style={{ background: "oklch(0.97 0.01 85)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Gap Type
            </p>
            <p className="text-[13px] text-foreground font-medium">{partner.gapType}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Recommended Action
            </p>
            <p className="text-[13px] text-foreground leading-relaxed">{partner.action}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Target Contacts
            </p>
            <div className="flex gap-3">
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
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
              Course Progress
            </p>
            <div className="flex gap-3">
              {[
                { label: "Simply Pure", val: partner.spSEs },
                { label: "TSP FY27", val: partner.tspSEs },
                { label: "Overlap", val: partner.compliantSEs },
              ].map((g) => (
                <span
                  key={g.label}
                  className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    background: g.val > 0 ? "oklch(0.60 0.12 175 / 0.08)" : "oklch(0.62 0.19 15 / 0.08)",
                    color: g.val > 0 ? "oklch(0.45 0.12 175)" : "oklch(0.50 0.19 15)",
                  }}
                >
                  {g.label}: {g.val}
                </span>
              ))}
            </div>
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
  const [sortKey, setSortKey] = useState<SortKey>("seGap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const maxGap = Math.max(...partners.map((p) => p.seGap), 1);

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
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Count statuses in the current filtered set
  const filteredStatusCounts = {
    compliant: partners.filter((p) => p.status === "compliant").length,
    partial: partners.filter((p) => p.status === "partial").length,
    "high-gap": partners.filter((p) => p.status === "high-gap").length,
  };

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
          className={`w-3 h-3 ${
            sortKey === sortKeyName ? "opacity-100" : "opacity-30"
          }`}
        />
      </span>
    </th>
  );

  const filterButtons: { key: ComplianceFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "compliant", label: "Compliant" },
    { key: "partial", label: "Partial" },
    { key: "high-gap", label: "High Gap" },
  ];

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
            <h3 className="text-[15px] font-bold text-foreground">Partner SE Compliance</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {partners.length} partner{partners.length !== 1 ? "s" : ""} — click a row to see details
            </p>
          </div>

          {/* Filter pill buttons */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            {filterButtons.map((btn) => {
              const isActive = activeFilter === btn.key;
              const count =
                btn.key === "all"
                  ? null
                  : filteredStatusCounts[btn.key as keyof typeof filteredStatusCounts];

              return (
                <button
                  key={btn.key}
                  onClick={() => onFilterChange(btn.key)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive
                      ? btn.key === "compliant"
                        ? "oklch(0.60 0.12 175 / 0.15)"
                        : btn.key === "partial"
                        ? "oklch(0.75 0.14 75 / 0.15)"
                        : btn.key === "high-gap"
                        ? "oklch(0.62 0.19 15 / 0.15)"
                        : "oklch(0.22 0.02 200 / 0.10)"
                      : "transparent",
                    color: isActive
                      ? btn.key === "compliant"
                        ? "oklch(0.45 0.12 175)"
                        : btn.key === "partial"
                        ? "oklch(0.58 0.14 75)"
                        : btn.key === "high-gap"
                        ? "oklch(0.50 0.19 15)"
                        : "oklch(0.22 0.02 200)"
                      : "oklch(0.55 0.02 55)",
                    border: isActive ? "1px solid currentColor" : "1px solid transparent",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {btn.label}
                  {count !== null && isActive && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
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
                Status
              </th>
              <SortHeader label="SE Gap" sortKeyName="seGap" align="right" />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Compliance
              </th>
              <SortHeader label="SP SEs" sortKeyName="spSEs" align="right" />
              <SortHeader label="TSP SEs" sortKeyName="tspSEs" align="right" />
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((partner, i) => {
                const status = statusConfig[partner.status];
                const StatusIcon = status.icon;
                const isExpanded = expandedId === partner.id;

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
                          style={{ background: status.bg, color: status.color }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="text-[13px] font-bold"
                          style={{
                            color:
                              partner.seGap === 0
                                ? "oklch(0.48 0.12 175)"
                                : partner.seGap <= 2
                                ? "oklch(0.55 0.02 55)"
                                : "oklch(0.50 0.19 15)",
                          }}
                        >
                          {partner.seGap}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ComplianceIndicator compliant={partner.compliantSEs} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-semibold text-foreground">
                          {partner.spSEs}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] text-foreground">
                          {partner.tspSEs}
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
