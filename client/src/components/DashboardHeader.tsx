/*
 * Dashboard Header — "Soft Terrain" design
 * FY27 Global Reseller Tier Compliance
 * Controlled search input for real-time partner filtering
 */

import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Search, Bell, X, Lock, FileClock } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import PureDividerBackground from "./PureDividerBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useModifications } from "@/contexts/ModificationContext";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardHeader({ searchQuery, onSearchChange }: DashboardHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, changePassword } = useAuth();
  const { allModificationHistory } = useModifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const latestHistory = allModificationHistory.slice(-5).reverse();

  // Reset unread count when opening notifications
  useEffect(() => {
    if (showNotifications) setUnreadCount(0);
  }, [showNotifications]);

  // Increment unread count when history changes
  useEffect(() => {
    if (allModificationHistory.length > 0 && !showNotifications) {
      setUnreadCount(prev => prev + 1);
    }
  }, [allModificationHistory]);

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
             <svg width="40" height="40" viewBox="0 0 88.7 79.6" fill="none">
               <path fillRule="evenodd" clipRule="evenodd" d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="var(--color-pure-orange)"/>
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
          <div className="relative">
            <button
              className="relative p-2.5 rounded-xl border hover:bg-white/60 transition-colors"
              style={{
                background: "color-mix(in srgb, var(--color-cloud-white) 80%, transparent)",
                borderColor: showNotifications ? "var(--color-pure-orange)" : "var(--color-stone-gray)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: "var(--color-cinnamon-brown)" }}
                />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  >
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileClock className="w-4 h-4 text-pure-orange" />
                        Changelog
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">{allModificationHistory.length} total edits</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto w-full p-2 space-y-1">
                      {latestHistory.length === 0 ? (
                        <p className="text-[12px] text-slate-500 italic p-4 text-center">No recent changes.</p>
                      ) : (
                        latestHistory.map((mod, idx) => (
                          <div key={`${mod.partnerId}-${idx}`} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-colors flex flex-col gap-1.5 cursor-default">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-slate-700">Partner ID: {mod.partnerId}</span>
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">Modified</span>
                            </div>
                            <span className="text-[11px] text-slate-500 leading-snug break-words">
                              {mod.comment ? `"${mod.comment}"` : "Manual email or tier adjustment made."}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(mod.modifiedAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
