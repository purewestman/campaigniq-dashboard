import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { type Partner } from "@/lib/data";
import PartnerReport from "./PartnerReport";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createPortal } from "react-dom";

interface ExportButtonProps {
  partner: Partner;
  variant?: "ghost" | "primary" | "outline";
}

export default function ExportButton({ partner, variant = "primary" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExporting) return;

    console.log(`Starting PDF export for: ${partner.name}`);
    setIsExporting(true);
    
    try {
      const reportId = `report-${partner.id}`;
      const element = document.getElementById(reportId);
      
      if (!element) {
        console.error("Report element not found in DOM");
        alert("Error: Report template not found. Please try refreshing the page.");
        return;
      }

      // Wait for any images or styles to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log("Capturing canvas...");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true,
      });

      console.log("Canvas captured, generating PDF...");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `${partner.name.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_')}_FY27_Report.pdf`;
      pdf.save(fileName);
      console.log(`PDF saved as: ${fileName}`);

    } catch (error: any) {
      console.error("PDF Export failed:", error);
      alert(`PDF Export failed: ${error.message || "Unknown error"}`);
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
        <div id={`report-${partner.id}`}>
          <PartnerReport partner={partner} />
        </div>
      </div>
    </>
  );
}
