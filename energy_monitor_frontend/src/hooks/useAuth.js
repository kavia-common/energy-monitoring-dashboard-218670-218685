import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "energy_monitor.auth";

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and actions (login/register/logout). */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    // load session
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.token) {
          setToken(parsed.token);
          setUser(parsed.user || null);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // persist session
    if (!token) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  const refreshMe = useCallback(
    async (t = token) => {
      if (!t) return null;
      try {
        const me = await authApi.getMe(t);
        setUser(me);
        return me;
      } catch {
        return null;
      }
    },
    [token]
  );

  // PUBLIC_INTERFACE
  const login = useCallback(
    async ({ email, password }) => {
      /** Logs in and stores token. Expects {access_token|token}. */
      const res = await authApi.login({ email, password });
      const t = res.access_token || res.token;
      if (!t) {
        throw new Error("Login succeeded but no token was returned by the backend.");
      }
      setToken(t);
      await refreshMe(t);
      return res;
    },
    [refreshMe]
  );

  // PUBLIC_INTERFACE
  const register = useCallback(
    async ({ email, password, name }) => {
      /** Registers and stores token if returned; otherwise instructs user to login. */
      const res = await authApi.register({ email, password, name });
      const t = res.access_token || res.token;
      if (t) {
        setToken(t);
        await refreshMe(t);
      }
      return res;
    },
    [refreshMe]
  );

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    /** Clears session. */
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, isAuthenticated, isLoading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
