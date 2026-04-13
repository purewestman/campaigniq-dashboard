import { useState } from "react";
import { FileDown, X, FileSignature, Calendar, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Partner } from "@/lib/data";
import { generatePartnerProfileHtml } from "@/lib/partnerProfilePdf";
import { toast } from "sonner";

interface ExportButtonProps {
  partner: Partner;
  variant?: "ghost" | "primary" | "outline";
}

export default function ExportButton({ partner, variant = "primary" }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Signature State
  const [signName, setSignName] = useState("");
  const [signRole, setSignRole] = useState("");
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAgreed, setIsAgreed] = useState(false);

  const startExportProcess = () => {
    setShowModal(true);
  };

  const handleExport = async () => {
    if (!signName || !signRole || !signDate || !isAgreed) {
      toast.error("Please complete all signature fields.");
      return;
    }

    setShowModal(false);
    console.log(`Switching to premium PDF generator for: ${partner.name}`);
    
    // Sync with Dashboard
    window.postMessage({
      type: 'PEI_COMMITMENT_SUBMIT',
      partnerId: partner.id,
      partnerName: partner.name,
      submittedAt: new Date().toISOString(),
      commitments: [
        {
          id: 'signed_plan',
          label: `Partner Status Report Signed by ${signName} (${signRole})`,
          suggestedDate: signDate,
          partnerDate: signDate,
          agreed: true
        }
      ]
    }, "*");

    const html = generatePartnerProfileHtml(partner);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    
    toast.success("Profile verified and report generated.");
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); startExportProcess(); }}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm ${
          variant === "primary" 
            ? "bg-[#FF7023] text-white hover:bg-[#E65F1B]" 
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        } active:scale-95`}
      >
        <FileDown className="w-4 h-4" />
        Export & Sign
      </button>

      {/* Signature Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 pb-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <FileSignature className="w-6 h-6 text-[#FF7023]" />
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Electronic Signature</h3>
                  <p className="text-slate-500 font-medium text-[13px] mt-1">
                    Sign the Enablement Plan for <span className="text-[#FF7023] font-bold">{partner.name}</span> to verify commitment.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name & Surname"
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7023] transition-all font-medium"
                    />
                  </div>
                  
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Professional Role (e.g. Sales Director)"
                      value={signRole}
                      onChange={(e) => setSignRole(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7023] transition-all font-medium"
                    />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={signDate}
                      onChange={(e) => setSignDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7023] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 bg-white transition-all checked:bg-[#FF7023] checked:border-[#FF7023]"
                      />
                      <svg
                        className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-normal group-hover:text-slate-700 transition-colors">
                      By signing, I confirm the accuracy of this enablement profile and commit to the outlined milestones.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleExport}
                  disabled={!signName || !signRole || !isAgreed}
                  className="w-full mt-8 py-4 bg-[#FF7023] text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-[#E65F1B] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  Sign & Export Document ⚡️
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}


