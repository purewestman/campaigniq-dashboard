import React, { useState } from "react";
import { useModifications } from "@/contexts/ModificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { isLinkedDomain } from "@/lib/data";
import { Users, UserPlus, Search, Trash2, Mail, BadgeCheck, ShieldAlert, Settings2, Check, X, Key, Download, Upload } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { computedGlobalDirectory, addGlobalUser, removeGlobalUser, updateUserRole } = useModifications();
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'Global Admin';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "" });
  const [newUserRole, setNewUserRole] = useState<"Admin" | "Sales" | "Technical" | "Sales & Technical">("Sales");

  const [forceRender, setForceRender] = useState(0);

  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  const domainDirectory = isGlobalAdmin 
    ? computedGlobalDirectory 
    : computedGlobalDirectory.filter(u => isLinkedDomain(user?.domain, u.email.split('@')[1]));

  const filteredUsers = domainDirectory.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newUser.email || !newUser.email.includes("@")) {
      toast.error("Valid email required");
      return;
    }
    
    if (!isGlobalAdmin) {
      const emailDomain = newUser.email.split('@')[1]?.toLowerCase();
      if (!isLinkedDomain(user?.domain, emailDomain)) {
         toast.error(`Access Denied: You may only add users within your authorized domain group.`);
         return;
      }
    }
    addGlobalUser({
      ...newUser,
      source: "manual",
      role: newUserRole
    });
    setNewUser({ firstName: "", lastName: "", email: "" });
    setNewUserRole("Sales");
    setIsAdding(false);
    toast.success("User added to Global Directory");
  };

  const handleResetPassword = (domain: string) => {
    if (confirm(`Are you sure you want to reset the primary login password for ${domain} back to 'everpure'?`)) {
      localStorage.setItem(`pwd_${domain}`, "everpure");
      toast.success(`Password for ${domain} successfully reset.`);
      setForceRender(p => p + 1);
    }
  };

  const commitSave = (email: string) => {
    if (pendingRoles[email]) {
      updateUserRole(email, pendingRoles[email] as any);
      toast.success("User role updated successfully");
      setPendingRoles(prev => { const n = {...prev}; delete n[email]; return n; });
    }
    setActionMenuFor(null);
  };

  const handleExportCsv = () => {
    const header = "firstName,lastName,email,role,source\n";
    // Using domainDirectory so we export the same list we are authorized to see, rather than the search-filtered subset
    const rows = domainDirectory.map(u => `${u.firstName || ""},${u.lastName || ""},${u.email},${u.role || "Sales"},${u.source || "organic"}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `everpure_users_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV empty or missing data rows.");
        return;
      }
      let added = 0;
      let skipped = 0;
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV split (assumes no commas in fields)
        const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 3) {
          const [firstName, lastName, email, roleInput, sourceInput] = cols;
          if (email && email.includes("@")) {
            if (!isGlobalAdmin) {
              const emailDomain = email.split('@')[1]?.toLowerCase();
              if (!isLinkedDomain(user?.domain, emailDomain)) {
                 skipped++;
                 continue; // prevent cross-domain ingestion via CSV
              }
            }
            const resolvedRole = ["Admin", "Sales", "Technical", "Sales & Technical"].includes(roleInput) 
              ? roleInput as any 
              : "Sales";
            
            addGlobalUser({
              firstName: firstName || "",
              lastName: lastName || "",
              email: email.toLowerCase(),
              role: resolvedRole,
              source: sourceInput || "csv_import"
            });
            added++;
          }
        }
      }
      toast.success(`Import complete! Loaded ${added} users.` + (skipped > 0 ? ` Skipped ${skipped} unauthorized domains.` : ''));
      if (e.target) e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 w-full bg-[#FAFAFA] min-h-screen text-slate-800 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b-4 border-pure-orange inline-block pb-2 max-w-fit flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-pure-orange" />
            {isGlobalAdmin ? "Admin Settings & Operations" : "Partner Identity Directory"}
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            {isGlobalAdmin ? "Manage overarching access, users, and credentials across the dashboard ecosystem." : `Administrative management of personnel associated with ${user?.domain || 'your organization'}.`}
          </p>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search directory..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pure-orange transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <button 
                 onClick={handleExportCsv}
                 className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
               >
                 <Download className="w-4 h-4" /> Export CSV
               </button>
               <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer">
                 <Upload className="w-4 h-4" /> Import CSV
                 <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
               </label>
               <button 
                 onClick={() => setIsAdding(!isAdding)}
                 className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
               >
                 <UserPlus className="w-4 h-4" /> Add User
               </button>
            </div>
          </div>

          {/* Add User Panel */}
          {isAdding && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-pure-orange space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-pure-orange" />
                Manual Directory Entry
              </h3>
              <p className="text-xs text-slate-500">
                Users added manually will bypass organic telemetry detection and become immediately available for assigning requirements in the exact domains you register them under.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input 
                   type="text" placeholder="First Name" 
                   value={newUser.firstName} onChange={(e) => setNewUser(p => ({...p, firstName: e.target.value}))}
                   className="bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:border-pure-orange outline-none"
                 />
                 <input 
                   type="text" placeholder="Last Name" 
                   value={newUser.lastName} onChange={(e) => setNewUser(p => ({...p, lastName: e.target.value}))}
                   className="bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:border-pure-orange outline-none"
                 />
                 <input 
                   type="email" placeholder="Email Address (e.g. user@partner.com)" 
                   value={newUser.email} onChange={(e) => setNewUser(p => ({...p, email: e.target.value}))}
                   className="bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:border-pure-orange outline-none"
                 />
                 <select 
                   value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}
                   className="bg-slate-50 border border-slate-200 px-3 py-2 text-sm rounded-lg focus:border-pure-orange outline-none"
                 >
                   <option value="Admin">Admin</option>
                   <option value="Sales">Sales</option>
                   <option value="Technical">Technical</option>
                   <option value="Sales & Technical">Sales & Technical (Both)</option>
                 </select>
              </div>
              <div className="flex justify-end gap-2">
                 <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">Cancel</button>
                 <button onClick={handleAdd} className="px-5 py-2 text-sm font-bold text-white bg-pure-orange rounded-lg shadow-sm">Save to Directory</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Account Domain</th>
                  <th className="px-6 py-4">Auth Credential</th>
                  <th className="px-6 py-4">IAM Role</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
                {filteredUsers.map((userObj) => {
                  const isEditing = actionMenuFor === userObj.email;
                  const currentDisplayRole = isEditing ? (pendingRoles[userObj.email] || userObj.role || "Sales") : (userObj.role || "Sales");
                  const userDomain = userObj.email.split('@')[1];

                  return (
                    <tr key={userObj.email} className={`transition-colors duration-200 ${isEditing ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isEditing ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'} border flex items-center justify-center transition-colors`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <span>{userObj.firstName} {userObj.lastName}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="flex items-center gap-2 text-slate-500 font-mono text-[12px]">
                          <Mail className="w-3.5 h-3.5" />
                          {userObj.email}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold font-mono border border-slate-200">
                          @{userDomain}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {isGlobalAdmin ? (() => {
                          const pwd = localStorage.getItem(`pwd_${userDomain}`) || "everpure";
                          const isDefault = pwd === "everpure";
                          return (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold ${isDefault ? 'bg-amber-50 text-amber-600 border-amber-200/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200/50'}`}>
                              <Key className="w-3 h-3" />
                              {pwd}
                            </div>
                          );
                        })() : (
                          <span className="text-slate-400 text-xs italic">Hidden</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {isEditing ? (
                          <select 
                            value={currentDisplayRole}
                            onChange={(e) => setPendingRoles(p => ({...p, [userObj.email]: e.target.value}))}
                            className="bg-white border text-slate-600 px-2 py-1.5 rounded-md text-[12px] font-bold outline-none border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-sm w-full"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Sales">Sales</option>
                            <option value="Technical">Technical</option>
                            <option value="Sales & Technical">Sales & Technical (Both)</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold ${currentDisplayRole === 'Admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                            {currentDisplayRole}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {userObj.source === "telemetry" ? (
                          <span className="inline-flex items-center gap-1 text-moss-green bg-moss-green/10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <BadgeCheck className="w-3 h-3" /> Telemetry
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-pure-orange bg-pure-orange/10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <UserPlus className="w-3 h-3" /> Manual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right w-[200px]">
                        {!isEditing ? (
                          <button 
                            onClick={() => setActionMenuFor(userObj.email)}
                            className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                          >
                            Actions
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                            <button 
                              onClick={() => commitSave(userObj.email)}
                              className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center gap-1 text-[11px] font-bold shadow-sm"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            {isGlobalAdmin && (
                              <button 
                                onClick={() => { handleResetPassword(userDomain); setActionMenuFor(null); }}
                                className="px-2 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md flex items-center gap-1 text-[11px] font-bold shadow-sm"
                                title={`Reset password for domain @${userDomain}`}
                              >
                                <Key className="w-3 h-3" /> Reset
                              </button>
                            )}
                            <button 
                              onClick={() => { setActionMenuFor(null); setPendingRoles(p => { const n={...p}; delete n[userObj.email]; return n; }); }}
                              className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md flex items-center gap-1 text-[11px] font-bold"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                            {userObj.source === "manual" && (
                              <button 
                                onClick={() => removeGlobalUser(userObj.email)}
                                className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-md ml-1"
                                title="Delete user entirely"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                      No users mapped to this search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
