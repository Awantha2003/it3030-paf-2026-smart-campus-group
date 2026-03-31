import React, { useEffect, useState, createContext, useContext } from 'react';
import { mockUsers } from '../data/mockData';
import { loginTechnician as loginTechnicianApi } from '../api/auth';

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
      Object.values(mockUsers).find((currentUser) => currentUser.role === role) || mockUsers.user;
    setUser(selectedUser);
    localStorage.setItem('authUser', JSON.stringify(selectedUser));
  };

  const loginTechnician = async (credentials) => {
    const response = await loginTechnicianApi(credentials);
    setUser(response.user);
    localStorage.setItem('authUser', JSON.stringify(response.user));
    return response.user;
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
        loginTechnician,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
