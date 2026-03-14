import uuid
import json
import logging
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.services.openai_service import openai_service
from app.models.interview import Interview, InterviewStatus
from app.models.question import Question
from app.models.response import Response
from app.schemas.score import (
    InterviewScoreResponse,
    CategoryScore,
    QuestionScoreDetail,
    PerformanceLevel
)

logger = logging.getLogger(__name__)


class ScoringService:
    """
    Handles scoring algorithm and detailed feedback generation.
    Calculates category-wise scores and generates GPT-4 summary.
    """

    # ─── Performance Level Calculator ────────────────────────────

    def _get_performance_level(self, score: float) -> PerformanceLevel:
        """
        Map score to performance level with label and message.

        Score ranges:
            85-100 → Excellent
            70-84  → Good
            50-69  → Average
            0-49   → Needs Work
        """
        if score >= 85:
            return PerformanceLevel(
                level   = "excellent",
                label   = "Excellent! 🌟",
                message = "Outstanding performance! You demonstrated strong knowledge and clear communication.",
                color   = "green"
            )
        elif score >= 70:
            return PerformanceLevel(
                level   = "good",
                label   = "Good 👍",
                message = "Good performance! You showed solid understanding with some areas to improve.",
                color   = "blue"
            )
        elif score >= 50:
            return PerformanceLevel(
                level   = "average",
                label   = "Average 📈",
                message = "Average performance. Focus on the improvement areas to boost your score.",
                color   = "yellow"
            )
        else:
            return PerformanceLevel(
                level   = "poor",
                label   = "Needs Work 💪",
                message = "Keep practicing! Review the key concepts and try again.",
                color   = "red"
            )

    # ─── Category Score Calculator ────────────────────────────────

    def _calculate_category_scores(
        self,
        questions : List[Question],
        responses : dict   # {question_id: Response}
    ) -> List[CategoryScore]:
        """
        Calculate average score per question type category.
        Groups questions by type and averages their scores.
        """
        # Group by question type
        categories = {}

        for question in questions:
            cat = question.question_type.value  # technical / behavioral

            if cat not in categories:
                categories[cat] = {
                    "scores"  : [],
                    "total"   : 0,
                    "answered": 0
                }

            categories[cat]["total"] += 1
            response = responses.get(str(question.id))

            if response and response.score is not None:
                categories[cat]["scores"].append(float(response.score))
                categories[cat]["answered"] += 1

        # Build CategoryScore list
        result = []
        for cat_name, data in categories.items():
            avg = (
                sum(data["scores"]) / len(data["scores"])
                if data["scores"] else 0.0
            )
            result.append(CategoryScore(
                category        = cat_name,
                average_score   = round(avg, 2),
                total_questions = data["total"],
                answered        = data["answered"]
            ))

        return result

    # ─── GPT Summary Generator ────────────────────────────────────

    def _generate_summary(
        self,
        job_role        : str,
        difficulty      : str,
        overall_score   : float,
        question_scores : List[QuestionScoreDetail]
    ) -> dict:
        """
        Use GPT-4 to generate an overall interview summary.
        Returns top strengths, improvements and a summary paragraph.
        """
        # Build Q&A summary for GPT
        qa_summary = []
        for qs in question_scores:
            if qs.answered:
                qa_summary.append({
                    "question"    : qs.question_text[:100],  # truncate for tokens
                    "score"       : qs.score,
                    "strengths"   : qs.strengths[:2],
                    "improvements": qs.improvements[:2]
                })

        system_prompt = """You are an expert career coach reviewing an interview performance.
Generate a concise summary with actionable feedback.
Return ONLY valid JSON. No markdown, no explanation."""

        user_prompt = f"""Review this interview performance:

Role        : {job_role}
Difficulty  : {difficulty}
Overall Score: {overall_score}/100
Question Results: {json.dumps(qa_summary)}

Return ONLY this JSON:
{{
    "overall_summary" : "2-3 sentence summary of overall performance",
    "top_strengths"   : ["strength 1", "strength 2", "strength 3"],
    "top_improvements": ["improvement 1", "improvement 2", "improvement 3"]
}}"""

        try:
            raw = openai_service.chat(
                system_prompt = system_prompt,
                user_message  = user_prompt,
                max_tokens    = 600,
                temperature   = 0.4
            )

            # Clean markdown if present
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            cleaned = cleaned.strip()

            return json.loads(cleaned)

        except Exception as e:
            logger.error(f"❌ Summary generation failed: {str(e)}")
            return {
                "overall_summary" : f"Interview completed with an overall score of {overall_score:.1f}/100.",
                "top_strengths"   : ["Completed the interview"],
                "top_improvements": ["Review answers for improvement areas"]
            }

    # ─── Main Scoring Function ────────────────────────────────────

    def get_interview_score(
        self,
        interview_id   : str,
        user_id        : str,
        db             : Session,
        generate_summary: bool = True
    ) -> InterviewScoreResponse:
        """
        Calculate full score breakdown for an interview.

        Args:
            interview_id     : UUID of the interview
            db               : Database session
            generate_summary : Whether to call GPT for summary (costs tokens)

        Returns:
            InterviewScoreResponse with all score details
        """

        # ── Fetch Interview ───────────────────────────────────────
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        if str(interview.user_id) != user_id:
            raise PermissionError("You are not allowed to view this interview score")

        repaired_timestamps = False

        if interview.started_at is None:
            interview.started_at = datetime.utcnow()
            repaired_timestamps = True

        if (
            interview.status == InterviewStatus.COMPLETED
            and interview.completed_at is None
        ):
            interview.completed_at = datetime.utcnow()
            repaired_timestamps = True

        if (
            interview.started_at is not None
            and interview.completed_at is not None
            and interview.completed_at < interview.started_at
        ):
            interview.completed_at = interview.started_at
            repaired_timestamps = True

        if repaired_timestamps:
            db.commit()
            db.refresh(interview)

        # ── Fetch Questions ───────────────────────────────────────
        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).order_by(Question.order_number).all()

        # ── Fetch Responses → map by question_id ─────────────────
        question_ids = [q.id for q in questions]
        raw_responses = db.query(Response).filter(
            Response.question_id.in_(question_ids)
        ).all()

        responses_map = {str(r.question_id): r for r in raw_responses}

        # ── Build Per-Question Score Details ──────────────────────
        question_scores = []
        scored_values   = []

        for question in questions:
            response = responses_map.get(str(question.id))

            if response:
                # Parse stored JSON lists
                try:
                    strengths    = json.loads(response.strengths)  if response.strengths  else []
                    improvements = json.loads(response.weaknesses) if response.weaknesses else []
                except (json.JSONDecodeError, TypeError):
                    strengths    = []
                    improvements = []

                score_val = float(response.score) if response.score else 0.0
                scored_values.append(score_val)

                question_scores.append(QuestionScoreDetail(
                    question_id   = str(question.id),
                    question_text = question.question_text,
                    question_type = question.question_type.value,
                    order_number  = question.order_number,
                    score         = score_val,
                    feedback      = response.ai_feedback,
                    strengths     = strengths,
                    improvements  = improvements,
                    answered      = True
                ))
            else:
                # Unanswered question
                question_scores.append(QuestionScoreDetail(
                    question_id   = str(question.id),
                    question_text = question.question_text,
                    question_type = question.question_type.value,
                    order_number  = question.order_number,
                    score         = None,
                    feedback      = None,
                    strengths     = [],
                    improvements  = [],
                    answered      = False
                ))

        # ── Calculate Overall Score ───────────────────────────────
        overall_score = (
            round(sum(scored_values) / len(scored_values), 2)
            if scored_values else 0.0
        )

        # ── Update Interview Score in DB ──────────────────────────
        interview.overall_score = Decimal(str(overall_score))
        db.commit()
        db.refresh(interview)

        # ── Stats ─────────────────────────────────────────────────
        total_questions = len(questions)
        answered        = len(raw_responses)
        skipped         = total_questions - answered
        completion_rate = round((answered / total_questions * 100), 2) if total_questions > 0 else 0.0

        # ── Category Scores ───────────────────────────────────────
        category_scores = self._calculate_category_scores(questions, responses_map)

        # ── Performance Level ─────────────────────────────────────
        performance = self._get_performance_level(overall_score)

        # ── GPT Summary ───────────────────────────────────────────
        summary_data = {"overall_summary": None, "top_strengths": [], "top_improvements": []}

        if generate_summary and answered > 0:
            logger.info(f"🤖 Generating GPT summary for interview {interview_id}")
            summary_data = self._generate_summary(
                job_role        = interview.job_role,
                difficulty      = interview.difficulty_level.value,
                overall_score   = overall_score,
                question_scores = question_scores
            )

        logger.info(
            f"✅ Scoring complete for interview {interview_id} "
            f"| score: {overall_score} | level: {performance.level}"
        )

        return InterviewScoreResponse(
            interview_id     = str(interview.id),
            job_role         = interview.job_role,
            difficulty       = interview.difficulty_level.value,
            status           = interview.status.value,
            overall_score    = overall_score,
            performance      = performance,
            total_questions  = total_questions,
            answered         = answered,
            skipped          = skipped,
            completion_rate  = completion_rate,
            category_scores  = category_scores,
            question_scores  = question_scores,
            overall_summary  = summary_data.get("overall_summary"),
            top_strengths    = summary_data.get("top_strengths", []),
            top_improvements = summary_data.get("top_improvements", []),
            started_at       = interview.started_at,
            completed_at     = interview.completed_at
        )


# ─── Singleton Instance ───────────────────────────────────────────
scoring_service = ScoringService()