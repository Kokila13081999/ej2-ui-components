import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, tokenStore, UNAUTHORIZED_EVENT, type AuthSession } from '../services/api';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setSession(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const s = await authApi.login(username, password);
    tokenStore.set(s);
    setSession(s);
  }, []);

  // Any API 401 (expired / invalid token) logs the user out.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  // Auto-logout exactly when the token expires.
  useEffect(() => {
    if (!session) return;
    const ms = session.expiresAt - Date.now();
    if (ms <= 0) { logout(); return; }
    const id = window.setTimeout(logout, Math.min(ms, 2_147_000_000));
    return () => window.clearTimeout(id);
  }, [session, logout]);

  const value = useMemo(() => ({ session, isAuthenticated: !!session, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
