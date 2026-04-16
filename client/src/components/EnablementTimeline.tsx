import React from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  Zap,
  Briefcase,
  Wrench,
  GraduationCap,
  Sparkles,
  Search,
  Users,
  Shield,
  Plus,
  Star,
  Trash2
} from "lucide-react";
import type { Partner } from "@/lib/data";
import { activityData } from "@/lib/activityData";
import { useModifications, type CustomRoadmapItem as CustomItem } from "@/contexts/ModificationContext";
import { trainingData } from "@/lib/trainingData";
import { useState } from "react";
import { toast } from "sonner";

interface TimelineItem {
  id: string;
  monthRange: string;
  quarter: string;
  category: "enablement" | "demand-gen" | "certification";
  label: string;
  description: string;
  status: "completed" | "planned" | "gap";
  icon: any;
  color: string;
  emails?: string[];
}

interface EnablementTimelineProps {
  partner: Partner;
  compact?: boolean;
}

export default function EnablementTimeline({ partner, compact = false }: EnablementTimelineProps) {
  const { getModification, addModification, events, partnerTimelines, updatePartnerTimeline } = useModifications();
  const reqs = partner.requirements;
  const activities = activityData[partner.name] || [];
  const mod = getModification(partner.id);
  const customItems = mod?.customItems || [];

  // Only show emails from this partner's domain
  const recommendedEmails = React.useMemo(() => {
    const domainEmails = Array.from(new Set(
      Object.values(trainingData).flatMap(ptd =>
        Object.values(ptd).flatMap(arr => arr.map(p => p.email))
      )
    )).filter(email => email.toLowerCase().endsWith(`@${partner.domain.toLowerCase()}`));

    // Fallback: if no domain emails found, return empty (don't leak other partners)
    return domainEmails;
  }, [partner.domain]);

  // Unique datalist id so each partner card only shows its own users
  const datalistId = `timeline-emails-${partner.id}`;

  // Helper to check if an activity is completed
  const hasActivity = (keywords: string[]) => {
    return keywords.some(kw => 
      activities.some(a => a.activity.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", month: "M1-3", category: "enablement" as any, description: "" });

  const handleAddCustomItem = () => {
    if (!newItem.label) return;
    const item = {
      id: `custom-${Date.now()}`,
      ...newItem,
      status: "planned" as const
    };
    const nextCustomItems = [...customItems, item];
    addModification({
      ...(mod || {
        partnerId: partner.id,
        salesPro: partner.requirements.salesPro.obtained,
        techPro: partner.requirements.techPro.obtained,
        bootcamp: partner.requirements.bootcamp.obtained,
        implSpec: partner.requirements.implSpec.obtained,
        simplyPure: partner.requirements.simplyPure.obtained,
        aspFoundations: partner.requirements.aspFoundations.totalObtained,
        aspStoragePro: partner.requirements.aspStoragePro.totalObtained,
        aspSupportSpec: partner.requirements.aspSupportSpec.totalObtained,
        bookingsUSD: partner.businessMetrics.bookingsUSD,
        uniqueCustomers: partner.businessMetrics.uniqueCustomers,
        partnerDeliveredServices: partner.businessMetrics.partnerDeliveredServices,
        comment: "Added custom roadmap item",
        modifiedBy: "Admin"
      }),
      customItems: nextCustomItems
    });
    setNewItem({ label: "", month: "M1-3", category: "enablement", description: "" });
    setIsAdding(false);
    toast.success("Custom milestone added to roadmap");
  };

  const timelineItems: TimelineItem[] = [
    // --- FOUNDATION (M1-3) ---
    {
      id: "sales-pro",
      monthRange: "Month 1-2",
      quarter: "Q1",
      category: "enablement",
      label: "Sales Professional Foundation",
      description: "Complete foundational sales paths to align on Pure Storage value proposition.",
      status: reqs.salesPro.obtained >= reqs.salesPro.required ? "completed" : "gap",
      icon: Briefcase,
      color: "var(--color-pure-orange)"
    },
    {
      id: "product-tour",
      monthRange: "Month 1-3",
      quarter: "Q1",
      category: "demand-gen",
      label: "Platform Awareness (Product Tours)",
      description: "Engage with 3D Product Tours to master platform aesthetics and key hardware features.",
      status: hasActivity(["3D Product Tour"]) ? "completed" : "planned",
      icon: Search,
      color: "var(--color-basil-green)"
    },
    {
      id: "ppp-cert",
      monthRange: "Month 2-3",
      quarter: "Q1",
      category: "certification",
      label: "Pure Platform Positioning (PPP)",
      description: "Obtain the PPP certificate to validate solution messaging expertise.",
      status: hasActivity(["Platform Positioning"]) ? "completed" : "gap",
      icon: Award,
      color: "var(--color-pure-orange)"
    },

    // --- DEPTH (M4-6) ---
    {
      id: "tech-pro",
      monthRange: "Month 4-5",
      quarter: "Q2",
      category: "enablement",
      label: "Technical Sales Professional",
      description: "Deep dive into technical architecture and sizing tools.",
      status: reqs.techPro.obtained >= reqs.techPro.required ? "completed" : "gap",
      icon: Wrench,
      color: "var(--color-basil-green)"
    },
    {
      id: "solution-messaging",
      monthRange: "Month 4-6",
      quarter: "Q2",
      category: "demand-gen",
      label: "Solution Messaging Workshops",
      description: "Participate in AI, Cloud, or Cyber Resilience workshops to sharpen demand gen skills.",
      status: hasActivity(["Workshop", "Technical Sellers", "Artificial Intelligence", "Cyber Resilience"]) ? "completed" : "planned",
      icon: Zap,
      color: "var(--color-pure-orange)"
    },
    {
      id: "bootcamp",
      monthRange: "Month 5-6",
      quarter: "Q2",
      category: "enablement",
      label: "SE Bootcamp",
      description: "Hands-on implementation training for pre-sales engineers.",
      status: reqs.bootcamp.obtained >= reqs.bootcamp.required ? "completed" : "gap",
      icon: GraduationCap,
      color: "var(--color-moss-green)"
    },

    // --- SPECIALIZATION (M7-9) ---
    {
      id: "asp-foundations",
      monthRange: "Month 7-8",
      quarter: "Q3",
      category: "certification",
      label: "ASP Foundations Specialization",
      description: "Qualify for Authorized Support Partner status with specialized storage training.",
      status: reqs.aspFoundations.totalObtained >= reqs.aspFoundations.required ? "completed" : "planned",
      icon: Shield,
      color: "var(--color-pure-orange)"
    },
    {
      id: "customer-references",
      monthRange: "Month 7-9",
      quarter: "Q3",
      category: "demand-gen",
      label: "Customer Success / Reference Stories",
      description: "Develop joint customer reference materials and demand generation case studies.",
      status: hasActivity(["Reference", "Slide"]) ? "completed" : "planned",
      icon: Users,
      color: "var(--color-basil-green)"
    },
    {
      id: "storage-pro",
      monthRange: "Month 8-9",
      quarter: "Q3",
      category: "certification",
      label: "Storage Professional Certification",
      description: "Advanced certification for storage architects and implementation experts.",
      status: reqs.aspStoragePro.totalObtained >= reqs.aspStoragePro.required ? "completed" : "planned",
      icon: Award,
      color: "var(--color-pure-orange)"
    },

    // --- EXPERTISE (M10-12) ---
    {
      id: "support-spec",
      monthRange: "Month 10-11",
      quarter: "Q4",
      category: "certification",
      label: "ASP Support Specialist",
      description: "Validate expert-level support capabilities for the full Pure portfolio.",
      status: reqs.aspSupportSpec.totalObtained >= reqs.aspSupportSpec.required ? "completed" : "planned",
      icon: Shield,
      color: "var(--color-pure-orange)"
    },
    {
      id: "market-expansion",
      monthRange: "Month 10-12",
      quarter: "Q4",
      category: "demand-gen",
      label: "Strategic Market Expansion",
      description: "Full alignment on solution practices and joint market development (MDF) plans.",
      status: hasActivity(["Strategy", "MDF", "Marketing"]) ? "completed" : "planned",
      icon: TrendingUp,
      color: "var(--color-basil-green)"
    }
  ];

  // Merge in custom items
  const allTimelineItems: TimelineItem[] = [
    ...timelineItems,
    ...customItems.map(ci => ({
      id: ci.id,
      monthRange: ci.month,
      quarter: ci.month.startsWith("M1") || ci.month.startsWith("M2") || ci.month.startsWith("M3") ? "Q1" :
               ci.month.startsWith("M4") || ci.month.startsWith("M5") || ci.month.startsWith("M6") ? "Q2" :
               ci.month.startsWith("M7") || ci.month.startsWith("M8") || ci.month.startsWith("M9") ? "Q3" : "Q4",
      category: ci.category,
      label: ci.label,
      description: ci.description,
      status: ci.status,
      icon: ci.category === "enablement" ? GraduationCap : ci.category === "demand-gen" ? Target : Award,
      color: "var(--color-ash-gray)"
    }))
  ];

  // Merge in events
  const partnerEvents = events.filter(e => e.partnerIds.includes(partner.id));
  partnerEvents.forEach(evt => {
    allTimelineItems.push({
      id: evt.id,
      monthRange: "Event Schedule",
      quarter: "Q" + Math.ceil((new Date(evt.date).getMonth() + 1) / 3),
      category: "enablement",
      label: `📍 EVENT: ${evt.title}`,
      description: evt.description,
      status: "planned",
      icon: Users,
      color: "var(--color-basil-green)"
    });
  });

  // Use persistent context state or fallback to defaults
  const timelineData = partnerTimelines[partner.id] || allTimelineItems;

  // Map timeline item id → requirement field name
  const GAP_ITEM_MAP: Record<string, keyof typeof reqs> = {
    "sales-pro":     "salesPro",
    "tech-pro":      "techPro",
    "bootcamp":      "bootcamp",
    "ppp-cert":      "implSpec",
    "asp-foundations": "aspFoundations",
    "storage-pro":   "aspStoragePro",
    "support-spec":  "aspSupportSpec",
  };

  const setTimelineData = (updater: any) => {
    const next = typeof updater === 'function' ? updater(timelineData) : updater;
    updatePartnerTimeline(partner.id, next);
  };

  // Called when an email is added to a milestone pill.
  // If the milestone covers a gap requirement, increment the obtained count.
  const handleAssignEmail = (itemId: string, email: string) => {
    // 1. Add to timeline
    setTimelineData((prev: TimelineItem[]) => prev.map(i =>
      i.id === itemId
        ? { ...i, emails: Array.from(new Set([...(i.emails ?? []), email])) }
        : i
    ));

    // 2. Check if this item maps to a gap requirement
    const reqKey = GAP_ITEM_MAP[itemId];
    if (!reqKey) return;

    const req = partner.requirements[reqKey as keyof typeof partner.requirements] as any;
    const currentMod = getModification(partner.id);
    const currentObtained: number = (currentMod as any)?.[reqKey] ?? req.obtained ?? req.totalObtained ?? 0;
    const required: number = req.required ?? 0;

    if (currentObtained >= required) return; // already met

    const newObtained = currentObtained + 1;
    addModification({
      ...(currentMod || {
        partnerId: partner.id,
        salesPro: reqs.salesPro.obtained,
        techPro: reqs.techPro.obtained,
        bootcamp: reqs.bootcamp.obtained,
        implSpec: reqs.implSpec.obtained,
        simplyPure: reqs.simplyPure.obtained,
        aspFoundations: reqs.aspFoundations.totalObtained,
        aspStoragePro: reqs.aspStoragePro.totalObtained,
        aspSupportSpec: reqs.aspSupportSpec.totalObtained,
        bookingsUSD: null,
        uniqueCustomers: null,
        partnerDeliveredServices: null,
        addedEmails: {},
        removedEmails: {},
        comment: `Assigned ${email} to ${itemId}`,
        modifiedBy: "Enablement Plan",
      }),
      [reqKey]: newObtained,
      comment: `Assigned ${email} → fills ${reqKey} gap (${newObtained}/${required})`,
      modifiedBy: "Enablement Plan",
    });
  };

  // Called when an email pill is removed from a milestone
  const handleUnassignEmail = (itemId: string, email: string) => {
    setTimelineData((prev: TimelineItem[]) => prev.map(i =>
      i.id === itemId
        ? { ...i, emails: (i.emails ?? []).filter(e => e !== email) }
        : i
    ));

    const reqKey = GAP_ITEM_MAP[itemId];
    if (!reqKey) return;

    const req = partner.requirements[reqKey as keyof typeof partner.requirements] as any;
    const currentMod = getModification(partner.id);
    const baseObtained: number = req.obtained ?? req.totalObtained ?? 0;
    const currentObtained: number = (currentMod as any)?.[reqKey] ?? baseObtained;

    if (currentObtained <= baseObtained) return; // don't go below actual certifications

    addModification({
      ...(currentMod || {
        partnerId: partner.id,
        salesPro: reqs.salesPro.obtained,
        techPro: reqs.techPro.obtained,
        bootcamp: reqs.bootcamp.obtained,
        implSpec: reqs.implSpec.obtained,
        simplyPure: reqs.simplyPure.obtained,
        aspFoundations: reqs.aspFoundations.totalObtained,
        aspStoragePro: reqs.aspStoragePro.totalObtained,
        aspSupportSpec: reqs.aspSupportSpec.totalObtained,
        bookingsUSD: null,
        uniqueCustomers: null,
        partnerDeliveredServices: null,
        addedEmails: {},
        removedEmails: {},
        comment: `Removed ${email} from ${itemId}`,
        modifiedBy: "Enablement Plan",
      }),
      [reqKey]: Math.max(baseObtained, currentObtained - 1),
      comment: `Removed ${email} → adjusted ${reqKey} (${Math.max(baseObtained, currentObtained - 1)}/${req.required ?? 0})`,
      modifiedBy: "Enablement Plan",
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDropToQuarter = (e: React.DragEvent, targetQuarter: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId) return;

    setTimelineData((prev: TimelineItem[]) => {
      const clone = [...prev];
      const itemIndex = clone.findIndex(i => i.id === draggedId);
      if (itemIndex > -1) {
        // We mutate the item's quarter
        const newItem = { ...clone[itemIndex], quarter: targetQuarter };
        clone[itemIndex] = newItem;
      }
      return clone;
    });
  };

  const handleRemoveTimelineItem = (id: string) => {
    setTimelineData((prev: TimelineItem[]) => prev.filter(i => i.id !== id));
  };

  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      <datalist id={datalistId}>
        {recommendedEmails.map(e => <option key={e} value={e} />)}
      </datalist>

      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "var(--color-pure-orange)" }} />
              12-Month Enablement & Demand Gen Roadmap
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1">
              Strategic planning guide based on current gaps and solution-led growth targets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Manual Entry
            </button>
            <div className="flex items-center gap-4 text-[11px] font-medium ml-4">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              Open Gap
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300" />
              Planned
            </span>
          </div>
        </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Done</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Gap</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-slate-300" /> Planned</span>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      )}

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="terrain-card p-4 bg-slate-50 border-slate-200 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-3">
              <input
                type="text"
                placeholder="Milestone Label (e.g. Workshop Cape Town)"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              />
              <textarea
                placeholder="Description of the activity..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm h-16"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <select
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={newItem.month}
                onChange={(e) => setNewItem({ ...newItem, month: e.target.value })}
              >
                <option value="M1-3">Q1 (Months 1-3)</option>
                <option value="M4-6">Q2 (Months 4-6)</option>
                <option value="M7-9">Q3 (Months 7-9)</option>
                <option value="M10-12">Q4 (Months 10-12)</option>
              </select>
              <select
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="enablement">Enablement</option>
                <option value="demand-gen">Demand Gen</option>
                <option value="certification">Certification</option>
              </select>
              <button
                onClick={handleAddCustomItem}
                className="w-full py-2 bg-pure-orange text-white rounded-lg text-sm font-bold shadow-sm"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-12">
          {quarters.map((q) => (
            <div key={q} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center z-10">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h4 className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">
                  {q} Focus Period
                </h4>
              </div>

              <div 
                className="ml-7 space-y-6 min-h-[50px] pb-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropToQuarter(e, q)}
              >
                {timelineData.filter((item: TimelineItem) => item.quarter === q).map((item: TimelineItem, idx: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-8 group"
                  >
                    {/* Horizontal Connector */}
                    <div className="absolute left-0 top-6 w-4 h-0.5 bg-slate-200" />
                    
                    {/* Status Indicator */}
                    <div className={`absolute -left-1.5 top-[18px] w-3 h-3 rounded-full border-2 z-10 transition-transform group-hover:scale-125 ${
                      item.status === "completed" 
                        ? "bg-green-500 border-green-200" 
                        : item.status === "gap"
                        ? "bg-amber-500 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse"
                        : "bg-white border-slate-300"
                    }`} />

                    <div 
                      className="terrain-card p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 cursor-grab active:cursor-grabbing">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${item.color}10`, color: item.color }}
                          >
                            {/* We use a star icon as fallback if item.icon is lost in JSON serialization */}
                            <Star className="w-5 h-5 mx-auto opacity-50 absolute" />
                          </div>
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-2">
                              <span 
                                contentEditable 
                                suppressContentEditableWarning 
                                className="text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 -ml-1 border-b border-transparent hover:border-slate-300 transition-colors"
                                onBlur={(e) => {
                                  const newText = e.currentTarget.textContent || item.label;
                                  setTimelineData((prev: TimelineItem[]) => prev.map(i => i.id === item.id ? { ...i, label: newText } : i));
                                }}
                              >{item.label}</span>
                              <span 
                                contentEditable 
                                suppressContentEditableWarning 
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                onBlur={(e) => {
                                  const newText = e.currentTarget.textContent || item.monthRange;
                                  setTimelineData((prev: TimelineItem[]) => prev.map(i => i.id === item.id ? { ...i, monthRange: newText } : i));
                                }}
                              >
                                {item.monthRange}
                              </span>
                            </div>
                            <p 
                              contentEditable 
                              suppressContentEditableWarning 
                              className="text-[12px] text-slate-600 mt-1 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 -ml-1 border-b border-transparent hover:border-slate-300 transition-colors cursor-text min-h-[20px]"
                              onBlur={(e) => {
                                const newText = e.currentTarget.textContent || item.description;
                                setTimelineData((prev: TimelineItem[]) => prev.map(i => i.id === item.id ? { ...i, description: newText } : i));
                              }}
                            >
                              {item.description}
                            </p>
                            <div className="mt-2">
                               {/* Multi-assignee pills */}
                               <div className="flex flex-wrap gap-1 mb-1">
                                 {(item.emails ?? (item as any).email ? [(item as any).email] : []).filter(Boolean).map((em: string) => (
                                   <span key={em} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                                     {em.split('@')[0]}
                                     <button
                                       type="button"
                                       onClick={() => handleUnassignEmail(item.id, em)}
                                       className="ml-0.5 hover:text-red-500 transition-colors"
                                       title="Remove assignee"
                                     >×</button>
                                   </span>
                                 ))}
                               </div>
                               <input
                                 type="text"
                                 list={datalistId}
                                 placeholder="+ Add assignee…"
                                 className="text-[10px] text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-300 w-44 transition-colors"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' || e.key === ',') {
                                     e.preventDefault();
                                     const val = (e.target as HTMLInputElement).value.trim();
                                     if (val && val.includes('@')) {
                                       handleAssignEmail(item.id, val);
                                       (e.target as HTMLInputElement).value = '';
                                     }
                                   }
                                 }}
                                 onChange={(e) => {
                                   const val = e.target.value.trim();
                                   const isExact = recommendedEmails.includes(val) ||
                                     (val.includes('@') && val.toLowerCase().endsWith(`@${partner.domain.toLowerCase()}`));
                                   if (isExact) {
                                     handleAssignEmail(item.id, val);
                                     e.target.value = '';
                                   }
                                 }}
                               />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : item.status === "gap"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {item.status === "completed" ? "✓ Done" : item.status === "gap" ? "⚠️ Urgent" : "Next Up"}
                          </span>
                        </div>
                      </div>

                      {/* Detail Pill */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Focus:</span>
                        <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-50">
                          {item.category === "enablement" ? "Core Skills" : item.category === "demand-gen" ? "Market Growth" : "Technical Cert"}
                        </span>
                        {item.status === "gap" && (
                          <div className="flex-1 flex justify-end">
                            <button
                              className="text-[10px] font-bold text-pure-orange hover:text-green-600 transition-colors flex items-center gap-1"
                              onClick={() => {
                                // Mark as completed and eligible for plan submission
                                setTimelineData((prev: TimelineItem[]) =>
                                  prev.map(i => i.id === item.id
                                    ? { ...i, status: "completed" as const }
                                    : i
                                  )
                                );
                                toast.success(`"${item.label}" marked complete`, {
                                  description: "This milestone is now ready to submit to the enablement plan.",
                                });
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Complete
                            </button>
                          </div>
                        )}
                        {item.monthRange === "Event Schedule" && (
                          <div className="flex-1 flex justify-end">
                            <span className="text-[10px] font-bold text-basil-green flex items-center gap-1">
                              Attendance Required
                            </span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleRemoveTimelineItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity ml-auto"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-pure-orange shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Strategic Recommendation:</strong> This plan aligns with the <strong className="text-pure-orange">FY27 Technical Enablement Framework</strong>. Prioritize Q1 gaps to unlock basic tier benefits, then shift focus to Q2-Q3 for solution-led demand generation to maximize MDF eligibility.
        </p>
      </div>
    </div>
  );
}
