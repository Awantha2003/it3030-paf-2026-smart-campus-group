import React, { useEffect, useState, createContext, useContext } from 'react';
import { mockUsers } from '../data/mockData';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const login = (role = 'USER') => {
    const selectedUser =
    Object.values(mockUsers).find((u) => u.role === role) || mockUsers.user;
    setUser(selectedUser);
    localStorage.setItem('authUser', JSON.stringify(selectedUser));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };
  const switchRole = (role) => {
    login(role);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole
      }}>
      
      {children}
    </AuthContext.Provider>);

}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
  throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
