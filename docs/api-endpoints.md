# API Endpoints Documentation

## Base URL
```
http://localhost:8000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "created_at": "2026-02-17T10:30:00Z"
}
```

---

### 2. Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

---

### 3. Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "created_at": "2026-02-17T10:30:00Z"
}
```

---

## 🎯 Interview Endpoints

### 4. Start New Interview
```http
POST /api/interviews
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "job_role": "Backend Developer",
  "difficulty_level": "intermediate"
}
```

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_role": "Backend Developer",
  "difficulty_level": "intermediate",
  "status": "in_progress",
  "started_at": "2026-02-17T11:00:00Z"
}
```

---

### 5. Get User's Interviews
```http
GET /api/interviews
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): filter by status (in_progress, completed, abandoned)
- `limit` (optional): number of results (default: 10)
- `offset` (optional): pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "total": 5,
  "interviews": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "job_role": "Backend Developer",
      "difficulty_level": "intermediate",
      "status": "completed",
      "overall_score": 78.5,
      "started_at": "2026-02-17T11:00:00Z",
      "completed_at": "2026-02-17T11:45:00Z"
    }
  ]
}
```

---

### 6. Get Interview Details
```http
GET /api/interviews/{interview_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "job_role": "Backend Developer",
  "difficulty_level": "intermediate",
  "status": "completed",
  "overall_score": 78.5,
  "started_at": "2026-02-17T11:00:00Z",
  "completed_at": "2026-02-17T11:45:00Z",
  "questions_count": 8,
  "duration_minutes": 45
}
```

---

## ❓ Question Endpoints

### 7. Get Next Question
```http
GET /api/interviews/{interview_id}/questions/next
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "interview_id": "660e8400-e29b-41d4-a716-446655440001",
  "question_text": "Explain the difference between authentication and authorization.",
  "question_type": "technical",
  "difficulty": "intermediate",
  "skill_category": "Security",
  "order_number": 1
}
```

---

### 8. Submit Answer
```http
POST /api/questions/{question_id}/responses
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "user_answer": "Authentication verifies who you are, while authorization determines what you can access..."
}
```

**Response (201 Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "question_id": "770e8400-e29b-41d4-a716-446655440002",
  "user_answer": "Authentication verifies who you are...",
  "ai_feedback": "Good explanation! You correctly identified the key difference...",
  "score": 85.0,
  "strengths": "Clear distinction between concepts",
  "weaknesses": "Could include more real-world examples",
  "answered_at": "2026-02-17T11:15:00Z"
}
```

---

## 📊 Skill Gap Endpoints

### 9. Get Skill Gaps
```http
GET /api/skill-gaps
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `interview_id` (optional): filter by specific interview

**Response (200 OK):**
```json
{
  "skill_gaps": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "skill_name": "System Design",
      "proficiency_level": "weak",
      "gap_score": 45.0,
      "recommendation": "Focus on scalability patterns and distributed systems concepts",
      "identified_at": "2026-02-17T11:45:00Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "skill_name": "Algorithms",
      "proficiency_level": "moderate",
      "gap_score": 65.0,
      "recommendation": "Practice more dynamic programming problems",
      "identified_at": "2026-02-17T11:45:00Z"
    }
  ]
}
```

---

### 10. Get Interview Report
```http
GET /api/interviews/{interview_id}/report
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "interview_id": "660e8400-e29b-41d4-a716-446655440001",
  "overall_score": 78.5,
  "job_role": "Backend Developer",
  "completed_at": "2026-02-17T11:45:00Z",
  "questions_answered": 8,
  "performance_by_category": {
    "Technical": 82.0,
    "Behavioral": 75.0,
    "System Design": 70.0
  },
  "skill_gaps": [
    {
      "skill_name": "System Design",
      "gap_score": 45.0,
      "recommendation": "Focus on scalability patterns"
    }
  ],
  "strengths": [
    "Strong understanding of REST APIs",
    "Good communication skills"
  ],
  "areas_for_improvement": [
    "System design fundamentals",
    "Scalability concepts"
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```