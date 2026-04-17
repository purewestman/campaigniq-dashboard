import React, { useState, useMemo } from 'react';
import { Star, Printer, Trash2, GripVertical, Plus, Box, Award, BookOpen, Layers, Zap, Cpu, Briefcase, Wrench, Maximize, Minimize } from 'lucide-react';
import { useModifications } from '@/contexts/ModificationContext';

export type TagType = "Simply Pure" | "Technical Sales Pro" | "SE Bootcamp" | "Architecture + Depth" | "Elective - Deep Dive" | "CIP, Solution based" | "Portfolio" | "Tools" | "Milestone" | "Custom";

export interface RoadmapEvent {
  id: string;
  text: string;
  tag: TagType;
  date?: string;
  email?: string;
  completed?: boolean;
}

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
const ROWS = ["FY27 Main Events", "FY27 Partner Enablement", "FY27 Partner SE Journey", "FY27 EMEA Orange Belt"];

const TAG_STYLES: Record<TagType, { bg: string, text: string, border: string, isStar?: boolean, icon: React.ElementType, iconColor: string }> = {
  "Simply Pure": { bg: "bg-slate-900", text: "text-white", border: "border-slate-800", icon: Box, iconColor: "text-slate-900" },
  "Technical Sales Pro": { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", icon: Award, iconColor: "text-blue-600" },
  "SE Bootcamp": { bg: "bg-red-500", text: "text-white", border: "border-red-600", icon: BookOpen, iconColor: "text-red-500" },
  "Architecture + Depth": { bg: "bg-[#c39bd3]", text: "text-white", border: "border-[#a569bd]", icon: Layers, iconColor: "text-[#c39bd3]" },
  "Elective - Deep Dive": { bg: "bg-yellow-400", text: "text-slate-900", border: "border-yellow-500", icon: Zap, iconColor: "text-yellow-500 fill-yellow-400/50" },
  "CIP, Solution based": { bg: "bg-[#9c4d62]", text: "text-white", border: "border-[#78283f]", icon: Cpu, iconColor: "text-[#9c4d62]" },
  "Portfolio": { bg: "bg-teal-500", text: "text-white", border: "border-teal-600", icon: Briefcase, iconColor: "text-teal-500" },
  "Tools": { bg: "bg-[#b35a1f]", text: "text-white", border: "border-[#934511]", icon: Wrench, iconColor: "text-[#b35a1f]" },
  "Milestone": { bg: "bg-transparent", text: "text-slate-800", border: "border-slate-300", isStar: true, icon: Star, iconColor: "text-yellow-500 fill-yellow-400 drop-shadow scale-110" },
  "Custom": { bg: "bg-slate-200", text: "text-slate-700", border: "border-slate-300", icon: Plus, iconColor: "text-slate-400" }
};

const BASE_MATRIX: Record<string, Record<string, RoadmapEvent[]>> = {};
ROWS.forEach(r => {
  BASE_MATRIX[r] = {};
  MONTHS.forEach(m => {
    BASE_MATRIX[r][m] = [];
  });
});

const inject = (row: string, month: string, text: string, tag: TagType) => {
  if (!BASE_MATRIX[row]?.[month]) return;
  BASE_MATRIX[row][month].push({ id: `item-\${Math.random()}`, text, tag, date: "", email: "" });
};

// --- DATA INJECTION FROM SLIDE ---
// FY27 Main Events
inject("FY27 Main Events", "Feb", "Partner Program Launch", "Milestone");
inject("FY27 Main Events", "Feb", "Fast Start", "Milestone");
inject("FY27 Main Events", "Jun", "Pure Accelerate Las Vegas", "Milestone");
inject("FY27 Main Events", "Aug", "Elite Requirements Check", "Milestone");
inject("FY27 Main Events", "Sep", "Pure Accelerate London", "Milestone");
inject("FY27 Main Events", "Oct", "Pure Accelerate METCA", "Milestone");

// FY27 Partner Enablement
inject("FY27 Partner Enablement", "Feb", "Reddington Customer workshop", "Portfolio");
inject("FY27 Partner Enablement", "Mar", "FT Cent - workshop", "Technical Sales Pro");
inject("FY27 Partner Enablement", "Mar", "FT Cent - CBS workshop", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "Mar", "DCS - PX workshop", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "Mar", "Paddock Club Event", "Portfolio");
inject("FY27 Partner Enablement", "Apr", "9th Bit - PX workshop", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "Apr", "Alliance (RedHat) workshop", "Architecture + Depth");
inject("FY27 Partner Enablement", "Apr", "Triple H Tech event", "Portfolio");
inject("FY27 Partner Enablement", "Apr", "TCM", "Tools");
inject("FY27 Partner Enablement", "May", "NTT ,DSC CPT", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "May", "Paddock Club Event CPT", "Portfolio");
inject("FY27 Partner Enablement", "May", "SE Bootcamp 5th May", "SE Bootcamp");
inject("FY27 Partner Enablement", "Jun", "CES Customer Event-Namibia follow-up event", "Portfolio");
inject("FY27 Partner Enablement", "Jun", "KZN Partner check-in person", "Portfolio");
inject("FY27 Partner Enablement", "Jun", "Alliance (Cisco) workshop", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "Jul", "Reddington Customer workshop", "Portfolio");
inject("FY27 Partner Enablement", "Jul", "Paddock Club Event", "Portfolio");
inject("FY27 Partner Enablement", "Jul", "First Technology - PX deep-dive", "Elective - Deep Dive");
inject("FY27 Partner Enablement", "Aug", "NTT, DSC Solution based", "CIP, Solution based");
inject("FY27 Partner Enablement", "Aug", "Alliance (Commvault) workshop", "Portfolio");
inject("FY27 Partner Enablement", "Aug", "SE Bootcamp", "SE Bootcamp");
inject("FY27 Partner Enablement", "Sep", "Paddock Club Event", "Portfolio");
inject("FY27 Partner Enablement", "Sep", "KZN FT", "CIP, Solution based");
inject("FY27 Partner Enablement", "Oct", "Alliance (Veeam)", "Portfolio");
inject("FY27 Partner Enablement", "Nov", "Purely Technical - Aim for 5 partners", "Portfolio");
inject("FY27 Partner Enablement", "Nov", "SE Bootcamp", "SE Bootcamp");
inject("FY27 Partner Enablement", "Dec", "Paddock Club Event", "Portfolio");

// FY27 Partner SE Journey
inject("FY27 Partner SE Journey", "Mar", "CES Customer Event-Namibia", "Portfolio");
inject("FY27 Partner SE Journey", "Mar", "NTT Monthly tech sessions", "Portfolio");
inject("FY27 Partner SE Journey", "Mar", "FT KZN", "Technical Sales Pro");
inject("FY27 Partner SE Journey", "Mar", "DSC Monthly Tech sessions", "Architecture + Depth");
inject("FY27 Partner SE Journey", "Apr", "NEC Monthly tech sessions", "Portfolio");
inject("FY27 Partner SE Journey", "Apr", "NTT JHB CIP", "CIP, Solution based");
inject("FY27 Partner SE Journey", "Apr", "FT KZN", "Architecture + Depth");
inject("FY27 Partner SE Journey", "Apr", "DSC PX", "Elective - Deep Dive");
inject("FY27 Partner SE Journey", "May", "KZN FT", "Simply Pure");
inject("FY27 Partner SE Journey", "May", "NTT JHB FA/FB", "Architecture + Depth");
inject("FY27 Partner SE Journey", "May", "DSC FA/Blade", "Architecture + Depth");
inject("FY27 Partner SE Journey", "Jun", "CES, KZN FT", "Technical Sales Pro");
inject("FY27 Partner SE Journey", "Sep", "KZN FT, NEC, NTT, DSC, CES", "Milestone");
inject("FY27 Partner SE Journey", "Nov", "KZN FT, NEC, NTT, DSC", "Milestone");

// FY27 EMEA Orange Belt
inject("FY27 EMEA Orange Belt", "Feb", "Every Friday Revision Sessions", "Portfolio");
inject("FY27 EMEA Orange Belt", "Apr", "Review Webinar", "Portfolio");
inject("FY27 EMEA Orange Belt", "Jun", "Review Webinar", "Portfolio");
inject("FY27 EMEA Orange Belt", "Aug", "Review Webinar", "Portfolio");
inject("FY27 EMEA Orange Belt", "Oct", "Review Webinar", "Portfolio");


export default function CalendarRoadmap() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { modifications } = useModifications();
  const [editableMatrix, setEditableMatrixState] = useState(() => {
    const fromCtx = modifications.find(m => m.type === "roadmap" && m.targetId === "global_calendar");
    return fromCtx ? fromCtx.data : structuredClone(BASE_MATRIX);
  });

  const [headerState, setHeaderState] = useState({
    title: "FY27 Planned Initiatives_RSA",
    quarters: ["Q1", "Q2", "Q3", "Q4"],
    months: [...MONTHS],
    rows: ROWS.map(r => r.replace("FY27 ", "FY27\n"))
  });

  const setEditableMatrix = (updater: any) => {
    setEditableMatrixState((prev: any) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setGlobalRoadmap(next); 
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, row: string, month: string, index: number) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ row, month, index }));
  };

  const handleDrop = (e: React.DragEvent, targetRow: string, targetMonth: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const { row, month, index } = JSON.parse(dataStr);
      if (row === targetRow && month === targetMonth) return;
      
      setEditableMatrix((prev: any) => {
        const clone = structuredClone(prev);
        const item = clone[row][month][index];
        clone[row][month].splice(index, 1);
        clone[targetRow][targetMonth].push(item);
        return clone;
      });
    } catch {}
  };

  const removeItem = (row: string, month: string, index: number) => {
    setEditableMatrix((prev: any) => {
      const clone = structuredClone(prev);
      clone[row][month].splice(index, 1);
      return clone;
    });
  };

  const updateItemText = (row: string, month: string, index: number, text: string) => {
    setEditableMatrix((prev: any) => {
      const clone = structuredClone(prev);
      clone[row][month][index].text = text;
      return clone;
    });
  };

  const updateItemTag = (row: string, month: string, index: number, tag: TagType) => {
    setEditableMatrix((prev: any) => {
      const clone = structuredClone(prev);
      clone[row][month][index].tag = tag;
      return clone;
    });
  };

  const toggleItemCompletion = (row: string, month: string, index: number) => {
    setEditableMatrix((prev: any) => {
      const clone = structuredClone(prev);
      clone[row][month][index].completed = !clone[row][month][index].completed;
      return clone;
    });
  };

  const addEventToCell = (row: string, month: string, tag: TagType = "Custom") => {
    setEditableMatrix((prev: any) => {
      const clone = structuredClone(prev);
      clone[row][month].push({ id: `added-\${Date.now()}`, text: "New Event", tag, date: "", email: "" });
      return clone;
    });
  };

  return (
    <div id="calendar-roadmap-print-zone" className={`font-sans text-slate-800 w-full transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[200] bg-slate-50 p-4 md:p-8 overflow-y-auto' : 'print:p-0 print:m-0 overflow-hidden'}`}>
      <style>{`
        @page {
          size: landscape;
          margin: 10mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #calendar-roadmap-print-zone, #calendar-roadmap-print-zone * {
            visibility: visible;
          }
          #calendar-roadmap-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            background: white !important;
            padding: 0;
            margin: 0;
            zoom: 65%; /* Scale down to fit 12 months in landscape */
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div className={`mx-auto space-y-6 ${isFullscreen ? 'max-w-none w-full pb-32' : 'max-w-[1600px] print:max-w-none'}`}>
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 w-full">
            <div className="flex-1">
              <div 
                contentEditable suppressContentEditableWarning
                onBlur={e => setHeaderState(p => ({...p, title: e.currentTarget.innerText}))}
                className="text-4xl font-extrabold text-[#3a4449] tracking-tight outline-none hover:bg-slate-100/50 p-2 -ml-2 rounded-lg transition-colors border border-transparent focus:border-slate-300 inline-block w-full max-w-4xl cursor-text"
              >
                {headerState.title}
              </div>
            </div>
            <div className="flex items-center gap-4 print-hide">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition shadow-sm font-bold"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#7b8e97] text-white rounded hover:bg-[#687a82] transition shadow-sm font-bold"
              >
                <Printer size={18} />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 relative z-10">
            <div className="text-lg font-black text-slate-500 mr-2 flex items-center pr-4 border-r border-slate-200">Key</div>
            {Object.entries(TAG_STYLES).filter(([tag]) => tag !== "Custom" && tag !== "Milestone").map(([tag, style]) => {
               const IconCmp = style.icon;
               return (
                 <div key={tag} className="flex items-center gap-2 group">
                   <IconCmp className={`w-4 h-4 ${style.iconColor}`} />
                   <span className="text-xs font-bold text-slate-600">{tag}</span>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Matrix Container */}
        <div className="bg-[#b1c4c1] rounded-2xl p-6 md:p-8 overflow-x-auto shadow-sm border-[4px] border-white ring-1 ring-slate-200">
           <div className="min-w-[1600px]">
             {/* Quarters Row */}
             <div className="grid grid-cols-[180px_repeat(12,1fr)] gap-2 mb-4 text-center text-[#95a8b0] font-black tracking-[0.2em] text-2xl pl-[180px]">
                {headerState.quarters.map((q, i) => (
                  <div key={i} className="col-span-3 border-b-2 border-[#9eb0a8] pb-2 mx-6 relative">
                     <div 
                       contentEditable suppressContentEditableWarning 
                       onBlur={e => setHeaderState(p => { const arr = [...p.quarters]; arr[i] = e.currentTarget.innerText; return {...p, quarters: arr} })}
                       className="outline-none hover:bg-white/20 rounded px-2 py-1 cursor-text transition-colors"
                     >{q}</div>
                  </div>
                ))}
             </div>

             {/* Months Header */}
             <div className="grid grid-cols-[180px_repeat(12,1fr)] gap-2 mb-6 text-center pb-2">
                <div className="col-span-1"></div>
                {MONTHS.map((m, i) => (
                  <div key={m} className={`font-black text-[22px] tracking-tight ${["Feb","Mar","Apr","May","Jun","Aug","Sep","Oct","Nov","Dec","Jan"].includes(m) ? "text-[#eb5224]" : "text-[#eb5224]"}`}>
                     <div 
                       contentEditable suppressContentEditableWarning
                       onBlur={e => setHeaderState(p => { const arr = [...p.months]; arr[i] = e.currentTarget.innerText; return {...p, months: arr} })}
                       className="outline-none hover:bg-white/20 rounded px-2 py-1 cursor-text transition-colors inline-block"
                     >{headerState.months[i]}</div>
                  </div>
                ))}
             </div>

             {/* Rows Grid */}
             <div className="space-y-0 text-base">
                {ROWS.map((row, rowIdx) => (
                  <div key={row} className="grid grid-cols-[180px_repeat(12,1fr)] gap-2 border-b border-[#9eb0a8] last:border-0 relative group/row min-h-[140px]">
                     {/* Row Header */}
                     <div className="flex items-center py-6 pr-4 border-r border-dashed border-[#9eb0a8]/60">
                        <div 
                          contentEditable suppressContentEditableWarning
                          onBlur={e => setHeaderState(p => { const arr = [...p.rows]; arr[rowIdx] = e.currentTarget.innerText; return {...p, rows: arr} })}
                          className="font-w[900] font-black text-[#a12008] text-[15px] leading-relaxed whitespace-pre-wrap uppercase tracking-tight outline-none hover:bg-white/20 p-2 -ml-2 rounded cursor-text transition-colors w-full"
                        >
                           {headerState.rows[rowIdx]}
                        </div>
                     </div>

                     {/* Month Cells */}
                     {MONTHS.map(month => (
                       <div 
                         key={month} 
                         className="border-r border-dashed border-[#9eb0a8]/60 last:border-r-0 pt-3 pb-8 px-2 relative group/cell transition-colors hover:bg-white/10"
                         onDragOver={e => e.preventDefault()}
                         onDrop={e => handleDrop(e, row, month)}
                       >
                          <div className="space-y-1.5">
                            {editableMatrix[row]?.[month]?.map((event, i) => {
                               const style = TAG_STYLES[event.tag] || TAG_STYLES["Custom"];
                               return (
                                 <div 
                                   key={event.id}
                                   draggable
                                   onDragStart={e => handleDragStart(e, row, month, i)}
                                   className={`relative flex items-start gap-0.5 p-1 rounded-sm transition-all group/item hover:shadow-md z-10 ${style.isStar ? "" : "hover:bg-white/90"} ${event.completed ? 'opacity-50' : ''}`}
                                 >
                                    <div className="opacity-0 group-hover/item:opacity-100 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-opacity flex items-center h-[20px]">
                                      <GripVertical size={13} />
                                    </div>
                                    {style.isStar ? (
                                      <Star className="text-yellow-400 fill-yellow-400 stroke-yellow-500 shrink-0 drop-shadow scale-110 h-[20px]" size={14} />
                                    ) : (
                                      <style.icon className={`shrink-0 ${style.iconColor} h-[20px]`} size={16} />
                                    )}
                                    <div 
                                      contentEditable 
                                      suppressContentEditableWarning
                                      onBlur={e => updateItemText(row, month, i, e.currentTarget.textContent || "Event")}
                                      className={`text-[13px] font-bold text-slate-800 leading-tight focus:outline-none focus:bg-white rounded px-1 py-0.5 flex-1 break-words cursor-text ${event.completed ? 'line-through text-slate-400' : ''}`}
                                    >
                                      {event.text}
                                    </div>

                                    {/* Action Toolbar on Hover */}
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 bg-white shadow-xl border border-slate-200 rounded-lg p-1 flex items-center gap-1.5 transition-opacity z-50 print-hide">
                                       <button 
                                         onClick={() => toggleItemCompletion(row, month, i)} 
                                         className={`p-0.5 rounded transition shadow-sm border ${event.completed ? 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200' : 'bg-slate-50 text-slate-400 hover:text-emerald-500 border-slate-200 hover:bg-slate-100'}`}
                                         title={event.completed ? "Mark incomplete" : "Mark completed"}
                                       >
                                         <Award size={12} />
                                       </button>
                                       <div className="w-px h-3 bg-slate-200"></div>
                                       <button onClick={() => removeItem(row, month, i)} className="text-slate-400 hover:text-red-500 p-0.5 rounded hover:bg-red-50" title="Delete event">
                                         <Trash2 size={12} />
                                       </button>
                                       <div className="w-px h-3 bg-slate-200"></div>
                                       <select 
                                         className="text-[9px] font-bold bg-transparent focus:outline-none w-16 text-slate-600 cursor-pointer"
                                         value={event.tag}
                                         onChange={(e) => updateItemTag(row, month, i, e.target.value as TagType)}
                                       >
                                         {Object.keys(TAG_STYLES).map(k => <option key={k} value={k}>{k}</option>)}
                                       </select>
                                    </div>
                                 </div>
                               );
                            })}
                          </div>
                          
                          {/* Quick Add Button */}
                          <button 
                            onClick={() => addEventToCell(row, month, "Custom")}
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 bg-black/5 hover:bg-black/10 text-slate-800 p-1 rounded-full transition-all"
                            title="Add Node"
                          >
                            <Plus size={12} />
                          </button>
                       </div>
                     ))}
                  </div>
                ))}
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
