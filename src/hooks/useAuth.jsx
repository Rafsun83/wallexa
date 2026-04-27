import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const access = localStorage.getItem(STORAGE.ACCESS);
      const refresh = localStorage.getItem(STORAGE.REFRESH);
      const user = JSON.parse(localStorage.getItem(STORAGE.USER) || 'null');
      if (access && user) return { accessToken: access, refreshToken: refresh, user };
    } catch (e) {}
    return null;
  });

  const signIn = useCallback((data) => {
    localStorage.setItem(STORAGE.ACCESS, data.accessToken);
    localStorage.setItem(STORAGE.REFRESH, data.refreshToken);
    localStorage.setItem(STORAGE.USER, JSON.stringify(data.user));
    setAuth(data);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE.ACCESS);
    localStorage.removeItem(STORAGE.REFRESH);
    localStorage.removeItem(STORAGE.USER);
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
