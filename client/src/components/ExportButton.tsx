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

    console.log(`Starting PDF export (robust) for: ${partner.name}`);
    setIsExporting(true);
    
    try {
      const element = reportRef.current;
      
      // Temporarily apply isolation class
      element.classList.add("pdf-export-mode");
      
      // Force layout and wait for images/fonts
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use html-to-image with security filters and a timeout
      const capturePromise = toPng(element, {
        quality: 1.0,
        pixelRatio: 2.0, // Higher resolution for professional look
        backgroundColor: "#ffffff",
        cacheBust: true,
        // Filter out link tags that might cause SecurityErrors
        filter: (node: any) => {
          if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
            return !node.href.includes('external-domain.com'); // Placeholder logic
          }
          return true;
        }
      });

      // Wrap in a timeout to prevent infinite spin
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("PDF generation timed out")), 15000)
      );

      const dataUrl = await Promise.race([capturePromise, timeoutPromise]) as string;

      element.classList.remove("pdf-export-mode");

      console.log("Image captured via html-to-image");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Proportions check without long wait
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("Image failed to load in PDF"));
        setTimeout(() => reject(new Error("Image dimension check timed out")), 5000);
      });
      
      img.src = dataUrl;
      await loadPromise;
      
      const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `${partner.name.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_')}_FY27_Profile.pdf`;
      pdf.save(fileName);
      console.log(`PDF saved successfully`);

    } catch (error: any) {
      console.error("PDF Export failed:", error);
      alert(`Export failed: ${error.message || "Unknown error"}. Check console for details.`);
      reportRef.current?.classList.remove("pdf-export-mode");
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
            ? "bg-[#FF7023] text-white hover:bg-[#E65F1B] disabled:bg-[#FF7023]/50" 
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

      {/* Hidden Report for capture - Improved styling to avoid measuring errors */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '-10000px', 
          left: '-10000px', 
          width: '800px', 
          height: '1132px', // A4 aspect ratio height at 800px width
          pointerEvents: 'none',
          background: 'white',
          zIndex: -1
        }}
      >
        <div ref={reportRef} style={{ width: '800px' }}>
          <PartnerReport partner={partner} />
        </div>
      </div>
    </>
  );
}


