/*
 * Dashboard Header — "Soft Terrain" design
 * FY27 Global Reseller Tier Compliance
 * Controlled search input for real-time partner filtering
 */

import { motion } from "framer-motion";
import { CalendarDays, Search, Bell, X, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import PureDividerBackground from "./PureDividerBackground";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardHeader({ searchQuery, onSearchChange }: DashboardHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, changePassword } = useAuth();

  const handlePasswordChange = () => {
    const newPass = prompt("Enter a new password for all users in your domain:");
    if (newPass) {
      if (changePassword(newPass)) {
        toast.success("Domain password updated successfully!");
      } else {
        toast.error("Failed to update password.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ minHeight: 130 }}
    >
      <PureDividerBackground />

      <div className="relative z-10 px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Greeting & Logo */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center shrink-0">
             <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
               <path fillRule="evenodd" clipRule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="var(--color-pure-orange)"/>
             </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-cloud-white)] tracking-tight">
              Everpure Certification Compliance
            </h2>
            <p className="text-[13px] text-[var(--color-cloud-white)] opacity-90 mt-1">
              Track SE Journey compliance across 19 partners: Roadmap score, enablement gaps, and certification status.
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {user?.role === 'partner' && (
            <button
              onClick={handlePasswordChange}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-medium text-foreground hover:bg-white/60 transition-colors"
              style={{
                background: "color-mix(in srgb, var(--color-cloud-white) 80%, transparent)",
                borderColor: "var(--color-stone-gray)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span>Change Password</span>
            </button>
          )}
          {/* Search — controlled */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200"
            style={{
              background: searchQuery
                ? "color-mix(in srgb, var(--color-cloud-white) 95%, transparent)"
                : "color-mix(in srgb, var(--color-cloud-white) 80%, transparent)",
              borderColor: searchQuery
                ? "color-mix(in srgb, var(--color-pure-orange) 40%, transparent)"
                : "var(--color-stone-gray)",
              backdropFilter: "blur(8px)",
              boxShadow: searchQuery
                ? "0 0 0 3px color-mix(in srgb, var(--color-pure-orange) 8%, transparent)"
                : "none",
            }}
          >
            <Search
              className="w-4 h-4 shrink-0 transition-colors"
              style={{
                color: searchQuery ? "var(--color-pure-orange)" : "var(--color-walnut-brown)",
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
              background: "color-mix(in srgb, var(--color-cloud-white) 80%, transparent)",
              borderColor: "var(--color-stone-gray)",
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
              background: "color-mix(in srgb, var(--color-cloud-white) 80%, transparent)",
              borderColor: "var(--color-stone-gray)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => toast("No new notifications")}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ background: "var(--color-cinnamon-brown)" }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
