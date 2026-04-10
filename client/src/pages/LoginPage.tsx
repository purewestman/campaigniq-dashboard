import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PureDividerBackground from "@/components/PureDividerBackground";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
      const success = login(password, username);
      if (!success) {
        setError(true);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-end overflow-hidden relative bg-[var(--color-rose-pink)]">
      {/* Slide 3 Pink Geometric SVG Background */}
      <PureDividerBackground 
        colorLeft="var(--color-quartz-pink)"
        colorTopRight="var(--color-rose-pink)"
        colorBottomRight="color-mix(in srgb, var(--color-clay-pink) 70%, var(--color-rose-pink))"
        lineColor="var(--color-cloud-white)"
        className="opacity-90"
      />

      {/* Login Card - positioned in the Cloud White area on the right */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="w-full max-w-[440px] px-6 relative z-10 mr-0 md:mr-[10%] lg:mr-[15%]"
      >
        <div 
          className="p-8 pb-10 rounded-3xl"
          style={{ 
            background: "var(--color-cloud-white)",
            border: "1px solid var(--color-stone-gray)",
            boxShadow: "0 32px 64px rgba(45, 42, 39, 0.15), 0 0 0 1px rgba(208, 200, 186, 0.5)"
          }}
        >
          {/* Header & Logo */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              {/* Custom Pure vector logo representation */}
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M50 0L6.7 25V75L50 100L93.3 75V50H70V65L50 76.5L30 65V35L50 23.5L70 35H93.3V25Z" fill="var(--color-pure-orange)"/>
              </svg>
              <h1 className="text-[34px] font-black tracking-tighter" style={{ color: "var(--color-ash-gray)" }}>
                Everpure
              </h1>
            </motion.div>

            <p className="text-[14px] font-medium" style={{ color: "var(--color-walnut-brown)" }}>
              Reseller Program Tier Compliance
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 transition-colors" style={{ color: "var(--color-walnut-brown)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(false);
                  }}
                  className="w-full text-[15px] pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all placeholder:text-opacity-50"
                  style={{ 
                    background: "var(--color-cloud-white)",
                    borderColor: "var(--color-stone-gray)",
                    color: "var(--color-ash-gray)"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-pure-orange)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-stone-gray)"}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 transition-colors" style={{ color: "var(--color-walnut-brown)" }} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  className="w-full text-[15px] pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all placeholder:text-opacity-50"
                  style={{ 
                    background: "var(--color-cloud-white)",
                    borderColor: "var(--color-stone-gray)",
                    color: "var(--color-ash-gray)"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-pure-orange)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-stone-gray)"}
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[13px] font-semibold text-center overflow-hidden"
                  style={{ color: "var(--color-rose-pink)" }}
                >
                  <span className="bg-white/50 px-3 py-1 rounded shadow-sm inline-block mt-2 text-[#D63301]">
                    Incorrect username or password.
                  </span>
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 text-[15px] font-bold px-4 py-4 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:brightness-110 active:scale-[0.98] mt-2 shadow-lg"
              style={{
                background: "var(--color-pure-orange)",
                color: "var(--color-cloud-white)",
                boxShadow: "0 8px 24px rgba(255, 112, 35, 0.3)"
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connect <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] font-bold" style={{ color: "var(--color-ash-gray)", textShadow: "0 1px 2px var(--color-cloud-white)" }}>
          <ShieldCheck className="w-[15px] h-[15px]" style={{ color: "var(--color-pure-orange)" }} />
          <span>Secure Authorized Access</span>
        </div>
      </motion.div>
    </div>
  );
}
