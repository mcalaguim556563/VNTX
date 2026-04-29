import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'vntx_auth_user';

// ---------- Demo credentials ----------
const DEMO_ADMIN: AuthUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@vntx.com',
  role: 'admin',
  initials: 'AD',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    // --- Attempt real backend first ---
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          initials: data.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        };
        if (data.token) localStorage.setItem('vntx_token', data.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
        return { ok: true };
      }
    } catch {
      // Backend not available — fall through to demo credentials
    }

    // --- Demo / mock login ---
    if (email === 'admin@vntx.com' && password === 'admin123') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
      setUser(DEMO_ADMIN);
      return { ok: true };
    }

    return { ok: false, error: 'Invalid email or password.' };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('vntx_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
