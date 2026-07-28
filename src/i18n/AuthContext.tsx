import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type SiteUser = {
  id: string;
  login: string;
  name: string | null;
  is_admin: boolean;
};

type AuthContextType = {
  user: SiteUser | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<{ error: string | null; user?: SiteUser; token?: string }>;
  signUp: (login: string, password: string, name: string) => Promise<{ error: string | null; user?: SiteUser; token?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'site_user';
const TOKEN_KEY = 'site_token';

function readUser(): SiteUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiteUser | null>(() => readUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(readUser());
  }, []);

  const signIn = async (login: string, password: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      const siteUser: SiteUser = {
        id: data.user.id,
        login: data.user.login,
        name: data.user.name,
        is_admin: data.user.is_admin,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(siteUser));
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(siteUser);
      return { error: null, user: siteUser, token: data.token };
    } catch {
      return { error: 'Network error' };
    }
  };

  const signUp = async (login: string, password: string, name: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/auth-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ login, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Registration failed' };
      }

      const siteUser: SiteUser = {
        id: data.user.id,
        login: data.user.login,
        name: data.user.name,
        is_admin: data.user.is_admin,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(siteUser));
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(siteUser);
      return { error: null, user: siteUser, token: data.token };
    } catch {
      return { error: 'Network error' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
