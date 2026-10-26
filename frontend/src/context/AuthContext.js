"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

// Keeps the logged-in user for the whole app.
// The JWT lives in an httpOnly cookie (JS can't read it), so we ask the backend "who am I?" via /profile/view.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile || null);
      return profile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial "who am I?" check when the app opens
    let active = true;
    api
      .getProfile()
      .then((profile) => active && setUser(profile || null))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));

    // api.js fires this on any 401 (expired token, password changed on another device...)
    const onUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    await api.login(credentials);
    return refreshUser();
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
