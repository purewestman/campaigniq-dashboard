import { useState, useRef } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { type Partner } from "@/lib/data";
import PartnerReport from "./PartnerReport";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

interface ExportButtonProps {
  partner: Partner;
  variant?: "ghost" | "primary" | "outline";
}

export default function ExportButton({ partner, variant = "primary" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExporting) return;

    if (!reportRef.current) {
      console.error("Report ref not found");
      return;
    }

    console.log(`Starting PDF export for: ${partner.name} using html-to-image (ref)`);
    setIsExporting(true);
    
    try {
      const element = reportRef.current;
      
      // Ensure the element is visible and computed styles are ready
      element.classList.add("pdf-export-mode");
      
      // Give the browser time to reflow
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Remove the isolation class after capture
      element.classList.remove("pdf-export-mode");


      console.log("Image captured, generating PDF...");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // PNGs from html-to-image are standard data URLs
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const pdfHeight = (img.height * pdfWidth) / img.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `${partner.name.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_')}_FY27_Report.pdf`;
      pdf.save(fileName);
      console.log(`PDF saved as: ${fileName}`);

    } catch (error: any) {
      console.error("PDF Export failed:", error);
      alert(`PDF Export failed: ${error.message || "Unknown error"}`);
      // Cleanup class if it was stuck
      const reportId = `report-${partner.id}`;
      document.getElementById(reportId)?.classList.remove("pdf-export-mode");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm ${
          variant === "primary" 
            ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400" 
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        {isExporting ? "Generating..." : "Export PDF"}
      </button>

      {/* Hidden Report for capture */}
      <div className="fixed -left-[2000px] -top-[2000px] pointer-events-none overflow-hidden h-0 w-0">
        <div ref={reportRef}>
          <PartnerReport partner={partner} />
        </div>
      </div>
    </>
  );
}

