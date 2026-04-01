/*
 * Compliance Status Summary Cards — "Soft Terrain" design
 * Four cards: Compliant, Partial Progress, Need TSP, No Progress
 */

import { motion } from "framer-motion";
import { gapDistribution } from "@/lib/data";
import { CheckCircle2, Clock, BookOpen, XCircle } from "lucide-react";

const gapIcons: Record<string, React.ElementType> = {
  Compliant: CheckCircle2,
  "Partial Progress": Clock,
  "Need TSP": BookOpen,
  "No Progress": XCircle,
};

const gapStyles: Record<string, { gradient: string; iconBg: string; iconColor: string }> = {
  Compliant: {
    gradient: "linear-gradient(135deg, oklch(0.60 0.12 175 / 0.06), oklch(0.60 0.12 175 / 0.01))",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
    iconColor: "oklch(0.50 0.12 175)",
  },
  "Partial Progress": {
    gradient: "linear-gradient(135deg, oklch(0.58 0.16 290 / 0.06), oklch(0.58 0.16 290 / 0.01))",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
    iconColor: "oklch(0.48 0.16 290)",
  },
  "Need TSP": {
    gradient: "linear-gradient(135deg, oklch(0.75 0.14 75 / 0.06), oklch(0.75 0.14 75 / 0.01))",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
    iconColor: "oklch(0.60 0.14 75)",
  },
  "No Progress": {
    gradient: "linear-gradient(135deg, oklch(0.62 0.19 15 / 0.06), oklch(0.62 0.19 15 / 0.01))",
    iconBg: "oklch(0.62 0.19 15 / 0.12)",
    iconColor: "oklch(0.52 0.19 15)",
  },
};

export default function GapTypeSummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {gapDistribution.map((gap, i) => {
        const Icon = gapIcons[gap.category] || CheckCircle2;
        const style = gapStyles[gap.category] || gapStyles.Compliant;

        return (
          <motion.div
            key={gap.category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
            className="terrain-card p-5 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: style.gradient }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: style.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                </div>
                <h4 className="text-[14px] font-bold text-foreground">{gap.category}</h4>
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
          </motion.div>
        );
      })}
    </div>
  );
}
