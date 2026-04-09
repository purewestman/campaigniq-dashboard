import { useState, useMemo, useEffect } from "react";
import { Activity, Trophy, Search, Users } from "lucide-react";
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

// Colors for the top 10 lines
const LINE_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#9333ea", // purple-600
  "#0891b2", // cyan-600
  "#c026d3", // fuchsia-600
  "#ea580c", // orange-600
  "#4f46e5", // indigo-600
  "#059669", // emerald-600
];

/** Sanitise an email into a recharts-safe dataKey (no dots, no @) */
const safeKey = (email: string) => email.replace(/[@.]/g, "_");

interface PartnerActivityPageProps {
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
}: PartnerActivityPageProps) {
  const [viewMode, setViewMode] = useState<"partner" | "course">(
    initialCourse ? "course" : "partner"
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");

  // ── Partner state ────────────────────────────────────────────────
  const partners = useMemo(() => Object.keys(activityData).sort(), []);
  const [selectedPartner, setSelectedPartner] = useState<string>(
    initialPartner || partners[0] || ""
  );

  // ── Course state ─────────────────────────────────────────────────
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    Object.values(activityData).forEach((recs) =>
      recs.forEach((r) => { if (r.activity) courses.add(r.activity); })
    );
    return Array.from(courses).sort();
  }, []);
  const [selectedCourse, setSelectedCourse] = useState<string>(
    initialCourse || uniqueCourses[0] || ""
  );

  // Sync state when deep-link props change
  useEffect(() => {
    if (initialPartner) { setViewMode("partner"); setSelectedPartner(initialPartner); }
    else if (initialCourse) { setViewMode("course"); setSelectedCourse(initialCourse); }
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialPartner, initialCourse, initialSearch]);

  // ─────────────────────────────────────────────────────────────────
  // PARTNER VIEW — filtered records + derived lists
  // ─────────────────────────────────────────────────────────────────
  const filteredPartnerRecords = useMemo(() => {
    if (!selectedPartner || !activityData[selectedPartner]) return [];
    let recs = activityData[selectedPartner];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      recs = recs.filter((r) => {
        const act = r.activity.toLowerCase();
        const person = `${r.name} ${r.email}`.toLowerCase();
        return act.includes(q) || person.includes(q);
      });
    }
    return recs;
  }, [selectedPartner, searchQuery]);

  // Top 10 employees by module count — recomputes whenever filtered records change
  const topEmployees = useMemo(() => {
    if (filteredPartnerRecords.length === 0) return [];

    const counts: Record<
      string,
      { name: string; email: string; count: number; activities: Set<string> }
    > = {};

    filteredPartnerRecords.forEach((r) => {
      if (!counts[r.email]) {
        counts[r.email] = { name: r.name, email: r.email, count: 0, activities: new Set() };
      }
      counts[r.email].count += 1;
      if (r.activity) counts[r.email].activities.add(r.activity);
    });

    return Object.values(counts)
      .map((emp) => ({ ...emp, activities: Array.from(emp.activities) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredPartnerRecords]); // ← correct dep; updates on search

  // Timeline chart data for partner view
  // Uses sanitised email keys so recharts doesn't mis-parse dots as nested paths
  const partnerChartData = useMemo(() => {
    if (filteredPartnerRecords.length === 0) return [];

    const timelineMap: Record<string, Record<string, number | string>> = {};

    // Build a lookup: raw email → safe dataKey
    const emailToKey: Record<string, string> = {};
    topEmployees.forEach((e) => { emailToKey[e.email] = safeKey(e.email); });

    filteredPartnerRecords.forEach((r) => {
      if (!r.date) return;
      const dateObj = new Date(r.date);
      const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

      if (!timelineMap[monthStr]) {
        timelineMap[monthStr] = { name: monthStr, Total: 0 };
        topEmployees.forEach((e) => { timelineMap[monthStr][safeKey(e.email)] = 0; });
      }

      (timelineMap[monthStr].Total as number) += 1;
      if (emailToKey[r.email]) {
        (timelineMap[monthStr][emailToKey[r.email]] as number) += 1;
      }
    });

    return Object.values(timelineMap).sort((a, b) =>
      (a.name as string).localeCompare(b.name as string)
    );
  }, [filteredPartnerRecords, topEmployees]); // ← correct deps

  // ─────────────────────────────────────────────────────────────────
  // COURSE VIEW — roster + timeline
  // ─────────────────────────────────────────────────────────────────
  const courseEmployees = useMemo(() => {
    if (!selectedCourse) return [];
    const list: Array<{ partner: string; name: string; email: string; date: string | null }> = [];

    for (const [partner, records] of Object.entries(activityData)) {
      records.forEach((r) => {
        if (r.activity === selectedCourse) list.push({ partner, name: r.name, email: r.email, date: r.date });
      });
    }

    // Apply search filter by name / email / partner
    const filtered = searchQuery.trim()
      ? list.filter((e) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            e.name.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.partner.toLowerCase().includes(q)
          );
        })
      : list;

    return filtered.sort((a, b) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });
  }, [selectedCourse, searchQuery]);

  const courseChartData = useMemo(() => {
    if (!selectedCourse) return [];
    const timelineMap: Record<string, { name: string; Completions: number }> = {};

    for (const records of Object.values(activityData)) {
      records.forEach((r) => {
        if (r.activity === selectedCourse && r.date) {
          const dateObj = new Date(r.date);
          const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
          if (!timelineMap[monthStr]) timelineMap[monthStr] = { name: monthStr, Completions: 0 };
          timelineMap[monthStr].Completions += 1;
        }
      });
    }
    return Object.values(timelineMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCourse]);

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  const chartData = viewMode === "partner" ? partnerChartData : courseChartData;
  const hasChart = chartData.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Activity Tracking
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Analyze online module activity by Partner or by Course.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* View Toggles */}
          <div className="flex bg-black/[0.04] p-1 rounded-lg">
            <button
              onClick={() => setViewMode("partner")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                viewMode === "partner"
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Partner
            </button>
            <button
              onClick={() => setViewMode("course")}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                viewMode === "course"
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Course
            </button>
          </div>

          {/* Contextual Selector */}
          {viewMode === "partner" ? (
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] sm:max-w-xs"
            >
              {partners.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          ) : (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-black/10 bg-white/80 rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-[200px] sm:max-w-xs"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <div className="relative flex items-center min-w-[220px]">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={viewMode === "partner" ? "Filter by name, email, course…" : "Filter by name or partner…"}
              className="pl-9 pr-3 py-2 border border-black/10 bg-white/80 rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Clear deep-link filters */}
        {(initialPartner || initialCourse || initialSearch) && (
          <button
            onClick={() => { setSearchQuery(""); onClearFilters?.(); }}
            className="text-[12px] font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            Clear deep-link filters
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Leaderboard or Roster */}
        <div className="terrain-card p-6 flex flex-col h-[600px] lg:h-[500px]">
          <h3 className="text-[14px] font-bold text-foreground mb-4 flex items-center gap-2">
            {viewMode === "partner" ? (
              <><Trophy className="w-4 h-4 text-amber-500" /> Top Employees{searchQuery ? " (filtered)" : ""}</>
            ) : (
              <><Users className="w-4 h-4 text-rose-500" /> Completion Roster ({courseEmployees.length})</>
            )}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

            {/* PARTNER VIEW: Top Employees */}
            {viewMode === "partner" && topEmployees.length > 0 && (
              <div className="space-y-4">
                {topEmployees.map((emp, idx) => (
                  <div key={emp.email} className="flex flex-col p-4 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0"
                          style={{ background: LINE_COLORS[idx % LINE_COLORS.length] + "22", color: LINE_COLORS[idx % LINE_COLORS.length] }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground leading-tight">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {emp.count} <span className="text-[10px] font-medium text-blue-500">modules</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-10">
                      {emp.activities.map((act, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-black/10 bg-white shadow-sm text-muted-foreground break-words max-w-full">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* COURSE VIEW: Roster */}
            {viewMode === "course" && courseEmployees.length > 0 && (
              <div className="space-y-3">
                {courseEmployees.map((emp, idx) => (
                  <div key={`${emp.email}-${idx}`} className="flex flex-col p-3 rounded-lg bg-black/[0.02] border border-black/[0.04]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{emp.name}</p>
                        <p className="text-[11px] font-medium text-blue-600 mt-0.5">{emp.partner}</p>
                      </div>
                      {emp.date && (
                        <div className="text-[10px] text-muted-foreground ml-2">
                          {new Date(emp.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((viewMode === "partner" && topEmployees.length === 0) ||
              (viewMode === "course" && courseEmployees.length === 0)) && (
              <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}".` : "No tracking data found for this selection."}
              </div>
            )}
          </div>
        </div>

        {/* Right — Timeline Chart */}
        <div className="terrain-card p-6 lg:col-span-2 flex flex-col" style={{ height: 400 }}>
          <h3 className="text-[14px] font-bold text-foreground mb-4">
            Activity Timeline — Modules Completed per Month
          </h3>
          <div className="flex-1 w-full" style={{ minHeight: 0 }}>
            {hasChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", background: "rgba(255,255,255,0.95)" }}
                    formatter={(value, name) => {
                      // Show display name instead of safe email key in tooltip
                      if (viewMode === "partner") {
                        const emp = topEmployees.find((e) => safeKey(e.email) === name);
                        return [value, emp ? (emp.name || emp.email.split("@")[0]) : name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    formatter={(value) => {
                      if (viewMode === "partner") {
                        const emp = topEmployees.find((e) => safeKey(e.email) === value);
                        return emp ? (emp.name || emp.email.split("@")[0]) : value;
                      }
                      return value;
                    }}
                  />

                  {/* Partner view: Total + individual employee lines */}
                  {viewMode === "partner" && (
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

                  {/* Course view: single Completions line */}
                  {viewMode === "course" && (
                    <Line
                      type="monotone"
                      dataKey="Completions"
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px] text-muted-foreground">
                {searchQuery
                  ? `No activity data matched "${searchQuery}".`
                  : "No timeline data available for this selection."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
