import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Plus, 
  ChevronRight,
  Target,
  GraduationCap,
  Shield,
  Zap,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useModifications } from "@/contexts/ModificationContext";
import { toast } from "sonner";
import { TIER_DEFINITIONS } from "@/lib/data";

export default function GlobalRoadmapView() {
  const { modifiedPartners, events, addEvent, removeEvent } = useModifications();

  // 1. Group Partners by Gap
  const gapClusters = useMemo(() => {
    const categories = [
      { id: "salesPro", label: "Sales Pro", icon: Target, color: "var(--color-pure-orange)" },
      { id: "techPro", label: "Tech Pro", icon: GraduationCap, color: "var(--color-basil-green)" },
      { id: "bootcamp", label: "SE Bootcamp", icon: Zap, color: "var(--color-moss-green)" },
      { id: "implSpec", label: "Impl Specialist", icon: Shield, color: "var(--color-cinnamon-brown)" },
      { id: "aspFoundations", label: "ASP Foundations", icon: Shield, color: "var(--color-pure-orange)" },
    ];

    return categories.map(cat => {
      const partnersMissing = modifiedPartners.filter(p => {
        const req = (p.requirements as any)[cat.id];
        const gap = req.required - (req.obtained ?? req.totalObtained ?? 0);
        return gap > 0;
      });

      return {
        ...cat,
        partners: partnersMissing,
        count: partnersMissing.length
      };
    }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  }, [modifiedPartners]);

  // 2. Event Creation State
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    category: "general" as any,
    partnerIds: [] as number[],
    description: ""
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || newEvent.partnerIds.length === 0) {
      toast.error("Please provide a title and select at least one partner.");
      return;
    }
    addEvent(newEvent);
    setShowCreate(false);
    setNewEvent({ title: "", date: new Date().toISOString().split('T')[0], category: "general", partnerIds: [], description: "" });
    toast.success("Collective Enablement Event scheduled!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-pure-orange" />
            Global Enablement Roadmap & Events
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Group partners by common gaps and schedule collective training events to accelerate compliance.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-pure-orange text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Schedule Enablement Event
        </button>
      </div>

      {/* Cluster Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Gap Clusters (By Category)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gapClusters.map((cluster) => (
              <div 
                key={cluster.id}
                className="terrain-card p-5 group hover:border-pure-orange transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-xl" style={{ background: `${cluster.color}15`, color: cluster.color }}>
                    <cluster.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-full text-slate-500">
                    {cluster.count} Partners
                  </span>
                </div>
                <h4 className="font-bold text-foreground">{cluster.label} Collective Gap</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {cluster.count} partners currently require {cluster.label} enablement to maintain tier compliance.
                </p>
                <button 
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      title: `${cluster.label} Acceleration Workshop`,
                      category: cluster.id as any,
                      partnerIds: cluster.partners.map(p => p.id),
                      description: `Intensive enablement session for ${cluster.label} requirements.`
                    });
                    setShowCreate(true);
                  }}
                  className="w-full py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1 group-hover:border-pure-orange group-hover:text-pure-orange"
                >
                  Create Hybrid Event <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Scheduled Events */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Scheduled Enablement Events</h3>
            {events.length === 0 ? (
              <div className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Calendar className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No collective events scheduled yet.</p>
                <p className="text-xs text-slate-400 mt-1">Use the "Create Hybrid Event" button above to group partners.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(evt => (
                  <motion.div
                    key={evt.id}
                    layoutId={evt.id}
                    className="terrain-card p-4 border-l-4"
                    style={{ borderLeftColor: "var(--color-basil-green)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-basil-green/10 flex flex-col items-center justify-center text-basil-green shrink-0">
                          <span className="text-[10px] font-bold uppercase">{new Date(evt.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{new Date(evt.date).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{evt.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {evt.partnerIds.length} Partners Assigned</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Virtual / Hybrid</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 14:00 - 16:00 (SAST)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-2">{evt.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeEvent(evt.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Assigned Partners Avatars/Bubbles */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                       {evt.partnerIds.slice(0, 8).map(pid => {
                         const p = modifiedPartners.find(part => part.id === pid);
                         return p ? (
                           <div key={pid} className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 border border-slate-200">
                             {p.name}
                           </div>
                         ) : null;
                       })}
                       {evt.partnerIds.length > 8 && (
                         <div className="px-2 py-1 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400">
                           + {evt.partnerIds.length - 8} more
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Creation Form / Success Metrics */}
        <div className="space-y-6">
          {showCreate ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="terrain-card p-6 border-2 border-pure-orange"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-pure-orange" />
                Schedule Event
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Event Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g., Q1 Technical Deep-Dive"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm h-24"
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="What will be covered?"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Targeted Partners ({newEvent.partnerIds.length})</p>
                  <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {modifiedPartners.map(p => (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg transition-colors cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newEvent.partnerIds.includes(p.id)}
                          onChange={e => {
                            const ids = e.target.checked 
                              ? [...newEvent.partnerIds, p.id]
                              : newEvent.partnerIds.filter(id => id !== p.id);
                            setNewEvent({...newEvent, partnerIds: ids});
                          }}
                          className="rounded text-pure-orange focus:ring-pure-orange"
                        />
                        <span className="text-[11px] font-medium text-slate-700 truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setShowCreate(false)}
                    className="py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateEvent}
                    className="py-2.5 rounded-xl bg-pure-orange text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="terrain-card p-6 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
              </div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-basil-green" />
                Collective Impact
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Potential impact by addressing clusters:</p>
              
              <div className="space-y-6">
                {gapClusters.slice(0, 3).map(cluster => (
                  <div key={cluster.id}>
                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                      <span className="text-slate-300">{cluster.label} Gap</span>
                      <span className="text-pure-orange">{cluster.count} Partners</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(cluster.count / modifiedPartners.length) * 100}%` }}
                        className="h-full bg-pure-orange" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Strategic Tip</p>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  "Grouping partners into hybrid training events reduces TCO for enablement by 40% and ensures peer-to-peer benchmarking for technical staff."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
