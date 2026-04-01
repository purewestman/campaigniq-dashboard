/*
 * CampaignIQ Dashboard — Mock Data
 * "Soft Terrain" design: muted teal, violet, rose, amber palette
 */

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: number; // percentage change
  changeLabel: string;
  trend: "up" | "down" | "flat";
  sparkline: number[];
}

export interface ChannelData {
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: "active" | "paused" | "completed" | "draft";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  roas: number;
  startDate: string;
  endDate: string;
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// ─── KPI Cards ──────────────────────────────────────────────
export const kpiMetrics: KPIMetric[] = [
  {
    id: "ad-spend",
    label: "Ad Spend",
    value: "$48,250",
    change: 12.5,
    changeLabel: "vs last month",
    trend: "up",
    sparkline: [32, 35, 38, 36, 42, 45, 48],
  },
  {
    id: "impressions",
    label: "Impressions",
    value: "2.4M",
    change: 8.3,
    changeLabel: "vs last month",
    trend: "up",
    sparkline: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4],
  },
  {
    id: "ctr",
    label: "Click-Through Rate",
    value: "3.42%",
    change: -0.8,
    changeLabel: "vs last month",
    trend: "down",
    sparkline: [3.6, 3.5, 3.5, 3.4, 3.3, 3.4, 3.42],
  },
  {
    id: "roas",
    label: "ROAS",
    value: "4.2x",
    change: 15.2,
    changeLabel: "vs last month",
    trend: "up",
    sparkline: [3.2, 3.4, 3.5, 3.8, 3.9, 4.0, 4.2],
  },
];

// ─── Channel Breakdown ─────────────────────────────────────
export const channelData: ChannelData[] = [
  {
    channel: "Social",
    impressions: 980000,
    clicks: 34200,
    conversions: 1850,
    spend: 18500,
    color: "var(--color-chart-1)",
  },
  {
    channel: "Search",
    impressions: 850000,
    clicks: 42500,
    conversions: 2340,
    spend: 19200,
    color: "var(--color-chart-2)",
  },
  {
    channel: "Email",
    impressions: 570000,
    clicks: 28500,
    conversions: 1420,
    spend: 10550,
    color: "var(--color-chart-4)",
  },
];

// ─── Channel Performance (monthly trend) ────────────────────
export const channelMonthlyData = [
  { month: "Jan", Social: 12400, Search: 14200, Email: 8100 },
  { month: "Feb", Social: 13800, Search: 15100, Email: 8900 },
  { month: "Mar", Social: 15200, Search: 16400, Email: 9200 },
  { month: "Apr", Social: 14600, Search: 17800, Email: 9800 },
  { month: "May", Social: 16800, Search: 18200, Email: 10100 },
  { month: "Jun", Social: 18500, Search: 19200, Email: 10550 },
];

// ─── Campaigns ──────────────────────────────────────────────
export const campaigns: Campaign[] = [
  {
    id: "camp-001",
    name: "Summer Brand Awareness",
    channel: "Social",
    status: "active",
    budget: 12000,
    spent: 8400,
    impressions: 540000,
    clicks: 18900,
    ctr: 3.5,
    conversions: 1020,
    roas: 4.8,
    startDate: "2026-03-01",
    endDate: "2026-06-30",
  },
  {
    id: "camp-002",
    name: "Product Launch — Q2",
    channel: "Search",
    status: "active",
    budget: 15000,
    spent: 11200,
    impressions: 420000,
    clicks: 21000,
    ctr: 5.0,
    conversions: 1340,
    roas: 5.2,
    startDate: "2026-02-15",
    endDate: "2026-05-15",
  },
  {
    id: "camp-003",
    name: "Newsletter Re-engagement",
    channel: "Email",
    status: "completed",
    budget: 5000,
    spent: 4800,
    impressions: 280000,
    clicks: 14000,
    ctr: 5.0,
    conversions: 720,
    roas: 3.6,
    startDate: "2026-01-10",
    endDate: "2026-03-10",
  },
  {
    id: "camp-004",
    name: "Holiday Retargeting",
    channel: "Social",
    status: "paused",
    budget: 8000,
    spent: 3200,
    impressions: 190000,
    clicks: 6650,
    ctr: 3.5,
    conversions: 380,
    roas: 3.1,
    startDate: "2026-03-15",
    endDate: "2026-04-30",
  },
  {
    id: "camp-005",
    name: "Enterprise SEM Push",
    channel: "Search",
    status: "active",
    budget: 20000,
    spent: 14800,
    impressions: 680000,
    clicks: 27200,
    ctr: 4.0,
    conversions: 1580,
    roas: 4.6,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
  },
  {
    id: "camp-006",
    name: "Loyalty Program Blast",
    channel: "Email",
    status: "draft",
    budget: 3500,
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    conversions: 0,
    roas: 0,
    startDate: "2026-04-15",
    endDate: "2026-05-15",
  },
  {
    id: "camp-007",
    name: "Influencer Collab — Spring",
    channel: "Social",
    status: "active",
    budget: 10000,
    spent: 6800,
    impressions: 320000,
    clicks: 11200,
    ctr: 3.5,
    conversions: 640,
    roas: 3.8,
    startDate: "2026-02-01",
    endDate: "2026-04-30",
  },
  {
    id: "camp-008",
    name: "Webinar Promotion",
    channel: "Email",
    status: "completed",
    budget: 2500,
    spent: 2400,
    impressions: 95000,
    clicks: 4750,
    ctr: 5.0,
    conversions: 285,
    roas: 4.1,
    startDate: "2026-02-10",
    endDate: "2026-03-20",
  },
];

// ─── Budget Allocation ──────────────────────────────────────
export const budgetAllocation: BudgetAllocation[] = [
  { category: "Social Media", amount: 22000, percentage: 35, color: "oklch(0.60 0.12 175)" },
  { category: "Search / SEM", amount: 20000, percentage: 32, color: "oklch(0.58 0.16 290)" },
  { category: "Email Marketing", amount: 11000, percentage: 18, color: "oklch(0.75 0.14 75)" },
  { category: "Content / SEO", amount: 6000, percentage: 10, color: "oklch(0.62 0.19 15)" },
  { category: "Other", amount: 3250, percentage: 5, color: "oklch(0.65 0.10 145)" },
];

// ─── Sidebar Navigation Items ───────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: string; // lucide icon name
  badge?: number;
}

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "campaigns", label: "Campaigns", icon: "Megaphone", badge: 5 },
  { id: "channels", label: "Channels", icon: "Share2" },
  { id: "budget", label: "Budget", icon: "Wallet" },
  { id: "reports", label: "Reports", icon: "FileBarChart" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
