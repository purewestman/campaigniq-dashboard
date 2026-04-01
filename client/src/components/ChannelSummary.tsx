/*
 * Tier Compliance Summary Cards — "Soft Terrain" design
 * Three cards: Top Performers, Mid-Tier, Falling Behind
 * Clickable to filter the entire dashboard by tier
 * FY27 Global Reseller Program Tier Compliance
 */

import { motion } from "framer-motion";
import { tierDistribution, partners, TIER_CONFIG, type ComplianceFilter } from "@/lib/data";
import { Trophy, Minus, AlertTriangle, X } from "lucide-react";

const tierIcons: Record<string, React.ElementType> = {
  tier1: Trophy,
  tier2: Minus,
  tier3: AlertTriangle,
};

interface ComplianceSummaryProps {
  activeFilter: ComplianceFilter;
  onFilterChange: (filter: ComplianceFilter) => void;
}

export default function ComplianceSummary({ activeFilter, onFilterChange }: ComplianceSummaryProps) {
  const totalPartners = partners.length;

  const handleClick = (tier: ComplianceFilter) => {
    if (activeFilter === tier) {
      onFilterChange("all");
    } else {
      onFilterChange(tier);
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
            <span className="font-bold">
              {TIER_CONFIG[activeFilter as keyof typeof TIER_CONFIG]?.label || activeFilter}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tierDistribution.map((item, i) => {
          const Icon = tierIcons[item.tier] || Minus;
          const style = TIER_CONFIG[item.tier];
          const isActive = activeFilter === item.tier;

          return (
            <motion.button
              key={item.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
              onClick={() => handleClick(item.tier)}
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
                  <div>
                    <h4 className="text-[14px] font-bold text-foreground">{item.label}</h4>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
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
                      {item.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Of Total
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPartners > 0 ? Math.round((item.count / totalPartners) * 100) : 0}%
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
