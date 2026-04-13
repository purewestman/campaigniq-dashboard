/*
 * Activity Tracer — unified view of partner training completions
 * Data sources: activityData (Excel) + csvActivityData (Training Report CSV)
 * Three modes:
 *   • Global search  — search any name / course across ALL partners
 *   • By Partner     — leaderboard + monthly timeline for one partner
 *   • By Course      — roster + monthly timeline for one course
 */

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity,
  Trophy,
  Search,
  Users,
  X,
  BookOpen,
  Building2,
  FileDown,
} from "lucide-react";
import { generateActivityReportHtml } from "@/lib/activityReportPdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { activityData } from "@/lib/activityData";
import { csvActivityData } from "@/lib/csvActivityData";
import { partners } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface UnifiedRecord {
  partner: string;
  email: string;
  name: string;
  activity: string;
  date: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Make an email safe as a recharts dataKey (dots / @ break nested-path lookup) */
const safeKey = (email: string) => email.replace(/[@.]/g, "_");

const LINE_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#dc2626", "#9333ea",
  "#0891b2", "#c026d3", "#ea580c", "#4f46e5", "#059669",
];

// ─── Merge activityData + csvActivityData into one flat list ─────────────────
function buildAllRecords(): UnifiedRecord[] {
  const out: UnifiedRecord[] = [];

  // From Excel-based activityData
  for (const [partner, recs] of Object.entries(activityData)) {
    if (partner === "Total") continue; // junk Excel row
    for (const r of recs) {
      out.push({ partner, email: r.email, name: r.name, activity: r.activity, date: r.date });
    }
  }

  // From CSV — add only records not already covered by activityData partners
  const excelPartners = new Set(Object.keys(activityData).filter(k => k !== "Total"));
  for (const [partner, recs] of Object.entries(csvActivityData)) {
    if (excelPartners.has(partner)) continue;
    for (const r of recs) {
      out.push({ partner, email: r.email, name: r.name, activity: r.activity, date: r.date });
    }
  }

  return out;
}

// Build once at module load (stable reference)
const ALL_RECORDS: UnifiedRecord[] = buildAllRecords();

const ALL_PARTNERS = Array.from(new Set(ALL_RECORDS.map(r => r.partner))).sort();
const ALL_COURSES  = Array.from(new Set(ALL_RECORDS.map(r => r.activity))).sort();

// ─── PDF Export helper ────────────────────────────────────────────────────────
function triggerPrint(
  title: string,
  subtitle: string,
  stats: { label: string; value: string | number }[],
  headers: string[],
  rows: { col1: string; col2: string; col3: string; col4: string }[]
) {
  const html = generateActivityReportHtml(title, subtitle, stats, headers, rows);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
}

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  initialPartner?: string;
  initialCourse?: string;
  initialSearch?: string;
  onClearFilters?: () => void;
}

export default function PartnerActivityPage({
  initialPartner,
  initialCourse,
  initialSearch,
  onClearFilters,
}: Props) {
  const { user } = useAuth();

  // ── Domain RLS: restrict records to logged-in partner ─────────────
  const VISIBLE_RECORDS = useMemo(() => {
    if (user?.role !== 'partner' || !user.domain) return ALL_RECORDS;
    const domainPartner = partners.find(p => p.domain === user.domain);
    if (!domainPartner) return ALL_RECORDS;
    return ALL_RECORDS.filter(r => r.partner === domainPartner.name);
  }, [user]);

  const VISIBLE_PARTNERS = useMemo(
    () => Array.from(new Set(VISIBLE_RECORDS.map(r => r.partner))).sort(),
    [VISIBLE_RECORDS]
  );
  const VISIBLE_COURSES = useMemo(
    () => Array.from(new Set(VISIBLE_RECORDS.map(r => r.activity))).sort(),
    [VISIBLE_RECORDS]
  );

  const [viewMode, setViewMode] = useState<"partner" | "course">(
    initialCourse ? "course" : "partner"
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedPartner, setSelectedPartner] = useState(initialPartner || VISIBLE_PARTNERS[0] || "");
  const [selectedCourse, setSelectedCourse]   = useState(initialCourse  || VISIBLE_COURSES[0]  || "");

  useEffect(() => {
    if (initialPartner) { setViewMode("partner"); setSelectedPartner(initialPartner); }
    else if (initialCourse) { setViewMode("course"); setSelectedCourse(initialCourse); }
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialPartner, initialCourse, initialSearch]);

  // ── Global search across ALL records ─────────────────────────────
  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.trim().toLowerCase();

  const globalResults = useMemo<UnifiedRecord[]>(() => {
    if (!isSearching) return [];
    return VISIBLE_RECORDS.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.activity.toLowerCase().includes(q) ||
      r.partner.toLowerCase().includes(q)
    );
  }, [q, isSearching, VISIBLE_RECORDS]);

  // Global timeline (one data point per month for matching records)
  const globalChartData = useMemo(() => {
    if (!isSearching || globalResults.length === 0) return [];
    const map: Record<string, number> = {};
    globalResults.forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Completions]) => ({ name, Completions }));
  }, [globalResults, isSearching]);

  // ── By Partner ───────────────────────────────────────────────────
  const partnerRecords = useMemo(() =>
    VISIBLE_RECORDS.filter(r => r.partner === selectedPartner),
    [selectedPartner, VISIBLE_RECORDS]
  );

  const topEmployees = useMemo(() => {
    if (partnerRecords.length === 0) return [];
    const counts: Record<string, { name: string; email: string; count: number; activities: string[] }> = {};
    partnerRecords.forEach(r => {
      if (!counts[r.email]) counts[r.email] = { name: r.name, email: r.email, count: 0, activities: [] };
      counts[r.email].count += 1;
      if (r.activity && !counts[r.email].activities.includes(r.activity)) {
        counts[r.email].activities.push(r.activity);
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [partnerRecords]);

  const partnerChartData = useMemo(() => {
    if (partnerRecords.length === 0) return [];

    // Map email → safe recharts key for top employees
    const topKeyByEmail: Record<string, string> = {};
    topEmployees.forEach(e => { topKeyByEmail[e.email] = safeKey(e.email); });

    const map: Record<string, { name: string; Total: number; [k: string]: number | string }> = {};

    partnerRecords.forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[month]) {
        const entry: { name: string; Total: number; [k: string]: number | string } = { name: month, Total: 0 };
        topEmployees.forEach(e => { entry[safeKey(e.email)] = 0; });
        map[month] = entry;
      }
      map[month].Total += 1;
      const sk = topKeyByEmail[r.email];
      if (sk) (map[month][sk] as number) += 1;
    });

    return Object.values(map).sort((a, b) => (a.name as string).localeCompare(b.name as string));
  }, [partnerRecords, topEmployees]);

  // ── By Course ────────────────────────────────────────────────────
  const courseRoster = useMemo(() => {
    if (!selectedCourse) return [];
    return VISIBLE_RECORDS
      .filter(r => r.activity === selectedCourse)
      .sort((a, b) => {
        if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return 0;
      });
  }, [selectedCourse, VISIBLE_RECORDS]);

  const courseChartData = useMemo(() => {
    if (!selectedCourse) return [];
    const map: Record<string, number> = {};
    VISIBLE_RECORDS.filter(r => r.activity === selectedCourse && r.date).forEach(r => {
      const d = new Date(r.date!);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Completions]) => ({ name, Completions }));
  }, [selectedCourse, VISIBLE_RECORDS]);

  // ── Derived for render ────────────────────────────────────────────
  const listItems = isSearching
    ? globalResults
    : viewMode === "partner"
    ? partnerRecords
    : courseRoster;

  const chartData = isSearching ? globalChartData : viewMode === "partner" ? partnerChartData : courseChartData;

  // ── PDF print content ─────────────────────────────────────────────
  const printTitle = isSearching
    ? `Search: "${searchQuery}"`
    : viewMode === "partner"
    ? selectedPartner
    : selectedCourse;

  const printRows: { col1: string; col2: string; col3: string; col4: string }[] = useMemo(() => {
    if (isSearching) {
      return globalResults.map(r => ({
        col1: r.name || r.email,
        col2: r.email,
        col3: r.partner,
        col4: r.date ? new Date(r.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—",
      }));
    }
    if (viewMode === "partner") {
      return topEmployees.map(e => ({
        col1: e.name || e.email,
        col2: e.email,
        col3: `${e.count} module${e.count !== 1 ? "s" : ""}`,
        col4: e.activities.slice(0, 3).join("; ") + (e.activities.length > 3 ? " …" : ""),
      }));
    }
    // By Course
    return courseRoster.map(r => ({
      col1: r.name || r.email,
      col2: r.email,
      col3: r.partner,
      col4: r.date ? new Date(r.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—",
    }));
  }, [isSearching, viewMode, globalResults, topEmployees, courseRoster]);

  const printHeaders = isSearching
    ? ["Name", "Email", "Partner", "Date"]
    : viewMode === "partner"
    ? ["Name", "Email", "Modules", "Courses (sample)"]
    : ["Name", "Email", "Partner", "Completed"];

  const printStats: { label: string; value: string | number }[] = useMemo(() => {
    if (isSearching) {
      return [
        { label: "Matched Records", value: globalResults.length },
        { label: "Unique People", value: Array.from(new Set(globalResults.map(r => r.email))).length },
        { label: "Partners", value: Array.from(new Set(globalResults.map(r => r.partner))).length },
        { label: "Courses", value: Array.from(new Set(globalResults.map(r => r.activity))).length },
      ];
    }
    if (viewMode === "partner") {
      return [
        { label: "Total Records", value: partnerRecords.length },
        { label: "Unique People", value: new Set(partnerRecords.map(r => r.email)).size },
        { label: "Unique Courses", value: new Set(partnerRecords.map(r => r.activity)).size },
        { label: "Months Active", value: partnerChartData.length },
      ];
    }
    return [
      { label: "Total Completions", value: courseRoster.length },
      { label: "Unique Learners", value: new Set(courseRoster.map(r => r.email)).size },
      { label: "Partners", value: new Set(courseRoster.map(r => r.partner)).size },
    ];
  }, [isSearching, viewMode, globalResults, partnerRecords, partnerChartData, courseRoster]);

  const canExport = listItems.length > 0;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Activity Tracer
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            {VISIBLE_RECORDS.length.toLocaleString()} training records across {VISIBLE_PARTNERS.length} partner{VISIBLE_PARTNERS.length !== 1 ? 's' : ''} — search any name, course, or partner.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">

          {/* Global search */}
          <div className="relative flex items-center w-full sm:w-72">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any name, course, or partner…"
              className="pl-9 pr-9 py-2 border border-black/10 bg-white/80 rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View toggles — hidden while searching */}
          {!isSearching && (
            <div className="flex bg-black/[0.04] p-1 rounded-lg shrink-0">
              <button
                onClick={() => setViewMode("partner")}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                  viewMode === "partner" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Partner
              </button>
              <button
                onClick={() => setViewMode("course")}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                  viewMode === "course" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Course
              </button>
            </div>
          )}

          {/* Contextual selectors */}
          {!isSearching && viewMode === "partner" && (
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              {VISIBLE_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          {!isSearching && viewMode === "course" && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-xs"
            >
              {VISIBLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* Export PDF button */}
          {canExport && (
            <button
              onClick={() => triggerPrint(
                printTitle,
                `PEI · FY27 Global Reseller Program · Activity Tracer · ${isSearching ? "Search Results" : viewMode === "partner" ? "Partner Report" : "Course Report"}`,
                printStats,
                printHeaders,
                printRows
              )}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-black/10 bg-white/80 text-foreground hover:bg-white hover:border-black/20 transition-all shrink-0"
              title="Export as PDF"
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              Export PDF
            </button>
          )}

          {(initialPartner || initialCourse || initialSearch) && (
            <button
              onClick={() => { setSearchQuery(""); onClearFilters?.(); }}
              className="text-[12px] font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Global search results banner ── */}
      {isSearching && (
        <div
          className="px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2"
          style={{ background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)", color: "var(--color-basil-green)" }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          {globalResults.length === 0
            ? `No matches for "${searchQuery}"`
            : (() => {
                const partnerCount = Array.from(new Set(globalResults.map(r => r.partner))).length;
                return `${globalResults.length} record${globalResults.length !== 1 ? "s" : ""} matching "${searchQuery}" across ${partnerCount} partner${partnerCount !== 1 ? "s" : ""}`;
              })()
          }
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel — records list */}
        <div className="terrain-card p-6 flex flex-col" style={{ height: 520 }}>
          <h3 className="text-[14px] font-bold text-foreground mb-4 flex items-center gap-2 shrink-0">
            {isSearching ? (
              <><Search className="w-4 h-4 text-blue-500" /> Search Results</>
            ) : viewMode === "partner" ? (
              <><Trophy className="w-4 h-4 text-amber-500" /> Top Employees — {selectedPartner.split(" ").slice(0, 2).join(" ")}</>
            ) : (
              <><Users className="w-4 h-4 text-rose-500" /> Completion Roster ({courseRoster.length})</>
            )}
          </h3>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">

            {/* ── GLOBAL SEARCH LIST ── */}
            {isSearching && globalResults.length > 0 && (
              globalResults.slice(0, 200).map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border"
                  style={{ background: "var(--color-cloud-white)", borderColor: "var(--color-stone-gray)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{r.email}</p>
                    </div>
                    {r.date && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(r.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1"
                      style={{ background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)", color: "var(--color-basil-green)" }}
                    >
                      <Building2 className="w-2.5 h-2.5" />{r.partner.split(" ").slice(0, 3).join(" ")}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 min-w-0"
                      style={{ background: "color-mix(in srgb, var(--color-moss-green) 10%, transparent)", color: "var(--color-moss-green)" }}
                    >
                      <BookOpen className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{r.activity}</span>
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* ── PARTNER LEADERBOARD ── */}
            {!isSearching && viewMode === "partner" && topEmployees.length > 0 && (
              topEmployees.map((emp, idx) => (
                <div
                  key={emp.email}
                  className="flex flex-col p-4 rounded-xl border"
                  style={{ background: "var(--color-cloud-white)", borderColor: "var(--color-stone-gray)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0"
                        style={{ background: LINE_COLORS[idx % LINE_COLORS.length] + "22", color: LINE_COLORS[idx % LINE_COLORS.length] }}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{emp.email}</p>
                      </div>
                    </div>
                    <div className="text-[13px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 ml-2">
                      {emp.count} <span className="text-[10px] font-medium text-blue-500">mod</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-10">
                    {emp.activities.slice(0, 4).map((act, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-black/10 bg-white text-muted-foreground">
                        {act.length > 32 ? act.slice(0, 30) + "…" : act}
                      </span>
                    ))}
                    {emp.activities.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-black/10 bg-white text-muted-foreground">
                        +{emp.activities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* ── COURSE ROSTER ── */}
            {!isSearching && viewMode === "course" && courseRoster.length > 0 && (
              courseRoster.map((emp, idx) => (
                <div
                  key={`${emp.email}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ background: "var(--color-cloud-white)", borderColor: "var(--color-stone-gray)" }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{emp.name}</p>
                    <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: "var(--color-basil-green)" }}>{emp.partner}</p>
                  </div>
                  {emp.date && (
                    <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                      {new Date(emp.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "2-digit" })}
                    </span>
                  )}
                </div>
              ))
            )}

            {/* Empty state */}
            {listItems.length === 0 && (
              <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
                {isSearching ? `No matches for "${searchQuery}".` : "No data for this selection."}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Timeline chart */}
        <div className="terrain-card p-6 lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-foreground">
            {isSearching
              ? "Matched Activity — Timeline"
              : viewMode === "partner"
              ? `${selectedPartner.split(" ").slice(0, 3).join(" ")} — Monthly Activity`
              : "Course Completions — Timeline"}
          </h3>

          {chartData.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontSize: "12px",
                      background: "rgba(255,255,255,0.97)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (!isSearching && viewMode === "partner") {
                        const emp = topEmployees.find(e => safeKey(e.email) === name);
                        return [value, emp ? (emp.name || emp.email.split("@")[0]) : name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value: string) => {
                      if (!isSearching && viewMode === "partner") {
                        const emp = topEmployees.find(e => safeKey(e.email) === value);
                        return emp ? (emp.name || emp.email.split("@")[0]) : value;
                      }
                      return value;
                    }}
                  />

                  {/* Global search or course: single Completions line.
                      NOTE: Do NOT wrap Line elements in React Fragments inside recharts —
                      recharts traverses direct children only and won't see Lines inside <>. */}
                  {(isSearching || viewMode === "course") && (
                    <Line type="monotone" dataKey="Completions" stroke="#e11d48" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6 }} />
                  )}

                  {/* Partner: Total line */}
                  {(!isSearching && viewMode === "partner") && (
                    <Line
                      type="monotone"
                      dataKey="Total"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {/* Partner: individual employee lines — each rendered as a direct child (no Fragment) */}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 0 && (
                    <Line key={topEmployees[0].email} type="monotone" dataKey={safeKey(topEmployees[0].email)} name={safeKey(topEmployees[0].email)} stroke={LINE_COLORS[0]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 1 && (
                    <Line key={topEmployees[1].email} type="monotone" dataKey={safeKey(topEmployees[1].email)} name={safeKey(topEmployees[1].email)} stroke={LINE_COLORS[1]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 2 && (
                    <Line key={topEmployees[2].email} type="monotone" dataKey={safeKey(topEmployees[2].email)} name={safeKey(topEmployees[2].email)} stroke={LINE_COLORS[2]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 3 && (
                    <Line key={topEmployees[3].email} type="monotone" dataKey={safeKey(topEmployees[3].email)} name={safeKey(topEmployees[3].email)} stroke={LINE_COLORS[3]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 4 && (
                    <Line key={topEmployees[4].email} type="monotone" dataKey={safeKey(topEmployees[4].email)} name={safeKey(topEmployees[4].email)} stroke={LINE_COLORS[4]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 5 && (
                    <Line key={topEmployees[5].email} type="monotone" dataKey={safeKey(topEmployees[5].email)} name={safeKey(topEmployees[5].email)} stroke={LINE_COLORS[5]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 6 && (
                    <Line key={topEmployees[6].email} type="monotone" dataKey={safeKey(topEmployees[6].email)} name={safeKey(topEmployees[6].email)} stroke={LINE_COLORS[6]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 7 && (
                    <Line key={topEmployees[7].email} type="monotone" dataKey={safeKey(topEmployees[7].email)} name={safeKey(topEmployees[7].email)} stroke={LINE_COLORS[7]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 8 && (
                    <Line key={topEmployees[8].email} type="monotone" dataKey={safeKey(topEmployees[8].email)} name={safeKey(topEmployees[8].email)} stroke={LINE_COLORS[8]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                  {(!isSearching && viewMode === "partner") && topEmployees.length > 9 && (
                    <Line key={topEmployees[9].email} type="monotone" dataKey={safeKey(topEmployees[9].email)} name={safeKey(topEmployees[9].email)} stroke={LINE_COLORS[9]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center text-[13px] text-muted-foreground" style={{ height: 300 }}>
              {isSearching
                ? `No dated records matched "${searchQuery}".`
                : "No date-based timeline data for this selection."}
            </div>
          )}

          {/* Summary stats */}
          {!isSearching && viewMode === "partner" && partnerRecords.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border/40">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Records</p>
                <p className="text-[18px] font-bold text-foreground">{partnerRecords.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique People</p>
                <p className="text-[18px] font-bold text-foreground">{new Set(partnerRecords.map(r => r.email)).size}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique Courses</p>
                <p className="text-[18px] font-bold text-foreground">{new Set(partnerRecords.map(r => r.activity)).size}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Months Active</p>
                <p className="text-[18px] font-bold text-foreground">{partnerChartData.length}</p>
              </div>
            </div>
          )}

          {!isSearching && viewMode === "course" && courseRoster.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border/40">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Completions</p>
                <p className="text-[18px] font-bold text-foreground">{courseRoster.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique Learners</p>
                <p className="text-[18px] font-bold text-foreground">{new Set(courseRoster.map(r => r.email)).size}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Partners Represented</p>
                <p className="text-[18px] font-bold text-foreground">{new Set(courseRoster.map(r => r.partner)).size}</p>
              </div>
            </div>
          )}

          {isSearching && globalResults.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border/40">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Matched Records</p>
                <p className="text-[18px] font-bold text-foreground">{globalResults.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique People</p>
                <p className="text-[18px] font-bold text-foreground">{Array.from(new Set(globalResults.map(r => r.email))).length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Partners</p>
                <p className="text-[18px] font-bold text-foreground">{Array.from(new Set(globalResults.map(r => r.partner))).length}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Courses</p>
                <p className="text-[18px] font-bold text-foreground">{Array.from(new Set(globalResults.map(r => r.activity))).length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
