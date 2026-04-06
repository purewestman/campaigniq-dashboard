/*
 * Dashboard Header — "Soft Terrain" design
 * FY27 Global Reseller Tier Compliance
 * Controlled search input for real-time partner filtering
 */

import { motion } from "framer-motion";
import { CalendarDays, Search, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663495817764/8buha8yVxFDm5taq5VEv6A/hero-gradient-bg-BWMxims4BWChqKmniByfwP.webp";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardHeader({ searchQuery, onSearchChange }: DashboardHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
            FY27 Global Reseller Tier Compliance
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Elite Zone B enablement: track obtained vs required across Sales Pro, Tech Pro, Bootcamp, and Implementation Specialist.
          </p>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Search — controlled */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200"
            style={{
              background: searchQuery
                ? "oklch(0.99 0.003 85 / 0.95)"
                : "oklch(0.99 0.003 85 / 0.80)",
              borderColor: searchQuery
                ? "oklch(0.60 0.12 175 / 0.4)"
                : "oklch(0.92 0.01 85)",
              backdropFilter: "blur(8px)",
              boxShadow: searchQuery
                ? "0 0 0 3px oklch(0.60 0.12 175 / 0.08)"
                : "none",
            }}
          >
            <Search
              className="w-4 h-4 shrink-0 transition-colors"
              style={{
                color: searchQuery ? "oklch(0.50 0.12 175)" : "oklch(0.55 0.02 55)",
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search partners..."
              className="bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none w-44"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange("");
                  inputRef.current?.focus();
                }}
                className="p-0.5 rounded-md hover:bg-black/5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
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
            <span>FY27 Q1</span>
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
