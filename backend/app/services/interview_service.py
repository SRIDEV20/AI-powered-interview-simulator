import uuid
import logging
from datetime import datetime
from typing import List

from app.services.openai_service import openai_service
from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse,
    QuestionResponse
)

logger = logging.getLogger(__name__)

# ─── Temporary In-Memory Store ────────────────────────────────────
# ⚠️ Stores interviews in memory for now
# Day 11 → Replace with real PostgreSQL storage
_interview_store: dict = {}


class InterviewService:
    """
    Handles interview creation and question generation.
    Uses OpenAI GPT-4 to generate dynamic questions.
    """

    # ─── Prompt Templates ─────────────────────────────────────────

    SYSTEM_PROMPTS = {
        "technical": """You are a senior technical interviewer with 10+ years of experience.
Generate technical interview questions that test real coding and system knowledge.
Return ONLY valid JSON array. No markdown, no explanation, just pure JSON.""",

        "behavioral": """You are an experienced HR interviewer and career coach.
Generate behavioral interview questions using the STAR method framework.
Return ONLY valid JSON array. No markdown, no explanation, just pure JSON.""",

        "mixed": """You are a senior technical interviewer with 10+ years of experience.
Generate a mix of technical and behavioral interview questions.
Return ONLY valid JSON array. No markdown, no explanation, just pure JSON."""
    }

    def _build_prompt(
        self,
        job_role     : str,
        difficulty   : str,
        num_questions: int,
        question_type: str
    ) -> str:
        """Build the user prompt for GPT-4"""
        return f"""Generate exactly {num_questions} interview questions for:

Role       : {job_role}
Difficulty : {difficulty}
Type       : {question_type}

Return a JSON array like this:
[
  {{
    "question"       : "Your question here?",
    "type"           : "technical or behavioral",
    "difficulty"     : "{difficulty}",
    "expected_points": ["key point 1", "key point 2", "key point 3"]
  }}
]

Rules:
- Generate EXACTLY {num_questions} questions
- Each question must be specific to {job_role}
- expected_points must have 3-5 items
- Return ONLY the JSON array, nothing else"""

    # ─── Generate Questions ────────────────────────────────────────

    def _generate_questions(
        self,
        job_role     : str,
        difficulty   : str,
        num_questions: int,
        question_type: str
    ) -> List[QuestionResponse]:
        """Call GPT-4 and parse questions"""
        import json

        system_prompt = self.SYSTEM_PROMPTS.get(question_type, self.SYSTEM_PROMPTS["mixed"])
        user_prompt   = self._build_prompt(job_role, difficulty, num_questions, question_type)

        logger.info(f"🤖 Generating {num_questions} {question_type} questions for {job_role} ({difficulty})")

        raw_response = openai_service.chat(
            system_prompt = system_prompt,
            user_message  = user_prompt,
            max_tokens    = 2000,
            temperature   = 0.7
        )

        # ── Clean response (remove markdown if GPT adds it) ───────
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()

        questions_data = json.loads(cleaned)
        logger.info(f"✅ Generated {len(questions_data)} questions successfully")

        return [QuestionResponse(**q) for q in questions_data]

    # ─── Create Interview ──────────────────────────────────────────

    def create_interview(
        self,
        request: InterviewCreateRequest,
        user_id: str
    ) -> InterviewCreateResponse:
        """
        Create a new interview session with GPT-4 generated questions.

        Args:
            request : Interview creation request (role, difficulty, etc.)
            user_id : ID of the user creating the interview

        Returns:
            InterviewCreateResponse with generated questions
        """
        interview_id = str(uuid.uuid4())
        created_at   = datetime.utcnow()

        # ── Generate questions via GPT-4 ──────────────────────────
        questions = self._generate_questions(
            job_role      = request.job_role,
            difficulty    = request.difficulty.value,
            num_questions = request.num_questions,
            question_type = request.question_type.value
        )

        # ── Store in memory (temporary) ───────────────────────────
        _interview_store[interview_id] = {
            "interview_id"   : interview_id,
            "user_id"        : user_id,
            "job_role"       : request.job_role,
            "difficulty"     : request.difficulty.value,
            "question_type"  : request.question_type.value,
            "total_questions": len(questions),
            "questions"      : [q.model_dump() for q in questions],
            "status"         : "active",
            "created_at"     : created_at
        }

        logger.info(f"✅ Interview {interview_id} created for user {user_id}")

        return InterviewCreateResponse(
            interview_id   = interview_id,
            job_role       = request.job_role,
            difficulty     = request.difficulty.value,
            question_type  = request.question_type.value,
            total_questions= len(questions),
            questions      = questions,
            status         = "active",
            created_at     = created_at
        )

    # ─── Get Interview ─────────────────────────────────────────────

    def get_interview(self, interview_id: str) -> InterviewDetailResponse:
        """
        Get interview details by ID.

        Args:
            interview_id : UUID of the interview

        Returns:
            InterviewDetailResponse with all questions
        """
        if interview_id not in _interview_store:
            raise ValueError(f"Interview {interview_id} not found")

        data = _interview_store[interview_id]

        return InterviewDetailResponse(
            interview_id   = data["interview_id"],
            job_role       = data["job_role"],
            difficulty     = data["difficulty"],
            question_type  = data["question_type"],
            total_questions= data["total_questions"],
            questions      = [QuestionResponse(**q) for q in data["questions"]],
            status         = data["status"],
            created_at     = data["created_at"]
        )

    # ─── List Interviews ───────────────────────────────────────────

    def get_user_interviews(self, user_id: str) -> list:
        """
        Get all interviews for a user (summary only).

        Args:
            user_id : ID of the user

        Returns:
            List of interview summaries
        """
        user_interviews = [
            {
                "interview_id"   : v["interview_id"],
                "job_role"       : v["job_role"],
                "difficulty"     : v["difficulty"],
                "total_questions": v["total_questions"],
                "status"         : v["status"],
                "created_at"     : v["created_at"]
            }
            for v in _interview_store.values()
            if v["user_id"] == user_id
        ]

        return user_interviews


# ─── Singleton Instance ───────────────────────────────────────────
interview_service = InterviewService()