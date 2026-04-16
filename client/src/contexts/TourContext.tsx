import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check } from "lucide-react";

export type TourStep = {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  preAction?: () => Promise<void> | void; // action to take BEFORE showing the step
};

interface TourContextType {
  isActive: boolean;
  startTour: (steps: TourStep[]) => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) return { isActive: false, startTour: () => {}, stopTour: () => {} }; // Fallback if no provider
  return context;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const startTour = useCallback((newSteps: TourStep[]) => {
    setSteps(newSteps);
    setCurrentIndex(0);
    setIsActive(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setTargetRect(null);
  }, []);

  const measureTarget = useCallback(() => {
    if (!isActive || !steps[currentIndex]) return;
    const el = document.querySelector(steps[currentIndex].target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const freshEl = document.querySelector(steps[currentIndex].target);
        if (freshEl) setTargetRect(freshEl.getBoundingClientRect());
      }, 350);
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentIndex, steps]);

  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentIndex];
    if (step?.preAction) {
      Promise.resolve(step.preAction()).then(() => setTimeout(measureTarget, 200));
    } else {
      measureTarget();
    }

    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [isActive, currentIndex, steps, measureTarget]);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      stopTour();
    }
  };

  const currentStep = steps[currentIndex];

  return (
    <TourContext.Provider value={{ isActive, startTour, stopTour }}>
      {children}
      
      <AnimatePresence>
        {isActive && currentStep && (
          <div className="fixed inset-0 z-[99999] pointer-events-none" style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <motion.rect
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        x: targetRect.left - 10,
                        y: targetRect.top - 10,
                        width: targetRect.width + 20,
                        height: targetRect.height + 20,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      fill="black"
                      rx={12}
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.55)"
                style={{ backdropFilter: "blur(6px)" }}
                mask="url(#spotlight-mask)"
              />
            </svg>

            {/* Click blocker for backdrop */}
            <div className="absolute inset-0 pointer-events-none" />

            {/* Tooltip */}
            <AnimatePresence mode="wait">
              {targetRect && (
                 <motion.div
                   key={currentIndex}
                   className="absolute pointer-events-auto w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                   initial={{ opacity: 0, scale: 0.95, y: 15 }}
                   animate={{
                     opacity: 1, 
                     scale: 1, 
                     y: 0,
                     top: currentStep.placement === 'top' 
                          ? targetRect.top - 190 
                          : targetRect.top + targetRect.height + 20,
                     left: Math.max(20, Math.min(window.innerWidth - 340, targetRect.left + (targetRect.width / 2) - 160))
                   }}
                   exit={{ opacity: 0, scale: 0.95, y: -10 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25 }}
                 >
                   <div className="p-5 relative" style={{ background: "var(--color-cloud-white)" }}>
                     {/* Brand accent */}
                     <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, var(--color-pure-orange), var(--color-basil-green))" }} />
                     
                     <div className="flex justify-between items-start mb-3 pt-1">
                       <h3 className="text-[14px] font-black tracking-tight" style={{ color: "var(--color-basalt-gray)" }}>
                         {currentStep.title}
                       </h3>
                       <button onClick={stopTour} className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-lg p-1">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                     <p className="text-[12px] text-slate-600 leading-relaxed font-normal mb-6 min-h-[40px]">
                       {currentStep.content}
                     </p>
                     
                     <div className="flex items-center justify-between mt-auto">
                       <div className="flex gap-1.5">
                         {steps.map((_, i) => (
                           <div 
                             key={i} 
                             className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5' : 'w-1.5'}`}
                             style={{ background: i === currentIndex ? "var(--color-pure-orange)" : "var(--color-stone-gray)" }}
                           />
                         ))}
                       </div>
                       <button 
                         onClick={handleNext}
                         className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                         style={{ background: "var(--color-basil-green)" }}
                       >
                         {currentIndex === steps.length - 1 ? (
                           <>Finish <Check className="w-3.5 h-3.5" /></>
                         ) : (
                           <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                         )}
                       </button>
                     </div>
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}
