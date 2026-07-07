import uuid
from datetime import datetime, timezone

from domain.job import Job, JobType
from exception.app_exceptions import ResourceNotFound
from repository.company_repository import CompanyRepository
from repository.job_repository import JobRepository
from schema.job import JobCreate, JobResponse, JobUpdate
from schema.pagination import paginate_response, serialize_response
from service.redis_service import RedisService


class JobService:

    CACHE_TTL_SECONDS = 300

    def __init__(self, job_repository : JobRepository, company_repository : CompanyRepository, redis_service : RedisService = None):
        self.job_repository = job_repository
        self.company_repository = company_repository
        self.redis_service = redis_service

    def _cache_key(self, name : str, **params):
        parts = [f"job:{name}"]

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
            self.redis_service.delete_pattern("job:*")

    def get_by_id(self, job_id : uuid.UUID):

        job = self.job_repository.get_by_id(job_id)

        if not job:
            raise ResourceNotFound("Vaga não encontrada")

        return job

    def list(self, page : int, limit : int, company_id : uuid.UUID = None, is_active : bool = None, type : JobType = None, q : str = None):
        cache_key = self._cache_key("list:recent-first", page=page, limit=limit, company_id=company_id, is_active=is_active, type=type, q=q)
        cached_jobs = self._get_cache(cache_key)

        if cached_jobs:
            return cached_jobs

        offset = (page - 1) * limit
        jobs, total = self.job_repository.list(offset, limit, company_id, is_active, type, q)
        response = paginate_response(jobs, total, page, limit, JobResponse)
        self._set_cache(cache_key, response)
        return response

    def list_public(self, page : int, limit : int, type : JobType = None, q : str = None):
        cache_key = self._cache_key("public:list:recent-first", page=page, limit=limit, type=type, q=q)
        cached_jobs = self._get_cache(cache_key)

        if cached_jobs:
            return cached_jobs

        offset = (page - 1) * limit
        current_date = datetime.now(timezone.utc)
        jobs, total = self.job_repository.list_public(offset, limit, current_date, type, q)
        response = paginate_response(jobs, total, page, limit, JobResponse)
        self._set_cache(cache_key, response)
        return response

    def serialize(self, job : Job):
        return serialize_response(job, JobResponse)

    def create(self, job_create : JobCreate):

        company = self.company_repository.get_by_id(job_create.company_id)

        if not company:
            raise ResourceNotFound("Empresa não encontrada")

        new_job = Job(**job_create.model_dump())
        new_job.application_end_not_lower_than_start()
        new_job.response_time_not_negative()

        saved_job = self.job_repository.save(new_job)
        self._invalidate_cache()
        return saved_job

    def update(self, job_id : uuid.UUID, job_update : JobUpdate):

        job = self.job_repository.get_by_id(job_id)

        if not job:
            raise ResourceNotFound("Vaga não encontrada")

        update_data = job_update.model_dump(exclude_unset=True)

        if "company_id" in update_data:
            company = self.company_repository.get_by_id(update_data["company_id"])
            if not company:
                raise ResourceNotFound("Empresa não encontrada")

        for field, value in update_data.items():
            setattr(job, field, value)

        job.application_end_not_lower_than_start()
        job.response_time_not_negative()
        job.updated_at = datetime.now(timezone.utc)

        saved_job = self.job_repository.save(job)
        self._invalidate_cache()
        return saved_job

    def delete(self, job_id : uuid.UUID):

        job = self.job_repository.get_by_id(job_id)

        if not job:
            raise ResourceNotFound("Vaga não encontrada")

        self.job_repository.delete(job)
        self._invalidate_cache()
