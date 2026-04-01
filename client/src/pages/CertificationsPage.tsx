/*
 * Certifications Page — CampaignIQ Dashboard
 * "Soft Terrain" design
 * Exam records, certification leaderboard, and per-partner exam details
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { partners, TIER_CONFIG } from "@/lib/data";
import {
  Award,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  BookOpen,
  Trophy,
  X,
  FileCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface FlatExam {
  partnerId: number;
  partnerName: string;
  tier: string;
  email: string;
  certification: string;
}

export default function CertificationsPage() {
  const [search, setSearch] = useState("");
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);

  // Flatten all exam records
  const allExams = useMemo<FlatExam[]>(() => {
    const exams: FlatExam[] = [];
    partners.forEach((p) => {
      p.exams.forEach((e) => {
        e.certifications.forEach((cert) => {
          exams.push({
            partnerId: p.id,
            partnerName: p.name,
            tier: p.tier,
            email: e.email,
            certification: cert,
          });
        });
      });
    });
    return exams;
  }, []);

  // Partners with exams, sorted by count
  const partnerExamCounts = useMemo(() => {
    return partners
      .filter((p) => p.totalExams > 0)
      .sort((a, b) => b.totalExams - a.totalExams);
  }, []);

  // Certification type breakdown
  const certTypes = useMemo(() => {
    const map = new Map<string, number>();
    allExams.forEach((e) => {
      const short = e.certification
        .replace("Certified ", "")
        .replace("Platform ", "")
        .replace(" Certificate", "")
        .replace(" Exam", "");
      map.set(short, (map.get(short) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allExams]);

  const certColors = [
    "oklch(0.60 0.12 175)",
    "oklch(0.58 0.16 290)",
    "oklch(0.75 0.14 75)",
    "oklch(0.62 0.19 15)",
    "oklch(0.55 0.12 220)",
    "oklch(0.65 0.10 150)",
    "oklch(0.50 0.14 330)",
    "oklch(0.70 0.12 45)",
  ];

  // Individual leaderboard
  const individualLeaderboard = useMemo(() => {
    const map = new Map<string, { email: string; partner: string; count: number }>();
    partners.forEach((p) => {
      p.exams.forEach((e) => {
        const existing = map.get(e.email);
        if (existing) {
          existing.count += e.certifications.length;
        } else {
          map.set(e.email, { email: e.email, partner: p.name, count: e.certifications.length });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, []);

  // Filter exams by search
  const filteredExams = useMemo(() => {
    if (!search.trim()) return allExams;
    const q = search.trim().toLowerCase();
    return allExams.filter(
      (e) =>
        e.partnerName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.certification.toLowerCase().includes(q)
    );
  }, [allExams, search]);

  const totalCerts = allExams.length;
  const uniqueHolders = new Set(allExams.map((e) => e.email)).size;
  const partnersWithCerts = partnerExamCounts.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: "oklch(0.58 0.16 290)" }} />
          Certifications
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          {totalCerts} certifications earned by {uniqueHolders} individuals across {partnersWithCerts} partners
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Certifications", value: totalCerts, icon: Award, color: "oklch(0.58 0.16 290)" },
          { label: "Unique Holders", value: uniqueHolders, icon: User, color: "oklch(0.60 0.12 175)" },
          { label: "Partners with Certs", value: partnersWithCerts, icon: BookOpen, color: "oklch(0.75 0.14 75)" },
          { label: "Cert Types", value: certTypes.length, icon: FileCheck, color: "oklch(0.62 0.19 15)" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="terrain-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}15` }}
              >
                <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              </div>
              <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Partner Certification Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="terrain-card p-5"
        >
          <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: "oklch(0.75 0.14 75)" }} />
            Partner Certification Leaderboard
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Partners ranked by total certifications earned
          </p>
          <div style={{ height: Math.max(250, partnerExamCounts.length * 32) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={partnerExamCounts.map((p) => ({
                  name: p.name.length > 20 ? p.name.substring(0, 18) + "…" : p.name,
                  fullName: p.name,
                  count: p.totalExams,
                  tier: p.tier,
                }))}
                layout="vertical"
                margin={{ left: 130, right: 20, top: 5, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.55 0.02 55)" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "oklch(0.45 0.02 55)" }}
                  width={125}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="terrain-card px-3 py-2 shadow-lg">
                        <p className="text-[11px] font-bold text-foreground">{d.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{d.count} certifications</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {partnerExamCounts.map((p, i) => (
                    <Cell
                      key={i}
                      fill={TIER_CONFIG[p.tier as keyof typeof TIER_CONFIG].color}
                      fillOpacity={0.65}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Certification Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="terrain-card p-5"
        >
          <h3 className="text-[14px] font-bold text-foreground mb-1">
            Certification Type Breakdown
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Distribution of certification types across the ecosystem
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={certTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {certTypes.map((_, i) => (
                    <Cell key={i} fill={certColors[i % certColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="terrain-card px-3 py-2 shadow-lg">
                        <p className="text-[11px] font-bold text-foreground">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground">{d.count} certifications</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 max-h-[200px] overflow-y-auto">
            {certTypes.map((ct, i) => (
              <div key={ct.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: certColors[i % certColors.length] }} />
                  <span className="text-foreground truncate">{ct.name}</span>
                </div>
                <span className="font-bold text-muted-foreground ml-2">{ct.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Individual Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="terrain-card p-5"
      >
        <h3 className="text-[14px] font-bold text-foreground mb-1 flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: "oklch(0.60 0.12 175)" }} />
          Top Certified Individuals
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          Engineers ranked by number of certifications earned
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground w-8">#</th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Partner</th>
                <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Certs</th>
              </tr>
            </thead>
            <tbody>
              {individualLeaderboard.slice(0, 15).map((person, i) => (
                <tr key={person.email} className="border-b border-border/20 hover:bg-black/[0.02] transition-colors">
                  <td className="py-2 px-3">
                    {i < 3 ? (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                        style={{
                          background: i === 0 ? "oklch(0.75 0.14 75)" : i === 1 ? "oklch(0.65 0.02 55)" : "oklch(0.62 0.10 50)",
                        }}
                      >
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{i + 1}</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <a
                      href={`mailto:${person.email}`}
                      className="font-medium hover:underline"
                      style={{ color: "oklch(0.48 0.16 290)" }}
                    >
                      {person.email}
                    </a>
                  </td>
                  <td className="py-2 px-3 text-foreground">{person.partner}</td>
                  <td className="py-2 px-3 text-center font-bold" style={{ color: "oklch(0.58 0.16 290)" }}>
                    {person.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Searchable Exam Records */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="terrain-card p-5"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-[14px] font-bold text-foreground">All Exam Records</h3>
            <p className="text-[11px] text-muted-foreground">
              {filteredExams.length} of {allExams.length} records
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border min-w-[250px]"
            style={{
              background: "oklch(0.99 0.003 85 / 0.95)",
              borderColor: search ? "oklch(0.58 0.16 290 / 0.4)" : "oklch(0.92 0.01 85)",
            }}
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams, emails, partners..."
              className="bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="p-0.5 rounded hover:bg-black/5">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0" style={{ background: "oklch(0.99 0.003 85)" }}>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Partner</th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Certification</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam, i) => (
                <tr key={`${exam.email}-${exam.certification}-${i}`} className="border-b border-border/20 hover:bg-black/[0.02] transition-colors">
                  <td className="py-1.5 px-3 text-foreground font-medium">{exam.partnerName}</td>
                  <td className="py-1.5 px-3">
                    <a
                      href={`mailto:${exam.email}`}
                      className="hover:underline"
                      style={{ color: "oklch(0.48 0.16 290)" }}
                    >
                      {exam.email}
                    </a>
                  </td>
                  <td className="py-1.5 px-3 text-foreground">{exam.certification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExams.length === 0 && (
          <div className="py-8 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-[12px] text-muted-foreground">No exam records match your search.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
