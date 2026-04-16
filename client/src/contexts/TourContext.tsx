/**
 * TourContext.tsx — Interactive Playthrough Engine
 *
 * The tour automatically executes actions (navigation, input fills, clicks)
 * with a visible animated cursor that shows the user *exactly* what to do.
 * Each step fires a `preAction` to set up the scene, then an `autoAction`
 * which is performed automatically before the user taps "Got it / Next".
 *
 * Storage key: "campaigniq_has_seen_tour" — cleared on "Take Tour" so the
 * partner can replay it at any time via the Help (?) button in the header.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check, Loader2 } from "lucide-react";

// ─── Step definition ──────────────────────────────────────────────────────────
export type TourStep = {
  /** CSS selector of the element to spotlight */
  target: string;
  title: string;
  content: string;
  /** Where to position the tooltip relative to spotlight */
  placement?: "top" | "bottom" | "left" | "right";
  /** Runs *before* the spotlight is shown (e.g. navigate, expand rows) */
  preAction?: () => Promise<void> | void;
  /**
   * Runs automatically once the spotlight has appeared.
   * Should simulate typing / clicking / selecting so the partner sees
   * the action happen in real time. Called with a helper `delay(ms)` fn.
   */
  autoAction?: (helpers: ActionHelpers) => Promise<void>;
};

type ActionHelpers = {
  delay: (ms: number) => Promise<void>;
  /** Smoothly simulates typing into a text input */
  typeInto: (selector: string, text: string) => Promise<void>;
  /** Trigger a native click on the first matching element */
  clickEl: (selector: string) => void;
  /** Set a <select> value and fire change event */
  selectValue: (selector: string, value: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface TourContextType {
  isActive: boolean;
  /** Start the tour with a new set of steps */
  startTour: (steps: TourStep[]) => void;
  /** Stop the tour immediately */
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const ctx = useContext(TourContext);
  return ctx ?? { isActive: false, startTour: () => {}, stopTour: () => {} };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [autoRunning, setAutoRunning] = useState(false);
  // Animated cursor position
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const cancelRef = useRef(false);

  // ── helpers ────────────────────────────────────────────────────────────────
  const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  /** Move the animated cursor to the centre of a DOM element */
  const moveCursorTo = useCallback((el: Element) => {
    const r = el.getBoundingClientRect();
    setCursor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, []);

  const actionHelpers: ActionHelpers = {
    delay,
    clickEl: (sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) {
        moveCursorTo(el);
        setTimeout(() => {
          // Use bubbling MouseEvent so React synthetic handlers fire
          el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        }, 300);
      }
    },
    selectValue: (sel, value) => {
      const el = document.querySelector<HTMLSelectElement>(sel);
      if (el) {
        moveCursorTo(el);
        setTimeout(() => {
          el.value = value;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, 300);
      }
    },
    typeInto: async (sel, text) => {
      const el = document.querySelector<HTMLInputElement>(sel);
      if (!el) return;
      moveCursorTo(el);
      await delay(400);
      el.focus();
      // Type character by character
      for (const ch of text) {
        if (cancelRef.current) return;
        el.value += ch;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        await delay(55);
      }
      await delay(300);
      // Fire change so React state updates
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
  };

  // ── measure target with retry polling ─────────────────────────────────────
  // Tries every 300ms for up to 15 attempts (~4.5s) before giving up.
  const measureTarget = useCallback(
    (idx: number, stepList: TourStep[], attempt = 0) => {
      const step = stepList[idx];
      if (!step) return;
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const fresh = document.querySelector(step.target);
          if (fresh) {
            moveCursorTo(fresh);
            setTargetRect(fresh.getBoundingClientRect());
          }
        }, 380);
      } else if (attempt < 15) {
        // Target not in DOM yet — retry after 300ms
        setTimeout(() => measureTarget(idx, stepList, attempt + 1), 300);
      } else {
        // Exhausted retries — skip this step gracefully
        setTargetRect(null);
      }
    },
    [moveCursorTo]
  );

  // ── lifecycle: run step ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    cancelRef.current = false;
    const step = steps[currentIndex];
    setTargetRect(null);
    setAutoRunning(false);
    setCursor(null);

    (async () => {
      // 1. Pre-action (navigation / expanding)
      if (step.preAction) {
        await Promise.resolve(step.preAction());
        await delay(600); // let React re-render
      }

      if (cancelRef.current) return;

      // 2. Measure and spotlight
      measureTarget(currentIndex, steps);

      // 3. Auto-action (typing / selecting)
      if (step.autoAction) {
        await delay(900); // wait for tooltip to appear
        if (cancelRef.current) return;
        setAutoRunning(true);
        await step.autoAction(actionHelpers);
        setAutoRunning(false);
        // Re-measure after action (element may have moved)
        measureTarget(currentIndex, steps);
      }
    })();

    // Refresh on resize / scroll
    const onResize = () => measureTarget(currentIndex, steps);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelRef.current = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentIndex, steps]);

  // ── public API ─────────────────────────────────────────────────────────────
  const startTour = useCallback((newSteps: TourStep[]) => {
    cancelRef.current = false;
    setSteps(newSteps);
    setCurrentIndex(0);
    setIsActive(true);
  }, []);

  const stopTour = useCallback(() => {
    cancelRef.current = true;
    setIsActive(false);
    setTargetRect(null);
    setCursor(null);
    setAutoRunning(false);
  }, []);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      stopTour();
    }
  };

  const currentStep = steps[currentIndex];

  // Tooltip position helpers
  const tooltipTop =
    targetRect &&
    (currentStep?.placement === "top"
      ? Math.max(10, targetRect.top - 195)
      : targetRect.top + targetRect.height + 18);
  const tooltipLeft =
    targetRect &&
    Math.max(
      16,
      Math.min(
        window.innerWidth - 344,
        targetRect.left + targetRect.width / 2 - 164
      )
    );

  return (
    <TourContext.Provider value={{ isActive, startTour, stopTour }}>
      {children}

      <AnimatePresence>
        {isActive && currentStep && (
          <div
            className="fixed inset-0 z-[99998] pointer-events-none"
            style={{ fontFamily: "var(--font-grotesk, sans-serif)" }}
          >
            {/* ── backdrop + spotlight mask ─────────────────────────────── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ cursor: "default" }}
              onClick={(e) => e.stopPropagation()}
            >
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <motion.rect
                      initial={{ opacity: 0, width: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        x: targetRect.left - 12,
                        y: targetRect.top - 12,
                        width: targetRect.width + 24,
                        height: targetRect.height + 24,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                      fill="black"
                      rx={14}
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.58)"
                style={{ backdropFilter: "blur(7px)" }}
                mask="url(#tour-spotlight-mask)"
              />
            </svg>

            {/* ── animated fake cursor ────────────────────────────────── */}
            <AnimatePresence>
              {cursor && (
                <motion.div
                  key="tour-cursor"
                  className="fixed z-[99999] pointer-events-none"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1, x: cursor.x, y: cursor.y }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ top: 0, left: 0, translateX: "-50%", translateY: "-50%" }}
                >
                  {/* SVG cursor shape */}
                  <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
                    <path
                      d="M2 2L2 20L6.5 15.5L9.5 23L12.5 21.5L9.5 14H16L2 2Z"
                      fill="white"
                      stroke="#333"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {autoRunning && (
                    <span className="absolute -top-1 -right-1">
                      <span className="inline-block w-3 h-3 rounded-full animate-ping"
                        style={{ background: "var(--color-pure-orange)" }} />
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── tooltip card ─────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {targetRect && typeof tooltipTop === "number" && typeof tooltipLeft === "number" && (
                <motion.div
                  key={`tooltip-${currentIndex}`}
                  className="fixed pointer-events-auto w-[330px] rounded-2xl shadow-2xl overflow-hidden z-[99999]"
                  style={{ top: tooltipTop, left: tooltipLeft }}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                >
                  {/* colour bar */}
                  <div
                    className="h-1 w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--color-pure-orange), var(--color-basil-green))",
                    }}
                  />
                  <div
                    className="p-5"
                    style={{ background: "var(--color-cloud-white)" }}
                  >
                    {/* header */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {autoRunning && (
                          <Loader2
                            className="w-3.5 h-3.5 animate-spin shrink-0"
                            style={{ color: "var(--color-pure-orange)" }}
                          />
                        )}
                        <h3
                          className="text-[13px] font-black tracking-tight leading-tight"
                          style={{ color: "var(--color-basalt-gray)" }}
                        >
                          {currentStep.title}
                        </h3>
                      </div>
                      <button
                        onClick={stopTour}
                        className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 ml-2 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11.5px] text-slate-600 leading-relaxed mb-5 min-h-[36px]">
                      {autoRunning ? (
                        <span>
                          <span
                            className="font-bold"
                            style={{ color: "var(--color-pure-orange)" }}
                          >
                            ↓ Watch:&nbsp;
                          </span>
                          {currentStep.content}
                        </span>
                      ) : (
                        currentStep.content
                      )}
                    </p>

                    {/* footer */}
                    <div className="flex items-center justify-between">
                      {/* step dots */}
                      <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: i === currentIndex ? 20 : 6,
                              background:
                                i === currentIndex
                                  ? "var(--color-pure-orange)"
                                  : "var(--color-stone-gray)",
                            }}
                          />
                        ))}
                      </div>

                      {/* step counter + next btn */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {currentIndex + 1} / {steps.length}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={autoRunning}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11.5px] font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-wait"
                          style={{ background: "var(--color-basil-green)" }}
                        >
                          {currentIndex === steps.length - 1 ? (
                            <>
                              Done <Check className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Next <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading pill when target not found yet */}
            <AnimatePresence>
              {!targetRect && (
                <motion.div
                  key="loading-pill"
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-[13px] font-medium text-white"
                    style={{ background: "rgba(30,30,35,0.92)", backdropFilter: "blur(10px)" }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Navigating…
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
