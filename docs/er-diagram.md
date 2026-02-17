# Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id           │
│    email        │
│    username     │
│    password_hash│
│    full_name    │
│    created_at   │
│    is_active    │
└────────┬────────┘
         │
         │ 1
         │
         │ Many
         │
┌────────▼────────┐          ┌─────────────────┐
│   INTERVIEWS    │          │   SKILL_GAPS    │
├─────────────────┤          ├─────────────────┤
│ PK id           │          │ PK id           │
│ FK user_id      │◄─────────┤ FK user_id      │
│    job_role     │ 1     1  │ FK interview_id │
│    difficulty   │          │    skill_name   │
│    status       │          │    proficiency  │
│    overall_score│          │    gap_score    │
│    started_at   │          │    recommendation│
└────────┬────────┘          └─────────────────┘
         │
         │ 1
         │
         │ Many
         │
┌────────▼────────┐
│   QUESTIONS     │
├─────────────────┤
│ PK id           │
│ FK interview_id │
│    question_text│
│    question_type│
│    difficulty   │
│    skill_category│
│    order_number │
└────────┬────────┘
         │
         │ 1
         │
         │ 1
         │
┌────────▼────────┐
│   RESPONSES     │
├─────────────────┤
│ PK id           │
│ FK question_id  │
│    user_answer  │
│    ai_feedback  │
│    score        │
│    strengths    │
│    weaknesses   │
│    answered_at  │
└─────────────────┘
```

## Cardinality Summary

- **1 User** → **Many Interviews** (One-to-Many)
- **1 User** → **Many Skill Gaps** (One-to-Many)
- **1 Interview** → **Many Questions** (One-to-Many)
- **1 Interview** → **Many Skill Gaps** (One-to-Many)
- **1 Question** → **1 Response** (One-to-One)