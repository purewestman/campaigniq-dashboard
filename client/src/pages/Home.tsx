/*
 * Home Page — CampaignIQ Dashboard
 * "Soft Terrain" design: Organic Gradient Landscape
 * FY27 Partner SE Journey Compliance & Gap Analysis
 *
 * Layout: Fixed sidebar (left) + scrollable main content
 * Components: Header, KPI Cards, Gap Analysis Chart, Journey Donut,
 *             Compliance Summary, Partner Table
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import KPICards from "@/components/KPICards";
import GapAnalysisChart from "@/components/ChannelChart";
import JourneyDonut from "@/components/BudgetDonut";
import ComplianceSummary from "@/components/ChannelSummary";
import PartnerTable from "@/components/CampaignTable";

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

      {/* Main content area */}
      <motion.main
        className="flex-1 min-h-screen"
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Header */}
          <DashboardHeader />

          {/* KPI Cards Row */}
          <section className="mb-6">
            <KPICards />
          </section>

          {/* Compliance Status Summary Cards */}
          <section className="mb-6">
            <ComplianceSummary />
          </section>

          {/* Charts Row: Gap Analysis (60%) + Journey Donut (40%) */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-3">
              <GapAnalysisChart />
            </div>
            <div className="lg:col-span-2">
              <JourneyDonut />
            </div>
          </section>

          {/* Partner SE Compliance Table */}
          <section className="mb-8">
            <PartnerTable />
          </section>

          {/* Footer */}
          <footer className="pb-6 text-center">
            <p className="text-[11px] text-muted-foreground">
              CampaignIQ &middot; FY27 Partner SE Journey Compliance Dashboard &middot; Data as of April 2026
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
