/*
 * Sidebar — "Soft Terrain" design
 * Dark teal-slate sidebar with FY27 Tier Compliance navigation
 * All nav items are now functional — no more "coming soon" toasts
 */

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Award,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Route,
  Shield,
  TrendingUp,
  Activity,
  CalendarCheck,
  CalendarDays,
  LogOut,
  ClipboardList,
  Map,
} from "lucide-react";
import { navItems, partners } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { loadSignedExports } from "@/lib/signedExports";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  Award,
  FileBarChart,
  Settings,
  Route,
  Shield,
  TrendingUp,
  Activity,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Map,
};

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ activeNav, onNavChange, collapsed, onCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  
  // Count signed exports for Strategic Planning badge with RLS factored in
  const [{ pending, approved }, setExportCounts] = useState({ pending: 0, approved: 0 });

  useEffect(() => {
    const updateCounts = () => {
      const all = loadSignedExports();
      const visible = user?.role === 'Global Admin' 
        ? all 
        : all.filter(e => user?.name && (e.partnerName === user.name || e.isAllPartners));
      
      setExportCounts({
        pending: visible.filter(e => e.status === 'pending_review').length,
        approved: visible.filter(e => e.status === 'approved').length,
      });
    };
    
    updateCounts(); // Initial
    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, [user]);

  const dynamicNavItems = useMemo(() => {
    let domainPartner = null;
    if (user?.role !== 'Global Admin' && user?.domain) {
      domainPartner = partners.find(p => p.domain === user.domain);
    }

    let items = navItems;
    if (user?.role !== 'Global Admin' && user?.role !== 'Admin') {
      items = items.filter(item => item.id !== 'settings');
    }

    return items.map(item => {
      const newItem = { ...item };
      if (domainPartner) {
        if (item.id === "partners") {
          newItem.badge = 1;
        } else if (item.id === "certifications") {
          newItem.badge = domainPartner.totalExams;
        }
      }
      // Signed exports badge on Strategic Planning tab
      if (item.id === 'planning') {
        if (pending > 0) {
          newItem.exportCount = pending;
          newItem.exportColor = '#ef4444'; // Red
        } else if (approved > 0) {
          newItem.exportCount = approved;
          newItem.exportColor = '#10b981'; // Green
        }
      }
      return newItem;
    });
  }, [user, pending, approved]);
  
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: "var(--color-ash-gray)",
      }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
         <div className="flex items-center justify-center shrink-0">
           <svg width="28" height="28" viewBox="0 0 88.7 79.6" fill="none">
             <path fillRule="evenodd" clipRule="evenodd" d="M47.5,79.6H27.9c-4.1,0-7.8-2.2-9.9-5.7L1.5,45.5c-2-3.5-2-7.8,0-11.3L18,5.7C20,2.2,23.8,0,27.9,0h33c4.1,0,7.8,2.2,9.9,5.7l16.5,28.5c2,3.5,2,7.8,0,11.3L83,52.2c-2,3.4-5.8,5.6-9.8,5.6H53.5l10.7-18l-9.9-17.1H34.4l-9.9,17.1L47.5,79.6z" fill="var(--color-pure-orange)"/>
           </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <h1 className="text-[16px] font-bold text-white tracking-tight whitespace-nowrap">
                Everpure
              </h1>
              <p className="text-[10px] text-white/40 -mt-0.5 whitespace-nowrap">
                FY27 Tier Compliance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {dynamicNavItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = activeNav === item.id;
          
          let themeColor = "var(--color-pure-orange)";
          if (item.id === "training") themeColor = "var(--color-basil-green)";
          else if (item.id === "planning") themeColor = "var(--color-quartz-pink)";
          else if (item.id === "reports") themeColor = "var(--color-cinnamon-brown)";

          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`
                relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group
                ${isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${themeColor} 25%, transparent), color-mix(in srgb, ${themeColor} 15%, transparent))`,
                    border: `1px solid color-mix(in srgb, ${themeColor} 20%, transparent)`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0 relative z-10" />
              {/* Strategic Planning Export Badge — visible even when collapsed */}
              {(item as any).exportCount > 0 && (
                <span
                  className="absolute top-1 left-6 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center z-20 shadow-md"
                  style={{ background: (item as any).exportColor, color: '#fff' }}
                >
                  {(item as any).exportCount}
                </span>
              )}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-medium relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto relative z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${themeColor} 25%, transparent)`,
                    color: themeColor === "var(--color-pure-orange)" ? themeColor : `color-mix(in srgb, ${themeColor} 90%, white)`,
                  }}
                >
                  {item.badge}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="px-3 pb-2 pt-2 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
            text-white/40 hover:text-white/70 hover:bg-white/[0.04]
            transition-all duration-200 text-[12px]"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
