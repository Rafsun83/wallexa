import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { STORAGE, setUnauthorizedCallback } from '../api/client';
import { getUser } from '../api/user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const [auth, setAuth] = useState(() => {
    try {
      const access = localStorage.getItem(STORAGE.ACCESS);
      const refresh = localStorage.getItem(STORAGE.REFRESH);
      if (!access) return null;
      let user = null;
      try {
        const raw = localStorage.getItem(STORAGE.USER);
        if (raw) user = JSON.parse(raw);
      } catch {}
      return { accessToken: access, refreshToken: refresh, user };
    } catch (e) {}
    return null;
  });

  // true only when we have a token that hasn't been validated yet
  const [isVerifying, setIsVerifying] = useState(
    () => !!localStorage.getItem(STORAGE.ACCESS)
  );

  const signIn = useCallback((data) => {
    localStorage.setItem(STORAGE.ACCESS, data.accessToken);
    localStorage.setItem(STORAGE.REFRESH, data.refreshToken);
    localStorage.setItem(STORAGE.USER, JSON.stringify(data.user ?? null));
    setAuth(data);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE.ACCESS);
    localStorage.removeItem(STORAGE.REFRESH);
    localStorage.removeItem(STORAGE.USER);
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  // Register signOut so the axios interceptor can call it on 401
  useEffect(() => {
    setUnauthorizedCallback(signOut);
    return () => setUnauthorizedCallback(null);
  }, [signOut]);

  // Validate the stored token on mount.
  // Uses the same React Query key ['user'] so the result is cached —
  // Home.jsx's useUserQuery() will reuse it without a second network request.
  useEffect(() => {
    if (!auth) {
      setIsVerifying(false);
      return;
    }
    queryClient
      .fetchQuery({ queryKey: ['user'], queryFn: getUser })
      .catch(() => {}) // 401 is handled by the interceptor → signOut()
      .finally(() => setIsVerifying(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ auth, isVerifying, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
