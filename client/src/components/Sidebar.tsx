/*
 * Sidebar — "Soft Terrain" design
 * Dark teal-slate sidebar with organic rounded inner edge
 * Warm glow highlights, pill-shaped active indicator
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Share2,
  Wallet,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { navItems } from "@/lib/data";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Megaphone,
  Share2,
  Wallet,
  FileBarChart,
  Settings,
};

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({ activeNav, onNavChange, collapsed, onCollapse }: SidebarProps) {
  const handleNavClick = (id: string) => {
    onNavChange(id);
    if (id !== "overview") {
      toast("Feature coming soon", {
        description: `The ${navItems.find((n) => n.id === id)?.label} section is under development.`,
      });
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: "oklch(0.22 0.02 200)",
      }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.60 0.12 175), oklch(0.50 0.14 190))",
          }}
        >
          <Zap className="w-5 h-5 text-white" />
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
              <h1 className="text-[15px] font-bold text-white tracking-tight whitespace-nowrap">
                CampaignIQ
              </h1>
              <p className="text-[10px] text-white/40 -mt-0.5 whitespace-nowrap">
                Marketing Intelligence
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
              onClick={() => handleNavClick(item.id)}
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
                    background: "linear-gradient(135deg, oklch(0.55 0.12 175 / 0.25), oklch(0.50 0.10 190 / 0.15))",
                    border: "1px solid oklch(0.60 0.12 175 / 0.20)",
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
                    background: "oklch(0.60 0.12 175 / 0.25)",
                    color: "oklch(0.80 0.08 175)",
                  }}
                >
                  {item.badge}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

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
