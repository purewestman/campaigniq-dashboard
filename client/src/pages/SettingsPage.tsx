import React, { useState } from "react";
import { useModifications } from "@/contexts/ModificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Users, UserPlus, Search, Trash2, Mail, BadgeCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { computedGlobalDirectory, addGlobalUser, removeGlobalUser, updateUserRole, addedGlobalUsers } = useModifications();
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'Global Admin';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "" });
  const [newUserRole, setNewUserRole] = useState<"Admin" | "Sales" | "Technical" | "Sales & Technical">("Sales");

  const domainDirectory = isGlobalAdmin 
    ? computedGlobalDirectory 
    : computedGlobalDirectory.filter(u => u.email.toLowerCase().endsWith(`@${user?.domain?.toLowerCase()}`));

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
      if (emailDomain !== user?.domain?.toLowerCase()) {
         toast.error(`Access Denied: You may only add users for the @${user?.domain} domain.`);
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

  return (
    <div className="flex-1 w-full bg-[#FAFAFA] min-h-screen text-slate-800 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b-4 border-pure-orange inline-block pb-2 max-w-fit">
            {isGlobalAdmin ? "Global User Directory" : "Partner Identity Directory"}
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Administrative management of {isGlobalAdmin ? `all ${domainDirectory.length} captured partner users across domains` : `personnel associated with ${user?.domain || 'your organization'}`}.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-pure-orange transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
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
                <th className="px-6 py-4">IAM Role</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>{user.firstName} {user.lastName}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-2 text-slate-500 font-mono text-[12px]">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold font-mono border border-slate-200">
                      @{user.email.split('@')[1]}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <select 
                      value={user.role || "Sales"}
                      onChange={(e) => updateUserRole(user.email, e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold outline-none focus:border-pure-orange"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Sales">Sales</option>
                      <option value="Technical">Technical</option>
                      <option value="Sales & Technical">Sales & Technical (Both)</option>
                    </select>
                  </td>
                  <td className="px-6 py-3.5">
                    {user.source === "telemetry" ? (
                      <span className="inline-flex items-center gap-1 text-moss-green bg-moss-green/10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <BadgeCheck className="w-3 h-3" /> Telemetry
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-pure-orange bg-pure-orange/10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <UserPlus className="w-3 h-3" /> Manual
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {user.source === "manual" && (
                      <button 
                        onClick={() => removeGlobalUser(user.email)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove manually added user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
