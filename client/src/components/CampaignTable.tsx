/*
 * Campaign Comparison Table — "Soft Terrain" design
 * Alternating warm-toned rows, pill-shaped status badges
 * Rounded container, soft shadows, organic spacing
 */

import { motion } from "framer-motion";
import { campaigns, type Campaign } from "@/lib/data";
import {
  ArrowUpDown,
  MoreHorizontal,
  Circle,
  Pause,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { useState } from "react";

type SortKey = "name" | "spent" | "impressions" | "ctr" | "roas";

const statusConfig: Record<
  Campaign["status"],
  { label: string; bg: string; color: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    bg: "oklch(0.60 0.12 175 / 0.10)",
    color: "oklch(0.48 0.12 175)",
    icon: Circle,
  },
  paused: {
    label: "Paused",
    bg: "oklch(0.75 0.14 75 / 0.12)",
    color: "oklch(0.62 0.14 75)",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    bg: "oklch(0.65 0.10 145 / 0.12)",
    color: "oklch(0.50 0.10 145)",
    icon: CheckCircle2,
  },
  draft: {
    label: "Draft",
    bg: "oklch(0.55 0.02 55 / 0.08)",
    color: "oklch(0.50 0.02 55)",
    icon: FileEdit,
  },
};

const channelBadgeColors: Record<string, { bg: string; color: string }> = {
  Social: { bg: "oklch(0.60 0.12 175 / 0.08)", color: "oklch(0.48 0.12 175)" },
  Search: { bg: "oklch(0.58 0.16 290 / 0.08)", color: "oklch(0.48 0.16 290)" },
  Email: { bg: "oklch(0.75 0.14 75 / 0.08)", color: "oklch(0.60 0.14 75)" },
};

function ProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isHigh = pct > 80;

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
            background: isHigh
              ? "oklch(0.62 0.19 15)"
              : "oklch(0.60 0.12 175)",
          }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground font-medium">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export default function CampaignTable() {
  const [sortKey, setSortKey] = useState<SortKey>("roas");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...campaigns].sort((a, b) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="terrain-card overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-foreground">Campaign Comparison</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {campaigns.length} campaigns across all channels
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["active", "paused", "completed", "draft"] as const).map((status) => {
              const config = statusConfig[status];
              const count = campaigns.filter((c) => c.status === status).length;
              return (
                <span
                  key={status}
                  className="text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ background: config.bg, color: config.color }}
                >
                  {count} {config.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "oklch(0.97 0.005 85)" }}>
              <SortHeader label="Campaign" sortKeyName="name" />
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Channel
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                Budget Used
              </th>
              <SortHeader label="Spent" sortKeyName="spent" align="right" />
              <SortHeader label="Impressions" sortKeyName="impressions" align="right" />
              <SortHeader label="CTR" sortKeyName="ctr" align="right" />
              <SortHeader label="ROAS" sortKeyName="roas" align="right" />
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((campaign, i) => {
              const status = statusConfig[campaign.status];
              const StatusIcon = status.icon;
              const channelColor = channelBadgeColors[campaign.channel] || channelBadgeColors.Social;

              return (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.5, duration: 0.3 }}
                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  style={
                    i % 2 === 0
                      ? { background: "oklch(0.99 0.003 85)" }
                      : { background: "oklch(0.975 0.006 85)" }
                  }
                >
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-foreground">
                      {campaign.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: channelColor.bg, color: channelColor.color }}
                    >
                      {campaign.channel}
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
                  <td className="px-4 py-3.5">
                    <ProgressBar spent={campaign.spent} budget={campaign.budget} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[13px] font-semibold text-foreground">
                      ${campaign.spent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[13px] text-foreground">
                      {campaign.impressions > 0
                        ? `${(campaign.impressions / 1000).toFixed(0)}k`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[13px] text-foreground">
                      {campaign.ctr > 0 ? `${campaign.ctr.toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        color:
                          campaign.roas >= 4
                            ? "oklch(0.48 0.12 175)"
                            : campaign.roas >= 3
                            ? "oklch(0.55 0.02 55)"
                            : "oklch(0.55 0.19 15)",
                      }}
                    >
                      {campaign.roas > 0 ? `${campaign.roas.toFixed(1)}x` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
