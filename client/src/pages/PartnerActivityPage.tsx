/*
 * Activity Tracer — unified view of partner training completions
 * Data sources: activityData (Excel) + csvActivityData (Training Report CSV)
 * Three modes:
 *   • Global search  — search any name / course across ALL partners
 *   • By Partner     — leaderboard + monthly timeline for one partner
 *   • By Course      — roster + monthly timeline for one course
 */

import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  Trophy,
  Search,
  Users,
  X,
  BookOpen,
  Building2,
} from "lucide-react";
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
    // If this partner already exists in activityData, skip (avoid double-counting)
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
  const [viewMode, setViewMode] = useState<"partner" | "course">(
    initialCourse ? "course" : "partner"
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedPartner, setSelectedPartner] = useState(initialPartner || ALL_PARTNERS[0] || "");
  const [selectedCourse, setSelectedCourse]   = useState(initialCourse  || ALL_COURSES[0]  || "");

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
    return ALL_RECORDS.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.activity.toLowerCase().includes(q) ||
      r.partner.toLowerCase().includes(q)
    );
  }, [q, isSearching]);

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
    ALL_RECORDS.filter(r => r.partner === selectedPartner),
    [selectedPartner]
  );

  const topEmployees = useMemo(() => {
    if (partnerRecords.length === 0) return [];
    const counts: Record<string, { name: string; email: string; count: number; activities: Set<string> }> = {};
    partnerRecords.forEach(r => {
      if (!counts[r.email]) counts[r.email] = { name: r.name, email: r.email, count: 0, activities: new Set() };
      counts[r.email].count += 1;
      if (r.activity) counts[r.email].activities.add(r.activity);
    });
    return Object.values(counts)
      .map(e => ({ ...e, activities: Array.from(e.activities) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [partnerRecords]);

  const partnerChartData = useMemo(() => {
    if (partnerRecords.length === 0) return [];
    const topKeys: Record<string, string> = {};
    topEmployees.forEach(e => { topKeys[e.email] = safeKey(e.email); });

    const map: Record<string, Record<string, number | string>> = {};
    partnerRecords.forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[m]) {
        map[m] = { name: m, Total: 0 };
        Object.values(topKeys).forEach(k => { map[m][k] = 0; });
      }
      (map[m].Total as number) += 1;
      if (topKeys[r.email]) (map[m][topKeys[r.email]] as number) += 1;
    });

    return Object.values(map).sort((a, b) => (a.name as string).localeCompare(b.name as string));
  }, [partnerRecords, topEmployees]);

  // ── By Course ────────────────────────────────────────────────────
  const courseRoster = useMemo(() => {
    if (!selectedCourse) return [];
    return ALL_RECORDS
      .filter(r => r.activity === selectedCourse)
      .sort((a, b) => {
        if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
        return 0;
      });
  }, [selectedCourse]);

  const courseChartData = useMemo(() => {
    if (!selectedCourse) return [];
    const map: Record<string, number> = {};
    ALL_RECORDS.filter(r => r.activity === selectedCourse && r.date).forEach(r => {
      const d = new Date(r.date!);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Completions]) => ({ name, Completions }));
  }, [selectedCourse]);

  // ── Derived for render ────────────────────────────────────────────
  const listItems = isSearching
    ? globalResults
    : viewMode === "partner"
    ? partnerRecords
    : courseRoster;

  const chartData = isSearching ? globalChartData : viewMode === "partner" ? partnerChartData : courseChartData;

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
            {ALL_RECORDS.length.toLocaleString()} training records across {ALL_PARTNERS.length} partners — search any name, course, or partner.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">

          {/* Global search — highest priority, spans full width on mobile */}
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

          {/* Contextual selector — hidden while searching */}
          {!isSearching && viewMode === "partner" && (
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              {ALL_PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          {!isSearching && viewMode === "course" && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-xs"
            >
              {ALL_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
          style={{ background: "oklch(0.58 0.16 290 / 0.08)", color: "oklch(0.42 0.16 290)" }}
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
                  style={{ background: "oklch(0.99 0.003 85)", borderColor: "oklch(0.93 0.01 85)" }}
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
                      style={{ background: "oklch(0.58 0.16 290 / 0.08)", color: "oklch(0.42 0.16 290)" }}
                    >
                      <Building2 className="w-2.5 h-2.5" />{r.partner.split(" ").slice(0, 3).join(" ")}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 min-w-0"
                      style={{ background: "oklch(0.75 0.14 75 / 0.10)", color: "oklch(0.50 0.14 75)" }}
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
                  style={{ background: "oklch(0.99 0.003 85)", borderColor: "oklch(0.93 0.01 85)" }}
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
                  style={{ background: "oklch(0.99 0.003 85)", borderColor: "oklch(0.93 0.01 85)" }}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{emp.name}</p>
                    <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: "oklch(0.42 0.16 290)" }}>{emp.partner}</p>
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
            {isSearching ? "Matched Activity — Timeline" : viewMode === "partner" ? `${selectedPartner.split(" ").slice(0, 3).join(" ")} — Monthly Activity` : "Course Completions — Timeline"}
          </h3>

          {chartData.length > 0 ? (
            /* Fixed pixel height so ResponsiveContainer can resolve height="100%" */
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
                      if (viewMode === "partner" && !isSearching) {
                        const emp = topEmployees.find(e => safeKey(e.email) === name);
                        return [value, emp ? (emp.name || emp.email.split("@")[0]) : name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value: string) => {
                      if (viewMode === "partner" && !isSearching) {
                        const emp = topEmployees.find(e => safeKey(e.email) === value);
                        return emp ? (emp.name || emp.email.split("@")[0]) : value;
                      }
                      return value;
                    }}
                  />

                  {/* Global search or course: single Completions line */}
                  {(isSearching || viewMode === "course") && (
                    <Line type="monotone" dataKey="Completions" stroke="#e11d48" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6 }} />
                  )}

                  {/* Partner view: Total + individual per-employee lines */}
                  {!isSearching && viewMode === "partner" && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="Total"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                        activeDot={{ r: 6 }}
                      />
                      {topEmployees.map((emp, i) => (
                        <Line
                          key={emp.email}
                          type="monotone"
                          dataKey={safeKey(emp.email)}
                          name={safeKey(emp.email)}
                          stroke={LINE_COLORS[i % LINE_COLORS.length]}
                          strokeWidth={1.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                    </>
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

          {/* Summary stats below chart */}
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
