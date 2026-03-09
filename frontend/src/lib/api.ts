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
  total_interviews        : number;
  completed_interviews    : number;
  average_score           : number;
  best_score              : number;
  total_questions_answered: number;
  member_since            : string;
  account_status          : string;
}

export interface InterviewSummary {
  interview_id   : string;
  job_role       : string;
  difficulty     : string;
  total_questions: number;
  status         : string;
  overall_score  : number | null;
  created_at     : string;
}

export interface InterviewListResponse {
  total      : number;
  interviews : InterviewSummary[];
}

// ✅ Day 18
export interface UpdateProfileData {
  full_name? : string;
  username?  : string;
  email?     : string;
}

// ✅ Day 19
export type Difficulty   = "beginner" | "intermediate" | "advanced";
export type QuestionType = "technical" | "behavioral" | "mixed";

export interface CreateInterviewData {
  job_role      : string;
  difficulty    : Difficulty;
  num_questions : number;
  question_type : QuestionType;
}

export interface InterviewQuestion {
  id             : string;
  question_text  : string;
  question_type  : string;
  difficulty     : string;
  skill_category : string;
  order_number   : number;
}

export interface CreateInterviewResponse {
  interview_id   : string;
  job_role       : string;
  difficulty     : string;
  question_type  : string;
  total_questions: number;
  status         : string;
  created_at     : string;
  questions      : InterviewQuestion[];
}

// ✅ Day 20
export interface InterviewDetail {
  interview_id   : string;
  job_role       : string;
  difficulty     : string;
  question_type  : string;
  total_questions: number;
  status         : string;
  overall_score  : number | null;
  created_at     : string;
  questions      : InterviewQuestion[];
}

export interface SubmitAnswerData {
  user_answer         : string;
  time_taken_seconds  : number;
}

export interface EvaluationResult {
  question_id         : string;
  score               : number;
  feedback            : string;
  strengths           : string[];
  improvements        : string[];
  sample_answer       : string;
  time_taken_seconds  : number;
}

export interface CompleteInterviewResponse {
  interview_id  : string;
  status        : string;
  overall_score : number;
  message       : string;
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
    // ── Token expired → clear + redirect ──────────────────────────
    if (res.status === 401) {
      localStorage.removeItem("ai_interview_token");
      localStorage.removeItem("ai_interview_user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // ── Parse error message smartly ────────────────────────────────
    let message = `Request failed: ${res.status}`;

    if (data?.detail) {
      if (typeof data.detail === "string") {
        // ✅ Normal string error
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // ✅ Pydantic validation error array
        message = data.detail
          .map((e: { msg?: string; message?: string }) =>
            e.msg || e.message || JSON.stringify(e)
          )
          .join(", ");
      } else {
        // ✅ Fallback
        message = JSON.stringify(data.detail);
      }
    } else if (data?.message) {
      message = data.message;
    }

    throw new Error(message);
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

// ✅ Day 18
export async function updateUserProfile(
  token : string,
  data  : UpdateProfileData
): Promise<User> {
  return request<User>("/api/user/profile", {
    method  : "PUT",
    headers : authHeader(token),
    body    : JSON.stringify(data),
  });
}

// ── Interview APIs ✅ Day 17 ───────────────────────────────────────
export async function getInterviewList(token: string): Promise<InterviewListResponse> {
  return request<InterviewListResponse>("/api/interview/", {
    headers: authHeader(token),
  });
}

// ✅ Day 19 - Fixed to match actual backend response
export interface InterviewQuestion {
  id             : string;
  question       : string;        // ← backend sends "question" not "question_text"
  type           : string;        // ← backend sends "type" not "question_type"
  difficulty     : string;
  order_number   : number;
  expected_points: string[];      // ← backend sends this too
}

// ✅ Day 20
export async function getInterviewDetail(
  token        : string,
  interview_id : string
): Promise<InterviewDetail> {
  return request<InterviewDetail>(`/api/interview/${interview_id}`, {
    headers: authHeader(token),
  });
}

export async function submitAnswer(
  token        : string,
  interview_id : string,
  question_id  : string,
  data         : SubmitAnswerData
): Promise<EvaluationResult> {
  return request<EvaluationResult>(
    `/api/interview/${interview_id}/answer/${question_id}`,
    {
      method  : "POST",
      headers : authHeader(token),
      body    : JSON.stringify(data),
    }
  );
}

export async function completeInterview(
  token        : string,
  interview_id : string
): Promise<CompleteInterviewResponse> {
  return request<CompleteInterviewResponse>(
    `/api/interview/${interview_id}/complete`,
    {
      method  : "PATCH",
      headers : authHeader(token),
    }
  );
}