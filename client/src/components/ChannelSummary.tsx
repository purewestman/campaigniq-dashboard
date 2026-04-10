/*
 * Tier Compliance Summary Cards — "Soft Terrain" design
 * Four cards: Ambassador, Elite, Preferred, Authorized
 * Clickable to filter the entire dashboard by program tier
 * FY27 Global Reseller Program Tier Compliance — 4-tier architecture
 * Uses modifiedPartners so admin edits are reflected
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TIER_DEFINITIONS, PROGRAM_TIERS, type ComplianceFilter, type ProgramTier } from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import { Crown, Shield, Star, Award, X } from "lucide-react";

const tierIcons: Record<ProgramTier, React.ElementType> = {
  ambassador: Crown,
  elite: Shield,
  preferred: Star,
  authorized: Award,
};

interface ComplianceSummaryProps {
  activeFilter: ComplianceFilter;
  onFilterChange: (filter: ComplianceFilter) => void;
}

export default function ComplianceSummary({ activeFilter, onFilterChange }: ComplianceSummaryProps) {
  const { modifiedPartners } = useModifications();

  const tierDistribution = useMemo(() =>
    PROGRAM_TIERS.map((tierId) => {
      const def = TIER_DEFINITIONS[tierId];
      return {
        tier: tierId,
        label: def.label,
        count: modifiedPartners.filter((p) => p.programTier === tierId).length,
        description: def.description,
        compliantCount: modifiedPartners.filter(
          (p) => p.programTier === tierId && p.enablementCompliant
        ).length,
      };
    }),
    [modifiedPartners]
  );

  const totalPartners = modifiedPartners.length;

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
            background: "color-mix(in srgb, var(--color-ash-gray) 50%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-ash-gray) 30%, transparent)",
          }}
        >
          <span className="text-[12px] font-medium text-foreground">
            Filtering by:{" "}
            <span className="font-bold">
              {TIER_DEFINITIONS[activeFilter as ProgramTier]?.label || activeFilter}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tierDistribution.map((item, i) => {
          const Icon = tierIcons[item.tier];
          const style = TIER_DEFINITIONS[item.tier];
          const isActive = activeFilter === item.tier;

          return (
            <motion.button
              key={item.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
              onClick={() => handleClick(item.tier)}
              className="terrain-card p-4 relative overflow-hidden text-left transition-all duration-200 group"
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
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: style.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-foreground truncate">{item.label}</h4>
                    <p className="text-[9px] text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: style.iconBg,
                        color: style.iconColor,
                      }}
                    >
                      Active
                    </motion.span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Partners
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {item.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Compliant
                    </p>
                    <p className="text-xl font-bold" style={{ color: style.color }}>
                      {item.compliantCount}/{item.count}
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
