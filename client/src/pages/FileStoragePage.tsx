import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Search,
  FolderOpen,
  File,
  FileSpreadsheet,
  FileImage,
  X,
  Loader2,
  Tag,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General", color: "oklch(0.55 0.02 55)" },
  { value: "certification", label: "Certification", color: "oklch(0.55 0.15 160)" },
  { value: "training", label: "Training", color: "oklch(0.55 0.16 290)" },
  { value: "report", label: "Report", color: "oklch(0.55 0.15 30)" },
  { value: "compliance", label: "Compliance", color: "oklch(0.55 0.15 200)" },
  { value: "partner", label: "Partner", color: "oklch(0.55 0.15 130)" },
];

function getCategoryColor(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.color ?? "oklch(0.55 0.02 55)";
}

function getCategoryLabel(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? "General";
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word"))
    return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function FileStoragePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: files, isLoading, error: listError } = trpc.files.list.useQuery();
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      utils.files.list.invalidate();
    },
  });
  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      utils.files.list.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadError(null);
      setUploadSuccess(null);

      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File too large (${formatFileSize(file.size)}). Maximum is 10 MB.`);
        return;
      }

      setUploading(true);

      try {
        // Read file as base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:application/pdf;base64,")
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await uploadMutation.mutateAsync({
          filename: file.name,
          base64Data: base64,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          category: uploadCategory,
          description: uploadDescription || undefined,
        });

        setUploadSuccess(`"${file.name}" uploaded successfully!`);
        setUploadDescription("");
        setTimeout(() => setUploadSuccess(null), 4000);
      } catch (err: any) {
        setUploadError(err.message || "Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadCategory, uploadDescription, uploadMutation]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (err: any) {
        setUploadError(err.message || "Delete failed.");
      }
    },
    [deleteMutation]
  );

  // Filter files
  const filteredFiles = (files ?? []).filter((f) => {
    const matchesSearch =
      !searchQuery.trim() ||
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.uploadedByName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalSize = (files ?? []).reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FolderOpen className="w-5 h-5" style={{ color: "oklch(0.55 0.15 160)" }} />
          File Storage
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Upload, organize, and manage documents. Files are stored securely in cloud storage.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="terrain-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Total Files
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{files?.length ?? 0}</p>
        </div>
        <div className="terrain-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Storage Used
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatFileSize(totalSize)}</p>
        </div>
        <div className="terrain-card p-4">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Categories
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {new Set((files ?? []).map((f) => f.category)).size}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="terrain-card p-5">
        <h3 className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4" style={{ color: "oklch(0.55 0.15 160)" }} />
          Upload Document
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Category selector */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Category
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief description of the file..."
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Drop zone / file input */}
        <div
          className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer hover:border-teal-400/50 hover:bg-teal-50/30"
          style={{ borderColor: "oklch(0.55 0.15 160 / 0.25)" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.zip"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.55 0.15 160)" }} />
              <p className="text-[13px] text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8" style={{ color: "oklch(0.55 0.15 160 / 0.5)" }} />
              <p className="text-[13px] text-foreground font-medium">
                Click to select a file
              </p>
              <p className="text-[11px] text-muted-foreground">
                PDF, Word, Excel, CSV, Images, ZIP — Max 10 MB
              </p>
            </div>
          )}
        </div>

        {/* Upload feedback */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "oklch(0.55 0.15 30 / 0.08)", border: "1px solid oklch(0.55 0.15 30 / 0.15)" }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "oklch(0.55 0.15 30)" }} />
              <span className="text-[12px] text-foreground">{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="ml-auto">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          )}
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "oklch(0.55 0.15 160 / 0.08)", border: "1px solid oklch(0.55 0.15 160 / 0.15)" }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "oklch(0.55 0.15 160)" }} />
              <span className="text-[12px] text-foreground">{uploadSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-[13px] border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File List */}
      <div className="terrain-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "oklch(0.55 0.15 160)" }} />
            <p className="text-[13px] text-muted-foreground">Loading files...</p>
          </div>
        ) : listError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.55 0.15 30)" }} />
            <p className="text-[14px] font-medium text-foreground">Failed to load files</p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">
              {listError.message || "An unexpected error occurred. Please try again later."}
            </p>
            <button
              onClick={() => utils.files.list.invalidate()}
              className="mt-3 px-4 py-2 rounded-xl text-[12px] font-medium transition-colors hover:opacity-80"
              style={{ background: "oklch(0.55 0.15 160 / 0.1)", color: "oklch(0.55 0.15 160)" }}
            >
              Retry
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-[14px] font-medium text-muted-foreground">
              {files?.length === 0 ? "No files uploaded yet" : "No files match your search"}
            </p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">
              {files?.length === 0
                ? "Upload your first document using the form above."
                : "Try adjusting your search or category filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              style={{ background: "oklch(0.97 0.005 85)" }}
            >
              <div className="col-span-5">File</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Uploaded</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* File rows */}
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/60 transition-colors group"
                >
                  {/* File info */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${getCategoryColor(file.category ?? "general")}15` }}
                    >
                      <Icon
                        className="w-4.5 h-4.5"
                        style={{ color: getCategoryColor(file.category ?? "general") }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {file.filename}
                      </p>
                      {file.description && (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        background: `${getCategoryColor(file.category ?? "general")}12`,
                        color: getCategoryColor(file.category ?? "general"),
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {getCategoryLabel(file.category ?? "general")}
                    </span>
                  </div>

                  {/* Size */}
                  <div className="col-span-2">
                    <span className="text-[12px] text-muted-foreground">
                      {formatFileSize(file.sizeBytes)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <span className="text-[12px] text-muted-foreground">
                      {formatDate(file.createdAt)}
                    </span>
                    {file.uploadedByName && (
                      <p className="text-[10px] text-muted-foreground/60">
                        by {file.uploadedByName}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-teal-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.15 160)" }} />
                    </a>

                    {deleteConfirmId === file.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                          title="Confirm delete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(file.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
