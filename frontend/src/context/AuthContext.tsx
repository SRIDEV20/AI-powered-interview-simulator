"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  LoginData,
  RegisterData,
} from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────
interface AuthState {
  user    : User | null;
  token   : string | null;
  loading : boolean;
}

interface AuthContextType extends AuthState {
  login       : (data: LoginData)    => Promise<void>;
  register    : (data: RegisterData) => Promise<User>;
  logout      : ()                   => Promise<void>;
  refreshUser : ()                   => Promise<void>;
  isAuth      : boolean;
}

// ── Constants ──────────────────────────────────────────────────────
const TOKEN_KEY = "ai_interview_token";
const USER_KEY  = "ai_interview_user";

// ── Context ────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user    : null,
    token   : null,
    loading : true,
  });

  // ── Load from localStorage on mount ──────────────────────────────
  useEffect(() => {
    try {
      const token   = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        setState({ user, token, loading: false });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────
  const login = useCallback(async (data: LoginData) => {
    const res = await loginUser(data);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY,  JSON.stringify(res.user));
    setState({ user: res.user, token: res.access_token, loading: false });
  }, []);

  // ── Register ──────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData): Promise<User> => {
    return await registerUser(data);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (state.token) await logoutUser(state.token);
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({ user: null, token: null, loading: false });
    }
  }, [state.token]);

  // ── Refresh User ✅ Day 18 ────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const user = await getCurrentUser(token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch {
      // Token may be expired — ignore silently
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        isAuth: !!state.token && !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}