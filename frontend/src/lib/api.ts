const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────
export interface User {
  id         : string;
  email      : string;
  username   : string;
  full_name  : string;
  is_active  : boolean;
  created_at : string;
}

export interface AuthResponse {
  access_token : string;
  token_type   : string;
  user         : User;
}

export interface RegisterData {
  email     : string;
  username  : string;
  password  : string;
  full_name : string;
}

export interface LoginData {
  email    : string;
  password : string;
}

export interface UserStats {
  total_interviews       : number;
  completed_interviews   : number;
  average_score          : number;
  best_score             : number;
  total_questions_answered: number;
  member_since           : string;
  account_status         : string;
}

// ── Helper ─────────────────────────────────────────────────────────
async function request<T>(
  endpoint : string,
  options  : RequestInit = {}
): Promise<T> {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ── Auth header helper ─────────────────────────────────────────────
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ── Health ─────────────────────────────────────────────────────────
export async function getHealth() {
  const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<{ status: string; timestamp: string }>;
}

// ── Auth APIs ──────────────────────────────────────────────────────
export async function registerUser(data: RegisterData): Promise<User> {
  return request<User>("/api/auth/register", {
    method : "POST",
    body   : JSON.stringify(data),
  });
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method : "POST",
    body   : JSON.stringify(data),
  });
}

export async function logoutUser(token: string): Promise<void> {
  return request<void>("/api/auth/logout", {
    method  : "POST",
    headers : authHeader(token),
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  return request<User>("/api/auth/me", {
    headers: authHeader(token),
  });
}

// ── User APIs ──────────────────────────────────────────────────────
export async function getUserProfile(token: string): Promise<User> {
  return request<User>("/api/user/profile", {
    headers: authHeader(token),
  });
}

export async function getUserStats(token: string): Promise<UserStats> {
  return request<UserStats>("/api/user/stats", {
    headers: authHeader(token),
  });
}