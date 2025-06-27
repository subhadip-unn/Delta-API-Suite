import React, { createContext, useState, useContext, useEffect } from 'react';

type AuthContextType = {
  qaName: string;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qaName, setQaName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // On mount, check if user is already authenticated via localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('cbz-qa-name');
    if (storedName) {
      setQaName(storedName);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (name: string) => {
    if (name.trim()) {
      localStorage.setItem('cbz-qa-name', name);
      setQaName(name);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('cbz-qa-name');
    setQaName('');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ qaName, isAuthenticated, login, logout }}>
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
