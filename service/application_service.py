import json
import uuid
from datetime import datetime, timezone

from domain.application import Application, ApplicationStatus
from domain.application_message import ApplicationMessage
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from repository.application_repository import ApplicationRepository
from repository.application_message_repository import ApplicationMessageRepository
from repository.candidate_profile_repository import CandidateProfileRepository
from repository.candidate_repository import CandidateRepository
from repository.job_repository import JobRepository
from schema.application import ApplicationCreate, ApplicationMessageResponse, ApplicationResponse, ApplicationUpdate
from schema.pagination import paginate_response, serialize_response
from service.email_service import EmailService
from service.open_ai_service import OpenAiService
from service.redis_service import RedisService


class ApplicationService:

    def __init__(
        self,
        application_repository : ApplicationRepository,
        candidate_repository : CandidateRepository,
        candidate_profile_repository : CandidateProfileRepository,
        job_repository : JobRepository,
        open_ai_service : OpenAiService,
        application_message_repository : ApplicationMessageRepository = None,
        email_service : EmailService = None,
        redis_service : RedisService = None,
    ):
        self.application_repository = application_repository
        self.candidate_repository = candidate_repository
        self.candidate_profile_repository = candidate_profile_repository
        self.job_repository = job_repository
        self.application_message_repository = application_message_repository
        self.open_ai_service = open_ai_service
        self.email_service = email_service
        self.redis_service = redis_service

    CACHE_TTL_SECONDS = 300

    def _cache_key(self, name : str, **params):
        parts = [f"application:{name}"]

        for key in sorted(params.keys()):
            value = params[key]
            if value is not None:
                parts.append(f"{key}={value}")

        return ":".join(parts)

    def _get_cache(self, key : str):
        if not self.redis_service:
            return None

        return self.redis_service.get_json(key)

    def _set_cache(self, key : str, value):
        if self.redis_service:
            self.redis_service.set_json(key, value, ttl_seconds=self.CACHE_TTL_SECONDS)

    def _invalidate_cache(self):
        if self.redis_service:
            self.redis_service.delete_pattern("application:*")

    def get_by_id(self, application_id : uuid.UUID):

        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        return application

    def list(
        self,
        page : int,
        limit : int,
        candidate_id : uuid.UUID = None,
        job_id : uuid.UUID = None,
        status : ApplicationStatus = None,
    ):
        cache_key = self._cache_key("list", page=page, limit=limit, candidate_id=candidate_id, job_id=job_id, status=status)
        cached_applications = self._get_cache(cache_key)

        if cached_applications:
            return cached_applications

        offset = (page - 1) * limit
        applications, total = self.application_repository.list(offset, limit, candidate_id, job_id, status)
        response = paginate_response(applications, total, page, limit, ApplicationResponse)
        self._set_cache(cache_key, response)
        return response

    def serialize(self, application : Application):
        return serialize_response(application, ApplicationResponse)

    def serialize_message(self, message : ApplicationMessage):
        return serialize_response(message, ApplicationMessageResponse)

    def list_messages(self, application_id : uuid.UUID):
        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        if not self.application_message_repository:
            return []

        return [
            self.serialize_message(message)
            for message in self.application_message_repository.list_by_application(application_id)
        ]

    def list_messages_for_company(self, application_id : uuid.UUID, company_id : uuid.UUID):
        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        job = self.job_repository.get_by_id(application.job_id)

        if not job:
            raise ResourceNotFound("Vaga da candidatura não encontrada")

        if job.company_id != company_id:
            raise BadRequest("Esta candidatura não pertence à empresa autenticada")

        return self.list_messages(application_id)

    def list_for_company_job(
        self,
        page : int,
        limit : int,
        job_id : uuid.UUID,
        company_id : uuid.UUID,
        status : ApplicationStatus = None,
    ):
        job = self.job_repository.get_by_id(job_id)

        if not job:
            raise ResourceNotFound("Vaga não encontrada")

        if job.company_id != company_id:
            raise BadRequest("Esta vaga não pertence à empresa autenticada")

        return self.list(page, limit, job_id=job_id, status=status)

    def candidate_has_application_for_company(self, candidate_id : uuid.UUID, company_id : uuid.UUID):
        return self.application_repository.candidate_has_application_for_company(candidate_id, company_id)

    def list_candidate_messages(self, candidate_id : uuid.UUID, limit : int = 10):
        if not self.application_message_repository:
            return []

        return [
            self.serialize_message(message)
            for message in self.application_message_repository.list_by_candidate(candidate_id, limit)
        ]


    def create(self, application_create : ApplicationCreate):

        candidate = self.candidate_repository.get_by_id(application_create.candidate_id)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        candidate_profile = self.candidate_profile_repository.get_by_candidate_id(application_create.candidate_id)

        if not candidate_profile:
            raise ResourceNotFound("Perfil do candidato não encontrado, preencha os campos do perfil e tente novamente")

        candidate_profile.should_have_cv_to_apply()

        job = self.job_repository.get_by_id(application_create.job_id)

        if not job:
            raise ResourceNotFound("Vaga não encontrada, ou tempo de aplicação findado")

        exist_application = self.application_repository.get_by_candidate_and_job(
            application_create.candidate_id,
            application_create.job_id
        )

        if exist_application:
            raise ResourceAlreadyExists("Já existe uma candidatura para esta vaga")

        application_date = datetime.now(timezone.utc)
        job.can_receive_applications(application_date)

        ai_analysis = self.open_ai_service.analyze_candidate_for_job(candidate_profile, job)
        application_data = application_create.model_dump(exclude={"ai_score", "ai_suggestions"})

        new_application = Application(
            **application_data,
            applied_at=application_date,
            ai_score=ai_analysis["score"],
            ai_suggestions=json.dumps(
                {
                    "competencias_chave": ai_analysis["competencias_chave"],
                    "explicacao": ai_analysis["explicacao"],
                    "explicacao_candidato": ai_analysis["explicacao_candidato"],
                    "explicacao_empresa": ai_analysis["explicacao_empresa"],
                },
                ensure_ascii=False
            )
        )
        new_application.can_apply()

        saved_application = self.application_repository.save(new_application)
        self._invalidate_cache()
        return saved_application

    def update(self, application_id : uuid.UUID, application_update : ApplicationUpdate):

        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        update_data = application_update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(application, field, value)

        application.can_apply()
        application.updated_at = datetime.now(timezone.utc)

        saved_application = self.application_repository.save(application)
        self._invalidate_cache()
        return saved_application

    def update_company_decision(
        self,
        application_id : uuid.UUID,
        company_id : uuid.UUID,
        status : ApplicationStatus,
        message : str = None,
    ):
        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        job = self.job_repository.get_by_id(application.job_id)

        if not job:
            raise ResourceNotFound("Vaga da candidatura não encontrada")

        if job.company_id != company_id:
            raise BadRequest("Esta candidatura não pertence à empresa autenticada")

        candidate = self.candidate_repository.get_by_id(application.candidate_id)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        application.status = status
        application.updated_at = datetime.now(timezone.utc)
        application.can_apply()

        saved_application = self.application_repository.save(application)
        self._invalidate_cache()

        message_payload = None
        clean_message = message.strip() if message else ""

        if clean_message and self.application_message_repository:
            delivery_status = "not_configured"

            if self.email_service:
                email_result = self.email_service.send_candidate_feedback(
                    to_email=candidate.email,
                    candidate_name=candidate.name,
                    job_title=job.title,
                    company_name=job.company.name if job.company else "Kukalakala",
                    message=clean_message,
                )
                delivery_status = email_result.get("status", "failed")

            saved_message = self.application_message_repository.save(
                ApplicationMessage(
                    application_id=saved_application.id,
                    candidate_id=saved_application.candidate_id,
                    company_id=company_id,
                    status=status,
                    message=clean_message,
                    delivery_status=delivery_status,
                )
            )
            message_payload = self.serialize_message(saved_message)

        response = self.serialize(saved_application)
        response["message_to_candidate"] = message
        response["message"] = message_payload
        return response

    def delete(self, application_id : uuid.UUID):

        application = self.application_repository.get_by_id(application_id)

        if not application:
            raise ResourceNotFound("Candidatura não encontrada")

        self.application_repository.delete(application)
        self._invalidate_cache()
