import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (password: string, username?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check sessionStorage on mount to persist login across refreshes
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('campaigniq_auth');
    if (sessionAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const login = (password: string, username?: string) => {
    // Validate credentials
    if (username === 'pureuser' && password === 'prevents.comm1ts') {
      setIsLoggedIn(true);
      sessionStorage.setItem('campaigniq_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('campaigniq_auth');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
