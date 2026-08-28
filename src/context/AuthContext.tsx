import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  role: UserRole;
  setCurrentUser: (user: UserAccount) => void;
  switchUserRole: (role: UserRole) => void;
  isAdminOrAbove: boolean;
  isOwner: boolean;
  canDispatch: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(null);

  useEffect(() => {
    apiClient.getAdminUsers().then((users) => {
      if (Array.isArray(users)) {
        setUsersList(users);
        if (users.length > 0) {
          // default to Owner or Admin
          const savedUserId = localStorage.getItem('rafting_staff_user_id');
          const found = users.find((u) => u.id === savedUserId);
          setCurrentUserState(found || users[0]);
        }
      }
    }).catch(console.error);
  }, []);

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserState(user);
    localStorage.setItem('rafting_staff_user_id', user.id);
  };

  const switchUserRole = (targetRole: UserRole) => {
    const target = usersList.find((u) => u.role === targetRole);
    if (target) {
      setCurrentUser(target);
    }
  };

  const role = currentUser?.role || UserRole.GUIDE;
  const isOwner = role === UserRole.OWNER;
  const isAdminOrAbove = role === UserRole.OWNER || role === UserRole.ADMIN;
  const canDispatch = role === UserRole.OWNER || role === UserRole.ADMIN || role === UserRole.DISPATCHER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        role,
        setCurrentUser,
        switchUserRole,
        isAdminOrAbove,
        isOwner,
        canDispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
