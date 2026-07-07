from datetime import date, datetime, timedelta, timezone
import uuid

import pytest

from domain.application import Application
from domain.candidate_profile import CandidateProfile
from domain.company import Company
from domain.job import Job, JobType
from exception.app_exceptions import BadRequest
from service.open_ai_service import OpenAiService


def test_company_foundation_date_cannot_be_in_future():
    company = Company(
        name="Kukalakala",
        sector="Tecnologia",
        location="Luanda",
        foundation_date=date.today() + timedelta(days=1),
    )

    with pytest.raises(BadRequest, match="fundação"):
        company.foundation_not_in_future()


def test_candidate_profile_experience_years_cannot_be_negative():
    profile = CandidateProfile(candidate_id=uuid.uuid4(), experience_years=-1)

    with pytest.raises(BadRequest, match="experiência"):
        profile.experience_not_negative()


def test_job_application_period_end_cannot_be_before_start():
    now = datetime.now(timezone.utc)
    job = Job(
        company_id=uuid.uuid4(),
        title="Backend Developer",
        description="API",
        application_period_start=now,
        application_period_end=now - timedelta(days=1),
        type=JobType.REMOTE,
    )

    with pytest.raises(BadRequest, match="data do fim"):
        job.application_end_not_lower_than_start()


def test_job_application_period_accepts_naive_dates_with_aware_application_date():
    now = datetime.now(timezone.utc)
    job = Job(
        company_id=uuid.uuid4(),
        title="Backend Developer",
        description="API",
        application_period_start=(now - timedelta(days=1)).replace(tzinfo=None),
        application_period_end=(now + timedelta(days=1)).replace(tzinfo=None),
        type=JobType.REMOTE,
    )

    assert job.can_receive_applications(now)


def test_job_response_time_cannot_be_negative():
    now = datetime.now(timezone.utc)
    job = Job(
        company_id=uuid.uuid4(),
        title="Backend Developer",
        description="API",
        application_period_start=now,
        application_period_end=now + timedelta(days=1),
        type=JobType.REMOTE,
        response_time=-1,
    )

    with pytest.raises(BadRequest, match="tempo de resposta"):
        job.response_time_not_negative()


@pytest.mark.parametrize("ai_score", [-1, 101])
def test_application_ai_score_must_be_between_zero_and_one_hundred(ai_score):
    application = Application(
        candidate_id=uuid.uuid4(),
        job_id=uuid.uuid4(),
        ai_score=ai_score,
    )

    with pytest.raises(BadRequest, match="score da IA"):
        application.ai_score_must_be_between_zero_and_one_hundred()


@pytest.mark.parametrize("ai_score", [None, 0, 50, 100])
def test_application_ai_score_accepts_valid_values(ai_score):
    application = Application(
        candidate_id=uuid.uuid4(),
        job_id=uuid.uuid4(),
        ai_score=ai_score,
    )

    assert application.ai_score_must_be_between_zero_and_one_hundred()


def test_open_ai_analysis_normalizes_ten_point_score_to_percentage():
    service = OpenAiService(openai_api_key=None)

    analysis = service._normalize_analysis(
        {
            "competencias_chave": ["Python", "FastAPI"],
            "score": 9,
            "explicacao_candidato": "Boa compatibilidade",
            "explicacao_empresa": "Candidato com bom fit técnico, mas deve validar experiência em produção.",
        }
    )

    assert analysis["score"] == 90
    assert analysis["explicacao_candidato"].startswith("De acordo ao seu perfil e currículo, você possui")
    assert analysis["explicacao_empresa"] == "Candidato com bom fit técnico, mas deve validar experiência em produção."
