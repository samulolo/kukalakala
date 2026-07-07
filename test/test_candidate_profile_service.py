import json
import uuid
from datetime import datetime, timedelta, timezone

import pytest

from domain.application import Application, ApplicationStatus
from domain.candidate import Candidate
from domain.candidate_profile import CandidateProfile
from domain.job import Job, JobType
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from schema.application import ApplicationCreate
from service.application_service import ApplicationService
from service.candidate_profile_service import CandidateProfileService


class FakeRepository:

    def __init__(self, entity=None):
        self.entity = entity
        self.saved = None
        self.deleted = None
        self.existing_application = None

    def get_by_id(self, entity_id):
        return self.entity

    def get_by_candidate_id(self, candidate_id):
        return self.entity

    def get_by_candidate_and_job(self, candidate_id, job_id):
        return self.existing_application

    def save(self, entity):
        self.saved = entity
        return entity

    def delete(self, entity):
        self.deleted = entity


class FakePdfExtractionService:

    def __init__(self):
        self.calls = 0

    def extract_text(self, file_path):
        self.calls += 1
        self.file_path = file_path
        return "Texto extraído do currículo"


class FakeRedisService:

    def __init__(self):
        self.cache = {}

    def build_file_hash(self, file_data):
        return str(hash(file_data))

    def get_json(self, key):
        return self.cache.get(key)

    def set_json(self, key, value, ttl_seconds=3600):
        self.cache[key] = value
        return True


class FakeOpenAiService:

    def analyze_candidate_for_job(self, candidate_profile, job):
        return {
            "competencias_chave": ["Python", "FastAPI"],
            "score": 86,
            "explicacao": "Currículo alinhado aos principais requisitos da vaga.",
            "explicacao_candidato": "De acordo ao seu perfil e currículo, você possui experiência alinhada aos principais requisitos da vaga.",
            "explicacao_empresa": "O candidato tem bom alinhamento técnico para a vaga, com aderência a Python e FastAPI.",
        }


class FakeApplicationMessageRepository:

    def __init__(self):
        self.saved = None
        self.messages = []

    def list_by_application(self, application_id):
        return [message for message in self.messages if message.application_id == application_id]

    def list_by_candidate(self, candidate_id, limit=10):
        return [message for message in self.messages if message.candidate_id == candidate_id][:limit]

    def save(self, message):
        self.saved = message
        self.messages.append(message)
        return message


class FakeEmailService:

    def __init__(self, status="sent"):
        self.status = status
        self.sent = None

    def send_candidate_feedback(self, **payload):
        self.sent = payload
        return {
            "sent": self.status == "sent",
            "status": self.status,
            "error": None,
        }


def build_active_job(job_id):
    now = datetime.now(timezone.utc)
    return Job(
        id=job_id,
        company_id=uuid.uuid4(),
        title="Backend Developer",
        description="Desenvolvimento de APIs",
        requirements=["Python", "FastAPI"],
        application_period_start=now - timedelta(days=1),
        application_period_end=now + timedelta(days=1),
        type=JobType.REMOTE,
    )


def build_application_service(candidate, candidate_profile, job, application_repository=None, application_message_repository=None, email_service=None):
    return ApplicationService(
        application_repository=application_repository or FakeRepository(),
        candidate_repository=FakeRepository(candidate),
        candidate_profile_repository=FakeRepository(candidate_profile),
        job_repository=FakeRepository(job),
        open_ai_service=FakeOpenAiService(),
        application_message_repository=application_message_repository,
        email_service=email_service,
    )


def test_job_must_be_active_to_receive_applications():
    job = build_active_job(uuid.uuid4())
    job.is_active = False

    with pytest.raises(BadRequest, match="vaga não está ativa"):
        job.can_receive_applications(datetime.now(timezone.utc))


def test_job_must_receive_applications_inside_period():
    job = build_active_job(uuid.uuid4())
    application_date = job.application_period_end + timedelta(seconds=1)

    with pytest.raises(BadRequest, match="fora do período"):
        job.can_receive_applications(application_date)


def test_candidate_profile_must_have_cv_to_apply():
    profile = CandidateProfile(candidate_id=uuid.uuid4(), experience_years=2)

    with pytest.raises(BadRequest, match="submeter o curriculo"):
        profile.should_have_cv_to_apply()


def test_candidate_profile_resume_must_be_pdf():
    profile = CandidateProfile(candidate_id=uuid.uuid4(), experience_years=2)

    with pytest.raises(BadRequest, match="formato PDF"):
        profile.resume_should_be_pdf("curriculo.docx")


def test_application_requires_candidate_profile_with_cv():
    candidate_id = uuid.uuid4()
    job_id = uuid.uuid4()
    candidate = Candidate(id=candidate_id, name="Maria", email="maria@email.com")
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2)
    job = build_active_job(job_id)
    service = build_application_service(candidate, profile, job)

    with pytest.raises(BadRequest, match="submeter o curriculo"):
        service.create(ApplicationCreate(candidate_id=candidate_id, job_id=job_id))


def test_application_requires_active_job_inside_application_period():
    candidate_id = uuid.uuid4()
    job_id = uuid.uuid4()
    candidate = Candidate(id=candidate_id, name="Maria", email="maria@email.com")
    profile = CandidateProfile(
        candidate_id=candidate_id,
        experience_years=2,
        resume_url="cv/maria.pdf",
        resume_text="Experiência com Python e FastAPI.",
    )
    job = build_active_job(job_id)
    job.is_active = False
    service = build_application_service(candidate, profile, job)

    with pytest.raises(BadRequest, match="vaga não está ativa"):
        service.create(ApplicationCreate(candidate_id=candidate_id, job_id=job_id))


def test_application_cannot_be_duplicated():
    candidate_id = uuid.uuid4()
    job_id = uuid.uuid4()
    candidate = Candidate(id=candidate_id, name="Maria", email="maria@email.com")
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2, resume_url="cv/maria.pdf")
    job = build_active_job(job_id)
    application_repository = FakeRepository()
    application_repository.existing_application = Application(candidate_id=candidate_id, job_id=job_id)
    service = build_application_service(candidate, profile, job, application_repository)

    with pytest.raises(ResourceAlreadyExists, match="Já existe uma candidatura"):
        service.create(ApplicationCreate(candidate_id=candidate_id, job_id=job_id))


def test_application_is_saved_when_rules_pass():
    candidate_id = uuid.uuid4()
    job_id = uuid.uuid4()
    candidate = Candidate(id=candidate_id, name="Maria", email="maria@email.com")
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2, resume_url="cv/maria.pdf")
    job = build_active_job(job_id)
    application_repository = FakeRepository()
    service = build_application_service(candidate, profile, job, application_repository)

    application = service.create(ApplicationCreate(candidate_id=candidate_id, job_id=job_id))

    assert application_repository.saved == application
    assert application.candidate_id == candidate_id
    assert application.job_id == job_id
    assert application.applied_at is not None
    assert application.ai_score == 86
    assert json.loads(application.ai_suggestions) == {
        "competencias_chave": ["Python", "FastAPI"],
        "explicacao": "Currículo alinhado aos principais requisitos da vaga.",
        "explicacao_candidato": "De acordo ao seu perfil e currículo, você possui experiência alinhada aos principais requisitos da vaga.",
        "explicacao_empresa": "O candidato tem bom alinhamento técnico para a vaga, com aderência a Python e FastAPI.",
    }


def test_company_can_update_application_decision_for_own_job():
    company_id = uuid.uuid4()
    application_id = uuid.uuid4()
    candidate_id = uuid.uuid4()
    application_repository = FakeRepository(
        Application(
            id=application_id,
            candidate_id=candidate_id,
            job_id=uuid.uuid4(),
        )
    )
    message_repository = FakeApplicationMessageRepository()
    email_service = FakeEmailService()
    job = build_active_job(application_repository.entity.job_id)
    job.company_id = company_id
    candidate = Candidate(id=candidate_id, name="Maria", email="maria@email.com")
    service = build_application_service(candidate, None, job, application_repository, message_repository, email_service)

    response = service.update_company_decision(
        application_id=application_id,
        company_id=company_id,
        status=ApplicationStatus.INTERVIEW,
        message="Vamos avançar para entrevista.",
    )

    assert application_repository.saved == application_repository.entity
    assert application_repository.entity.status == ApplicationStatus.INTERVIEW
    assert response["status"] == "entrevista"
    assert response["message_to_candidate"] == "Vamos avançar para entrevista."
    assert response["message"]["message"] == "Vamos avançar para entrevista."
    assert message_repository.saved.application_id == application_id
    assert message_repository.saved.candidate_id == candidate_id
    assert message_repository.saved.company_id == company_id
    assert message_repository.saved.delivery_status == "sent"
    assert email_service.sent == {
        "to_email": "maria@email.com",
        "candidate_name": "Maria",
        "job_title": "Backend Developer",
        "company_name": "Kukalakala",
        "message": "Vamos avançar para entrevista.",
    }


def test_company_cannot_update_application_decision_for_other_company_job():
    application_id = uuid.uuid4()
    application_repository = FakeRepository(
        Application(
            id=application_id,
            candidate_id=uuid.uuid4(),
            job_id=uuid.uuid4(),
        )
    )
    job = build_active_job(application_repository.entity.job_id)
    service = build_application_service(None, None, job, application_repository)

    with pytest.raises(BadRequest, match="não pertence"):
        service.update_company_decision(
            application_id=application_id,
            company_id=uuid.uuid4(),
            status=ApplicationStatus.REJECTED,
            message="Não vamos avançar.",
        )


def test_upload_cv_extracts_text_sends_to_supabase_and_updates_profile(tmp_path, monkeypatch):
    candidate_id = uuid.uuid4()
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2)
    repository = FakeRepository(profile)
    service = CandidateProfileService(
        candidate_profile_repository=repository,
        pdf_extraction_service=FakePdfExtractionService(),
        redis_service=FakeRedisService(),
    )

    sent_to_supabase = {}

    def fake_send_cv_to_supa(file_path, storage_path):
        sent_to_supabase["file_path"] = file_path
        sent_to_supabase["storage_path"] = storage_path
        return {
            "bucket": "curriculos",
            "path": storage_path,
            "response": {},
        }

    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        "service.candidate_profile_service.send_cv_to_supa",
        fake_send_cv_to_supa,
    )

    result = service.upload_cv(
        candidate_id=candidate_id,
        filename="curriculo.pdf",
        content_type="application/pdf",
        file_data=b"%PDF-1.4 fake content",
    )

    assert repository.saved == profile
    assert profile.resume_url == f"cv/{candidate_id}.pdf"
    assert profile.resume_text == "Texto extraído do currículo"
    assert sent_to_supabase["storage_path"] == f"cv/{candidate_id}.pdf"
    assert result["storage"]["bucket"] == "curriculos"
    assert result["text_extracted"] is True
    assert result["extracted_text_length"] == len("Texto extraído do currículo")
    assert result["from_cache"] is False
    assert "resume_text" not in result


def test_upload_cv_rejects_empty_file():
    candidate_id = uuid.uuid4()
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2)
    service = CandidateProfileService(
        candidate_profile_repository=FakeRepository(profile),
        pdf_extraction_service=FakePdfExtractionService(),
        redis_service=FakeRedisService(),
    )

    with pytest.raises(BadRequest, match="ficheiro enviado está vazio"):
        service.upload_cv(
            candidate_id=candidate_id,
            filename="curriculo.pdf",
            content_type="application/pdf",
            file_data=b"",
        )


def test_upload_cv_requires_existing_profile():
    service = CandidateProfileService(
        candidate_profile_repository=FakeRepository(None),
        pdf_extraction_service=FakePdfExtractionService(),
        redis_service=FakeRedisService(),
    )

    with pytest.raises(ResourceNotFound, match="Perfil do candidato não encontrado"):
        service.upload_cv(
            candidate_id=uuid.uuid4(),
            filename="curriculo.pdf",
            content_type="application/pdf",
            file_data=b"%PDF-1.4 fake content",
        )


def test_upload_cv_uses_cache_for_same_file(tmp_path, monkeypatch):
    candidate_id = uuid.uuid4()
    profile = CandidateProfile(candidate_id=candidate_id, experience_years=2)
    repository = FakeRepository(profile)
    pdf_extraction_service = FakePdfExtractionService()
    redis_service = FakeRedisService()
    service = CandidateProfileService(
        candidate_profile_repository=repository,
        pdf_extraction_service=pdf_extraction_service,
        redis_service=redis_service,
    )
    supabase_calls = {"count": 0}

    def fake_send_cv_to_supa(file_path, storage_path):
        supabase_calls["count"] += 1
        return {
            "bucket": "curriculos",
            "path": storage_path,
            "response": {},
        }

    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        "service.candidate_profile_service.send_cv_to_supa",
        fake_send_cv_to_supa,
    )

    first_result = service.upload_cv(
        candidate_id=candidate_id,
        filename="curriculo.pdf",
        content_type="application/pdf",
        file_data=b"%PDF-1.4 fake content",
    )
    second_result = service.upload_cv(
        candidate_id=candidate_id,
        filename="curriculo.pdf",
        content_type="application/pdf",
        file_data=b"%PDF-1.4 fake content",
    )

    assert first_result["resume_url"] == second_result["resume_url"]
    assert first_result["extracted_text_length"] == second_result["extracted_text_length"]
    assert supabase_calls["count"] == 1
    assert pdf_extraction_service.calls == 1
    assert second_result["from_cache"] is True
