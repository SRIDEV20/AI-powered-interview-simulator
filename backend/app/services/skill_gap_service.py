import uuid
import json
import logging
from datetime import datetime
from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.services.openai_service import openai_service
from app.models.interview import Interview
from app.models.question import Question
from app.models.response import Response
from app.models.skill_gap import SkillGap, ProficiencyLevel
from app.schemas.skill_gap import (
    AnalyzeSkillGapsResponse,
    SkillGapSummary,
    SkillGapItem,
    UserSkillGapsResponse,
    InterviewSkillGapsResponse
)

logger = logging.getLogger(__name__)


class SkillGapService:
    """
    Analyzes interview performance and identifies skill gaps.
    Uses GPT-4 to generate personalized recommendations.
    Saves results to skill_gaps table in PostgreSQL.
    """

    # ─── Map Score to Proficiency Level ──────────────────────────

    def _get_proficiency_level(self, score: float) -> ProficiencyLevel:
        """
        Map a score to a proficiency level.

        Score ranges:
            0  - 49  → WEAK
            50 - 74  → MODERATE
            75 - 100 → STRONG
        """
        if score >= 75:
            return ProficiencyLevel.STRONG
        elif score >= 50:
            return ProficiencyLevel.MODERATE
        else:
            return ProficiencyLevel.WEAK

    # ─── Build Skill Category Scores ─────────────────────────────

    def _build_skill_scores(
        self,
        questions     : List[Question],
        responses_map : dict   # {question_id: Response}
    ) -> dict:
        """
        Group questions by skill_category and average their scores.

        Returns:
            dict of { skill_name: { score, questions, answers } }
        """
        skill_data = {}

        for question in questions:
            skill = question.skill_category or "General"
            response = responses_map.get(str(question.id))

            if skill not in skill_data:
                skill_data[skill] = {
                    "scores"   : [],
                    "questions": [],
                    "answers"  : []
                }

            skill_data[skill]["questions"].append(question.question_text)

            if response and response.score is not None:
                skill_data[skill]["scores"].append(float(response.score))
                skill_data[skill]["answers"].append(response.user_answer[:200])

        # Calculate averages
        result = {}
        for skill, data in skill_data.items():
            avg = (
                sum(data["scores"]) / len(data["scores"])
                if data["scores"] else 0.0
            )
            result[skill] = {
                "avg_score" : round(avg, 2),
                "questions" : data["questions"],
                "answers"   : data["answers"]
            }

        return result

    # ─── GPT Recommendations ─────────────────────────────────────

    def _generate_recommendations(
        self,
        job_role    : str,
        skill_scores: dict
    ) -> dict:
        """
        Use GPT-4 to generate specific recommendations for each skill.

        Returns:
            dict of { skill_name: recommendation_text }
        """
        # Build skill summary for GPT
        skill_summary = [
            {
                "skill"    : skill,
                "score"    : data["avg_score"],
                "level"    : self._get_proficiency_level(data["avg_score"]).value
            }
            for skill, data in skill_scores.items()
        ]

        system_prompt = """You are an expert career coach.
Generate specific, actionable learning recommendations for each skill gap.
Return ONLY valid JSON. No markdown, no explanation."""

        user_prompt = f"""Analyze these skill gaps for a {job_role} candidate:

Skills: {json.dumps(skill_summary)}

Return ONLY this JSON:
{{
    "recommendations": {{
        "<skill_name>": "specific 1-2 sentence actionable recommendation",
        "<skill_name>": "specific 1-2 sentence actionable recommendation"
    }}
}}"""

        try:
            raw = openai_service.chat(
                system_prompt = system_prompt,
                user_message  = user_prompt,
                max_tokens    = 800,
                temperature   = 0.4
            )

            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            cleaned = cleaned.strip()

            data = json.loads(cleaned)
            return data.get("recommendations", {})

        except Exception as e:
            logger.error(f"❌ GPT recommendations failed: {str(e)}")
            # Return default recommendations
            return {
                skill: f"Focus on improving your {skill} skills through practice and study."
                for skill in skill_scores.keys()
            }

    # ─── Analyze Interview ────────────────────────────────────────

    def analyze_interview(
        self,
        interview_id : str,
        user_id      : str,
        db           : Session,
        force        : bool = False
    ) -> AnalyzeSkillGapsResponse:
        """
        Analyze an interview's responses and save skill gaps to PostgreSQL.

        Steps:
            1. Fetch interview + questions + responses
            2. Group by skill_category → calculate average scores
            3. GPT-4 generates recommendations per skill
            4. Save to skill_gaps table
            5. Return full analysis

        Args:
            interview_id : UUID of the interview
            user_id      : UUID of the current user
            db           : Database session
            force        : Re-analyze even if gaps already exist

        Returns:
            AnalyzeSkillGapsResponse
        """

        # ── Fetch Interview ───────────────────────────────────────
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        # ── Check if already analyzed ─────────────────────────────
        existing = db.query(SkillGap).filter(
            SkillGap.interview_id == uuid.UUID(interview_id)
        ).all()

        if existing and not force:
            logger.info(f"⚡ Skill gaps already exist for {interview_id}, returning cached")
            return self._build_response_from_existing(interview, existing)

        # ── Delete existing if force re-analyze ───────────────────
        if existing and force:
            for gap in existing:
                db.delete(gap)
            db.flush()
            logger.info(f"🔄 Force re-analyzing {interview_id}")

        # ── Fetch Questions + Responses ───────────────────────────
        questions = db.query(Question).filter(
            Question.interview_id == interview.id
        ).all()

        if not questions:
            raise ValueError(f"No questions found for interview {interview_id}")

        question_ids  = [q.id for q in questions]
        raw_responses = db.query(Response).filter(
            Response.question_id.in_(question_ids)
        ).all()

        if not raw_responses:
            raise ValueError(f"No answers found. Please answer questions before analyzing.")

        responses_map = {str(r.question_id): r for r in raw_responses}

        # ── Build Skill Scores ────────────────────────────────────
        skill_scores = self._build_skill_scores(questions, responses_map)
        logger.info(f"📊 Found {len(skill_scores)} skill categories")

        # ── GPT Recommendations ───────────────────────────────────
        recommendations = self._generate_recommendations(
            job_role     = interview.job_role,
            skill_scores = skill_scores
        )

        # ── Save to PostgreSQL ────────────────────────────────────
        skill_gap_records = []
        now = datetime.utcnow()

        for skill_name, data in skill_scores.items():
            avg_score   = data["avg_score"]
            prof_level  = self._get_proficiency_level(avg_score)
            rec_text    = recommendations.get(skill_name, f"Practice {skill_name} skills regularly.")

            skill_gap = SkillGap(
                user_id           = uuid.UUID(user_id),
                interview_id      = uuid.UUID(interview_id),
                skill_name        = skill_name,
                proficiency_level = prof_level,
                gap_score         = Decimal(str(avg_score)),
                recommendation    = rec_text,
                identified_at     = now
            )
            db.add(skill_gap)
            skill_gap_records.append({
                "skill_name"       : skill_name,
                "gap_score"        : avg_score,
                "proficiency_level": prof_level.value,
                "recommendation"   : rec_text
            })

        db.commit()
        logger.info(f"✅ Saved {len(skill_gap_records)} skill gaps to PostgreSQL")

        # ── Build Response ────────────────────────────────────────
        weak_count     = sum(1 for s in skill_gap_records if s["proficiency_level"] == "weak")
        moderate_count = sum(1 for s in skill_gap_records if s["proficiency_level"] == "moderate")
        strong_count   = sum(1 for s in skill_gap_records if s["proficiency_level"] == "strong")

        return AnalyzeSkillGapsResponse(
            interview_id    = interview_id,
            job_role        = interview.job_role,
            overall_score   = float(interview.overall_score) if interview.overall_score else None,
            total_skills    = len(skill_gap_records),
            weak_skills     = weak_count,
            moderate_skills = moderate_count,
            strong_skills   = strong_count,
            skill_gaps      = [
                SkillGapSummary(**s) for s in skill_gap_records
            ],
            analyzed_at     = now
        )

    # ─── Build Response from Existing Records ────────────────────

    def _build_response_from_existing(
        self,
        interview : Interview,
        existing  : list
    ) -> AnalyzeSkillGapsResponse:
        """Build response from already saved skill gaps"""
        skill_gap_summaries = [
            SkillGapSummary(
                skill_name        = gap.skill_name,
                gap_score         = float(gap.gap_score),
                proficiency_level = gap.proficiency_level.value,
                recommendation    = gap.recommendation
            )
            for gap in existing
        ]

        weak_count     = sum(1 for g in existing if g.proficiency_level == ProficiencyLevel.WEAK)
        moderate_count = sum(1 for g in existing if g.proficiency_level == ProficiencyLevel.MODERATE)
        strong_count   = sum(1 for g in existing if g.proficiency_level == ProficiencyLevel.STRONG)

        return AnalyzeSkillGapsResponse(
            interview_id    = str(interview.id),
            job_role        = interview.job_role,
            overall_score   = float(interview.overall_score) if interview.overall_score else None,
            total_skills    = len(existing),
            weak_skills     = weak_count,
            moderate_skills = moderate_count,
            strong_skills   = strong_count,
            skill_gaps      = skill_gap_summaries,
            analyzed_at     = existing[0].identified_at if existing else datetime.utcnow()
        )

    # ─── Get User Skill Gaps ──────────────────────────────────────

    def get_user_skill_gaps(
        self,
        user_id : str,
        db      : Session
    ) -> UserSkillGapsResponse:
        """
        Get all skill gaps for a user across ALL interviews.

        Args:
            user_id : UUID of the user
            db      : Database session

        Returns:
            UserSkillGapsResponse
        """
        gaps = db.query(SkillGap).filter(
            SkillGap.user_id == uuid.UUID(user_id)
        ).order_by(SkillGap.gap_score.asc()).all()   # lowest score first

        weak_count     = sum(1 for g in gaps if g.proficiency_level == ProficiencyLevel.WEAK)
        moderate_count = sum(1 for g in gaps if g.proficiency_level == ProficiencyLevel.MODERATE)
        strong_count   = sum(1 for g in gaps if g.proficiency_level == ProficiencyLevel.STRONG)

        return UserSkillGapsResponse(
            user_id        = user_id,
            total_gaps     = len(gaps),
            weak_count     = weak_count,
            moderate_count = moderate_count,
            strong_count   = strong_count,
            skill_gaps     = [
                SkillGapItem(
                    id                = str(g.id),
                    skill_name        = g.skill_name,
                    proficiency_level = g.proficiency_level.value,
                    gap_score         = float(g.gap_score),
                    recommendation    = g.recommendation,
                    identified_at     = g.identified_at
                )
                for g in gaps
            ]
        )

    # ─── Get Interview Skill Gaps ─────────────────────────────────

    def get_interview_skill_gaps(
        self,
        interview_id : str,
        db           : Session
    ) -> InterviewSkillGapsResponse:
        """
        Get all skill gaps for a specific interview.

        Args:
            interview_id : UUID of the interview
            db           : Database session

        Returns:
            InterviewSkillGapsResponse
        """
        interview = db.query(Interview).filter(
            Interview.id == uuid.UUID(interview_id)
        ).first()

        if not interview:
            raise ValueError(f"Interview {interview_id} not found")

        gaps = db.query(SkillGap).filter(
            SkillGap.interview_id == uuid.UUID(interview_id)
        ).order_by(SkillGap.gap_score.asc()).all()

        return InterviewSkillGapsResponse(
            interview_id = interview_id,
            job_role     = interview.job_role,
            total_gaps   = len(gaps),
            skill_gaps   = [
                SkillGapItem(
                    id                = str(g.id),
                    skill_name        = g.skill_name,
                    proficiency_level = g.proficiency_level.value,
                    gap_score         = float(g.gap_score),
                    recommendation    = g.recommendation,
                    identified_at     = g.identified_at
                )
                for g in gaps
            ]
        )


# ─── Singleton Instance ───────────────────────────────────────────
skill_gap_service = SkillGapService()