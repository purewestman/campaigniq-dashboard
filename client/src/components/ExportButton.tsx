import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { type Partner } from "@/lib/data";
import PartnerReport from "./PartnerReport";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

    setIsExporting(true);
    
    // Create a temporary container for the report
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    try {
      // We need to render the report and wait for fonts/images
      // For simplicity in this demo, we'll use a portal-like approach 
      // by temporarily rendering it in the DOM.
      const reportId = `report-${partner.id}`;
      
      // We'll render it to the hidden container
      // Note: In a real app we'd use a more robust way to wait for render
      // but html2canvas handles most things well.
      
      // Let's create a temporary hidden div for the capture
      const captureDiv = document.createElement("div");
      captureDiv.id = "temp-capture";
      captureDiv.style.width = "800px";
      captureDiv.style.background = "white";
      document.body.appendChild(captureDiv);

      // We'll use a simple trick: render the component to a string or just use actual DOM
      // Since we are in React, we'll use a hidden element in the main DOM instead of dynamic creation
      // but for this implementation we'll assume the component is already in HTML if we provide a ref.
      
      // REVISED APPROACH: We'll look for the element in the DOM. 
      // To make it work, let's keep the PartnerReport rendered but hidden in this component.
      
      const element = document.getElementById(reportId);
      if (!element) throw new Error("Report element not found");

      // Make it visible momentarily for capture if needed, or html2canvas might handle hidden
      // Wait a tiny bit for any potential re-renders
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

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
      pdf.save(`${partner.name.replace(/\s+/g, '_')}_FY27_Report.pdf`);

    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
      const temp = document.getElementById("temp-capture");
      if (temp) temp.remove();
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
