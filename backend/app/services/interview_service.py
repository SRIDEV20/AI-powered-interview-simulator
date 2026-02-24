import uuid
import json
import logging
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.services.openai_service import openai_service
from app.models.interview import Interview, DifficultyLevel, InterviewStatus
from app.models.question import Question, QuestionType
from app.schemas.interview import (
    InterviewCreateRequest,
    InterviewCreateResponse,
    InterviewDetailResponse,
    InterviewSummary,
    QuestionResponse
)

logger = logging.getLogger(__name__)


class InterviewService:
    """
    Handles interview creation and question generation.
    Saves everything to PostgreSQL database.
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

    # ─── Build Prompt ──────────────────────────────────────────────

    def _build_prompt(
        self,
        job_role     : str,
        difficulty   : str,
        num_questions: int,
        question_type: str
    ) -> str:
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

    # ─── Generate Questions via GPT ────────────────────────────────

    def _generate_questions(
        self,
        job_role     : str,
        difficulty   : str,
        num_questions: int,
        question_type: str
    ) -> List[dict]:
        """Call GPT and parse questions into list of dicts"""

        system_prompt = self.SYSTEM_PROMPTS.get(
            question_type, self.SYSTEM_PROMPTS["mixed"]
        )
        user_prompt = self._build_prompt(
            job_role, difficulty, num_questions, question_type
        )

        logger.info(
            f"🤖 Generating {num_questions} {question_type} "
            f"questions for {job_role} ({difficulty})"
        )

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
        logger.info(f"✅ Generated {len(questions_data)} questions")
        return questions_data

    # ─── Map difficulty string → model Enum ───────────────────────

    def _map_difficulty(self, difficulty: str) -> DifficultyLevel:
        mapping = {
            "beginner"    : DifficultyLevel.BEGINNER,
            "intermediate": DifficultyLevel.INTERMEDIATE,
            "advanced"    : DifficultyLevel.ADVANCED
        }
        return mapping.get(difficulty.lower(), DifficultyLevel.INTERMEDIATE)

    # ─── Map question_type string → model Enum ────────────────────

    def _map_question_type(self, qtype: str) -> QuestionType:
        mapping = {
            "technical" : QuestionType.TECHNICAL,
            "behavioral": QuestionType.BEHAVIORAL,
            "mixed"     : QuestionType.TECHNICAL
        }
        return mapping.get(qtype.lower(), QuestionType.TECHNICAL)

    # ─── Create Interview ──────────────────────────────────────────

    def create_interview(
        self,
        request : InterviewCreateRequest,
        user_id : str,
        db      : Session
    ) -> InterviewCreateResponse:
        """
        Create interview + generate questions → save to PostgreSQL.
        """
        # ── Generate questions via GPT ────────────────────────────
        questions_data = self._generate_questions(
            job_role      = request.job_role,
            difficulty    = request.difficulty.value,
            num_questions = request.num_questions,
            question_type = request.question_type.value
        )

        # ── Create Interview record ───────────────────────────────
        interview = Interview(
            user_id          = uuid.UUID(user_id),
            job_role         = request.job_role,
            difficulty_level = self._map_difficulty(request.difficulty.value),
            status           = InterviewStatus.IN_PROGRESS,
            started_at       = datetime.utcnow()
        )
        db.add(interview)
        db.flush()   # get interview.id without full commit

        # ── Create Question records ───────────────────────────────
        question_responses = []
        for idx, q_data in enumerate(questions_data, start=1):
            question = Question(
                interview_id    = interview.id,
                question_text   = q_data["question"],
                question_type   = self._map_question_type(q_data.get("type", "technical")),
                difficulty      = q_data.get("difficulty", request.difficulty.value),
                skill_category  = request.job_role,
                expected_answer = ", ".join(q_data.get("expected_points", [])),
                order_number    = idx
            )
            db.add(question)
            db.flush()   # ✅ get question.id immediately after add

            question_responses.append(QuestionResponse(
                id              = str(question.id),   # ✅ Now has real UUID
                question        = q_data["question"],
                type            = q_data.get("type", "technical"),
                difficulty      = q_data.get("difficulty", request.difficulty.value),
                expected_points = q_data.get("expected_points", []),
                order_number    = idx
            ))

        db.commit()
        db.refresh(interview)

        logger.info(f"✅ Interview {interview.id} saved to PostgreSQL")

        return InterviewCreateResponse(
            interview_id    = str(interview.id),
            job_role        = interview.job_role,
            difficulty      = interview.difficulty_level.value,
            question_type   = request.question_type.value,
            total_questions = len(question_responses),
            questions       = question_responses,
            status          = interview.status.value,
            created_at      = interview.started_at
        )

    # ─── Get Interview ─────────────────────────────────────────────

    def get_interview(
        self,
        interview_id : str,
        db           : Session
    ) -> InterviewDetailResponse:
        """Get interview + questions from PostgreSQL"""

        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).order_by(Question.order_number).all()

        question_responses = [
            QuestionResponse(
                id              = str(q.id),          # ✅ Real UUID from DB
                question        = q.question_text,
                type            = q.question_type.value,
                difficulty      = q.difficulty,
                expected_points = q.expected_answer.split(", ") if q.expected_answer else [],
                order_number    = q.order_number
            )
            for q in questions
        ]

        return InterviewDetailResponse(
            interview_id    = str(interview.id),
            job_role        = interview.job_role,
            difficulty      = interview.difficulty_level.value,
            question_type   = "mixed",
            total_questions = len(question_responses),
            questions       = question_responses,
            status          = interview.status.value,
            created_at      = interview.started_at
        )

    # ─── List User Interviews ──────────────────────────────────────

    def get_user_interviews(
        self,
        user_id : str,
        db      : Session
    ) -> list:
        """Get all interviews for a user from PostgreSQL"""

        interviews = db.query(Interview).filter(
            Interview.user_id == uuid.UUID(user_id)
        ).order_by(Interview.started_at.desc()).all()

        return [
            InterviewSummary(
                interview_id    = str(i.id),
                job_role        = i.job_role,
                difficulty      = i.difficulty_level.value,
                total_questions = len(i.questions),
                status          = i.status.value,
                overall_score   = float(i.overall_score) if i.overall_score else None,
                created_at      = i.started_at
            )
            for i in interviews
        ]

    # ─── Complete Interview ────────────────────────────────────────

    def complete_interview(
        self,
        interview_id : str,
        db           : Session
    ) -> dict:
        """Mark interview as completed"""

        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        interview.status       = InterviewStatus.COMPLETED
        interview.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(interview)

        logger.info(f"✅ Interview {interview_id} marked as completed")

        return {
            "interview_id": str(interview.id),
            "status"      : interview.status.value,
            "message"     : "Interview completed successfully",
            "completed_at": interview.completed_at
        }


# ─── Singleton Instance ───────────────────────────────────────────
interview_service = InterviewService()