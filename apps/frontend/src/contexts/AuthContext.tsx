import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'QA Engineer' | 'Developer' | 'Manager';

type AuthContextType = {
  qaName: string;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qaName, setQaName] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('QA Engineer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, check if user is already authenticated via localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('cbz-qa-name');
    const storedRole = localStorage.getItem('cbz-user-role') as UserRole;
    
    // CORE FIX: Prevent "QA Engineer" from being used as an actual name
    // If stored name is a role instead of a person's name, clear it
    if (storedName && storedName !== 'QA Engineer' && storedName !== 'Developer' && storedName !== 'Manager') {
      setQaName(storedName);
      setUserRole(storedRole || 'QA Engineer');
      setIsAuthenticated(true);
      console.log(`🔐 [AUTH] Restored user: ${storedName} (${storedRole || 'QA Engineer'})`);
    } else {
      // Clear corrupted/invalid data and force re-login
      if (storedName) {
        console.warn(`⚠️ [AUTH] Invalid name "${storedName}" found in localStorage. Clearing and forcing re-login.`);
        localStorage.removeItem('cbz-qa-name');
        localStorage.removeItem('cbz-user-role');
      }
      setIsAuthenticated(false);
    }
    setIsLoading(false); // Authentication check complete
  }, []);

  const login = (name: string, role: UserRole) => {
    if (name.trim()) {
      localStorage.setItem('cbz-qa-name', name);
      localStorage.setItem('cbz-user-role', role);
      setQaName(name);
      setUserRole(role);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('cbz-qa-name');
    localStorage.removeItem('cbz-user-role');
    setQaName('');
    setUserRole('QA Engineer');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ qaName, userRole, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
