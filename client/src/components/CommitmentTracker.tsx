/*
 * CommitmentTracker — displays timeline commitments submitted from partner PDF plans.
 * Data is stored in localStorage under key 'pei_timeline_commitments'.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, CalendarX, CheckCircle2, Clock, Trash2 } from "lucide-react";

export interface CommitmentMilestone {
  id: string;
  label: string;
  suggestedDate: string;
  partnerDate: string;
  agreed: boolean;
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

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

function dueDays(dateStr: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface Props {
  commitments: PartnerCommitment[];
  onDelete: (partnerId: number) => void;
}

export default function CommitmentTracker({ commitments, onDelete }: Props) {
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
                    ? "color-mix(in srgb, var(--color-basil-green) 8%, transparent)"
                    : "color-mix(in srgb, var(--color-pure-orange) 6%, transparent)",
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
                  const effectiveDate = m.partnerDate || m.suggestedDate;
                  const days = dueDays(effectiveDate);
                  const overdue = days !== null && days < 0;
                  const soon = days !== null && days >= 0 && days <= 14;

                  return (
                    <div key={m.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {m.agreed
                            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-basil-green)" }} />
                            : <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-pure-orange)" }} />
                          }
                          <span className="text-[12px] font-semibold text-foreground truncate">{m.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-[11px]">
                        <div>
                          <p className="text-muted-foreground text-[10px]">Suggested</p>
                          <p className="font-medium text-foreground">{formatDate(m.suggestedDate)}</p>
                        </div>
                        {m.partnerDate && (
                          <div>
                            <p className="text-[10px]" style={{ color: "var(--color-pure-orange)" }}>Partner Proposed</p>
                            <p className="font-bold" style={{ color: "var(--color-pure-orange)" }}>{formatDate(m.partnerDate)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground text-[10px]">Due in</p>
                          {days === null ? (
                            <p className="text-muted-foreground">—</p>
                          ) : overdue ? (
                            <span className="flex items-center gap-1 font-bold" style={{ color: "#dc2626" }}>
                              <CalendarX className="w-3 h-3" /> {Math.abs(days)}d overdue
                            </span>
                          ) : soon ? (
                            <span className="font-bold" style={{ color: "var(--color-pure-orange)" }}>{days}d</span>
                          ) : (
                            <span className="font-medium text-foreground">{days}d</span>
                          )}
                        </div>
                      </div>
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
