/*
 * Compliance Status Summary Cards — "Soft Terrain" design
 * Four cards: Compliant, Partial Progress, Need TSP, No Progress
 * Clickable to filter the entire dashboard by compliance tier
 */

import { motion } from "framer-motion";
import { gapDistribution, type ComplianceFilter } from "@/lib/data";
import { CheckCircle2, Clock, BookOpen, XCircle, X } from "lucide-react";

const gapIcons: Record<string, React.ElementType> = {
  Compliant: CheckCircle2,
  "Partial Progress": Clock,
  "Need TSP": BookOpen,
  "No Progress": XCircle,
};

const gapStyles: Record<string, { gradient: string; iconBg: string; iconColor: string; activeRing: string }> = {
  Compliant: {
    gradient: "linear-gradient(135deg, oklch(0.60 0.12 175 / 0.06), oklch(0.60 0.12 175 / 0.01))",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
    iconColor: "oklch(0.50 0.12 175)",
    activeRing: "oklch(0.55 0.12 175)",
  },
  "Partial Progress": {
    gradient: "linear-gradient(135deg, oklch(0.58 0.16 290 / 0.06), oklch(0.58 0.16 290 / 0.01))",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
    iconColor: "oklch(0.48 0.16 290)",
    activeRing: "oklch(0.53 0.16 290)",
  },
  "Need TSP": {
    gradient: "linear-gradient(135deg, oklch(0.75 0.14 75 / 0.06), oklch(0.75 0.14 75 / 0.01))",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
    iconColor: "oklch(0.60 0.14 75)",
    activeRing: "oklch(0.65 0.14 75)",
  },
  "No Progress": {
    gradient: "linear-gradient(135deg, oklch(0.62 0.19 15 / 0.06), oklch(0.62 0.19 15 / 0.01))",
    iconBg: "oklch(0.62 0.19 15 / 0.12)",
    iconColor: "oklch(0.52 0.19 15)",
    activeRing: "oklch(0.57 0.19 15)",
  },
};

// Map summary card categories to the ComplianceFilter values
const categoryToFilter: Record<string, ComplianceFilter> = {
  Compliant: "compliant",
  "Partial Progress": "partial",
  "Need TSP": "high-gap",
  "No Progress": "high-gap",
};

interface ComplianceSummaryProps {
  activeFilter: ComplianceFilter;
  onFilterChange: (filter: ComplianceFilter) => void;
}

export default function ComplianceSummary({ activeFilter, onFilterChange }: ComplianceSummaryProps) {
  const handleClick = (category: string) => {
    const targetFilter = categoryToFilter[category];
    // Toggle: if already active, reset to "all"
    if (activeFilter === targetFilter) {
      onFilterChange("all");
    } else {
      onFilterChange(targetFilter);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter indicator bar */}
      {activeFilter !== "all" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.97 0.015 200 / 0.5)",
            border: "1px solid oklch(0.90 0.02 200 / 0.3)",
          }}
        >
          <span className="text-[12px] font-medium text-foreground">
            Filtering by:{" "}
            <span className="font-bold capitalize">
              {activeFilter === "high-gap" ? "High Gap" : activeFilter}
            </span>
          </span>
          <button
            onClick={() => onFilterChange("all")}
            className="ml-auto flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg
              hover:bg-white/60 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {gapDistribution.map((gap, i) => {
          const Icon = gapIcons[gap.category] || CheckCircle2;
          const style = gapStyles[gap.category] || gapStyles.Compliant;
          const filterVal = categoryToFilter[gap.category];
          const isActive = activeFilter === filterVal;

          return (
            <motion.button
              key={gap.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
              onClick={() => handleClick(gap.category)}
              className="terrain-card p-5 relative overflow-hidden text-left transition-all duration-200 group"
              style={{
                outline: isActive ? `2px solid ${style.activeRing}` : "2px solid transparent",
                outlineOffset: "-1px",
                transform: isActive ? "scale(1.02)" : "scale(1)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                style={{
                  background: style.gradient,
                  opacity: isActive ? 1 : 0.6,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: style.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                  </div>
                  <h4 className="text-[14px] font-bold text-foreground">{gap.category}</h4>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: style.iconBg,
                        color: style.iconColor,
                      }}
                    >
                      Active
                    </motion.span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Partners
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {gap.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Of Total
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((gap.total / 22) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
