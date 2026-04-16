import SEJourneyMap from "@/components/SEJourneyMap";
/*
 * Home Page — CampaignIQ Dashboard
 * "Soft Terrain" design: Organic Gradient Landscape
 * FY27 Global Reseller Program Tier Compliance — Elite Zone B
 *
 * Layout: Fixed sidebar (left) + scrollable main content
 * Sidebar navigation renders different page views via activeNav state
 * Uses modifiedPartners from ModificationContext so admin edits propagate everywhere
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ComplianceSummary from "@/components/ChannelSummary";
import CalendarRoadmap from "@/components/CalendarRoadmap";
import PartnerTable from "@/components/CampaignTable";
import CorePlatforms from "@/components/CorePlatforms";
import PartnersPage from "@/pages/PartnersPage";
import TierCompliancePage from "@/pages/TierCompliancePage";
import GapAnalysisPage from "@/pages/GapAnalysisPage";
import CertificationsPage from "@/pages/CertificationsPage";
import ReportsPage from "@/pages/ReportsPage";
import TierProgressionPage from "@/pages/TierProgressionPage";
import TrainingDetailsPage from "@/pages/TrainingDetailsPage";
import PartnerActivityPage from "@/pages/PartnerActivityPage";
import AspTrackingPage from "@/pages/AspTrackingPage";
import SecurityLogPage from "@/pages/SecurityLogPage";
import SettingsPage from "@/pages/SettingsPage";
import TrainingHub from "@/pages/TrainingHub";
import PlanningHub from "@/pages/PlanningHub";
import EnablementPlansPage from "@/pages/EnablementPlansPage";
import CommitmentTracker, { loadCommitments, saveCommitment, removeCommitment, type PartnerCommitment } from "@/components/CommitmentTracker";
import { useModifications } from "@/contexts/ModificationContext";
import { type ComplianceFilter, TIER_DEFINITIONS, generateRecommendedAction } from "@/lib/data";
import { Settings, CalendarCheck, CalendarDays, Map, FileBarChart, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityPartnerFilter, setActivityPartnerFilter] = useState<string | null>(null);
  const [activityCourseFilter, setActivityCourseFilter] = useState<string | null>(null);
  const [activitySearchFilter, setActivitySearchFilter] = useState<string | null>(null);
  const [partnerSearchFilter, setPartnerSearchFilter] = useState<string | null>(null);
  const [forceActivityTab, setForceActivityTab] = useState(0);
  const [commitments, setCommitments] = useState<PartnerCommitment[]>(loadCommitments);
  const partnerTableRef = useRef<HTMLDivElement>(null);

  const handleNavChange = useCallback((id: string) => {
    if (id === "activity") {
      setForceActivityTab(prev => prev + 1);
      setActiveNav("training");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (id === "training") {
      // Clear all activity filters to ensure "certs" tab opens by default
      setActivityPartnerFilter(null);
      setActivityCourseFilter(null);
      setActivitySearchFilter(null);
      setForceActivityTab(0);
    }
    setActiveNav(id);
  }, []);

  // Navigation helpers to switch pages with filters
  const navigateToPartner = (partnerName: string) => {
    setPartnerSearchFilter(partnerName);
    setActiveNav("partners");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Listen for commitment submissions from PDF windows
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'PEI_COMMITMENT_SUBMIT') return;
      const c: PartnerCommitment = {
        partnerId: event.data.partnerId,
        partnerName: event.data.partnerName,
        submittedAt: event.data.submittedAt,
        commitments: (event.data.commitments || []).map((milestone: any) => ({
          ...milestone,
          status: milestone.status || 'pending',
          assignedEmployees: milestone.assignedEmployees || [],
        })),
      };
      saveCommitment(c);
      setCommitments(loadCommitments());
      toast.success(`Commitment received from ${c.partnerName}`, {
        description: `${c.commitments.length} milestone(s) submitted.`,
      });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // FORCE RESET logic for NTT DATA (Id 3)
  // This clears any stale manual modifications in the user's browser to sync with the 4/5 verified data.
  useEffect(() => {
    const RESET_KEY = 'pei_force_clear_ntt_v1';
    if (localStorage.getItem(RESET_KEY) !== 'true') {
      const STORAGE_KEY = 'pei-gap-modifications';
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const mods = JSON.parse(raw);
          const filtered = mods.filter((m: any) => m.partnerId !== 3);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          
          // Also clear commitments
          const COMM_KEY = 'pei_timeline_commitments';
          const rawComm = localStorage.getItem(COMM_KEY);
          if (rawComm) {
            const comms = JSON.parse(rawComm);
            const filteredComm = comms.filter((c: any) => c.partnerId !== 3);
            localStorage.setItem(COMM_KEY, JSON.stringify(filteredComm));
          }

          localStorage.setItem(RESET_KEY, 'true');
          // Reload to apply changes immediately
          window.location.reload();
        }
      } catch (e) {
        console.error("Force clear failed", e);
      }
    }
  }, []);

  const handleDeleteCommitment = useCallback((partnerId: number) => {
    removeCommitment(partnerId);
    setCommitments(loadCommitments());
  }, []);

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
          generateRecommendedAction(p).toLowerCase().includes(q) ||
          p.targetEmails.some((e) => e.toLowerCase().includes(q))
      );
    }
    return result;
  }, [complianceFilter, searchQuery, filterModifiedPartners]);

  const filteredKPIs = useMemo(() => getModifiedKPIs(filteredPartners), [filteredPartners, getModifiedKPIs]);
  const filteredGapData = useMemo(() => getModifiedGapBreakdown(filteredPartners), [filteredPartners, getModifiedGapBreakdown]);
  const filteredEnablement = useMemo(() => getModifiedEnablementDistribution(filteredPartners), [filteredPartners, getModifiedEnablementDistribution]);

  // Navigation helper to switch pages with filters
  const navigateToActivity = (partner?: string, course?: string, search?: string) => {
    if (partner) setActivityPartnerFilter(partner);
    if (course) setActivityCourseFilter(course);
    if (search) setActivitySearchFilter(search);
    setForceActivityTab(prev => prev + 1);
    setActiveNav("training");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render page content based on active navigation
  const renderPageContent = () => {
    switch (activeNav) {
      case "partners":
        return (
          <PartnersPage 
            initialSearch={partnerSearchFilter || undefined}
            onClearSearch={() => setPartnerSearchFilter(null)}
            onNavigateToActivity={navigateToActivity} 
          />
        );
      case "training":
        return (
          <TrainingHub 
            activityPartnerFilter={activityPartnerFilter}
            activityCourseFilter={activityCourseFilter}
            activitySearchFilter={activitySearchFilter}
            forceActivityTab={forceActivityTab}
            onClearFilters={() => {
              setActivityPartnerFilter(null);
              setActivityCourseFilter(null);
              setActivitySearchFilter(null);
            }}
            onNavigateToActivity={navigateToActivity}
          />
        );

      case "planning":
        return <PlanningHub />;

      case "enablement":
        return <EnablementPlansPage />;

      case "asp":
        return <AspTrackingPage />;

      case "security":
        return <SecurityLogPage />;

      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "overview":
      default:
        return (
          <>
            {/* Header with controlled search */}
            <DashboardHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavChange={handleNavChange}
            />

            {/* Search indicator */}
            {searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--color-basil-green) 6%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-basil-green) 12%, transparent)",
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

            {/* Quick Report Navigation Banner */}
            <section className="mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl" style={{ borderColor: 'var(--color-stone-gray)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--color-pure-orange)', color: 'white' }}>
                    <FileBarChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-slate-900">Partner Compliance Reports & Logs</h3>
                    <p className="text-[11px] text-slate-500">Access full CSV exports, modification histories, and audit data</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavChange('reports')}
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold bg-white border rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                  style={{ color: 'var(--color-pure-orange)', borderColor: 'var(--color-stone-gray)' }}
                >
                  Open Reporting Center
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </section>

            {/* Tier Compliance Summary Cards (clickable filter) */}
            <section className="mb-6">
              <ComplianceSummary
                activeFilter={complianceFilter}
                onFilterChange={(filter: ComplianceFilter) => setComplianceFilter(filter)}
                onNavigate={handleNavChange}
              />
            </section>

            {/* Partner Details Compliance Table */}
            <section className="mb-6" ref={partnerTableRef}>
              <PartnerTable
                partners={filteredPartners}
                activeFilter={complianceFilter}
                onFilterChange={setComplianceFilter}
                searchQuery={searchQuery}
                onNavigateToActivity={navigateToActivity}
              />
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-cloud-white)" }}>
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
