import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, ShieldCheck, Mail, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PureDividerBackground from "@/components/PureDividerBackground";
import { toast } from "sonner";
import { partners } from "@/lib/data";

type LoginView = "login" | "forgot" | "force_setup" | "reset";

export default function LoginPage() {
  const { login, changePassword, resetPassword } = useAuth();
  const [view, setView] = useState<LoginView>("login");
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Setup/Reset State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [targetResetDomain, setTargetResetDomain] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
      const result = login(password, username);
      if (result === 'fail') {
        setError(true);
        setLoading(false);
      } else if (result === 'setup_required') {
        setView("force_setup");
        setLoading(false);
      } else {
        // Success handled by AuthContext (re-render)
      }
    }, 600);
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    const success = changePassword(newPassword);
    if (success) {
      toast.success("Password initialized successfully!");
      // On success, AuthContext user becomes isLoggedIn: true and Home mounts
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = username.toLowerCase().trim();
    const emailDomain = resetEmail.split('@')[1]?.toLowerCase();
    
    if (emailDomain !== domain) {
      toast.error(`Invalid email for domain ${domain}. Please use a ${domain} address.`);
      return;
    }

    setLoading(true);
    setTargetResetDomain(domain);

    setTimeout(() => {
      setLoading(false);
      toast.info("Security Check", {
        description: `A reset link has been simulated for ${resetEmail}.`,
        action: {
          label: "Click Reset Link",
          onClick: () => setView("reset")
        },
        duration: 10000
      });
    }, 1000);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRobotChecked) {
      toast.error("Please verify you are not a robot");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = resetPassword(targetResetDomain, newPassword);
    if (success) {
      toast.success("Password reset successfully!");
      setView("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end overflow-hidden relative bg-[var(--color-rose-pink)]">
      <PureDividerBackground 
        colorLeft="var(--color-quartz-pink)"
        colorTopRight="var(--color-rose-pink)"
        colorBottomRight="color-mix(in srgb, var(--color-clay-pink) 70%, var(--color-rose-pink))"
        lineColor="var(--color-cloud-white)"
        className="opacity-90 transition-all duration-1000"
      />

      <motion.div 
        layout
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-[440px] px-6 relative z-10 mr-0 md:mr-[10%] lg:mr-[15%]"
      >
        <div 
          className="p-8 pb-10 rounded-3xl overflow-hidden"
          style={{ 
            background: "var(--color-cloud-white)",
            border: "1px solid var(--color-stone-gray)",
            boxShadow: "0 32px 64px rgba(45, 42, 39, 0.15), 0 0 0 1px rgba(208, 200, 186, 0.5)"
          }}
        >
          {/* Header & Logo */}
          <div className="text-center mb-8">
            <motion.div layout className="flex items-center justify-center gap-3 mb-2">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M50 0L93.3 25V50H70V35L50 23.5L30 35V65L50 76.5L70 65H93.3V75L50 100L6.7 75V25Z" fill="var(--color-pure-orange)"/>
              </svg>
              <h1 className="text-[34px] font-black tracking-tighter" style={{ color: "var(--color-ash-gray)" }}>
                Everpure
              </h1>
            </motion.div>
            <p className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
              {view === "login" ? "Partner Login" : view === "forgot" ? "Account Recovery" : view === "force_setup" ? "First-Time Security" : "Reset Password"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN VIEW */}
            {view === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-pure-orange)] transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Your Domain"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full text-sm pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-pure-orange)] transition-colors" />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-sm pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-center text-red-500 py-2 bg-red-50 rounded-lg">
                    Incorrect domain or password.
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold bg-[var(--color-pure-orange)] text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Connect <ArrowRight className="w-4 h-4" /></>}
                </button>

                <button 
                  type="button" 
                  onClick={() => setView("forgot")}
                  className="w-full text-xs font-bold text-slate-400 hover:text-[var(--color-pure-orange)] transition-colors py-2"
                >
                  Forgot your password?
                </button>
              </motion.form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleForgotSubmit}
                className="space-y-4"
              >
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-2 text-slate-600">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    Enter the email associated with <strong className="text-slate-900">{username || "your domain"}</strong> to receive a secure reset link.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-pure-orange)] transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder={`e.g. admin@${username || "yourdomain.com"}`}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full text-sm pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !resetEmail}
                  className="w-full py-4 rounded-xl font-bold bg-[var(--color-pure-orange)] text-white shadow-lg transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin text-center w-full" /> : "Request Reset Link"}
                </button>

                <button 
                  type="button" 
                  onClick={() => setView("login")}
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  Back to Login
                </button>
              </motion.form>
            )}

            {/* FORCE SETUP VIEW */}
            {view === "force_setup" && (
              <motion.form
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSetupSubmit}
                className="space-y-4"
              >
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl mb-2 text-indigo-900 shadow-sm">
                  <h3 className="text-sm font-black flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4" /> Finalize Your Account
                  </h3>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    Welcome! For your security, you must replace the default password with a custom secure password before continuing.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-sm px-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold bg-[var(--color-pure-orange)] text-white shadow-lg transition-all"
                >
                  Initialize Account
                </button>
              </motion.form>
            )}

            {/* RESET VIEW */}
            {view === "reset" && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleResetSubmit}
                className="space-y-4"
              >
                <div className="space-y-3 pt-2">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-sm px-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm px-4 py-3.5 border-2 rounded-xl focus:outline-none border-[var(--color-stone-gray)] focus:border-[var(--color-pure-orange)] transition-all"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-default group" onClick={() => setIsRobotChecked(!isRobotChecked)}>
                   <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isRobotChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                      {isRobotChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                   </div>
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">I am not a robot</span>
                   <div className="ml-auto flex flex-col items-center opacity-40">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="4"/>
                      </svg>
                      <span className="text-[6px] font-black leading-none">reCAPTCHA</span>
                   </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg transition-all"
                >
                  Reset & Log In
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] font-bold text-slate-600">
          <ShieldCheck className="w-[15px] h-[15px] text-[var(--color-pure-orange)]" />
          <span>Security & Compliance Verified</span>
        </div>
      </motion.div>
    </div>
  );
}

