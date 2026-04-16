/*
 * Dashboard Header — "Soft Terrain" design
 * FY27 Global Reseller Tier Compliance
 * Controlled search input for real-time partner filtering
 */

import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Search, Bell, X, Lock, FileClock, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import PureDividerBackground from "./PureDividerBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import { useTour } from "@/contexts/TourContext";
import { loadCommitments } from "@/components/CommitmentTracker";
import { loadSignedExports } from "@/lib/signedExports";

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
  const { startTour } = useTour();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedAt, setClearedAt] = useState<number>(() => {
    const stored = localStorage.getItem("campaigniq-notifications-cleared");
    return stored ? parseInt(stored) : 0;
  });

  // Flash help button on first mount
  const [helpPulse, setHelpPulse] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHelpPulse(true), 800);
    const offTimer = setTimeout(() => setHelpPulse(false), 5000);
    return () => { clearTimeout(timer); clearTimeout(offTimer); };
  }, []);

  // Live-reload signed exports for notification stream
  const [signedExportsData, setSignedExportsData] = useState(() => loadSignedExports());
  useEffect(() => {
    const reload = () => setSignedExportsData(loadSignedExports());
    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);

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

    // 5. Signed PPTX Exports (submissions, approvals, comments)
    signedExportsData.forEach(ex => {
      // RLS: partner only sees their own
      if (user?.role !== 'Global Admin' && user?.name && ex.partnerName !== user.name && !ex.isAllPartners) return;

      // Submission notification
      items.push({
        id: `se-sub-${ex.id}`,
        type: "commitment" as const,
        partnerId: 0,
        partnerName: ex.partnerName,
        message: `📄 Signed PPTX export submitted by ${ex.signedBy} — Commitment date: ${ex.commitmentDate}`,
        timestamp: ex.exportedAt,
        dateStr: new Date(ex.exportedAt).toLocaleString(),
      });

      // Status change notification if not pending
      if (ex.status !== 'pending_review') {
        const statusLabel = ex.status === 'approved' ? '✅ Approved' : '🔄 Changes Requested';
        items.push({
          id: `se-status-${ex.id}`,
          type: "asp" as const,
          partnerId: 0,
          partnerName: ex.partnerName,
          message: `${statusLabel} by pureuser on signed PPTX export for ${ex.partnerName}`,
          timestamp: ex.exportedAt + 1,
          dateStr: new Date(ex.exportedAt).toLocaleString(),
        });
      }

      // Comment notifications
      ex.comments.forEach(c => {
        if (user?.role !== 'Global Admin' && c.role === 'Global Admin') return; // partner already sees admin notes
        items.push({
          id: `se-comment-${c.id}`,
          type: "modification" as const,
          partnerId: 0,
          partnerName: ex.partnerName,
          message: `💬 ${c.author} (${c.role}) commented on ${ex.partnerName}: "${c.text.slice(0, 60)}${c.text.length > 60 ? '…' : ''}"`,
          timestamp: c.timestamp,
          dateStr: new Date(c.timestamp).toLocaleString(),
        });
      });
    });

    // Sort descending by time
    items = items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [allModificationHistory, overrides, aspOverrides, modifiedPartners, user, signedExportsData]);

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

  // ── Tour step definitions ──────────────────────────────────────────
  const buildTourSteps = useCallback(() => [
    // ── Step 1: tier selector ───────────────────────────────────────
    {
      target: ".tour-step-1",
      title: "Step 1 — Select a Target Tier",
      content: "Start by reviewing your current partner tier. Watch as the tour changes the target tier to 'Elite' so you can see how the enablement gap requirement updates.",
      placement: "bottom" as const,
      autoAction: async ({ delay, selectValue }: any) => {
        selectValue(".tour-step-1", "elite");
        await delay(800);
      },
    },
    // ── Step 2: expand partner row ──────────────────────────────────────────
    {
      target: ".tour-step-2",
      title: "Step 2 — Expand a Partner Row",
      content: "Click any partner row to reveal the full enablement gap breakdown below it. Watch as the tour opens the first partner row now.",
      placement: "top" as const,
      // Give step 1's tier change time to settle first
      preAction: async () => {
        await new Promise(r => setTimeout(r, 600));
      },
      autoAction: async ({ delay }: any) => {
        // Dispatch a proper MouseEvent — .click() doesn't trigger React synthetic events on motion.tr
        const row = document.querySelector<HTMLElement>(".tour-step-2");
        if (row) {
          row.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        }
        await delay(1200);
      },
    },
    // ── Step 2b: click a gap row chevron to reveal the email picker ─────────
    {
      target: ".tour-step-gap-toggle",
      title: "Step 2b — Open a Gap's Assignee Panel",
      content: "Each gap metric has a small chevron (›). Click it to reveal the employee assignment panel for that certification gap. Watch as the tour opens one now.",
      placement: "top" as const,
      // Wait for partner row expand animation to finish
      preAction: async () => {
        await new Promise(r => setTimeout(r, 1000));
      },
      autoAction: async ({ delay }: any) => {
        const btn = document.querySelector<HTMLElement>(".tour-step-gap-toggle");
        if (btn) {
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        }
        await delay(1000);
      },
    },
    // ── Step 3: gap dropdown ─────────────────────────────────────────────
    {
      target: ".tour-step-gap-select",
      title: "Step 3 — Assign an Employee to a Gap",
      content: "For each enablement gap, use this dropdown to pick a qualified domain user who will complete the certification. Watch as the tour selects a sample user then clicks Add.",
      placement: "top" as const,
      // Wait for the expanded row animation to finish before trying to find the select
      preAction: async () => {
        await new Promise(r => setTimeout(r, 800));
      },
      autoAction: async ({ delay, selectValue, clickEl }: any) => {
        // Safely check if the dropdown has real options to select
        const sel = document.querySelector<HTMLSelectElement>(".tour-step-gap-select");
        if (sel && sel.options.length > 1) {
          await delay(500);
          selectValue(".tour-step-gap-select", sel.options[1]?.value ?? "");
          await delay(900);
          // Click the + Add button sitting beside the select
          clickEl(".tour-step-gap-select + button");
          await delay(800);
        }
        // If no options: gracefully do nothing and let user click Next
      },
    },
    // ── Step 4: Submit to Enablement Plan ────────────────────────────
    {
      target: ".tour-step-3",
      title: "Step 4 — Submit to the Enablement Plan",
      content: "Once all gaps have an assignee, click 'Submit to Enablement Plan'. This locks in the plan and moves it to the 12-month roadmap automatically.",
      placement: "top" as const,
    },
    // ── Step 5: navigate enablement + expand card ──────────────────────
    {
      target: ".tour-expand-card",
      title: "Step 5 — Open the 12-Month Roadmap",
      content: "Go to the Enablement Plans tab and click the '12-Month Enablement Roadmap' toggle on any partner card to reveal the full timeline. Watch as the tour opens the first card now.",
      placement: "bottom" as const,
      preAction: async () => {
        if (onNavChange) onNavChange("enablement");
        // Wait longer for the page to mount fully
        await new Promise(r => setTimeout(r, 1200));
      },
      autoAction: async ({ delay, clickEl }: any) => {
        clickEl(".tour-expand-card");
        await delay(1200);
      },
    },
    // ── Step 6: assignee picker inside timeline ────────────────────────
    {
      target: ".tour-step-4",
      title: "Step 6 — Assign Users to Timeline Items",
      content: "Each milestone in the 12-month plan has an assignee field. Watch as the tour types a sample email address to show you how it works.",
      placement: "bottom" as const,
      autoAction: async ({ delay, typeInto }: any) => {
        await typeInto(".tour-step-4", "jane.smith@partner.com");
        await delay(600);
      },
    },
    // ── Step 7: export PPTX ──────────────────────────────────────────
    {
      target: ".tour-step-5",
      title: "Step 7 — Export Plan as PowerPoint",
      content: "When the plan is complete, click 'Export PPTX' to download a branded PowerPoint presentation ready for your regional enablement review.",
      placement: "bottom" as const,
    },
  ], [onNavChange]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("campaigniq_has_seen_tour");
    if (!hasSeenTour && user) {
      localStorage.setItem("campaigniq_has_seen_tour", "true");
      setTimeout(() => startTour(buildTourSteps()), 900);
    }
  }, [startTour, user, buildTourSteps]);

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
          {/* Help button – white bg so it pops against the dark/orange header */}
          <div className="relative">
            <button
              title="Take a guided walkthrough"
              onClick={() => {
                setHelpPulse(false);
                if (onNavChange) onNavChange("overview");
                setTimeout(() => startTour(buildTourSteps()), 400);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-bold transition-all hover:scale-105 active:scale-95 shadow-md ${
                helpPulse ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : ''
              }`}
              style={{
                background: helpPulse ? "#ffffff" : "rgba(255,255,255,0.95)",
                borderColor: helpPulse ? "var(--color-basil-green)" : "rgba(255,255,255,0.6)",
                color: "var(--color-basil-green)",
                backdropFilter: "blur(8px)",
                boxShadow: helpPulse ? "0 0 0 4px rgba(82,160,120,0.35), 0 4px 16px rgba(0,0,0,0.15)" : undefined,
                transition: "all 0.3s ease",
              }}
            >
              <HelpCircle className={`w-4 h-4 ${helpPulse ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline font-black">Help</span>
            </button>

            {/* Callout tooltip */}
            <AnimatePresence>
              {helpPulse && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 280, damping: 22 }}
                  className="absolute right-0 top-[calc(100%+14px)] z-50 w-80"
                >
                  {/* Arrow */}
                  <div
                    className="absolute -top-2 right-7 w-4 h-4 rotate-45 rounded-sm"
                    style={{ background: "var(--color-ash-gray)" }}
                  />
                  <div
                    className="rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: "var(--color-ash-gray)" }}
                  >
                    {/* Body */}
                    <div className="px-5 pt-5 pb-4">
                      <p className="font-black text-[15px] text-white mb-1.5 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-white/70 shrink-0" />
                        Welcome to the Dashboard!
                      </p>
                      <p className="text-white/80 text-[13px] leading-relaxed">
                        Not sure where to start? Click <strong className="text-white">Start Tour</strong> for a guided walkthrough of every feature — takes under 2 minutes.
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 px-5 pb-5">
                      <button
                        onClick={() => {
                          setHelpPulse(false);
                          if (onNavChange) onNavChange("overview");
                          setTimeout(() => startTour(buildTourSteps()), 400);
                        }}
                        className="flex-1 py-2 rounded-xl bg-[var(--color-pure-orange)] hover:bg-orange-500 text-white text-[13px] font-black transition-all active:scale-95 shadow-lg"
                      >
                        Start Tour →
                      </button>
                      <button
                        onClick={() => setHelpPulse(false)}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[13px] font-semibold transition-all border border-white/10"
                      >
                        Later
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
