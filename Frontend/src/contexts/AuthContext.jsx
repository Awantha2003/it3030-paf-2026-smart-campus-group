import React, { useState, createContext, useContext, useCallback } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(undefined);
const DEFAULT_ROLE = 'USER';

function getDefaultUser(role = DEFAULT_ROLE) {
  return Object.values(mockUsers).find((currentUser) => currentUser.role === role) || mockUsers.user;
}

function getInitialUser() {
  const savedUser = localStorage.getItem('authUser');

  if (!savedUser) {
    return getDefaultUser();
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return getDefaultUser();
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  const switchRole = useCallback((role = DEFAULT_ROLE) => {
    const selectedUser = getDefaultUser(role);
    setUser(selectedUser);
    localStorage.setItem('authUser', JSON.stringify(selectedUser));
  }, []);

  const logout = useCallback(() => {
    const defaultUser = getDefaultUser();
    setUser(defaultUser);
    localStorage.setItem('authUser', JSON.stringify(defaultUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
