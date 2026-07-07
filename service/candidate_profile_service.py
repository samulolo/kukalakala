import uuid
from datetime import datetime, timezone
from pathlib import Path

from domain.candidate_profile import CandidateProfile
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from repository.candidate_profile_repository import CandidateProfileRepository
from schema.candidate.candidate_profile import CandidateProfileResponse, CreateCandidateProfile, UpdateCandidateProfile
from schema.pagination import paginate_response, serialize_response
from service.pdf_extraction_service import PdfExtractionService
from service.redis_service import RedisService
from supa.lib import send_cv_to_supa


class CandidateProfileService:

    def __init__(
        self,
        candidate_profile_repository : CandidateProfileRepository,
        pdf_extraction_service : PdfExtractionService,
        redis_service : RedisService,
    ):
        self.candidate_profile_repository = candidate_profile_repository
        self.pdf_extraction_service = pdf_extraction_service
        self.redis_service = redis_service

    def _ensure_candidate_profile_exists(self, candidate_id : uuid.UUID):

        exist_candidate_profile = self.candidate_profile_repository.get_by_candidate_id(candidate_id)

        if not exist_candidate_profile:
            return False

        return exist_candidate_profile

    def get_by_id(self, candidate_id : uuid.UUID):

        candidate_profile = self._ensure_candidate_profile_exists(candidate_id)

        if not candidate_profile:
            raise ResourceNotFound("Perfil do candidato não encontrado")

        return candidate_profile

    def list(self, page : int, limit : int):
        offset = (page - 1) * limit
        candidate_profiles, total = self.candidate_profile_repository.list(offset, limit)
        return paginate_response(candidate_profiles, total, page, limit, CandidateProfileResponse)

    def serialize(self, candidate_profile : CandidateProfile):
        return serialize_response(candidate_profile, CandidateProfileResponse)


    def create(self, candidate_profile_create : CreateCandidateProfile):

        if self._ensure_candidate_profile_exists(candidate_profile_create.candidate_id):
            raise ResourceAlreadyExists("Já existe um perfil para esse candidato")

        new_candidate_profile = CandidateProfile(**candidate_profile_create.model_dump())
        new_candidate_profile.experience_not_negative()

        return self.candidate_profile_repository.save(new_candidate_profile)


    def update(self, candidate_id : uuid.UUID, candidate_profile_update : UpdateCandidateProfile):

        candidate_profile = self.candidate_profile_repository.get_by_id(candidate_id)

        if not candidate_profile:
            raise ResourceNotFound("Perfil do candidato não encontrado")

        update_data = candidate_profile_update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(candidate_profile, field, value)

        candidate_profile.experience_not_negative()
        candidate_profile.updated_at = datetime.now(timezone.utc)

        return self.candidate_profile_repository.save(candidate_profile)


    def delete(self, candidate_id : uuid.UUID):

        candidate_profile = self.candidate_profile_repository.get_by_id(candidate_id)

        if not candidate_profile:
            raise ResourceNotFound("Perfil do candidato não encontrado")

        self.candidate_profile_repository.delete(candidate_profile)


    def upload_cv(self, candidate_id : uuid.UUID, filename : str, content_type : str, file_data : bytes):

        candidate_profile = self.candidate_profile_repository.get_by_id(candidate_id)

        if not candidate_profile:
            raise ResourceNotFound("Perfil do candidato não encontrado")

        candidate_profile.resume_should_be_pdf(filename)

        if not file_data:
            raise BadRequest("O ficheiro enviado está vazio")

        file_hash = self.redis_service.build_file_hash(file_data)
        cache_key = f"candidate-profile:{candidate_id}:cv:{file_hash}"
        cached_upload_data = self.redis_service.get_json(cache_key)

        if cached_upload_data:
            candidate_profile.resume_url = cached_upload_data["resume_url"]
            candidate_profile.resume_text = cached_upload_data["resume_text"]
            candidate_profile.updated_at = datetime.now(timezone.utc)
            self.candidate_profile_repository.save(candidate_profile)

            return self._build_upload_response(cached_upload_data, from_cache=True)

        upload_dir = Path("uploads/cv")
        upload_dir.mkdir(parents=True, exist_ok=True)

        file_path = upload_dir / f"{candidate_id}.pdf"
        file_path.write_bytes(file_data)
        resume_text = self.pdf_extraction_service.extract_text(str(file_path))
        storage_path = f"cv/{candidate_id}.pdf"
        storage_data = send_cv_to_supa(
            file_path=str(file_path),
            storage_path=storage_path
        )

        candidate_profile.resume_url = storage_data["path"]
        candidate_profile.resume_text = resume_text
        candidate_profile.updated_at = datetime.now(timezone.utc)
        self.candidate_profile_repository.save(candidate_profile)

        upload_data = {
            "candidate_id": str(candidate_id),
            "filename": filename,
            "content_type": content_type,
            "size": len(file_data),
            "resume_url": candidate_profile.resume_url,
            "resume_text": candidate_profile.resume_text,
            "storage": {
                "bucket": storage_data["bucket"],
                "path": storage_data["path"]
            }
        }
        self.redis_service.set_json(cache_key, upload_data, ttl_seconds=86400)

        return self._build_upload_response(upload_data, from_cache=False)

    def _build_upload_response(self, upload_data : dict, from_cache : bool):

        resume_text = upload_data.get("resume_text") or ""

        return {
            "candidate_id": upload_data["candidate_id"],
            "filename": upload_data["filename"],
            "content_type": upload_data["content_type"],
            "size": upload_data["size"],
            "resume_url": upload_data["resume_url"],
            "text_extracted": bool(resume_text),
            "extracted_text_length": len(resume_text),
            "from_cache": from_cache,
            "storage": upload_data["storage"]
        }
