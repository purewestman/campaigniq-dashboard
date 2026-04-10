/*
 * Sidebar — "Soft Terrain" design
 * Dark teal-slate sidebar with FY27 Tier Compliance navigation
 * All nav items are now functional — no more "coming soon" toasts
 */

import { motion, AnimatePresence } from "framer-motion";
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
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { navItems } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";

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
  ShieldAlert,
};

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ activeNav, onNavChange, collapsed, onCollapse }: SidebarProps) {
  const { logout } = useAuth();
  
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
           <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
             <path fillRule="evenodd" clipRule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="var(--color-pure-orange)"/>
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
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = activeNav === item.id;

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
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--color-pure-orange) 25%, transparent), color-mix(in srgb, var(--color-pure-orange) 15%, transparent))",
                    border: "1px solid color-mix(in srgb, var(--color-pure-orange) 20%, transparent)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0 relative z-10" />
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
                    background: "color-mix(in srgb, var(--color-pure-orange) 25%, transparent)",
                    color: "var(--color-pure-orange)",
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
