import json
import os
import sys
import time
import uuid

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.database import SessionLocal
from app.models.interview import Interview
from app.models.user import User
from app.schemas.interview import DifficultyLevel, InterviewCreateRequest, QuestionType
from app.services.interview_service import interview_service
from app.services.scoring_service import scoring_service


def _assert(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    db = SessionLocal()

    unique = uuid.uuid4().hex[:10]
    user = User(
        email=f"timestamp-check-{unique}@example.com",
        username=f"timestamp-check-{unique}",
        password_hash="not-used",
        full_name="Timestamp Verification",
        is_active=True,
    )

    original_generate_questions = interview_service._generate_questions
    interview_id = None

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        # Avoid external OpenAI calls in this verification script.
        interview_service._generate_questions = lambda **_: [
            {
                "question": "What is a Python tuple?",
                "type": "technical",
                "difficulty": "beginner",
                "skill_category": "Python",
                "expected_points": ["immutable", "ordered"],
            },
            {
                "question": "When would you use a list?",
                "type": "technical",
                "difficulty": "beginner",
                "skill_category": "Python",
                "expected_points": ["mutable", "dynamic size"],
            },
        ]

        create_request = InterviewCreateRequest(
            job_role="Python Developer",
            difficulty=DifficultyLevel.beginner,
            num_questions=2,
            question_type=QuestionType.technical,
        )

        created = interview_service.create_interview(
            request=create_request,
            user_id=str(user.id),
            db=db,
        )
        interview_id = created.interview_id

        interview = db.query(Interview).filter(Interview.id == uuid.UUID(interview_id)).first()
        _assert(interview is not None, "Interview was not created")
        _assert(interview.started_at is not None, "started_at is missing after create")

        # Ensure completed_at is strictly later than started_at.
        time.sleep(1)

        completed = interview_service.complete_interview(
            interview_id=interview_id,
            user_id=str(user.id),
            db=db,
        )

        interview = db.query(Interview).filter(Interview.id == uuid.UUID(interview_id)).first()
        _assert(interview.completed_at is not None, "completed_at is missing after complete")
        _assert(
            interview.completed_at > interview.started_at,
            "completed_at is not greater than started_at",
        )

        score = scoring_service.get_interview_score(
            interview_id=interview_id,
            user_id=str(user.id),
            db=db,
            generate_summary=False,
        )

        _assert(score.started_at is not None, "score.started_at is missing")
        _assert(score.completed_at is not None, "score.completed_at is missing")

        payload = score.model_dump(mode="json")
        _assert(isinstance(payload.get("started_at"), str), "started_at is not serialized as string")
        _assert(isinstance(payload.get("completed_at"), str), "completed_at is not serialized as string")
        _assert("T" in payload["started_at"], "started_at is not ISO-like")
        _assert("T" in payload["completed_at"], "completed_at is not ISO-like")

        duration_seconds = (score.completed_at - score.started_at).total_seconds()
        _assert(duration_seconds > 0, "Duration is not positive")

        print("Verification passed")
        print(json.dumps({
            "interview_id": interview_id,
            "status": completed["status"],
            "started_at": payload["started_at"],
            "completed_at": payload["completed_at"],
            "duration_seconds": duration_seconds,
        }, indent=2))

    finally:
        interview_service._generate_questions = original_generate_questions

        if interview_id:
            row = db.query(Interview).filter(Interview.id == uuid.UUID(interview_id)).first()
            if row:
                db.delete(row)

        existing_user = db.query(User).filter(User.id == user.id).first()
        if existing_user:
            db.delete(existing_user)

        db.commit()
        db.close()


if __name__ == "__main__":
    main()
