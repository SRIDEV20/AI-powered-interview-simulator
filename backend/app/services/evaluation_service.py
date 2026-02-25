import uuid
import json
import logging
from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.services.openai_service import openai_service
from app.models.interview import Interview
from app.models.question import Question
from app.models.response import Response
from app.schemas.response import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    ResponseDetail,
    InterviewResultsResponse
)

logger = logging.getLogger(__name__)


class EvaluationService:
    """
    Handles answer submission and AI-powered evaluation.
    Uses GPT-4 to score answers and provide detailed feedback.
    """

    # ─── Build Evaluation Prompt ──────────────────────────────────

    def _build_evaluation_prompt(
        self,
        question       : str,
        user_answer    : str,
        expected_points: str,
        job_role       : str,
        difficulty     : str
    ) -> str:
        return f"""Evaluate this interview answer for a {job_role} position:

Difficulty  : {difficulty}
Question    : {question}
Expected Key Points: {expected_points}
Candidate Answer: {user_answer}

Score the answer from 0-100 based on:
- Accuracy and correctness (40%)
- Coverage of key points (30%)
- Clarity and communication (20%)
- Depth of knowledge (10%)

Return ONLY this JSON, nothing else:
{{
    "score"              : <number 0-100>,
    "feedback"           : "2-3 sentence overall feedback",
    "strengths"          : ["strength 1", "strength 2"],
    "improvements"       : ["improvement 1", "improvement 2"],
    "keywords_mentioned" : ["keyword1", "keyword2"]
}}"""

    # ─── Parse Evaluation Response ────────────────────────────────

    def _parse_evaluation(self, raw_response: str) -> dict:
        """Clean and parse GPT response to dict"""
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()
        return json.loads(cleaned)

    # ─── Submit & Evaluate Answer ─────────────────────────────────

    def submit_answer(
        self,
        interview_id : str,
        question_id  : str,
        request      : SubmitAnswerRequest,
        db           : Session
    ) -> SubmitAnswerResponse:
        """
        Submit an answer → evaluate with GPT-4 → save to PostgreSQL.

        Args:
            interview_id : UUID of the interview
            question_id  : UUID of the question being answered
            request      : SubmitAnswerRequest (user_answer, time_taken)
            db           : Database session

        Returns:
            SubmitAnswerResponse with score + feedback
        """

        # ── Validate interview exists ─────────────────────────────
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        # ── Validate question exists + belongs to interview ───────
        question = db.query(Question).filter(
            Question.id          == uuid.UUID(question_id),
            Question.interview_id == uuid.UUID(interview_id)
        ).first()

        if not question:
            raise ValueError(f"Question {question_id} not found in interview {interview_id}")

        # ── Check if already answered ─────────────────────────────
        existing = db.query(Response).filter(
            Response.question_id == uuid.UUID(question_id)
        ).first()

        if existing:
            raise ValueError(f"Question {question_id} has already been answered")

        # ── Call GPT-4 for evaluation ─────────────────────────────
        logger.info(f"🤖 Evaluating answer for question {question_id}")

        evaluation_prompt = self._build_evaluation_prompt(
            question        = question.question_text,
            user_answer     = request.user_answer,
            expected_points = question.expected_answer or "",
            job_role        = interview.job_role,
            difficulty      = question.difficulty
        )

        system_prompt = """You are an expert technical interviewer evaluating interview answers.
Be fair, constructive, and specific in your feedback.
Return ONLY valid JSON. No markdown, no explanation."""

        raw_response = openai_service.chat(
            system_prompt = system_prompt,
            user_message  = evaluation_prompt,
            max_tokens    = 1000,
            temperature   = 0.3   # Low temperature = consistent scoring
        )

        evaluation = self._parse_evaluation(raw_response)
        logger.info(f"✅ Evaluation complete | score: {evaluation.get('score')}")

        # ── Save Response to PostgreSQL ───────────────────────────
        response = Response(
            question_id        = uuid.UUID(question_id),
            user_answer        = request.user_answer,
            ai_feedback        = evaluation.get("feedback", ""),
            score              = Decimal(str(evaluation.get("score", 0))),
            strengths          = json.dumps(evaluation.get("strengths", [])),
            weaknesses         = json.dumps(evaluation.get("improvements", [])),
            answered_at        = datetime.utcnow(),
            time_taken_seconds = request.time_taken_seconds
        )
        db.add(response)
        db.flush()  # get response.id immediately

        # ── Update interview overall_score ────────────────────────
        self._update_interview_score(interview_id, db)

        db.commit()
        db.refresh(response)

        logger.info(f"✅ Response {response.id} saved to PostgreSQL")

        return SubmitAnswerResponse(
            response_id        = str(response.id),
            interview_id       = interview_id,
            question_id        = question_id,
            question_text      = question.question_text,
            user_answer        = request.user_answer,
            score              = float(response.score),
            feedback           = evaluation.get("feedback", ""),
            strengths          = evaluation.get("strengths", []),
            improvements       = evaluation.get("improvements", []),
            keywords_mentioned = evaluation.get("keywords_mentioned", []),
            time_taken_seconds = request.time_taken_seconds,
            answered_at        = response.answered_at
        )

    # ─── Update Interview Overall Score ───────────────────────────

    def _update_interview_score(
        self,
        interview_id : str,
        db           : Session
    ) -> None:
        """
        Recalculate and update the interview's overall score
        based on average of all answered questions.
        """
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            return

        # Get all responses for this interview
        questions = db.query(Question).filter(
            Question.interview_id == uuid.UUID(interview_id)
        ).all()

        question_ids = [q.id for q in questions]

        responses = db.query(Response).filter(
            Response.question_id.in_(question_ids),
            Response.score.isnot(None)
        ).all()

        if responses:
            total_score  = sum(float(r.score) for r in responses)
            avg_score    = total_score / len(responses)
            interview.overall_score = Decimal(str(round(avg_score, 2)))
            logger.info(f"📊 Interview {interview_id} overall score updated: {avg_score:.2f}")

    # ─── Get Interview Results ─────────────────────────────────────

    def get_interview_results(
        self,
        interview_id : str,
        db           : Session
    ) -> InterviewResultsResponse:
        """
        Get full interview results with all responses.

        Args:
            interview_id : UUID of the interview
            db           : Database session

        Returns:
            InterviewResultsResponse with all Q&A + scores
        """
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).order_by(Question.order_number).all()

        response_details = []

        for question in questions:
            response = db.query(Response).filter(
                Response.question_id == question.id
            ).first()

            if response:
                # ── Parse stored JSON strings back to lists ───────
                try:
                    strengths   = json.loads(response.strengths)   if response.strengths  else []
                    improvements= json.loads(response.weaknesses)  if response.weaknesses else []
                except (json.JSONDecodeError, TypeError):
                    strengths    = []
                    improvements = []

                response_details.append(ResponseDetail(
                    response_id        = str(response.id),
                    question_id        = str(question.id),
                    question_text      = question.question_text,
                    question_type      = question.question_type.value,
                    order_number       = question.order_number,
                    user_answer        = response.user_answer,
                    score              = float(response.score) if response.score else None,
                    feedback           = response.ai_feedback,
                    strengths          = strengths,
                    improvements       = improvements,
                    keywords_mentioned = [],
                    time_taken_seconds = response.time_taken_seconds,
                    answered_at        = response.answered_at
                ))

        return InterviewResultsResponse(
            interview_id    = str(interview.id),
            job_role        = interview.job_role,
            difficulty      = interview.difficulty_level.value,
            status          = interview.status.value,
            overall_score   = float(interview.overall_score) if interview.overall_score else None,
            total_questions = len(questions),
            answered        = len(response_details),
            responses       = response_details,
            created_at      = interview.started_at,
            completed_at    = interview.completed_at
        )


# ─── Singleton Instance ───────────────────────────────────────────
evaluation_service = EvaluationService()