/*
 * signedExports.ts — Signed PPTX Commitment Record Store
 * Stores signed export metadata in localStorage so partners and pureuser
 * can track, comment on, and approve signed commitment decks.
 */

export interface SignedExportComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: number;
}

export interface SignedExportRecord {
  id: string;
  partnerName: string;
  partnerDomain: string;
  signedBy: string;
  commitmentDate: string;
  exportedAt: number;
  status: 'pending_review' | 'approved' | 'changes_requested';
  comments: SignedExportComment[];
  isAllPartners: boolean; // true = "Export All" deck
}

const STORAGE_KEY = 'pei-signed-exports';

export function loadSignedExports(): SignedExportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSignedExports(records: SignedExportRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addSignedExport(record: Omit<SignedExportRecord, 'id' | 'comments' | 'status' | 'exportedAt'>): SignedExportRecord {
  const all = loadSignedExports();
  const newRecord: SignedExportRecord = {
    ...record,
    id: `se-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    exportedAt: Date.now(),
    status: 'pending_review',
    comments: [],
  };
  all.unshift(newRecord); // newest first
  saveSignedExports(all);
  return newRecord;
}

export function addCommentToExport(exportId: string, comment: Omit<SignedExportComment, 'id' | 'timestamp'>): SignedExportRecord | null {
  const all = loadSignedExports();
  const idx = all.findIndex(r => r.id === exportId);
  if (idx < 0) return null;
  const newComment: SignedExportComment = {
    ...comment,
    id: `c-${Date.now()}`,
    timestamp: Date.now(),
  };
  all[idx].comments = [...all[idx].comments, newComment];
  saveSignedExports(all);

  // Emit a custom storage event so DashboardHeader re-reads
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  return all[idx];
}

export function updateExportStatus(exportId: string, status: SignedExportRecord['status']): SignedExportRecord | null {
  const all = loadSignedExports();
  const idx = all.findIndex(r => r.id === exportId);
  if (idx < 0) return null;
  all[idx].status = status;
  saveSignedExports(all);
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  return all[idx];
}

export function deleteSignedExport(exportId: string) {
  const all = loadSignedExports().filter(r => r.id !== exportId);
  saveSignedExports(all);
}
