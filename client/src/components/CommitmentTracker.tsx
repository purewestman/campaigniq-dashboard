/*
 * CommitmentTracker — displays timeline commitments submitted from partner PDF plans.
 * Data is stored in localStorage under key 'pei_timeline_commitments'.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarCheck, 
  CalendarX, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  UserPlus, 
  X, 
  Check, 
  AlertCircle,
  Calendar,
  Users
} from "lucide-react";
import { trainingData } from "../lib/trainingData";
import { toast } from "sonner";

export interface CommitmentMilestone {
  id: string;
  label: string;
  suggestedDate: string;
  partnerDate: string;
  agreed: boolean;
  status: "pending" | "accepted" | "rejected";
  adminNotes?: string;
  internalTargetDate?: string;
  assignedEmployees?: string[]; // array of emails
}

export interface PartnerCommitment {
  partnerId: number;
  partnerName: string;
  submittedAt: string;
  commitments: CommitmentMilestone[];
}

const STORAGE_KEY = "pei_timeline_commitments";

export function loadCommitments(): PartnerCommitment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCommitment(commitment: PartnerCommitment) {
  const all = loadCommitments();
  // Replace existing if same partner
  const idx = all.findIndex((c) => c.partnerId === commitment.partnerId);
  if (idx >= 0) all[idx] = commitment;
  else all.push(commitment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function removeCommitment(partnerId: number) {
  const all = loadCommitments().filter((c) => c.partnerId !== partnerId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updateCommitmentMilestone(
  partnerId: number, 
  milestoneId: string, 
  updates: Partial<CommitmentMilestone>
) {
  const all = loadCommitments();
  const cIdx = all.findIndex((c) => c.partnerId === partnerId);
  if (cIdx >= 0) {
    const mIdx = all[cIdx].commitments.findIndex((m) => m.id === milestoneId);
    if (mIdx >= 0) {
      all[cIdx].commitments[mIdx] = { ...all[cIdx].commitments[mIdx], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return all;
    }
  }
  return null;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

function dueDays(dateStr: string) {
  if (!dateStr || dateStr.length > 10) return null; // Safety for corrupt dates
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const diff = d.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

interface Props {
  commitments: PartnerCommitment[];
  onDelete: (partnerId: number) => void;
  onUpdate: () => void;
}

export default function CommitmentTracker({ commitments, onDelete, onUpdate }: Props) {
  const [editingMilestone, setEditingMilestone] = useState<{ partnerId: number, mId: string } | null>(null);
  
  // State for the edit form
  const [editStatus, setEditStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEmployees, setEditEmployees] = useState<string[]>([]);
  
  const handleStartEdit = (partnerId: number, milestone: CommitmentMilestone) => {
    setEditingMilestone({ partnerId, mId: milestone.id });
    setEditStatus(milestone.status || "pending");
    setEditDate(milestone.internalTargetDate || milestone.partnerDate || milestone.suggestedDate);
    setEditNotes(milestone.adminNotes || "");
    setEditEmployees(milestone.assignedEmployees || []);
  };

  const handleSaveEdit = () => {
    if (!editingMilestone) return;
    
    updateCommitmentMilestone(editingMilestone.partnerId, editingMilestone.mId, {
      status: editStatus,
      internalTargetDate: editDate,
      adminNotes: editNotes,
      assignedEmployees: editEmployees,
    });
    
    setEditingMilestone(null);
    onUpdate();
    toast.success("Milestone updated successfully");
  };
  if (commitments.length === 0) {
    return (
      <div
        className="terrain-card p-8 text-center"
        style={{ borderStyle: "dashed", borderColor: "var(--color-stone-gray)" }}
      >
        <CalendarCheck className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-[13px] font-medium text-muted-foreground">No partner commitments submitted yet.</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Export a partner's enablement plan PDF, fill in proposed dates, and click "Submit to Dashboard".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {commitments.map((c) => {
          const agreed = c.commitments.filter((m) => m.agreed).length;
          const total = c.commitments.length;
          const allAgreed = agreed === total;

          return (
            <motion.div
              key={c.partnerId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="terrain-card overflow-hidden"
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between gap-3"
                style={{
                  background: allAgreed
                    ? "color-mix(in srgb, var(--color-basil-green) 5%, transparent)"
                    : "color-mix(in srgb, var(--color-pure-orange) 4%, transparent)",
                  borderBottom: "1px solid var(--color-stone-gray)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in srgb, var(--color-basil-green) 14%, transparent)" }}
                  >
                    <CalendarCheck className="w-4 h-4" style={{ color: "var(--color-basil-green)" }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{c.partnerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Submitted {formatDate(c.submittedAt)} · {agreed}/{total} milestones agreed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{
                      background: allAgreed
                        ? "color-mix(in srgb, var(--color-basil-green) 14%, transparent)"
                        : "color-mix(in srgb, var(--color-pure-orange) 12%, transparent)",
                      color: allAgreed ? "var(--color-basil-green)" : "var(--color-pure-orange)",
                    }}
                  >
                    {allAgreed ? "✓ Fully Committed" : `${total - agreed} Pending`}
                  </span>
                  <button
                    onClick={() => onDelete(c.partnerId)}
                    className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                    title="Remove commitment"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Milestones */}
              <div className="divide-y divide-border/50">
                {c.commitments.map((m) => {
                  const effectiveDate = m.internalTargetDate || m.partnerDate || m.suggestedDate;
                  const days = dueDays(effectiveDate);
                  const overdue = days !== null && days < 0;
                  const soon = days !== null && days >= 0 && days <= 14;
                  const isEditing = editingMilestone?.partnerId === c.partnerId && editingMilestone?.mId === m.id;
                  
                  // Get partner employee pool
                  const partnerPool = trainingData[c.partnerId];
                  const allEmployees = partnerPool ? [
                    ...partnerPool.salesPro,
                    ...partnerPool.techPro,
                    ...partnerPool.bootcamp,
                    ...partnerPool.implSpec
                  ].reduce((acc, curr) => {
                    if (!acc.find(p => p.email === curr.email)) acc.push(curr);
                    return acc;
                  }, [] as any[]) : [];

                  return (
                    <div key={m.id} className="relative">
                      <div className={`px-5 py-4 flex items-center gap-4 flex-wrap transition-colors ${isEditing ? 'bg-slate-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {m.status === "accepted" ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                              </div>
                            ) : m.status === "rejected" ? (
                              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                              </div>
                            ) : (
                              <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                            )}
                            <div className="min-w-0">
                              <span className="text-[13px] font-bold text-slate-900 leading-tight block truncate">{m.label}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {m.assignedEmployees && m.assignedEmployees.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {m.assignedEmployees.map(email => (
                                      <span key={email} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white text-[9px] font-bold text-slate-500 border border-slate-200">
                                        <Users className="w-2.5 h-2.5" /> {email.split('@')[0]}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {m.adminNotes && (
                                  <span className="text-[10px] text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[300px]" title={m.adminNotes}>
                                    " {m.adminNotes} "
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 text-[11px]">
                          <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Pure Suggested</p>
                            <p className="font-semibold text-slate-600">{formatDate(m.suggestedDate)}</p>
                          </div>
                          
                          {(m.partnerDate || m.internalTargetDate) && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "var(--color-pure-orange)" }}>
                                {m.internalTargetDate ? "Admin Revised" : "Partner Proposed"}
                              </p>
                              <p className="font-black" style={{ color: "var(--color-pure-orange)" }}>
                                {formatDate(m.internalTargetDate || m.partnerDate)}
                              </p>
                            </div>
                          )}

                          <div className="w-20">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Status</p>
                            {days === null ? (
                              <p className="text-slate-400">—</p>
                            ) : overdue ? (
                              <span className="flex items-center gap-1 font-black text-rose-600">
                                <CalendarX className="w-3 h-3" /> {Math.abs(days)}d Over
                              </span>
                            ) : soon ? (
                              <span className="font-black text-orange-500">{days}d left</span>
                            ) : (
                              <span className="font-bold text-slate-700">{days}d left</span>
                            )}
                          </div>

                          <button 
                            onClick={() => handleStartEdit(c.partnerId, m)}
                            className={`p-2 rounded-xl border transition-all ${
                              isEditing 
                                ? 'bg-[#FF7023] border-[#FF7023] text-white' 
                                : 'bg-white border-slate-200 text-slate-400 hover:text-[#FF7023] hover:border-[#FF7023]/30'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Edit Form */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50 border-t border-slate-200 overflow-hidden"
                          >
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Review Decision</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => setEditStatus("accepted")}
                                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${
                                        editStatus === "accepted" 
                                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" /> Accept Date
                                    </button>
                                    <button
                                      onClick={() => setEditStatus("rejected")}
                                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${
                                        editStatus === "rejected" 
                                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' 
                                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                      }`}
                                    >
                                      <CalendarX className="w-3.5 h-3.5" /> Reject / Revise
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Revised Target Date</label>
                                  <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                      type="date"
                                      value={editDate}
                                      onChange={(e) => setEditDate(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7023] transition-all"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Potential Employees</label>
                                  <div className="relative">
                                    <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                    <div className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl min-h-[44px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-[#FF7023] transition-all">
                                      {editEmployees.map(email => (
                                        <span key={email} className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg bg-orange-50 text-[11px] font-bold text-[#FF7023] border border-orange-100">
                                          {email.split('@')[0]}
                                          <button onClick={() => setEditEmployees(prev => prev.filter(e => e !== email))}>
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      ))}
                                      {allEmployees.length > 0 && (
                                        <select 
                                          className="flex-1 bg-transparent border-none outline-none text-[12px] min-w-[100px]"
                                          onChange={(e) => {
                                            if (e.target.value && !editEmployees.includes(e.target.value)) {
                                              setEditEmployees([...editEmployees, e.target.value]);
                                            }
                                            e.target.value = "";
                                          }}
                                        >
                                          <option value="">Add employee...</option>
                                          {allEmployees.map(p => (
                                            <option key={p.email} value={p.email}>
                                              {p.firstName} {p.lastName}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Admin Review Notes</label>
                                  <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Add feedback or reasons for rejection..."
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7023] transition-all min-h-[80px]"
                                  />
                                </div>
                              </div>

                              <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-200">
                                <button
                                  onClick={() => setEditingMilestone(null)}
                                  className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-white transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-8 py-2.5 rounded-xl bg-[#FF7023] text-white text-[13px] font-black shadow-lg shadow-orange-500/20 hover:bg-[#E65F1B] transition-all active:scale-95"
                                >
                                  Save Review Decisions
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
