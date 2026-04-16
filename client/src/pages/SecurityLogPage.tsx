import { useState, useEffect } from "react";
import { partners, isLinkedDomain } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, Key, UserCheck, AlertTriangle, Search, Info } from "lucide-react";

export default function SecurityLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<{ domain: string; name: string; passwordSet: string | null; isDefault: boolean }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let allowedPartners = partners;
    if (user?.role !== 'Global Admin' && user?.domain) {
      allowedPartners = partners.filter(p => isLinkedDomain(user.domain, p.domain));
    }
    
    const data = allowedPartners.map(p => {
      const stored = localStorage.getItem(`pwd_${p.domain}`);
      return {
        domain: p.domain,
        name: p.name,
        passwordSet: stored,
        isDefault: stored === null || stored === "everpure"
      };
    });
    setLogs(data);
  }, []);

  const handleResetPassword = (domain: string) => {
    if (confirm(`Are you sure you want to reset the password for ${domain} back to 'everpure'?`)) {
      localStorage.setItem(`pwd_${domain}`, "everpure");
      setLogs(prev => prev.map(l => 
        l.domain === domain ? { ...l, passwordSet: "everpure", isDefault: true } : l
      ));
    }
  };

  const filteredLogs = logs.filter(l => 
    l.domain.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" /> Security & Credential Audit
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor partner account initialization and active credentials.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search domain or partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
            <Key className="w-32 h-32" />
          </div>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Passwords Set</p>
          <p className="text-4xl font-black">{logs.filter(l => !l.isDefault).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending Initialization</p>
          <p className="text-4xl font-black text-slate-900">{logs.filter(l => l.isDefault).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm border-l-4 border-l-emerald-400">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">System Health</p>
          <p className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner / Domain</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Password Log</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.domain} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{log.name}</div>
                    <div className="text-xs text-slate-500 font-medium tracking-tight">{log.domain}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.isDefault ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100 uppercase">
                        <AlertTriangle className="w-3 h-3" /> Initial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100 uppercase">
                        <UserCheck className="w-3 h-3" /> Custom
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-2 font-mono text-xs flex items-center justify-between group-hover:bg-white transition-colors">
                      <span className="text-slate-600 font-bold">{log.isDefault ? "everpure" : log.passwordSet}</span>
                      <Key className="w-3 h-3 text-slate-300" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${log.isDefault ? 'w-1/3 bg-amber-400' : 'w-full bg-emerald-500'}`}
                         />
                       </div>
                       <span className="text-[10px] font-bold text-slate-400">{log.isDefault ? "Basic" : "Secure"}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleResetPassword(log.domain)}
                      disabled={log.isDefault}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4 items-start">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          <strong className="text-slate-900">Security Note:</strong> This log is strictly for internal administration of partner accounts. 
          Passwords are listed in plain-text for support purposes as per current requirement. Ensure this screen remains 
          visible only to authorized support personnel.
        </p>
      </div>
    </div>
  );
}
