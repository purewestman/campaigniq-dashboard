import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { partners, isLinkedDomain } from '@/lib/data';

interface UserIdentity {
  role: 'Global Admin' | 'Admin' | 'Sales' | 'Technical' | 'Sales & Technical';
  email?: string;
  domain?: string;
  name?: string;
  requiresSetup?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserIdentity | null;
  login: (password: string, username?: string) => 'success' | 'setup_required' | 'fail' | 'unauthorized_domain';
  logout: () => void;
  changePassword: (newPassword: string) => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserIdentity | null>(null);

  // Check sessionStorage on mount to persist login across refreshes
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('campaigniq_auth');
    const sessionUser = sessionStorage.getItem('campaigniq_user');
    if (sessionAuth === 'true' && sessionUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(sessionUser));
    }
  }, []);

  const login = (password: string, username?: string) => {
    if (!username) return 'fail';
    
    // Global admin logic
    if (username === 'pureuser' && password === 'prevents.comm1ts') {
      const adminUser: UserIdentity = { role: 'Global Admin', name: 'Global Admin', email: 'pureuser' };
      setIsLoggedIn(true);
      setUser(adminUser);
      sessionStorage.setItem('campaigniq_auth', 'true');
      sessionStorage.setItem('campaigniq_user', JSON.stringify(adminUser));
      return 'success';
    }
    
    // Partner Email logic
    const email = username.toLowerCase().trim();
    if (!email.includes('@')) return 'fail';
    
    const domain = email.split('@')[1];
    const partnerMatch = partners.find(p => isLinkedDomain(p.domain, domain));
    
    if (!partnerMatch) {
      return 'unauthorized_domain';
    }
    
    if (partnerMatch) {
      const storedPassword = localStorage.getItem(`pwd_${email}`);
      const effectivePassword = storedPassword ?? 'everpure';
      
      if (password !== effectivePassword) {
        return 'fail';
      }
      
      // Fetch dynamic role
      const rolesData = localStorage.getItem("pei-global-user-roles-v1");
      const rolesMap = rolesData ? JSON.parse(rolesData) : {};
      let assignedRole = rolesMap[email] || "Sales";
      if ((email === "riaan.taylor@nttdata.com" || email === "riaan.taylor@ntt.com") && !rolesMap[email]) {
        assignedRole = "Admin";
      }

      const requiresSetup = password === 'everpure';
      const partnerUser: UserIdentity = { 
        role: assignedRole, 
        email,
        domain: domain, 
        name: partnerMatch.name,
        requiresSetup
      };

      setUser(partnerUser);
      sessionStorage.setItem('campaigniq_user', JSON.stringify(partnerUser));
      
      if (!requiresSetup) {
        setIsLoggedIn(true);
        sessionStorage.setItem('campaigniq_auth', 'true');
      }
      
      return requiresSetup ? 'setup_required' : 'success';
    }

    return 'fail';
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    sessionStorage.removeItem('campaigniq_auth');
    sessionStorage.removeItem('campaigniq_user');
  };

  const changePassword = (newPassword: string) => {
    if (user && user.email && user.role !== 'Global Admin') {
      localStorage.setItem(`pwd_${user.email.toLowerCase()}`, newPassword);
      // Update session user to clear setup flag and login
      const updatedUser = { ...user, requiresSetup: false };
      setUser(updatedUser);
      setIsLoggedIn(true);
      sessionStorage.setItem('campaigniq_auth', 'true');
      sessionStorage.setItem('campaigniq_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const resetPassword = (email: string, newPassword: string) => {
    const rawEmail = email.toLowerCase().trim();
    if (!rawEmail.includes('@')) return false;
    
    const domain = rawEmail.split('@')[1];
    const partnerMatch = partners.find(p => p.domain === domain);
    
    if (partnerMatch) {
      localStorage.setItem(`pwd_${rawEmail}`, newPassword);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, changePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
