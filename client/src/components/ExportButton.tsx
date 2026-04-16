/**
 * ExportButton.tsx
 * Replaced "View & Sign Report" with "Submit to Enablement Plan".
 * Marks the partner's current state as submitted in ModificationContext
 * and shows a confirmation toast. PPTX export lives on the Enablement Plans page.
 */

import { type Partner } from "@/lib/data";
import { useModifications } from "@/contexts/ModificationContext";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  partner: Partner;
  variant?: "ghost" | "primary" | "outline";
}

export default function ExportButton({ partner, variant = "primary" }: ExportButtonProps) {
  const { getModification, addModification, partnerTimelines } = useModifications();

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();

    const mod = getModification(partner.id);
    const timeline = partnerTimelines[partner.id] ?? [];
    const completedItems = timeline.filter((i: any) => i.status === "completed").length;
    const totalItems = timeline.length;

    // Persist a "submitted" flag on the modification
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
        bookingsUSD: null,
        uniqueCustomers: null,
        partnerDeliveredServices: null,
        addedEmails: {},
        removedEmails: {},
        modifiedBy: "Enablement Manager",
      }),
      comment: `Submitted to Enablement Plan on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — ${completedItems}/${totalItems || "—"} milestones complete`,
      modifiedBy: "Enablement Manager",
    });

    toast.success(`${partner.name} submitted to Enablement Plan`, {
      description: `${completedItems} of ${totalItems || "0"} milestones marked complete. View full plan & export PPTX on the Enablement Plans page.`,
      duration: 5000,
    });
  };

  return (
    <button
      onClick={handleSubmit}
      className={`tour-step-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm ${
        variant === "primary"
          ? "bg-[#FF7023] text-white hover:bg-[#E65F1B]"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      } active:scale-95`}
    >
      <ClipboardCheck className="w-4 h-4" />
      Submit to Enablement Plan
    </button>
  );
}
