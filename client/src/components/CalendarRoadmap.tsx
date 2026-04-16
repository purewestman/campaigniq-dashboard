import React, { useState, useMemo } from 'react';
import { Star, BookOpen, TrendingUp, Map, Monitor, Award, CalendarDays, Filter, Printer, Trash2, GripVertical } from 'lucide-react';
import { useModifications } from '@/contexts/ModificationContext';
import { TIER_DEFINITIONS } from '@/lib/data';
import { trainingData } from '@/lib/trainingData';

// Data derived from the user's plan
const timelineData = [
  {
    quarter: "Q1 (February – April)",
    months: [
      {
        name: "February",
        events: [
          { category: "Main Events", items: ["Partner Program Launch"] },
          { category: "Partner Enablement", items: ["Fast Start", "Partner Program Webinar", "VMXperts enablement", "IOCO Enablement", "Ukuvela Group Enablement", "Reddington Customer workshop"] },
          { category: "Partner Digital Initiatives", items: ["Partner Program Webinar"] },
          { category: "EMEA Orange Belt", items: ["Revision sessions occur every Friday"] },
        ]
      },
      {
        name: "March",
        events: [
          { category: "Partner Enablement", items: ["Enablement FT KZN - EG1", "DSC Portworx workshops", "VMXperts enablement", "Enablement Altron - EG1 workshop", "FT Cent - CBS workshop", "DCS - Portworx workshop", "Paddock Club Event"] },
          { category: "Partner Demand Gen", items: ["CES Customer Event-Namibia", "DSC team event"] },
          { category: "Partner SE Journey", items: ["CES Customer Event-Namibia", "NTT Monthly tech sessions", "FT KZN", "DSC Monthly Tech sessions"] },
        ]
      },
      {
        name: "April",
        events: [
          { category: "Partner Enablement", items: ["Enablement BCX", "Nutanix Workshop - NTT", "Enablement NTT CT", "Enablement Altron", "9th Bit - Portworx workshop", "Alliance (RedHat) workshop", "Triple H Tech event"] },
          { category: "Partner Demand Gen", items: ["First Technology Round Table", "Customer event NTT CPT", "TCM Customer event"] },
          { category: "Partner SE Journey", items: ["NEC Monthly tech sessions", "NTT JHB CIP", "FT KZN", "DSC PX"] },
          { category: "Partner Digital Initiatives", items: ["Pure/Commvault Webinar"] },
          { category: "EMEA Orange Belt", items: ["Review Webinar"] },
        ]
      }
    ]
  },
  {
    quarter: "Q2 (May – July)",
    months: [
      {
        name: "May",
        events: [
          { category: "Partner Enablement", items: ["FT KZN - PSC enablement", "DSC Pitch assessment", "Enablement NEC - Sales team", "Enablement BCX - EG1 workshop", "NTT/DSC CPT", "Paddock Club Event CPT", "SE Bootcamp on May 5th"] },
          { category: "Partner Demand Gen", items: ["Pure Storage Retail Event - NTT", "Triple H customer event", "Customer event NEC KZN"] },
          { category: "Partner SE Journey", items: ["KZN FT", "NTT JHB FA/FB", "DSC FA//Blade"] },
        ]
      },
      {
        name: "June",
        events: [
          { category: "Main Events", items: ["Pure Accelerate Las Vegas"] },
          { category: "Partner Enablement", items: ["Accelerate updates", "Enablement - PX NTT", "Enablement Pitch assessment -NTT", "CES Customer Event-Namibia follow-up event", "KZN Partner check-in person", "Alliance (Cisco) workshop"] },
          { category: "Partner Demand Gen", items: ["BCX Customer event", "NEC JHB Customer session"] },
          { category: "Partner SE Journey", items: ["CES and KZN FT sessions"] },
          { category: "Partner Digital Initiatives", items: ["Pure/Nutanix Webinar"] },
          { category: "EMEA Orange Belt", items: ["Review Webinar"] },
        ]
      },
      {
        name: "July",
        events: [
          { category: "Partner Enablement", items: ["Nutanix/Pure-NTT", "Cisco/Pure-BCX", "First Technology - PX deep-dive", "Reddington Customer workshop", "Paddock Club Event"] },
          { category: "Partner Demand Gen", items: ["FT KZN - PSC Workshop", "NTT JHB Customer session"] },
        ]
      }
    ]
  },
  {
    quarter: "Q3 (August – October)",
    months: [
      {
        name: "August",
        events: [
          { category: "Main Events", items: ["Elite Requirements Check"] },
          { category: "Partner Enablement", items: ["Enablement Pitch assessment - Altron", "Enablement Pitch assessment -BCX", "Rubrik/Pure-BCX", "Cape Town Partner check-in person", "Alliance (Commvault) workshop", "SE Bootcamp", "NTT, DSC Solution based"] },
          { category: "Partner Demand Gen", items: ["FT KZN - Womens Day", "Altron Customer session", "BCX Customer event CT"] },
          { category: "EMEA Orange Belt", items: ["Review Webinar"] },
        ]
      },
      {
        name: "September",
        events: [
          { category: "Main Events", items: ["Pure Accelerate London"] },
          { category: "Partner Enablement", items: ["Enablement Competitive session - NTT", "Enablement Competitive session - FT KZN", "Paddock Club Event", "KZN Partner check-in person"] },
          { category: "Partner Demand Gen", items: ["Customer event NEC CT", "DSC Customer event", "Customer sessions across partners with key opportunities"] },
          { category: "Partner SE Journey", items: ["KZN FT", "NEC", "NTT", "DSC", "CES sessions"] },
        ]
      },
      {
        name: "October",
        events: [
          { category: "Main Events", items: ["Pure Accelerate METCA"] },
          { category: "Partner Enablement", items: ["Quarter close drive across partners with key opportunities", "Platform conversations- BCX", "Alliance (Veeam)"] },
          { category: "Partner Demand Gen", items: ["Altron Healthcare event"] },
          { category: "EMEA Orange Belt", items: ["Review Webinar"] },
        ]
      }
    ]
  },
  {
    quarter: "Q4 (November – January)",
    months: [
      {
        name: "November",
        events: [
          { category: "Partner Enablement", items: ["Certification sessions with various partners", "Purely Technical - Aim for 5 partners", "SE Bootcamp"] },
          { category: "Partner SE Journey", items: ["KZN FT", "NEC", "NTT", "DSC"] },
        ]
      },
      {
        name: "December",
        events: [
          { category: "Partner Enablement", items: ["Partner experience day", "Paddock Club Event"] },
        ]
      },
      {
        name: "January",
        events: [
          { category: "Partner Enablement", items: ["Partner appreciation lunch"] },
        ]
      }
    ]
  }
];

const categoryConfig: Record<string, any> = {
  "Main Events": { color: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: Star },
  "Partner Enablement": { color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: BookOpen },
  "Partner Demand Gen": { color: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: TrendingUp },
  "Partner SE Journey": { color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: Map },
  "Partner Digital Initiatives": { color: "bg-teal-500", text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", icon: Monitor },
  "EMEA Orange Belt": { color: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: Award },
};

export default function CalendarRoadmap() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  
  const { modifiedPartners, globalRoadmap, setGlobalRoadmap } = useModifications();

  // Dynamically compute commonalities (top gaps)
  const initialData = useMemo(() => {
    // 1. Calculate global gaps
    const gapCounts: Record<string, number> = {
      "Sales Pro": 0,
      "Tech Pro": 0,
      "Bootcamp": 0,
      "Impl Specialist": 0,
    };

    modifiedPartners.forEach((p) => {
      const spReq = Math.max(0, p.requirements.salesPro.required - p.requirements.salesPro.obtained);
      const tpReq = Math.max(0, p.requirements.techPro.required - p.requirements.techPro.obtained);
      const bootReq = Math.max(0, p.requirements.bootcamp.required - p.requirements.bootcamp.obtained);
      const implReq = Math.max(0, p.requirements.implSpec.required - p.requirements.implSpec.obtained);
      
      gapCounts["Sales Pro"] += spReq;
      gapCounts["Tech Pro"] += tpReq;
      gapCounts["Bootcamp"] += bootReq;
      gapCounts["Impl Specialist"] += implReq;
    });

    const topGaps = Object.entries(gapCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => `Global Enablement Drive: ${name} (${count} global gaps)`);

    // 2. Clone and inject, migrating strings to objects
    const clone = JSON.parse(JSON.stringify(timelineData)).map((q: any) => {
      q.months.forEach((m: any) => {
        m.events.forEach((eg: any) => {
          eg.items = eg.items.map((str: string) => ({ text: str, date: "", email: "" }));
        });
      });
      return q;
    });

    if (topGaps.length > 0) {
      // Inject into Feb, Partner Enablement
      const feb = clone[0].months[0];
      const enab = feb.events.find((e: any) => e.category === "Partner Enablement");
      if (enab) {
        enab.items = [
          ...topGaps.map(str => ({ text: str, date: "", email: "" })),
          ...enab.items
        ];
      }
    }
    
    return clone;
  }, [modifiedPartners]); // We deliberately only compute this ONCE as a baseline, but now we use persistent state.

  const [editableData, setEditableDataState] = useState(globalRoadmap || initialData);

  const recommendedEmails = useMemo(() => {
    return Array.from(new Set(Object.values(trainingData).flatMap(ptd => 
      Object.values(ptd).flatMap(arr => arr.map(p => p.email))
    )));
  }, []);

  const setEditableData = (updater: any) => {
    setEditableDataState((prev: any) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setGlobalRoadmap(next);
      return next;
    });
  };

  const handleAddEvent = (qI: number, mI: number, categoryName: string) => {
    setEditableData((prev: any) => {
      const clone = structuredClone(prev);
      const monthObj = clone[qI].months[mI];
      let catObj = monthObj.events.find((e: any) => e.category === categoryName);
      if (!catObj) {
        catObj = { category: categoryName, items: [] };
        monthObj.events.push(catObj);
      }
      catObj.items.push({ text: "New Event", date: "", email: "" });
      return clone;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRemoveItem = (qI: number, mI: number, eI: number, iI: number) => {
    setEditableData((prev: any) => {
      const clone = structuredClone(prev);
      clone[qI].months[mI].events[eI].items.splice(iI, 1);
      return clone;
    });
  };

  const handleDragStart = (e: React.DragEvent, qI: number, mI: number, eI: number, iI: number) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ qI, mI, eI, iI }));
  };

  const handleDropToMonth = (e: React.DragEvent, targetQI: number, targetMI: number) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const { qI, mI, eI, iI } = JSON.parse(dataStr);
      setEditableData((prev: any) => {
        const clone = structuredClone(prev);
        const itemObj = clone[qI].months[mI].events[eI].items[iI];
        const categoryName = clone[qI].months[mI].events[eI].category;
        
        // Remove from source
        clone[qI].months[mI].events[eI].items.splice(iI, 1);
        
        // Add to target month
        const targetMonth = clone[targetQI].months[targetMI];
        const existingCategory = targetMonth.events.find((ev: any) => ev.category === categoryName);
        if (existingCategory) {
          existingCategory.items.push(itemObj);
        } else {
          targetMonth.events.push({ category: categoryName, items: [itemObj] });
        }
        return clone;
      });
    } catch {}
  };

  return (
    <div className="text-slate-800 font-sans print:p-0 print:m-0">
      <datalist id="roadmap-emails">
        {recommendedEmails.map(e => <option key={e} value={e} />)}
      </datalist>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 contentEditable suppressContentEditableWarning className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded px-1 -ml-1 w-max">
                FY27 RSA Initiatives
              </h1>
              <p contentEditable suppressContentEditableWarning className="mt-2 text-slate-500 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded px-1 -ml-1 w-max">
                Consolidated timeline of enablement, demand generation, and digital planning.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Printer size={18} />
                <span className="font-semibold text-sm">Print PDF</span>
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full text-indigo-600">
                <CalendarDays size={28} />
              </div>
            </div>
          </div>
          
          {/* Print only header */}
          <div className="hidden print:block text-center mb-8 border-b border-slate-200 pb-4">
            <h1 className="text-4xl font-extrabold text-slate-900">FY27 RSA Initiatives</h1>
            <p className="mt-2 text-slate-500 text-xl">Consolidated Global Calendar</p>
          </div>
          
          {/* Filters */}
          <div className="mt-8 border-t border-slate-100 pt-6 print:hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                <Filter size={16} />
                <span>Filter by Category</span>
              </div>
              
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setViewMode("month")} 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "month" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Month View
                </button>
                <button 
                  onClick={() => setViewMode("week")} 
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "week" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Week View
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === "All" 
                    ? "bg-slate-800 text-white shadow-md" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Initiatives
              </button>
              {Object.entries(categoryConfig).map(([category, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === category 
                        ? `${config.color} text-white shadow-md` 
                        : `bg-white border ${config.border} ${config.text} hover:${config.bg}`
                    }`}
                  >
                    <Icon size={16} className={activeFilter === category ? "text-white" : config.text} />
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-12 print:space-y-6">
          {editableData.map((quarterData: any, qIndex: number) => {
            
            // Filter months to check if this quarter has any data to show
            const filteredMonths = quarterData.months.map((month: any) => {
              const filteredEvents = activeFilter === "All" 
                ? month.events 
                : month.events.filter((e: any) => e.category === activeFilter);
              return { ...month, events: filteredEvents };
            }).filter(month => month.events.length > 0);

            if (filteredMonths.length === 0) return null;

            return (
              <div key={qIndex} className="relative">
                {/* Quarter Header */}
                <div className="sticky top-0 z-10 bg-slate-50/95 print:bg-transparent backdrop-blur py-4 mb-4">
                  <h2 
                    contentEditable 
                    suppressContentEditableWarning 
                    className="text-2xl font-bold text-slate-800 inline-block border-b-4 border-indigo-500 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded px-1 min-w-[50px] print:border-indigo-500"
                    onBlur={(e) => {
                      const newText = e.currentTarget.textContent || quarterData.quarter;
                      setEditableData((prev: any) => {
                        const clone = structuredClone(prev);
                        clone[qIndex].quarter = newText;
                        return clone;
                      });
                    }}
                  >
                    {quarterData.quarter}
                  </h2>
                </div>

                <div className="ml-4 md:ml-8 border-l-2 border-slate-200 print:ml-2 print:border-l-4 space-y-10 print:space-y-6 py-4">
                  {filteredMonths.map((month: any, mIndex: number) => (
                    <div 
                      key={mIndex} 
                      className="relative pl-6 md:pl-10"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropToMonth(e, qIndex, mIndex)}
                    >
                      {/* Timeline Node */}
                      <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white bg-indigo-500 shadow-sm"></div>
                      
                      {/* Month Label */}
                      <h3 
                        contentEditable 
                        suppressContentEditableWarning 
                        className="text-xl font-semibold text-slate-700 mb-6 flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded px-1 w-max"
                        onBlur={(e) => {
                          const newText = e.currentTarget.textContent || month.name;
                          setEditableData((prev: any) => {
                            const clone = structuredClone(prev);
                            clone[qIndex].months[mIndex].name = newText;
                            return clone;
                          });
                        }}
                      >
                        {month.name}
                      </h3>

                      {/* Event Cards */}
                      {viewMode === "month" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                          {month.events.map((eventGroup: any, eIndex: number) => {
                            const config = categoryConfig[eventGroup.category];
                            const Icon = config.icon;
                            
                            return (
                              <div 
                                key={eIndex} 
                                className={`rounded-xl border ${config.border} ${config.bg} p-5 transition-transform hover:-translate-y-1 shadow-sm hover:shadow-md duration-300 print:break-inside-avoid print:shadow-none print:bg-white print:border-slate-300`}
                              >
                                <div className="flex items-center gap-3 mb-4 border-b border-white/40 print:border-slate-200 pb-3">
                                  <div className={`p-2 rounded-lg ${config.color} text-white shadow-sm`}>
                                    <Icon size={18} />
                                  </div>
                                  <h4 className={`font-bold text-sm ${config.text}`}>
                                    {eventGroup.category}
                                  </h4>
                                </div>
                                <ul className="space-y-2.5">
                                  {eventGroup.items.map((itemObj: any, iIndex: number) => (
                                    <li 
                                      key={iIndex} 
                                      draggable 
                                      onDragStart={(e) => handleDragStart(e, qIndex, mIndex, eIndex, iIndex)}
                                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-slate-700 leading-snug cursor-grab active:cursor-grabbing hover:bg-slate-50 p-1 -m-1 rounded transition-colors gap-2"
                                    >
                                      <div className="flex items-start flex-1 w-full gap-1">
                                        <div className="opacity-0 group-hover:opacity-100 print:hidden text-slate-300 hover:text-slate-500 flex items-center pr-1 -ml-3 cursor-grab shrink-0 mt-1">
                                          <GripVertical size={12} />
                                        </div>
                                        <span className={`mr-2 mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${config.color} print:!bg-slate-800`}></span>
                                        <div 
                                          contentEditable 
                                          suppressContentEditableWarning 
                                          className="focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1 border border-transparent flex-1 print:border-transparent print:p-0 cursor-text min-h-[20px]"
                                          onBlur={(e) => {
                                            const newText = e.currentTarget.textContent || "New Event";
                                            setEditableData((prev: any) => {
                                              const clone = structuredClone(prev);
                                              clone[qIndex].months[mIndex].events[eIndex].items[iIndex].text = newText;
                                              return clone;
                                            })
                                          }}
                                        >
                                          {itemObj.text}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 pl-4 sm:pl-0 pt-2 sm:pt-0 shrink-0 self-end sm:self-auto flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto mt-2 sm:mt-0">
                                        <input 
                                          type="text"
                                          list="roadmap-emails"
                                          placeholder="Assignee Email..."
                                          className="text-[10px] sm:text-xs text-slate-600 bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5 w-32 focus:outline-none focus:border-indigo-300 print:text-black font-semibold h-6"
                                          onChange={(e) => {
                                            const newEmail = e.target.value;
                                            setEditableData((prev: any) => {
                                              const clone = structuredClone(prev);
                                              clone[qIndex].months[mIndex].events[eIndex].items[iIndex].email = newEmail;
                                              return clone;
                                            })
                                          }}
                                          value={itemObj.email || ""}
                                        />
                                        <input 
                                          type="date"
                                          title="Commit Date"
                                          className="text-[10px] sm:text-xs text-slate-500 bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:border-indigo-300 print:border-none print:text-black font-semibold h-6"
                                          onChange={(e) => {
                                            const newDate = e.target.value;
                                            setEditableData((prev: any) => {
                                              const clone = structuredClone(prev);
                                              clone[qIndex].months[mIndex].events[eIndex].items[iIndex].date = newDate;
                                              return clone;
                                            })
                                          }}
                                          value={itemObj.date || ""}
                                        />
                                        <button 
                                          onClick={() => handleRemoveItem(qIndex, mIndex, eIndex, iIndex)}
                                          className="opacity-0 group-hover:opacity-100 print:hidden text-slate-300 hover:text-red-500 pl-1 transition-opacity shrink-0"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                                {/* Add Event Button for Category */}
                                <button 
                                  onClick={() => handleAddEvent(qIndex, mIndex, eventGroup.category)}
                                  className="mt-3 text-[11px] font-semibold text-slate-400 hover:text-indigo-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden w-full justify-center p-1 rounded hover:bg-slate-50"
                                >
                                  + Add Event
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                          {[1, 2, 3, 4].map((weekNum) => {
                            // Synthetically distribute events across 4 weeks for visualisation
                            const allMonthEvents = month.events.flatMap(g => g.items.map(item => ({ item, category: g.category })));
                            const eventsInWeek = allMonthEvents.filter((_, idx) => (idx % 4) === (weekNum - 1));
                            
                            if (eventsInWeek.length === 0) return (
                              <div key={weekNum} className="min-w-[200px] border-l first:border-l-0 border-slate-100 pl-4 first:pl-0 opacity-50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Week {weekNum}</h4>
                                <div className="text-xs text-slate-400 italic">No scheduled events</div>
                              </div>
                            );

                            return (
                              <div key={weekNum} className="min-w-[200px] border-l first:border-l-0 border-slate-100 pl-4 first:pl-0">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Week {weekNum}</h4>
                                <div className="space-y-2">
                                  {eventsInWeek.map((e, idx) => {
                                    const config = categoryConfig[e.category];
                                    return (
                                      <div key={idx} className={`p-2 rounded border ${config.bg} ${config.border} text-xs flex flex-col group relative`}>
                                        <div className="flex items-start">
                                          <div className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${config.color}`}></div>
                                          <span className="text-slate-700 font-medium leading-tight">{e.item.text}</span>
                                        </div>
                                        {/* Date and Email Render */}
                                        {(e.item.date || e.item.email) && (
                                          <div className="text-[9px] text-slate-500 mt-1 ml-3 border-t border-slate-200/50 pt-1 flex flex-col gap-0.5">
                                            {e.item.date && <div className="font-bold">Commit: {e.item.date}</div>}
                                            {e.item.email && <div className="italic break-all">{e.item.email}</div>}
                                          </div>
                                        )}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] whitespace-nowrap px-2 py-1 rounded shadow-xl transition-opacity pointer-events-none z-10">
                                          {e.category}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer & Signature Block (Visible in Print) */}
        <div className="pt-8 mt-12 border-t border-slate-200">
          <div className="hidden print:block page-break-inside-avoid">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">✍️ Sign-off & Acceptance</h2>
            <p className="text-sm text-slate-600 mb-8">
              By signing below, both parties confirm acceptance of the enablement commitments and maturity initiatives outlined in the FY27 Roadmap.
            </p>
            
            <div className="flex items-start gap-12 mt-6">
              {/* Partner Signoff */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">Partner Representative</h3>
                
                <div className="mb-6">
                  <div className="border-b border-slate-400 h-8"></div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Print Name / Signature</div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="border-b border-slate-400 h-8 flex items-end pb-1 text-sm">{new Date().toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Date</div>
                  </div>
                  <div className="flex-1">
                    <div className="border-b border-slate-400 h-8"></div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Title / Role</div>
                  </div>
                </div>
              </div>
              
              {/* PAM Signoff */}
              <div className="flex-1 bg-slate-800 rounded-xl p-6 text-white outline outline-1 outline-slate-700">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Pure Storage — PAM</h3>
                
                <div className="mb-6">
                  <div className="border-b border-slate-500 h-8"></div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Print Name / Signature</div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="border-b border-slate-500 h-8 flex items-end pb-1 text-sm">{new Date().toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Date</div>
                  </div>
                  <div className="flex-1">
                    <div className="border-b border-slate-500 h-8"></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Title / Role</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-slate-400 text-sm mt-12 print:mt-16">
            End of FY27 Roadmap
          </div>
        </div>
      </div>
    </div>
  );
}
