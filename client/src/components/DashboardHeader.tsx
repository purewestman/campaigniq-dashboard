/*
 * Dashboard Header — "Soft Terrain" design
 * FY27 Global Reseller Tier Compliance
 * Controlled search input for real-time partner filtering
 */

import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Search, Bell, X, Lock, FileClock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState, useEffect, useMemo } from "react";
import PureDividerBackground from "./PureDividerBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import { loadCommitments } from "@/components/CommitmentTracker";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavChange?: (id: string) => void;
}

interface NotificationItem {
  id: string;
  type: "modification" | "override" | "asp" | "commitment";
  partnerId: number;
  partnerName: string;
  message: string;
  timestamp: number;
  dateStr: string;
}

export default function DashboardHeader({ searchQuery, onSearchChange, onNavChange }: DashboardHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, changePassword } = useAuth();
  const { allModificationHistory, modifiedPartners } = useModifications();
  const { overrides, aspOverrides } = useOverrides();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedAt, setClearedAt] = useState<number>(() => {
    const stored = localStorage.getItem("campaigniq-notifications-cleared");
    return stored ? parseInt(stored) : 0;
  });

  // Unify Data Streams
  const notifications = useMemo(() => {
    let items: NotificationItem[] = [];

    // 1. Partner Score/Tier Modifications
    allModificationHistory.forEach(mod => {
      const partner = modifiedPartners.find(p => p.id === mod.partnerId);
      if (!partner) return;
      if (user?.role === "partner" && partner.name !== user.name) return; // Restrict visibility
      
      const ts = new Date(mod.modifiedAt).getTime();
      items.push({
        id: `mod-${mod.partnerId}-${ts}`,
        type: "modification",
        partnerId: mod.partnerId,
        partnerName: partner.name,
        message: mod.comment ? `Tier/Score Adjusted: "${mod.comment}"` : "Partner metrics adjusted manually",
        timestamp: ts,
        dateStr: new Date(mod.modifiedAt).toLocaleString()
      });
    });

    // 2. Gap Overrides
    overrides.forEach(ov => {
      const partner = modifiedPartners.find(p => p.id === ov.partnerId);
      if (!partner) return;
      if (user?.role === "partner" && partner.name !== user.name) return;
      
      const ts = new Date(ov.completedAt).getTime();
      items.push({
        id: `ov-${ov.partnerId}-${ov.category}-${ts}`,
        type: "override",
        partnerId: ov.partnerId,
        partnerName: partner.name,
        message: `Requirement Overridden: ${ov.category} by ${ov.completedBy}`,
        timestamp: ts,
        dateStr: new Date(ov.completedAt).toLocaleString()
      });
    });

    // 3. ASP Manual Approvals
    aspOverrides.forEach(asp => {
      const partner = modifiedPartners.find(p => p.id === asp.partnerId);
      if (!partner) return;
      if (user?.role === "partner" && partner.name !== user.name) return;
      
      const ts = new Date(asp.approvedAt).getTime();
      items.push({
        id: `asp-${asp.partnerId}-${ts}`,
        type: "asp",
        partnerId: asp.partnerId,
        partnerName: partner.name,
        message: "Manually Approved for ASP Tier status",
        timestamp: ts,
        dateStr: new Date(asp.approvedAt).toLocaleString()
      });
    });

    // 4. Roadmap Commitments
    const commitments = loadCommitments();
    commitments.forEach(c => {
      if (user?.role === "partner" && c.partnerName !== user.name) return;
      const ts = new Date(c.submittedAt).getTime();
      items.push({
        id: `com-${c.partnerId}-${ts}`,
        type: "commitment",
        partnerId: c.partnerId,
        partnerName: c.partnerName,
        message: `Submitted a roadmap with ${c.commitments.length} tracked milestone(s)`,
        timestamp: ts,
        dateStr: new Date(c.submittedAt).toLocaleString()
      });
    });

    // Sort descending by time
    items = items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [allModificationHistory, overrides, aspOverrides, modifiedPartners, user]);

  const unreadCount = notifications.filter(n => n.timestamp > clearedAt).length;

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    setClearedAt(now);
    localStorage.setItem("campaigniq-notifications-cleared", now.toString());
    toast.success("All notifications cleared");
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setShowNotifications(false);
    if (!onNavChange) return;

    if (item.type === "modification" || item.type === "override") {
      onSearchChange(item.partnerName); // Search the partner
      onNavChange("partners");
    } else if (item.type === "asp") {
      onSearchChange(item.partnerName);
      onNavChange("asp");
    } else if (item.type === "commitment") {
      onNavChange("planning");
    }
  };

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
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-lg border border-white/10 shrink-0">
                {user?.role === 'admin' ? "System Administrator" : user?.name || user?.domain}
              </span>
            </div>
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
                        <Bell className="w-4 h-4 text-pure-orange" />
                        Notification Center
                      </h3>
                      <button 
                        onClick={handleClearAll}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All
                      </button>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto w-full p-2 space-y-1">
                      {notifications.filter(n => n.timestamp > clearedAt).length === 0 ? (
                        <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-100">
                            <Bell className="w-4 h-4 text-slate-300" />
                          </div>
                          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">You're caught up!</p>
                          <p className="text-[11px] text-slate-400 mt-1">No new notifications since last cleared.</p>
                        </div>
                      ) : (
                        notifications.filter(n => n.timestamp > clearedAt).map((n) => (
                          <button 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            className="w-full text-left p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors flex flex-col gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-xs font-bold text-slate-800 truncate pr-2 flex-1">{n.partnerName}</span>
                              <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${
                                n.type === 'commitment' ? 'bg-sky-50 text-sky-600' :
                                n.type === 'override' ? 'bg-indigo-50 text-indigo-600' :
                                n.type === 'asp' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-orange-50 text-orange-600'
                              }`}>
                                {n.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 leading-snug break-words">
                              {n.message}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                              {n.dateStr}
                            </span>
                          </button>
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
