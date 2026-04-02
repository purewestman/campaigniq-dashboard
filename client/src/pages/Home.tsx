/*
 * Home Page — CampaignIQ Dashboard
 * "Soft Terrain" design: Organic Gradient Landscape
 * FY27 Global Reseller Program Tier Compliance — Elite Zone B
 *
 * Layout: Fixed sidebar (left) + scrollable main content
 * Sidebar navigation renders different page views via activeNav state
 * Uses modifiedPartners from ModificationContext so admin edits propagate everywhere
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
import PartnersPage from "@/pages/PartnersPage";
import TierCompliancePage from "@/pages/TierCompliancePage";
import GapAnalysisPage from "@/pages/GapAnalysisPage";
import CertificationsPage from "@/pages/CertificationsPage";
import ReportsPage from "@/pages/ReportsPage";
import { useModifications } from "@/contexts/ModificationContext";
import { type ComplianceFilter, TIER_DEFINITIONS } from "@/lib/data";
import { Settings } from "lucide-react";

export default function Home() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    modifiedPartners,
    filterModifiedPartners,
    getModifiedKPIs,
    getModifiedGapBreakdown,
    getModifiedEnablementDistribution,
  } = useModifications();

  // Combined filtering: tier filter first, then search query
  const filteredPartners = useMemo(() => {
    let result = filterModifiedPartners(complianceFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          TIER_DEFINITIONS[p.programTier].label.toLowerCase().includes(q) ||
          p.action.toLowerCase().includes(q) ||
          p.targetEmails.some((e) => e.toLowerCase().includes(q))
      );
    }
    return result;
  }, [complianceFilter, searchQuery, filterModifiedPartners]);

  const filteredKPIs = useMemo(() => getModifiedKPIs(filteredPartners), [filteredPartners, getModifiedKPIs]);
  const filteredGapData = useMemo(() => getModifiedGapBreakdown(filteredPartners), [filteredPartners, getModifiedGapBreakdown]);
  const filteredEnablement = useMemo(() => getModifiedEnablementDistribution(filteredPartners), [filteredPartners, getModifiedEnablementDistribution]);

  // Render page content based on active navigation
  const renderPageContent = () => {
    switch (activeNav) {
      case "partners":
        return <PartnersPage />;
      case "tiers":
        return <TierCompliancePage />;
      case "gaps":
        return <GapAnalysisPage />;
      case "certs":
        return <CertificationsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5" style={{ color: "oklch(0.55 0.02 55)" }} />
                Settings
              </h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                Dashboard configuration and preferences
              </p>
            </div>
            <div className="terrain-card p-12 text-center">
              <Settings className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-[14px] font-medium text-muted-foreground">Settings page coming soon</p>
              <p className="text-[12px] text-muted-foreground/60 mt-1">
                Configure dashboard preferences, notification settings, and data refresh intervals.
              </p>
            </div>
          </div>
        );
      case "overview":
      default:
        return (
          <>
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
                  <span className="font-bold">{modifiedPartners.length}</span> partners matching{" "}
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
          </>
        );
    }
  };

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
          {renderPageContent()}

          {/* Footer */}
          <footer className="pb-6 pt-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              PEI &middot; FY27 Global Reseller Program Tier Compliance &middot; 4-Tier Architecture (South Africa) &middot; Data as of April 2026
            </p>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}
