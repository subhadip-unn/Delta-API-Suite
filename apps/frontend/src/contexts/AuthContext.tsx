import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'QA Engineer' | 'Developer' | 'Manager';

type AuthContextType = {
  qaName: string;
  userRole: UserRole;
  isAuthenticated: boolean;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qaName, setQaName] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('QA Engineer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // On mount, check if user is already authenticated via localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('cbz-qa-name');
    const storedRole = localStorage.getItem('cbz-user-role') as UserRole;
    if (storedName) {
      setQaName(storedName);
      setUserRole(storedRole || 'QA Engineer');
      setIsAuthenticated(true);
    }
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
    <AuthContext.Provider value={{ qaName, userRole, isAuthenticated, login, logout }}>
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
