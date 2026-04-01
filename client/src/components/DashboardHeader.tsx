/*
 * Dashboard Header — "Soft Terrain" design
 * Partner Certification Readiness context
 * Uses the hero gradient background image subtly
 */

import { motion } from "framer-motion";
import { CalendarDays, Search, Bell } from "lucide-react";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663495817764/8buha8yVxFDm5taq5VEv6A/hero-gradient-bg-BWMxims4BWChqKmniByfwP.webp";

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ minHeight: 130 }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.45,
        }}
      />
      {/* Gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.975 0.008 85 / 0.85), oklch(0.94 0.02 145 / 0.70))",
        }}
      />

      <div className="relative z-10 px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Greeting */}
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Partner Certification Readiness
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Track partner certification gaps, training progress, and readiness across your ecosystem.
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{
              background: "oklch(0.99 0.003 85 / 0.80)",
              borderColor: "oklch(0.92 0.01 85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search partners..."
              className="bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none w-40"
            />
          </div>

          {/* Date range */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium text-foreground hover:bg-white/60 transition-colors"
            style={{
              background: "oklch(0.99 0.003 85 / 0.80)",
              borderColor: "oklch(0.92 0.01 85)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => toast("Feature coming soon", { description: "Date range picker is under development." })}
          >
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span>April 2026</span>
          </button>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-xl border hover:bg-white/60 transition-colors"
            style={{
              background: "oklch(0.99 0.003 85 / 0.80)",
              borderColor: "oklch(0.92 0.01 85)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => toast("No new notifications")}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ background: "oklch(0.62 0.19 15)" }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
