const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Day 24: Auth Event ─────────────────────────────────────────────
// Fired when API returns 401 so AuthContext/ProtectedRoute can react globally.
export const AUTH_LOGOUT_EVENT = "ai_interview:logout";

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

// ✅ Fixed to match actual backend field names
export interface InterviewQuestion {
  id             : string;
  question       : string;      // ✅ backend sends "question"
  type           : string;      // ✅ backend sends "type"
  difficulty     : string;
  order_number   : number;
  expected_points: string[];
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
  user_answer        : string;
  time_taken_seconds : number;
}

export interface EvaluationResult {
  question_id        : string;
  score              : number;
  feedback           : string;
  strengths          : string[];
  improvements       : string[];
  sample_answer      : string;
  time_taken_seconds : number;
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
  const { headers: optHeaders, ...restOptions } = options;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(optHeaders as Record<string, string>),
    },
    ...restOptions,
  });

  // Try to parse JSON safely (some errors may return empty bodies)
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // ── Token expired/invalid → notify app globally (Day 24) ───────
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      }
    }

    // ── Parse error message smartly ───────────────────────────────
    let message = `Request failed: ${res.status}`;

    if (data?.detail) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((e: { msg?: string; message?: string }) =>
            e.msg || e.message || JSON.stringify(e)
          )
          .join(", ");
      } else {
        message = JSON.stringify(data.detail);
      }
    } else if (data?.message) {
      message = data.message;
    } else if (typeof data === "string" && data.trim().length > 0) {
      message = data;
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

// ✅ Day 19
export async function createInterview(
  token : string,
  data  : CreateInterviewData
): Promise<CreateInterviewResponse> {
  return request<CreateInterviewResponse>("/api/interview/create", {
    method  : "POST",
    headers : authHeader(token),
    body    : JSON.stringify(data),
  });
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

// ✅ Day 21 - Results Page Types
export interface PerformanceInfo {
  level   : string;
  label   : string;
  message : string;
  color   : string;
}

export interface CategoryScore {
  category       : string;
  average_score  : number;
  total_questions: number;
  answered       : number;
}

export interface QuestionScore {
  question_id  : string;
  question_text: string;
  question_type: string;
  order_number : number;
  score        : number;
  feedback     : string;
  strengths    : string[];
  improvements : string[];
  answered     : boolean;
}

export interface InterviewScoreResponse {
  interview_id     : string;
  job_role         : string;
  difficulty       : string;
  status           : string;
  overall_score    : number;
  performance      : PerformanceInfo;
  total_questions  : number;
  answered         : number;
  skipped          : number;
  completion_rate  : number;
  category_scores  : CategoryScore[];
  question_scores  : QuestionScore[];
  overall_summary  : string;
  top_strengths    : string[];
  top_improvements : string[];
  started_at       : string;
  completed_at     : string;
}

// ✅ Day 21
export async function getInterviewScore(
  token        : string,
  interview_id : string
): Promise<InterviewScoreResponse> {
  return request<InterviewScoreResponse>(
    `/api/interview/${interview_id}/score`,
    {
      headers: authHeader(token),
    }
  );
}

// ── Day 22 - Skill Gap Types ───────────────────────────────────────
export interface SkillGapItem {
  id                : string;
  skill_name        : string;
  proficiency_level : "weak" | "moderate" | "strong";
  gap_score         : number;
  recommendation    : string | null;
  identified_at     : string;
}

export interface SkillGapSummary {
  skill_name        : string;
  gap_score         : number;
  proficiency_level : "weak" | "moderate" | "strong";
  recommendation    : string | null;
}

export interface AnalyzeSkillGapsResponse {
  interview_id    : string;
  job_role        : string;
  overall_score   : number | null;
  total_skills    : number;
  weak_skills     : number;
  moderate_skills : number;
  strong_skills   : number;
  skill_gaps      : SkillGapSummary[];
  analyzed_at     : string;
}

export interface UserSkillGapsResponse {
  user_id        : string;
  total_gaps     : number;
  weak_count     : number;
  moderate_count : number;
  strong_count   : number;
  skill_gaps     : SkillGapItem[];
}

// ── Day 22 - Skill Gap APIs ────────────────────────────────────────
export async function analyzeSkillGaps(
  token        : string,
  interview_id : string,
  force        : boolean = false
): Promise<AnalyzeSkillGapsResponse> {
  return request<AnalyzeSkillGapsResponse>(
    `/api/skill-gaps/analyze/${interview_id}`,
    {
      method  : "POST",
      headers : authHeader(token),
      body    : JSON.stringify({ force_reanalyze: force }),
    }
  );
}

export async function getUserSkillGaps(
  token: string
): Promise<UserSkillGapsResponse> {
  return request<UserSkillGapsResponse>("/api/skill-gaps/", {
    headers: authHeader(token),
  });
}