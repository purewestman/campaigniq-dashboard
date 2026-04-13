import { type Partner } from "@/lib/data";
import { generatePartnerProfileHtml } from "@/lib/partnerProfilePdf";
import { FileSearch } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  partner: Partner;
  variant?: "ghost" | "primary" | "outline";
}

export default function ExportButton({ partner, variant = "primary" }: ExportButtonProps) {
  const handleViewAndSign = () => {
    console.log(`Opening premium report viewer for: ${partner.name}`);
    
    const html = generatePartnerProfileHtml(partner);
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Pop-up blocked. Please allow pop-ups for this dashboard.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    
    toast.info("Report viewer opened in a new tab.");
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleViewAndSign(); }}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm ${
        variant === "primary" 
          ? "bg-[#FF7023] text-white hover:bg-[#E65F1B]" 
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
      } active:scale-95`}
    >
      <FileSearch className="w-4 h-4" />
      View & Sign Report
    </button>
  );
}
