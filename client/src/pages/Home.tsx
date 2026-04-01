/*
 * Home Page — CampaignIQ Dashboard
 * "Soft Terrain" design: Organic Gradient Landscape
 *
 * Layout: Fixed sidebar (left) + scrollable main content
 * Components: Header, KPI Cards, Channel Chart, Budget Donut,
 *             Channel Summary, Campaign Table
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import KPICards from "@/components/KPICards";
import ChannelChart from "@/components/ChannelChart";
import BudgetDonut from "@/components/BudgetDonut";
import ChannelSummary from "@/components/ChannelSummary";
import CampaignTable from "@/components/CampaignTable";

export default function Home() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.975 0.008 85)" }}>
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main content area — offset by sidebar width */}
      <motion.main
        className="flex-1 min-h-screen"
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Header with gradient background */}
          <DashboardHeader />

          {/* KPI Cards Row */}
          <section className="mb-6">
            <KPICards />
          </section>

          {/* Charts Row: Channel Chart (60%) + Budget Donut (40%) */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-3">
              <ChannelChart />
            </div>
            <div className="lg:col-span-2">
              <BudgetDonut />
            </div>
          </section>

          {/* Channel Summary Cards */}
          <section className="mb-6">
            <ChannelSummary />
          </section>

          {/* Campaign Comparison Table */}
          <section className="mb-8">
            <CampaignTable />
          </section>

          {/* Footer */}
          <footer className="pb-6 text-center">
            <p className="text-[11px] text-muted-foreground">
              CampaignIQ Dashboard &middot; Data refreshed hourly &middot; &copy; 2026
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
