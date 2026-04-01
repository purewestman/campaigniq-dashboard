/*
 * Home Page — CampaignIQ Dashboard
 * "Soft Terrain" design: Organic Gradient Landscape
 * FY27 Global Reseller Program Tier Compliance — Elite Zone B
 *
 * Layout: Fixed sidebar (left) + scrollable main content
 * Filter state (tier + search) is lifted here and passed to all child components
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import KPICards from "@/components/KPICards";
import GapAnalysisChart from "@/components/ChannelChart";
import EnablementDonut from "@/components/BudgetDonut";
import ComplianceSummary from "@/components/ChannelSummary";
import PartnerTable from "@/components/CampaignTable";
import {
  type ComplianceFilter,
  filterPartners,
  getFilteredKPIs,
  getFilteredGapBreakdown,
  getFilteredEnablementDistribution,
  partners as allPartners,
} from "@/lib/data";

export default function Home() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Combined filtering: tier filter first, then search query
  const filteredPartners = useMemo(() => {
    let result = filterPartners(complianceFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tierLabel.toLowerCase().includes(q) ||
          p.action.toLowerCase().includes(q) ||
          p.targetEmails.some((e) => e.toLowerCase().includes(q))
      );
    }
    return result;
  }, [complianceFilter, searchQuery]);

  const filteredKPIs = useMemo(() => getFilteredKPIs(filteredPartners), [filteredPartners]);
  const filteredGapData = useMemo(() => getFilteredGapBreakdown(filteredPartners), [filteredPartners]);
  const filteredEnablement = useMemo(() => getFilteredEnablementDistribution(filteredPartners), [filteredPartners]);

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
          {/* Header with controlled search */}
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Search indicator */}
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: "oklch(0.58 0.16 290 / 0.06)",
                border: "1px solid oklch(0.58 0.16 290 / 0.12)",
              }}
            >
              <span className="text-[12px] text-foreground">
                Showing <span className="font-bold">{filteredPartners.length}</span> of{" "}
                <span className="font-bold">{allPartners.length}</span> partners matching{" "}
                <span className="font-bold">"{searchQuery.trim()}"</span>
                {complianceFilter !== "all" && (
                  <span className="text-muted-foreground"> in filtered view</span>
                )}
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="ml-auto text-[11px] font-medium px-2 py-1 rounded-lg hover:bg-white/60 transition-colors text-muted-foreground hover:text-foreground"
              >
                Clear search
              </button>
            </motion.div>
          )}

          {/* KPI Cards Row */}
          <section className="mb-6">
            <KPICards metrics={filteredKPIs} />
          </section>

          {/* Tier Compliance Summary Cards (clickable filter) */}
          <section className="mb-6">
            <ComplianceSummary
              activeFilter={complianceFilter}
              onFilterChange={setComplianceFilter}
            />
          </section>

          {/* Charts Row: Gap Analysis (60%) + Enablement Donut (40%) */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-3">
              <GapAnalysisChart data={filteredGapData} />
            </div>
            <div className="lg:col-span-2">
              <EnablementDonut data={filteredEnablement} />
            </div>
          </section>

          {/* Partner Tier Compliance Table */}
          <section className="mb-8">
            <PartnerTable
              partners={filteredPartners}
              activeFilter={complianceFilter}
              onFilterChange={setComplianceFilter}
              searchQuery={searchQuery}
            />
          </section>

          {/* Footer */}
          <footer className="pb-6 text-center">
            <p className="text-[11px] text-muted-foreground">
              CampaignIQ &middot; FY27 Global Reseller Program Tier Compliance &middot; Elite Zone B (South Africa) &middot; Data as of April 2026
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
