from openai import OpenAI
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    """
    Real OpenAI service wrapper for GPT-4 API calls.
    Handles all communication with OpenAI.
    """

    def __init__(self):
        """Initialize OpenAI client with API key from settings"""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        logger.info(f"✅ OpenAIService initialized with model: {self.model}")

    # ─── Base Chat ───────────────────────────────────────────────

    def chat(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        Send a message to GPT-4 and get a response.

        Args:
            system_prompt : Instructions for how GPT should behave
            user_message  : The actual message/question to send
            max_tokens    : Override default max tokens
            temperature   : 0 = focused/deterministic, 1 = creative

        Returns:
            GPT-4 response as string
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message}
                ],
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature or self.temperature
            )
            result = response.choices[0].message.content
            logger.info(f"✅ OpenAI call successful | tokens used: {response.usage.total_tokens}")
            return result

        except Exception as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            raise Exception(f"OpenAI API error: {str(e)}")

    # ─── Interview Questions ──────────────────────────────────────

    def generate_interview_questions(
        self,
        job_role: str,
        difficulty: str,
        num_questions: int = 5
    ) -> list:
        """
        Generate interview questions for a given role and difficulty.
        Used in Day 10 - Question generation service.

        Args:
            job_role      : e.g. "Python Developer", "Data Scientist"
            difficulty    : "beginner", "intermediate", "advanced"
            num_questions : How many questions to generate

        Returns:
            List of question dicts
        """
        system_prompt = """You are an expert technical interviewer.
Generate interview questions in valid JSON format only.
No extra text, no markdown, just pure JSON array."""

        user_message = f"""Generate {num_questions} interview questions for:
Role: {job_role}
Difficulty: {difficulty}

Return a JSON array like this:
[
  {{
    "question": "question text here",
    "type": "technical or behavioral",
    "difficulty": "{difficulty}",
    "expected_points": ["point 1", "point 2", "point 3"]
  }}
]"""

        try:
            import json
            response = self.chat(
                system_prompt=system_prompt,
                user_message=user_message,
                max_tokens=2000,
                temperature=0.7
            )
            questions = json.loads(response)
            logger.info(f"✅ Generated {len(questions)} questions for {job_role}")
            return questions

        except Exception as e:
            logger.error(f"❌ Question generation error: {str(e)}")
            raise Exception(f"Failed to generate questions: {str(e)}")

    # ─── Answer Evaluation ────────────────────────────────────────

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        job_role: str
    ) -> dict:
        """
        Evaluate a candidate's answer using GPT-4.
        Used in Day 12 - Answer evaluation service.

        Args:
            question : The interview question asked
            answer   : The candidate's answer
            job_role : Role being interviewed for

        Returns:
            dict with score, feedback, strengths, improvements
        """
        system_prompt = """You are an expert technical interviewer evaluating candidate answers.
Evaluate answers fairly and return valid JSON only.
No extra text, no markdown, just pure JSON."""

        user_message = f"""Evaluate this interview answer:

Role: {job_role}
Question: {question}
Answer: {answer}

Return JSON like this:
{{
  "score": <number 0-100>,
  "feedback": "overall feedback here",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "keywords_mentioned": ["keyword1", "keyword2"]
}}"""

        try:
            import json
            response = self.chat(
                system_prompt=system_prompt,
                user_message=user_message,
                max_tokens=1000,
                temperature=0.3
            )
            evaluation = json.loads(response)
            logger.info(f"✅ Answer evaluated | score: {evaluation.get('score')}")
            return evaluation

        except Exception as e:
            logger.error(f"❌ Answer evaluation error: {str(e)}")
            raise Exception(f"Failed to evaluate answer: {str(e)}")

    # ─── Skill Gap Analysis ───────────────────────────────────────

    def analyze_skill_gaps(
        self,
        interview_responses: list,
        job_role: str
    ) -> dict:
        """
        Analyze interview performance and identify skill gaps.
        Used in Day 14 - Skill gap analysis service.

        Args:
            interview_responses : List of question/answer/score dicts
            job_role            : Role being interviewed for

        Returns:
            dict with skill gaps, strengths, recommendations
        """
        system_prompt = """You are an expert career coach analyzing interview performance.
Identify skill gaps and provide actionable recommendations.
Return valid JSON only. No extra text, no markdown."""

        user_message = f"""Analyze this interview performance:

Role: {job_role}
Responses: {interview_responses}

Return JSON like this:
{{
  "overall_score": <number 0-100>,
  "skill_gaps": ["gap 1", "gap 2"],
  "strengths": ["strength 1", "strength 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "priority_areas": ["area 1", "area 2"]
}}"""

        try:
            import json
            response = self.chat(
                system_prompt=system_prompt,
                user_message=user_message,
                max_tokens=1500,
                temperature=0.3
            )
            analysis = json.loads(response)
            logger.info(f"✅ Skill gap analysis complete for {job_role}")
            return analysis

        except Exception as e:
            logger.error(f"❌ Skill gap analysis error: {str(e)}")
            raise Exception(f"Failed to analyze skill gaps: {str(e)}")

    # ─── Connection Test ──────────────────────────────────────────

    def test_connection(self) -> dict:
        """
        Test OpenAI connection with a simple call.
        Used to verify API key is working.
        """
        try:
            response = self.chat(
                system_prompt="You are a helpful assistant. Reply in exactly one sentence.",
                user_message="Say: OpenAI connection successful!",
                max_tokens=50
            )
            return {
                "status": "connected",
                "model": self.model,
                "response": response
            }
        except Exception as e:
            return {
                "status": "failed",
                "model": self.model,
                "error": str(e)
            }


# ─── Singleton Instance ──────────────────────────────────────────
openai_service = OpenAIService()