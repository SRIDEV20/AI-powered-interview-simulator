# Database Schema Design

## Tables Overview

### 1. **users**
Stores user account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |

---

### 2. **interviews**
Stores interview session data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique interview identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Reference to user |
| job_role | VARCHAR(100) | NOT NULL | Target job role (e.g., "Backend Developer") |
| difficulty_level | ENUM | NOT NULL | 'beginner', 'intermediate', 'advanced' |
| status | ENUM | NOT NULL | 'in_progress', 'completed', 'abandoned' |
| overall_score | DECIMAL(5,2) | NULL | Overall performance score (0-100) |
| started_at | TIMESTAMP | DEFAULT NOW() | Interview start time |
| completed_at | TIMESTAMP | NULL | Interview completion time |
| duration_minutes | INTEGER | NULL | Total interview duration |

---

### 3. **questions**
Stores interview questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique question identifier |
| interview_id | UUID | FOREIGN KEY → interviews(id) | Reference to interview |
| question_text | TEXT | NOT NULL | The actual question |
| question_type | ENUM | NOT NULL | 'technical', 'behavioral', 'coding', 'system_design' |
| difficulty | ENUM | NOT NULL | 'beginner', 'intermediate', 'advanced' |
| skill_category | VARCHAR(100) | NOT NULL | e.g., "Python", "Algorithms", "Communication" |
| expected_answer | TEXT | NULL | AI-generated expected answer (for comparison) |
| order_number | INTEGER | NOT NULL | Question sequence in interview |
| created_at | TIMESTAMP | DEFAULT NOW() | Question generation time |

---

### 4. **responses**
Stores user answers to questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique response identifier |
| question_id | UUID | FOREIGN KEY → questions(id) | Reference to question |
| user_answer | TEXT | NOT NULL | User's actual answer |
| ai_feedback | TEXT | NULL | AI-generated feedback |
| score | DECIMAL(5,2) | NULL | Score for this answer (0-100) |
| strengths | TEXT | NULL | What was good about the answer |
| weaknesses | TEXT | NULL | What needs improvement |
| answered_at | TIMESTAMP | DEFAULT NOW() | When answer was submitted |
| time_taken_seconds | INTEGER | NULL | Time to answer |

---

### 5. **skill_gaps**
Stores identified skill gaps from interviews

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique skill gap identifier |
| user_id | UUID | FOREIGN KEY → users(id) | Reference to user |
| interview_id | UUID | FOREIGN KEY → interviews(id) | Reference to interview |
| skill_name | VARCHAR(100) | NOT NULL | e.g., "Data Structures", "System Design" |
| proficiency_level | ENUM | NOT NULL | 'weak', 'moderate', 'strong' |
| gap_score | DECIMAL(5,2) | NOT NULL | How much improvement needed (0-100) |
| recommendation | TEXT | NULL | AI-generated learning recommendations |
| identified_at | TIMESTAMP | DEFAULT NOW() | When gap was identified |

---

### 6. **learning_resources** (Optional - Future Enhancement)
Stores recommended learning materials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique resource identifier |
| skill_gap_id | UUID | FOREIGN KEY → skill_gaps(id) | Reference to skill gap |
| resource_type | ENUM | NOT NULL | 'article', 'video', 'course', 'practice' |
| title | VARCHAR(255) | NOT NULL | Resource title |
| url | TEXT | NOT NULL | Resource link |
| description | TEXT | NULL | Brief description |
| priority | INTEGER | DEFAULT 1 | Recommendation priority |

---

## Relationships

```
users (1) ──── (Many) interviews
interviews (1) ──── (Many) questions
questions (1) ──── (1) responses
interviews (1) ──── (Many) skill_gaps
users (1) ──── (Many) skill_gaps
skill_gaps (1) ──── (Many) learning_resources
```

---

## Indexes for Performance

```sql
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_questions_interview_id ON questions(interview_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);
CREATE INDEX idx_skill_gaps_user_id ON skill_gaps(user_id);
CREATE INDEX idx_skill_gaps_interview_id ON skill_gaps(interview_id);
```