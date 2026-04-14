/*
 * Partners Page — PEI Dashboard
 * "Soft Terrain" design
 * 4-tier architecture: Authorized → Preferred → Elite → Ambassador
 * Full partner directory with search, tier badges, contact info, enablement + business progress,
 * and admin "Modify" button to update gap counts with justification comments.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TIER_DEFINITIONS,
  PROGRAM_TIERS,
  type ProgramTier,
  type Partner,
  formatCurrency,
  formatPercent,
  getRevenueAttainment,
  generateRecommendedAction,
} from "@/lib/data";
import { trainingData } from "@/lib/trainingData";
import { useModifications } from "@/contexts/ModificationContext";
import { useOverrides } from "@/contexts/OverrideContext";
import ModifyGapModal from "@/components/ModifyGapModal";
import ExportButton from "@/components/ExportButton";
import {
  Search,
  Building2,
  Shield,
  Star,
  Award,
  Crown,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Users,
  Target,
  X,
  Pencil,
  DollarSign,
  GraduationCap,
} from "lucide-react";

const tierIcons: Record<ProgramTier, React.ElementType> = {
  authorized: Shield,
  preferred: Star,
  elite: Award,
  ambassador: Crown,
};

interface PartnersPageProps {
  onNavigateToActivity?: (partner: string, course?: string, search?: string) => void;
}

export default function PartnersPage({ onNavigateToActivity }: PartnersPageProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [modifyPartner, setModifyPartner] = useState<Partner | null>(null);
  const [certPopover, setCertPopover] = useState<{ partnerId: number; category: string } | null>(null);

  const { getOverrideCount } = useOverrides();
  const { modifiedPartners, getModification } = useModifications();

  const filtered = useMemo(() => {
    let result = modifiedPartners;
    if (tierFilter !== "all") {
      result = result.filter((p) => p.programTier === tierFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.targetEmails.some((e) => e.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, tierFilter, modifiedPartners]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { all: modifiedPartners.length };
    PROGRAM_TIERS.forEach((tier) => {
      counts[tier] = modifiedPartners.filter((p) => p.programTier === tier).length;
    });
    return counts;
  }, [modifiedPartners]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5" style={{ color: "var(--color-pure-orange)" }} />
          Partner Directory
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          {modifiedPartners.length} registered partners in the FY27 Global Reseller Program
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[250px]"
          style={{
            background: "color-mix(in srgb, var(--color-cloud-white) 95%, transparent)",
            borderColor: search ? "color-mix(in srgb, var(--color-pure-orange) 40%, transparent)" : "var(--color-stone-gray)",
          }}
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by partner name or email..."
            className="bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch("")} className="p-0.5 rounded hover:bg-black/5">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", ...PROGRAM_TIERS] as const).map((t) => {
            const isActive = tierFilter === t;
            const label = t === "all" ? "All" : TIER_DEFINITIONS[t as ProgramTier].label;
            const count = tierCounts[t] || 0;
            const def = t !== "all" ? TIER_DEFINITIONS[t as ProgramTier] : null;
            return (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: isActive
                    ? def ? def.bg : "color-mix(in srgb, var(--color-ash-gray) 10%, transparent)"
                    : "transparent",
                  color: isActive
                    ? def ? def.color : "var(--color-ash-gray)"
                    : "var(--color-walnut-brown)",
                  border: isActive ? "1px solid currentColor" : "1px solid transparent",
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((partner, i) => {
            const def = TIER_DEFINITIONS[partner.programTier];
            const TierIcon = tierIcons[partner.programTier];
            const isExpanded = expandedId === partner.id;
            const overrideCount = getOverrideCount(partner.id);
            const modification = getModification(partner.id);
            const tierReq = def.enablement;
            const totalObtained =
              Math.min(partner.requirements.salesPro.obtained, partner.requirements.salesPro.required) +
              Math.min(partner.requirements.techPro.obtained, partner.requirements.techPro.required) +
              Math.min(partner.requirements.bootcamp.obtained, partner.requirements.bootcamp.required) +
              Math.min(partner.requirements.implSpec.obtained, partner.requirements.implSpec.required);

            return (
              <motion.div
                key={partner.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="terrain-card p-5 cursor-pointer hover:shadow-lg transition-shadow relative"
                onClick={() => setExpandedId(isExpanded ? null : partner.id)}
              >
                {/* Modified indicator stripe */}
                {modification && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "var(--color-basil-green)" }} />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-foreground leading-tight">{partner.name}</h3>
                      {modification && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--color-basil-green) 10%, transparent)", color: "var(--color-basil-green)" }}>
                          <Pencil className="w-2.5 h-2.5" /> Modified
                        </span>
                      )}
                      {overrideCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)", color: "var(--color-pure-orange)" }}>
                          <CheckCircle2 className="w-2.5 h-2.5" /> {overrideCount}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: def.bg, color: def.color }}>
                      <TierIcon className="w-3 h-3" />
                      {def.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: partner.enablementScore >= 80 ? "var(--color-pure-orange)" : partner.enablementScore >= 40 ? "var(--color-moss-green)" : "var(--color-cinnamon-brown)",
                      }}
                    >
                      {partner.enablementScore}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{totalObtained}/{tierReq.total} met</p>
                  </div>
                </div>

                {/* Compliance Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                    background: partner.enablementCompliant ? "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)" : "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
                    color: partner.enablementCompliant ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)",
                  }}>
                    {partner.enablementCompliant ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    Enablement
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                    background: partner.businessCompliant ? "color-mix(in srgb, var(--color-basil-green) 10%, transparent)" : "color-mix(in srgb, var(--color-cinnamon-brown) 8%, transparent)",
                    color: partner.businessCompliant ? "var(--color-basil-green)" : "var(--color-cinnamon-brown)",
                  }}>
                    {partner.businessCompliant ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    Business
                  </span>
                  {partner.overallCompliant && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--color-pure-orange) 10%, transparent)", color: "var(--color-pure-orange)" }}>
                      <Shield className="w-2.5 h-2.5" /> Compliant
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "var(--color-stone-gray)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${partner.enablementScore}%`,
                      background: partner.enablementScore >= 80 ? "var(--color-pure-orange)" : partner.enablementScore >= 40 ? "var(--color-moss-green)" : "var(--color-cinnamon-brown)",
                    }}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {partner.totalGaps} gaps</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {partner.totalExams} exams</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {partner.targetEmails.length} contacts</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 pt-4 border-t border-border/50 space-y-3"
                    >
                      {/* Requirements Breakdown */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                          Enablement Requirements
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {([
                            { label: "Sales Pro", key: "salesPro" as const },
                            { label: "Tech Pro", key: "techPro" as const },
                            { label: "Bootcamp", key: "bootcamp" as const },
                            { label: "Impl Spec", key: "implSpec" as const },
                          ]).map(({ label, key }) => {
                            const req = partner.requirements[key];
                            const met = req.obtained >= req.required;
                            const isActive = certPopover?.partnerId === partner.id && certPopover?.category === key;
                            return (
                              <div
                                key={key}
                                className="px-3 py-2 rounded-lg text-center cursor-pointer hover:bg-black/5 active:scale-95 transition-all"
                                style={{
                                  background: isActive
                                    ? "color-mix(in srgb, var(--color-basil-green) 12%, transparent)"
                                    : met ? "color-mix(in srgb, var(--color-pure-orange) 6%, transparent)"
                                    : req.required === 0 ? "color-mix(in srgb, var(--color-cloud-white) 60%, transparent)"
                                    : "color-mix(in srgb, var(--color-cinnamon-brown) 4%, transparent)",
                                  outline: isActive ? "1.5px solid color-mix(in srgb, var(--color-basil-green) 40%, transparent)" : "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCertPopover((prev) =>
                                    prev?.partnerId === partner.id && prev?.category === key
                                      ? null
                                      : { partnerId: partner.id, category: key }
                                  );
                                }}
                              >
                                <p className="text-[10px] text-muted-foreground">{label}</p>
                                <p className="text-[14px] font-bold" style={{ color: req.required === 0 ? "var(--color-walnut-brown)" : met ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)" }}>
                                  {req.obtained}/{req.required}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        {/* Training people popover */}
                        {certPopover?.partnerId === partner.id && (() => {
                          const cat = certPopover.category as "salesPro" | "techPro" | "bootcamp" | "implSpec";
                          const people = trainingData[partner.id]?.[cat] ?? [];
                          const catLabel = { salesPro: "Sales Pro", techPro: "Tech Pro", bootcamp: "Bootcamp", implSpec: "Impl Spec" }[cat] ?? cat;
                          return (
                            <div 
                              className="mt-2 rounded-lg p-4 border shadow-sm" 
                              style={{ 
                                background: "color-mix(in srgb, var(--color-stone-gray) 15%, transparent)", 
                                borderColor: "color-mix(in srgb, var(--color-stone-gray) 50%, transparent)" 
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-pure-orange)" }}>
                                  {catLabel} — Completed ({people.length})
                                </p>
                                <button onClick={(e) => { e.stopPropagation(); setCertPopover(null); }} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-black/5 hover:bg-black/10 rounded-md">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {people.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground italic">No training completions recorded for this category.</p>
                              ) : (
                                <div className="space-y-2">
                                  {people.map((person) => (
                                    <div key={person.email} className="flex items-center gap-2">
                                      <GraduationCap className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-moss-green)" }} />
                                      <span className="text-[11px] font-bold text-slate-800">
                                        {person.firstName} {person.lastName}
                                      </span>
                                      <span className="text-[10px] text-slate-500">{person.email}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Business Metrics */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                          Business Metrics
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { label: "Bookings USD", value: partner.businessMetrics.bookingsUSD, threshold: def.businessMetrics.bookingsUSD, format: (v: number) => `$${v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : (v / 1000).toFixed(0) + "K"}` },
                            { label: "Unique Customers", value: partner.businessMetrics.uniqueCustomers, threshold: def.businessMetrics.uniqueCustomers, format: (v: number) => v.toString() },
                            { label: "PDS (Installs)", value: partner.businessMetrics.partnerDeliveredServices, threshold: def.businessMetrics.partnerDeliveredServices, format: (v: number) => v.toString() },
                          ]).map(({ label, value, threshold, format }) => {
                            const met = value !== null && threshold !== null && value >= threshold;
                            const na = threshold === null;
                            return (
                              <div key={label} className="px-3 py-2 rounded-lg text-center" style={{ background: na ? "color-mix(in srgb, var(--color-cloud-white) 60%, transparent)" : met ? "color-mix(in srgb, var(--color-pure-orange) 6%, transparent)" : "color-mix(in srgb, var(--color-cinnamon-brown) 4%, transparent)" }}>
                                <p className="text-[10px] text-muted-foreground">{label}</p>
                                <p className="text-[13px] font-bold" style={{ color: na ? "var(--color-walnut-brown)" : met ? "var(--color-pure-orange)" : "var(--color-cinnamon-brown)" }}>
                                  {value !== null ? format(value) : "Not Set"}
                                </p>
                                {threshold !== null && (
                                  <p className="text-[9px] text-muted-foreground">
                                    Req: {format(threshold)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* FY27 Revenue & Training */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> FY27 Revenue & Pipeline
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Revenue", val: formatCurrency(partner.revenueData.revenueFY27, true) },
                            { label: "Target", val: formatCurrency(partner.revenueData.targetFY27, true) },
                            { label: "Attainment", val: (() => { const a = getRevenueAttainment(partner); return a !== null ? `${a}%` : "\u2014"; })() },
                            { label: "Pipeline", val: formatCurrency(partner.revenueData.pipelineFY27, true) },
                          ].map((item) => (
                            <div key={item.label} className="px-3 py-2 rounded-lg text-center" style={{ background: "color-mix(in srgb, var(--color-ash-gray) 4%, transparent)" }}>
                              <p className="text-[10px] text-muted-foreground">{item.label}</p>
                              <p className="text-[13px] font-bold text-foreground">{item.val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {[
                            { label: "Contribution", val: formatPercent(partner.revenueData.contributionFY27) },
                            { label: "DR (P-S)", val: formatCurrency(partner.revenueData.drFY27, true) },
                            { label: "FY26 Rev", val: formatCurrency(partner.revenueData.revenueFY26, true) },
                            { label: "FY25 Rev", val: formatCurrency(partner.revenueData.revenueFY25, true) },
                          ].map((item) => (
                            <div key={item.label} className="px-3 py-2 rounded-lg text-center" style={{ background: "color-mix(in srgb, var(--color-cloud-white) 60%, transparent)" }}>
                              <p className="text-[10px] text-muted-foreground">{item.label}</p>
                              <p className="text-[13px] font-bold text-foreground">{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>


                      {/* Last Modification Comment */}
                      {modification && (
                        <div className="px-3 py-2.5 rounded-lg" style={{ background: "color-mix(in srgb, var(--color-basil-green) 4%, transparent)", border: "1px solid color-mix(in srgb, var(--color-basil-green) 12%, transparent)" }}>
                          <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--color-basil-green)" }}>Last Modification</p>
                          <p className="text-[12px] text-foreground/80 italic leading-relaxed">"{modification.comment}"</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            — {modification.modifiedBy},{" "}
                            {new Date(modification.modifiedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}

                      {/* Action */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Recommended Action</p>
                        <p className="text-[12px] text-foreground leading-relaxed">{generateRecommendedAction(partner)}</p>
                      </div>

                      {/* Contacts */}
                      {partner.targetEmails.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Contacts</p>
                          <div className="flex flex-wrap gap-1.5">
                            {partner.targetEmails.map((email) => (
                              <a key={email} href={`mailto:${email}`} onClick={(e) => e.stopPropagation()} className="text-[10px] px-2 py-0.5 rounded-md font-medium hover:opacity-80 transition-opacity" style={{ background: "color-mix(in srgb, var(--color-basil-green) 8%, transparent)", color: "var(--color-basil-green)" }}>
                                {email}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Modify & Export Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setModifyPartner(partner); }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:shadow-md"
                          style={{ background: "var(--color-pure-orange)", color: "white", boxShadow: "0 2px 8px color-mix(in srgb, var(--color-pure-orange) 25%, transparent)" }}
                        >
                          <Pencil className="w-4 h-4" /> Modify Gaps
                        </button>
                        <ExportButton partner={partner} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="terrain-card p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-[14px] font-medium text-muted-foreground">No partners found</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modify Gap Modal */}
      {modifyPartner && (
        <ModifyGapModal partner={modifyPartner} isOpen={!!modifyPartner} onClose={() => setModifyPartner(null)} />
      )}
    </div>
  );
}
