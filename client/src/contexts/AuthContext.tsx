import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { partners } from '@/lib/data';

interface UserIdentity {
  role: 'admin' | 'partner';
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
  resetPassword: (domain: string, newPassword: string) => boolean;
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
      const adminUser: UserIdentity = { role: 'admin', name: 'Global Admin' };
      setIsLoggedIn(true);
      setUser(adminUser);
      sessionStorage.setItem('campaigniq_auth', 'true');
      sessionStorage.setItem('campaigniq_user', JSON.stringify(adminUser));
      return 'success';
    }
    
    // Partner logic
    const partnerUrlStr = username.toLowerCase().trim();
    const partnerMatch = partners.find(p => p.domain === partnerUrlStr);
    
    if (!partnerMatch) {
      return 'unauthorized_domain';
    }
    
    if (partnerMatch) {
      const storedPassword = localStorage.getItem(`pwd_${partnerUrlStr}`);
      
      // Default password is "everpure" if none has been set for this domain
      const effectivePassword = storedPassword ?? 'everpure';
      if (password !== effectivePassword) {
        return 'fail';
      }
      
      const requiresSetup = password === 'everpure';
      const partnerUser: UserIdentity = { 
        role: 'partner', 
        domain: partnerUrlStr, 
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
    if (user && user.role === 'partner' && user.domain) {
      localStorage.setItem(`pwd_${user.domain}`, newPassword);
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

  const resetPassword = (domain: string, newPassword: string) => {
    const partnerMatch = partners.find(p => p.domain === domain.toLowerCase().trim());
    if (partnerMatch) {
      localStorage.setItem(`pwd_${partnerMatch.domain}`, newPassword);
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
